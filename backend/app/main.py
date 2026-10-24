"""
ISIC Skin Lesion Analysis - FastAPI Application Entry Point

Features:
- CatBoost tabular metadata inference
- PyTorch ResNet-18 dermoscopic image inference
- JWT Authentication (register, login, me)
- SQLAlchemy database persistence (SQLite default / PostgreSQL compatible)
- User-specific prediction history with strict data isolation
"""

from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import init_db
from app.services.db_service import db_service
from app.services.image_service import image_service
from app.services.model_service import model_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown hooks."""
    # Initialize database tables on startup
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Educational full-stack platform for multimodal skin lesion malignancy risk assessment (ISIC 2024).",
    lifespan=lifespan,
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
    Reports operational status for API, ML models, and database connectivity.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "services": {
            "metadata_inference": {
                "active": model_service.is_loaded,
                "model": "CatBoost",
            },
            "image_inference": {
                "active": image_service.is_loaded,
                "model": "ResNet-18",
            },
            "database": db_service.get_status(),
        },
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
