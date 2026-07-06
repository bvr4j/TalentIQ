"""
LinkedIn Agent — analyzes a LinkedIn profile URL for completeness and consistency.
Since the LinkedIn API requires OAuth, we use heuristics + Gemini to analyze 
whatever information is available from the URL and resume data.

If API restrictions prevent access, this step is gracefully skipped.
"""

import logging
import re
from app.services.llm_service import generate_json

logger = logging.getLogger(__name__)


def run_linkedin_agent(linkedin_url: str | None, resume_data: dict) -> dict:
    """
    Analyze a LinkedIn profile using resume data correlation.
    Returns {} if URL is missing.
    Returns a dict with linkedin_score (0-100) and analysis.
    """
    if not linkedin_url or not linkedin_url.strip():
        return {}

    url = linkedin_url.strip()

    # Validate it's actually a LinkedIn URL
    if "linkedin.com" not in url.lower():
        return {}

    username = _extract_username(url)

    # Since we can't scrape LinkedIn directly, we use available resume data
    # to infer profile quality and cross-check consistency
    prompt = f"""
You are an HR AI assistant analyzing a LinkedIn profile correlation with a resume.

LinkedIn Profile URL: {url}
LinkedIn Username: {username or "unknown"}

Resume Data:
- Name: {resume_data.get("name", "Unknown")}
- Skills: {", ".join(resume_data.get("skills", [])[:20])}
- Experience entries: {len(resume_data.get("experience", []))}
- Education entries: {len(resume_data.get("education", []))}
- Projects: {len(resume_data.get("projects", []))}
- Certifications: {len(resume_data.get("certifications", []))}

Based on the profile data richness and LinkedIn presence, estimate:
{{
  "linkedin_score": <number 0-100 estimated profile completeness/quality>,
  "profile_completeness": "Complete / Partial / Minimal",
  "experience_consistency": "High / Medium / Low",
  "education_consistency": "High / Medium / Low",
  "professional_presence": "Strong / Moderate / Weak",
  "reasoning": "Brief explanation of the score"
}}

Return ONLY the JSON object.
"""

    try:
        result = generate_json(prompt, fallback=_default_result())
        if not isinstance(result, dict):
            return _default_result()
        return _normalize(result)
    except Exception as exc:
        logger.error("[linkedin_agent] Error: %s", exc)
        return _default_result()


def _extract_username(url: str) -> str | None:
    match = re.search(r"linkedin\.com/in/([a-zA-Z0-9\-_]+)", url)
    return match.group(1) if match else None


def _default_result() -> dict:
    return {
        "linkedin_score": 50.0,
        "profile_completeness": "Partial",
        "experience_consistency": "Medium",
        "education_consistency": "Medium",
        "professional_presence": "Moderate",
        "reasoning": "LinkedIn profile analysis based on URL presence only.",
    }


def _normalize(data: dict) -> dict:
    default = _default_result()
    for key, val in default.items():
        if key not in data:
            data[key] = val
    try:
        data["linkedin_score"] = float(data["linkedin_score"])
    except (TypeError, ValueError):
        data["linkedin_score"] = 50.0
    return data
