"""
Prediction History Endpoints
Provides authenticated CRUD operations for a user's saved predictions.
Strictly enforces user isolation so users can access and delete ONLY their own records.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, PredictionHistory
from app.schemas.history import (
    PredictionHistoryResponse,
    PredictionHistoryList,
)
from app.api.deps import get_current_user

router = APIRouter()


@router.get(
    "",
    response_model=PredictionHistoryList,
    summary="List current user's prediction history",
)
def list_history(
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Page offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all saved predictions belonging to the authenticated user,
    ordered by most recent first.
    """
    query = db.query(PredictionHistory).filter(
        PredictionHistory.user_id == current_user.id
    )

    total = query.count()
    records = (
        query.order_by(PredictionHistory.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return PredictionHistoryList(
        total=total,
        records=[
            PredictionHistoryResponse.model_validate(rec) for rec in records
        ],
    )


@router.get(
    "/{record_id}",
    response_model=PredictionHistoryResponse,
    summary="Get a specific prediction record belonging to user",
)
def get_history_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve details of a single prediction record.
    Returns 404 if the record does not exist or does not belong to the user.
    """
    record = (
        db.query(PredictionHistory)
        .filter(
            PredictionHistory.id == record_id,
            PredictionHistory.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record #{record_id} not found.",
        )

    return PredictionHistoryResponse.model_validate(record)


@router.delete(
    "/{record_id}",
    summary="Delete a prediction record belonging to user",
)
def delete_history_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Delete a specific prediction from the user's history.
    Returns 404 if the record does not exist or does not belong to the user.
    """
    record = (
        db.query(PredictionHistory)
        .filter(
            PredictionHistory.id == record_id,
            PredictionHistory.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record #{record_id} not found.",
        )

    db.delete(record)
    db.commit()

    return {
        "success": True,
        "message": f"Prediction record #{record_id} deleted successfully.",
        "deleted_id": record_id,
    }
