"""
Authentication Endpoints
Handles user registration, login, and profile retrieval using JWT tokens.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register a new user account with email and password.
    Returns access token and user profile upon successful registration.
    """
    clean_email = user_in.email.strip().lower()

    if not clean_email or "@" not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required.",
        )

    # Check for existing user
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Hash password and persist user
    new_user = User(
        email=clean_email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip() if user_in.full_name else None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue access token
    access_token = create_access_token(
        subject=new_user.email,
        user_id=new_user.id,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and return access token",
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate an existing user using email and password.
    Returns a JWT bearer token for accessing protected routes.
    """
    clean_email = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=user.email,
        user_id=user.id,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve profile details for the currently authenticated user.
    """
    return UserResponse.model_validate(current_user)
