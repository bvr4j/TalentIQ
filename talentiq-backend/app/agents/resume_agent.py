"""
Resume Agent — extracts structured profile data from raw resume text using Gemini.
"""

import logging
from app.services.llm_service import generate_json

logger = logging.getLogger(__name__)

RESUME_PROMPT_TEMPLATE = """
You are an expert HR AI system. Analyze the following resume text and extract structured information.

RESUME TEXT:
{resume_text}

Return a JSON object with EXACTLY these fields:
{{
  "name": "Full name of the candidate (string or null)",
  "email": "Email address (string or null)",
  "phone": "Phone number (string or null)",
  "github_url": "GitHub profile URL if mentioned (string or null)",
  "linkedin_url": "LinkedIn profile URL if mentioned (string or null)",
  "skills": ["list", "of", "technical", "and", "soft", "skills"],
  "education": [
    {{"degree": "...", "institution": "...", "year": "..."}}
  ],
  "experience": [
    {{"title": "...", "company": "...", "duration": "...", "description": "..."}}
  ],
  "certifications": ["list of certifications"],
  "projects": [
    {{"name": "...", "description": "...", "url": "..."}}
  ],
  "strengths": ["3-5 key professional strengths"],
  "weaknesses": ["1-3 areas for improvement based on the resume"],
  "summary": "2-3 sentence professional summary"
}}

Be precise and only include information actually found in the resume.
Return ONLY the JSON object, no markdown, no explanation.
"""


def run_resume_agent(resume_text: str) -> dict:
    """
    Parse a resume and return a structured dict.
    Always returns a dict (may have partial/empty fields on failure).
    """
    if not resume_text or len(resume_text.strip()) < 50:
        logger.warning("[resume_agent] Resume text too short or empty")
        return _empty_result()

    prompt = RESUME_PROMPT_TEMPLATE.format(resume_text=resume_text[:8000])  # Trim to avoid token limits
    result = generate_json(prompt, fallback=_empty_result())

    if not isinstance(result, dict):
        return _empty_result()

    return _normalize(result)


def _empty_result() -> dict:
    return {
        "name": None,
        "email": None,
        "phone": None,
        "github_url": None,
        "linkedin_url": None,
        "skills": [],
        "education": [],
        "experience": [],
        "certifications": [],
        "projects": [],
        "strengths": [],
        "weaknesses": [],
        "summary": "",
    }


def _normalize(data: dict) -> dict:
    """Ensure all expected fields are present with correct types."""
    empty = _empty_result()
    for key, default in empty.items():
        if key not in data:
            data[key] = default
        elif isinstance(default, list) and not isinstance(data[key], list):
            data[key] = []
    return data