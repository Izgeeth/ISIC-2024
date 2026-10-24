"""
Application Configuration
Defines environment settings, CORS policies, and API prefixes.
"""

from typing import List


class Settings:
    PROJECT_NAME: str = "ISIC Skin Lesion Analysis API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # CORS origins for local frontend development (Vite default is 5173)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
