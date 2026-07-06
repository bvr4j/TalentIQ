"""
Interview Agent — generates tailored interview questions based on candidate and JD.
"""

import logging
from app.services.llm_service import generate_json

logger = logging.getLogger(__name__)

INTERVIEW_PROMPT_TEMPLATE = """
You are a senior technical interviewer AI. Generate a comprehensive interview question set
for the candidate below, specifically tailored to the job requirements.

Candidate: {name}
Job Title: {job_title}
Job Description: {job_description}

Candidate's Strong Areas: {strengths}
Candidate's Weak Areas: {weaknesses}
Missing Skills: {missing_skills}
Matched Skills: {matched_skills}

Generate interview questions as JSON:
{{
  "technical_questions": [
    {{"question": "...", "category": "...", "difficulty": "Easy/Medium/Hard", "rationale": "why this question"}}
  ],
  "behavioral_questions": [
    {{"question": "...", "category": "...", "rationale": "why this question"}}
  ],
  "followup_questions": [
    {{"question": "...", "context": "when to ask this"}}
  ],
  "red_flag_probes": [
    {{"question": "...", "concern": "what gap this probes"}}
  ]
}}

Rules:
- 5 technical questions (focus on matched skills + probe missing skills)
- 4 behavioral questions (focus on experience and soft skills)
- 3 follow-up questions (deeper dives on key areas)
- 2 red flag probes (probe weak areas diplomatically)

Return ONLY the JSON object.
"""


def run_interview_agent(
    resume_data: dict,
    matching_data: dict,
    recommendation_data: dict,
    job: dict,
) -> dict:
    """
    Generate a structured set of interview questions.
    """
    prompt = INTERVIEW_PROMPT_TEMPLATE.format(
        name=resume_data.get("name") or "the candidate",
        job_title=job.get("title") or "the role",
        job_description=(job.get("description") or "")[:2000],
        strengths=recommendation_data.get("strengths", [])[:5],
        weaknesses=recommendation_data.get("weaknesses", [])[:4],
        missing_skills=matching_data.get("missing_skills", [])[:8],
        matched_skills=matching_data.get("matched_skills", [])[:8],
    )

    result = generate_json(prompt, fallback=_empty_questions())
    if not isinstance(result, dict):
        return _empty_questions()

    # Ensure all sections exist
    for key in ["technical_questions", "behavioral_questions", "followup_questions", "red_flag_probes"]:
        if key not in result or not isinstance(result[key], list):
            result[key] = []

    return result


def _empty_questions() -> dict:
    return {
        "technical_questions": [],
        "behavioral_questions": [],
        "followup_questions": [],
        "red_flag_probes": [],
    }
