from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

from app.services.pdf_parser import extract_text_from_pdf
from app.agents.resume_agent import analyze_resume

import os

router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...)
):

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as f:

        f.write(
            await file.read()
        )

    resume_text = extract_text_from_pdf(
        file_path
    )

    analysis = analyze_resume(
        resume_text
    )

    return {
        "filename": file.filename,
        "analysis": analysis
    }