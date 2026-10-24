"""
Application Configuration
Defines environment settings, security keys, CORS policies, and database connection.
"""

import os
from typing import List


class Settings:
    PROJECT_NAME: str = "ISIC Skin Lesion Analysis API"
    VERSION: str = "0.2.0"
    API_V1_STR: str = "/api/v1"

    # Database configuration (Defaults to SQLite for local development; supports PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./isic_app.db")

    # JWT Authentication settings
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "isic-dev-secret-key-change-in-production-2026"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")  # 24 hours
    )

    # CORS origins for local frontend development (Vite default is 5173)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
