"""
DOCX text extraction using python-docx.
"""

from pathlib import Path
from docx import Document


def extract_text_from_docx(file_path: str) -> str:
    """
    Extract plain text from a DOCX file.
    Returns an empty string if extraction fails.
    """
    try:
        path = Path(file_path)
        if not path.exists():
            return ""

        doc = Document(str(path))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs).strip()

    except Exception as exc:
        print(f"[docx_parser] Error extracting text from {file_path}: {exc}")
        return ""
