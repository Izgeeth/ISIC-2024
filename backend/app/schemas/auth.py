"""
Pydantic Schemas for Authentication and User Management
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    """Schema for user registration."""

    email: str = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=6, description="Password (at least 6 characters)"
    )
    full_name: Optional[str] = Field(None, description="Optional full name")


class UserLogin(BaseModel):
    """Schema for user login."""

    email: str
    password: str


class UserResponse(BaseModel):
    """Schema for user profile responses."""

    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for access token responses."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
