"""
SQLAlchemy declarative Base.
All models import from here so they share the same metadata.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
