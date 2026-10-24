"""
Database Service Placeholder

NOTE:
Database connectivity (PostgreSQL / SQLAlchemy) is NOT configured at this stage.
Alembic migrations, database models (User, PredictionHistory), and session
management will be introduced in a future development phase.
"""

from typing import Any, Dict


class DatabaseService:
    """
    Placeholder service for database session and persistence.

    Future Responsibilities:
    1. Manage SQLAlchemy engine and connection pool (PostgreSQL).
    2. Persist patient prediction records and audit history.
    3. Support user authentication and authorization (JWT).
    """

    def __init__(self) -> None:
        self.is_connected: bool = False

    def get_status(self) -> Dict[str, Any]:
        """Returns the status of the database connection."""
        return {
            "database_connected": self.is_connected,
            "engine": "PostgreSQL (Planned)",
            "orm": "SQLAlchemy (Planned)",
            "status": "Database offline. Persistence layer scheduled for future phase.",
        }


# Global database service instance
db_service = DatabaseService()
