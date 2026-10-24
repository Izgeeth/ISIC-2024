"""
Direct Integration Tests for Authentication, Database Persistence, and Isolation.
Calls API handlers directly with real database sessions.
"""

import sys
import os
from pathlib import Path
from fastapi import HTTPException

# Add backend directory to path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

# Configure test database
test_db_path = backend_dir / "test_direct.db"
if test_db_path.exists():
    try:
        test_db_path.unlink()
    except Exception:
        pass

os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path.resolve()}"

from app.db.session import init_db, SessionLocal
from app.db.models import User, PredictionHistory
from app.schemas.auth import UserRegister, UserLogin
from app.api.v1.endpoints.auth import register, login, get_me
from app.api.v1.endpoints.predictions import (
    predict_metadata,
    MetadataPredictionRequest,
)
from app.api.v1.endpoints.history import (
    list_history,
    get_history_record,
    delete_history_record,
)
from app.core.security import decode_access_token

# Initialize database tables
init_db()


def run_tests():
    db = SessionLocal()
    try:
        print("1. Testing User Registration (User A)...")
        reg_a = UserRegister(
            email="alice@university.edu",
            password="SecurePassword123!",
            full_name="Dr. Alice Smith",
        )
        res_a = register(user_in=reg_a, db=db)
        token_a = res_a.access_token
        user_a = res_a.user
        assert user_a.email == "alice@university.edu"
        assert token_a is not None
        payload_a = decode_access_token(token_a)
        assert payload_a["sub"] == "alice@university.edu"
        user_a_db = db.query(User).filter(User.id == user_a.id).first()
        assert user_a_db is not None
        print(f"[PASS] User A registered successfully (ID: #{user_a.id})")

        print("2. Testing Duplicate Registration Rejection...")
        try:
            register(user_in=reg_a, db=db)
            assert False, "Should have raised HTTPException 400 for duplicate email"
        except HTTPException as exc:
            assert exc.status_code == 400
            print("[PASS] Duplicate email correctly rejected with HTTP 400")

        print("3. Testing User Registration (User B)...")
        reg_b = UserRegister(
            email="bob@clinic.org",
            password="AnotherPassword456!",
            full_name="Dr. Bob Jones",
        )
        res_b = register(user_in=reg_b, db=db)
        token_b = res_b.access_token
        user_b = res_b.user
        assert user_b.email == "bob@clinic.org"
        user_b_db = db.query(User).filter(User.id == user_b.id).first()
        print(f"[PASS] User B registered successfully (ID: #{user_b.id})")

        print("4. Testing User Login (Valid credentials)...")
        login_success = login(
            credentials=UserLogin(
                email="alice@university.edu", password="SecurePassword123!"
            ),
            db=db,
        )
        assert login_success.access_token is not None
        print("[PASS] Login successful with correct credentials")

        print("5. Testing User Login (Invalid credentials)...")
        try:
            login(
                credentials=UserLogin(
                    email="alice@university.edu", password="WrongPassword!"
                ),
                db=db,
            )
            assert False, "Should have raised HTTPException 401 for bad password"
        except HTTPException as exc:
            assert exc.status_code == 401
            print("[PASS] Login rejected with HTTP 401 for invalid password")

        print("6. Testing /auth/me Profile...")
        me_res = get_me(current_user=user_a_db)
        assert me_res.email == "alice@university.edu"
        assert me_res.full_name == "Dr. Alice Smith"
        print("[PASS] /auth/me profile returned correctly")

        print("7. Testing Prediction Persistence for Authenticated User A...")
        meta_req = MetadataPredictionRequest(
            isic_id="ISIC_0015670",
            age_approx=55.0,
            sex="male",
            anatom_site_general="torso",
            clin_size_long_diam_mm=5.0,
        )
        pred_res_a = predict_metadata(
            request=meta_req, db=db, current_user=user_a_db
        )
        assert pred_res_a["saved_to_history"] is True
        record_id_a = pred_res_a["prediction_id"]
        assert record_id_a is not None
        print(f"[PASS] Prediction saved to database with record ID #{record_id_a}")

        print("8. Testing Prediction for Guest (Unauthenticated)...")
        pred_res_guest = predict_metadata(
            request=meta_req, db=db, current_user=None
        )
        assert pred_res_guest["saved_to_history"] is False
        assert pred_res_guest["prediction_id"] is None
        print("[PASS] Guest prediction succeeded without creating a database record")

        print("9. Testing History Listing for User A...")
        hist_a = list_history(
            limit=50, offset=0, current_user=user_a_db, db=db
        )
        assert hist_a.total == 1
        assert len(hist_a.records) == 1
        rec = hist_a.records[0]
        assert rec.id == record_id_a
        assert rec.model_name == "CatBoost"
        assert rec.prediction_type == "metadata"
        assert rec.isic_id == "ISIC_0015670"
        print(f"[PASS] User A history contains 1 record: score {rec.risk_score_percent}%")

        print("10. Testing User Isolation (User B cannot see User A's history)...")
        hist_b = list_history(
            limit=50, offset=0, current_user=user_b_db, db=db
        )
        assert hist_b.total == 0
        assert len(hist_b.records) == 0
        print("[PASS] User B history list is empty (0 records)")

        print("11. Testing User B cannot view User A's record...")
        try:
            get_history_record(
                record_id=record_id_a, current_user=user_b_db, db=db
            )
            assert False, "User B should not be able to view User A's record"
        except HTTPException as exc:
            assert exc.status_code == 404
            print("[PASS] Cross-user view blocked with HTTP 404")

        print("12. Testing User B cannot delete User A's record...")
        try:
            delete_history_record(
                record_id=record_id_a, current_user=user_b_db, db=db
            )
            assert False, "User B should not be able to delete User A's record"
        except HTTPException as exc:
            assert exc.status_code == 404
            print("[PASS] Cross-user delete blocked with HTTP 404")

        print("13. Testing User A deletes their own record...")
        del_result = delete_history_record(
            record_id=record_id_a, current_user=user_a_db, db=db
        )
        assert del_result["success"] is True
        assert del_result["deleted_id"] == record_id_a

        hist_a_after = list_history(
            limit=50, offset=0, current_user=user_a_db, db=db
        )
        assert hist_a_after.total == 0
        print("[PASS] Record deleted successfully; User A history is now empty")

        print("\n========================================================")
        print("SUCCESS: ALL 13 AUTH, DATABASE, AND ISOLATION TESTS PASSED!")
        print("========================================================")

    finally:
        db.close()
        if test_db_path.exists():
            try:
                test_db_path.unlink()
            except Exception:
                pass


if __name__ == "__main__":
    run_tests()
