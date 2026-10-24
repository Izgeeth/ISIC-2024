"""
Pydantic Schemas for Prediction History Records
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class PredictionHistoryResponse(BaseModel):
    """Schema for individual prediction history record."""

    id: int
    user_id: int
    prediction_type: str
    model_name: str
    isic_id: Optional[str] = None
    risk_score: float
    risk_score_percent: float
    input_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PredictionHistoryList(BaseModel):
    """Schema for paginated history listings."""

    total: int
    records: List[PredictionHistoryResponse]
