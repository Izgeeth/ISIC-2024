from fastapi import APIRouter
from app.api.v1.endpoints import health, predictions, auth, history

api_router = APIRouter()

# Health endpoints
api_router.include_router(health.router, tags=["Health"])

# Authentication endpoints (/api/v1/auth/register, /api/v1/auth/login, /api/v1/auth/me)
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# User-specific prediction history (/api/v1/predictions/history)
api_router.include_router(
    history.router,
    prefix="/predictions/history",
    tags=["Prediction History"],
)

# Model inference endpoints (/api/v1/predictions/metadata, /api/v1/predictions/image)
api_router.include_router(
    predictions.router,
    prefix="/predictions",
    tags=["Predictions"],
)
