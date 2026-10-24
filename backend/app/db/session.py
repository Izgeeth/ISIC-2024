"""
Database Session and Engine Management
Supports SQLite by default and PostgreSQL when DATABASE_URL is supplied.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

database_url = settings.DATABASE_URL
# Handle SQLAlchemy 1.4+ compatibility for postgres:// -> postgresql://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# SQLite requires check_same_thread=False for multi-threaded FastAPI workers
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    """
    FastAPI dependency yielding an independent database session per request.
    Rolls back automatically on exception and always closes the session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database schema (creates tables if they do not exist).
    Safe to call multiple times.
    """
    # Import models here so Base knows about them before creating tables
    import app.db.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
