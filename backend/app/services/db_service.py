"""
Database Service
Provides status information and connectivity checks for the database.
"""

from typing import Any, Dict
from sqlalchemy import text
from app.db.session import engine, database_url


class DatabaseService:
    """Service reporting database engine and connectivity status."""

    def get_status(self) -> Dict[str, Any]:
        """Checks live connectivity to the configured database."""
        engine_type = "SQLite" if "sqlite" in database_url.lower() else "PostgreSQL"
        is_connected = False
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                is_connected = True
        except Exception:
            is_connected = False

        return {
            "database_connected": is_connected,
            "engine": engine_type,
            "url_scheme": database_url.split(":")[0],
            "status": "Online" if is_connected else "Offline / Connection Error",
        }

    @property
    def is_connected(self) -> bool:
        return self.get_status()["database_connected"]


db_service = DatabaseService()
