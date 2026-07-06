"""
Matching Agent — compares a resume against a job description and returns a detailed score.
"""

import logging
from app.services.llm_service import generate_json

logger = logging.getLogger(__name__)

MATCHING_PROMPT_TEMPLATE = """
You are an expert technical recruiter AI. Compare the candidate resume and job description below.

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS: {required_skills}
PREFERRED SKILLS: {preferred_skills}
EXPERIENCE LEVEL REQUIRED: {experience_level}

CANDIDATE RESUME SUMMARY:
Name: {name}
Skills: {skills}
Experience: {experience}
Education: {education}

Analyze the match and return a JSON object:
{{
  "match_score": <number 0-100 overall JD match percentage>,
  "experience_match": "Strong / Moderate / Weak",
  "education_match": "Strong / Moderate / Weak",
  "matched_skills": ["skills candidate has that match JD"],
  "missing_skills": ["required skills candidate lacks"],
  "strengths": ["3-5 reasons this candidate is a good fit"],
  "weaknesses": ["2-4 areas where the candidate falls short for this role"],
  "reasoning": "3-4 sentence summary explaining the match score"
}}

Be objective and evidence-based. Return ONLY the JSON object.
"""


def run_matching_agent(resume_data: dict, job: dict) -> dict:
    """
    Compare resume data against a job and return matching analysis.
    """
    if not job.get("description") and not job.get("required_skills"):
        logger.warning("[matching_agent] Job has no description or required skills")
        return _empty_result()

    skills = ", ".join(resume_data.get("skills", []))
    experience = "; ".join(
        f"{e.get('title', '')} at {e.get('company', '')} ({e.get('duration', '')})"
        for e in resume_data.get("experience", [])
    )
    education = "; ".join(
        f"{e.get('degree', '')} from {e.get('institution', '')} ({e.get('year', '')})"
        for e in resume_data.get("education", [])
    )

    prompt = MATCHING_PROMPT_TEMPLATE.format(
        job_description=(job.get("description") or "")[:3000],
        required_skills=job.get("required_skills") or "Not specified",
        preferred_skills=job.get("preferred_skills") or "Not specified",
        experience_level=job.get("experience_level") or "Not specified",
        name=resume_data.get("name") or "Unknown",
        skills=skills or "None listed",
        experience=experience or "None listed",
        education=education or "None listed",
    )

    result = generate_json(prompt, fallback=_empty_result())
    if not isinstance(result, dict):
        return _empty_result()

    return _normalize(result)


def _empty_result() -> dict:
    return {
        "match_score": 0.0,
        "experience_match": "Weak",
        "education_match": "Weak",
        "matched_skills": [],
        "missing_skills": [],
        "strengths": [],
        "weaknesses": [],
        "reasoning": "Unable to perform matching analysis.",
    }


def _normalize(data: dict) -> dict:
    empty = _empty_result()
    for key, default in empty.items():
        if key not in data:
            data[key] = default

    # Ensure numeric types
    try:
        data["match_score"] = float(data["match_score"])
    except (TypeError, ValueError):
        data["match_score"] = 0.0

    return data
