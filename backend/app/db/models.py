"""
SQLAlchemy ORM Models for Users and Prediction History
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class User(Base):
    """Registered user model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # User's saved prediction records
    predictions = relationship(
        "PredictionHistory",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(PredictionHistory.created_at)",
    )


class PredictionHistory(Base):
    """
    Stores individual patient prediction records for logged-in users.
    NOTE: Uploaded image bytes are NOT stored in the database.
    Only model outputs, metadata summaries, and timestamps are persisted.
    """

    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prediction_type = Column(String(50), nullable=False)  # 'metadata' | 'image'
    model_name = Column(String(50), nullable=False)       # 'CatBoost' | 'ResNet-18'
    isic_id = Column(String(64), nullable=True)           # ISIC identifier if provided
    risk_score = Column(Float, nullable=False)            # e.g. 0.0421
    risk_score_percent = Column(Float, nullable=False)    # e.g. 4.21
    input_summary = Column(Text, nullable=True)           # JSON string or summary of inputs
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Link back to user
    user = relationship("User", back_populates="predictions")
