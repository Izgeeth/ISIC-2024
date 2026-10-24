"""
ISIC Skin Lesion Analysis - FastAPI Application Entry Point

Phase 1: Initial project skeleton with health checks, CORS middleware,
and architectural scaffolding for upcoming ML inference and PostgreSQL integration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.core.config import settings
from app.api.v1.api import api_router
from app.services.model_service import model_service
from app.services.db_service import db_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Educational full-stack platform for multimodal skin lesion malignancy risk assessment (ISIC 2024).",
)

# Configure Cross-Origin Resource Sharing (CORS) for frontend clients (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def root_health() -> Dict[str, Any]:
    """
    Root health check endpoint.
    Returns immediate service status and phase readiness indicators.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "inference_active": model_service.is_loaded,
        "database_active": db_service.is_connected,
        "message": "API is operational. Model inference and database features are scheduled for subsequent phases.",
    }


# Include versioned API router (/api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root() -> Dict[str, str]:
    """Root info endpoint providing entry point references."""
    return {
        "app": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "health_url": "/health",
        "status": "active",
    }
