"""
PDF text extraction using PyMuPDF (fitz).
"""

import fitz  # PyMuPDF
from pathlib import Path


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract plain text from a PDF file.
    Returns an empty string if extraction fails.
    """
    try:
        path = Path(file_path)
        if not path.exists():
            return ""

        doc = fitz.open(str(path))
        text_parts: list[str] = []

        for page in doc:
            text_parts.append(page.get_text("text"))  # type: ignore[attr-defined]

        doc.close()
        return "\n".join(text_parts).strip()

    except Exception as exc:
        print(f"[pdf_parser] Error extracting text from {file_path}: {exc}")
        return ""