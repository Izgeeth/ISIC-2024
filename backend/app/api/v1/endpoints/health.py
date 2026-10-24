"""
Health Check Endpoint
"""

from fastapi import APIRouter
from typing import Dict, Any

from app.core.config import settings
from app.services.model_service import model_service
from app.services.db_service import db_service

router = APIRouter()


@router.get("/health", response_model=Dict[str, Any])
def health_check() -> Dict[str, Any]:
    """
    Returns API health status and service readiness.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "services": {
            "model_inference": model_service.get_status(),
            "database": db_service.get_status(),
        },
    }
