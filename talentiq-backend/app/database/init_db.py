"""
Database initialiser — creates all tables on startup.
Used in development; production uses Alembic migrations.
"""

from app.database.base import Base
from app.database.session import engine

# Import all models so SQLAlchemy knows about them before creating tables
import app.models.user          # noqa: F401
import app.models.job           # noqa: F401
import app.models.candidate     # noqa: F401
import app.models.analysis      # noqa: F401
import app.models.settings      # noqa: F401


def init_db() -> None:
    """Create all tables if they do not exist."""
    Base.metadata.create_all(bind=engine)
