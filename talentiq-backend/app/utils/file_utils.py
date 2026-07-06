"""
File utilities — safe upload handling and format detection.
"""

import os
from pathlib import Path
from app.config.settings import get_settings

settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def is_allowed_file(filename: str) -> bool:
    """Check if the uploaded filename has an allowed extension."""
    suffix = Path(filename).suffix.lower()
    return suffix in ALLOWED_EXTENSIONS


def get_file_extension(filename: str) -> str:
    """Return the file extension in lowercase."""
    return Path(filename).suffix.lower()


def ensure_upload_dir() -> Path:
    """Ensure the upload directory exists and return its path."""
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


def safe_filename(filename: str, prefix: str = "") -> str:
    """Generate a safe unique filename."""
    import uuid
    suffix = get_file_extension(filename)
    unique_name = f"{prefix}_{uuid.uuid4().hex}{suffix}" if prefix else f"{uuid.uuid4().hex}{suffix}"
    return unique_name
