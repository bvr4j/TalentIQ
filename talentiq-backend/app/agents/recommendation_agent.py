"""
Recommendation Agent — combines all sub-agent scores into a final verdict.
"""

import logging
from app.services.scoring_service import compute_overall_score, score_to_recommendation
from app.services.llm_service import generate_json

logger = logging.getLogger(__name__)

RECOMMENDATION_PROMPT_TEMPLATE = """
You are a senior talent intelligence AI. Based on the analysis data below, 
provide a final hiring recommendation.

Candidate: {name}
Job Title: {job_title}

Scores:
- Resume/JD Match Score: {match_score}/100
- GitHub Activity Score: {github_score}/100 (available: {github_available})
- LinkedIn Score: {linkedin_score}/100 (available: {linkedin_available})
- Overall Score: {overall_score}/100
- Current Recommendation: {recommendation}

Resume Analysis:
- Strengths: {strengths}
- Weaknesses: {weaknesses}
- Matched Skills: {matched_skills}
- Missing Skills: {missing_skills}
- Experience Match: {experience_match}
- Education Match: {education_match}

Provide a final comprehensive assessment as JSON:
{{
  "overall_score": {overall_score},
  "recommendation": "{recommendation}",
  "final_strengths": ["3-5 key reasons to hire or not hire"],
  "final_weaknesses": ["2-3 key concerns"],
  "reasoning": "3-4 sentence comprehensive hiring recommendation with clear rationale",
  "confidence": "High / Medium / Low"
}}

Return ONLY the JSON object.
"""


def run_recommendation_agent(
    resume_data: dict,
    matching_data: dict,
    github_data: dict,
    linkedin_data: dict,
    job: dict,
) -> dict:
    """
    Combine all analysis data into a final recommendation.
    """
    match_score = matching_data.get("match_score", 0.0)
    github_score = github_data.get("activity_score", 0.0)
    linkedin_score = linkedin_data.get("linkedin_score", 0.0)
    github_available = bool(github_data)
    linkedin_available = bool(linkedin_data)

    overall_score = compute_overall_score(
        match_score, github_score, linkedin_score,
        github_available, linkedin_available
    )
    recommendation = score_to_recommendation(overall_score)

    prompt = RECOMMENDATION_PROMPT_TEMPLATE.format(
        name=resume_data.get("name") or "Unknown",
        job_title=job.get("title") or "Unknown Position",
        match_score=round(match_score, 1),
        github_score=round(github_score, 1),
        linkedin_score=round(linkedin_score, 1),
        overall_score=round(overall_score, 1),
        recommendation=recommendation,
        github_available=github_available,
        linkedin_available=linkedin_available,
        strengths=matching_data.get("strengths", []),
        weaknesses=matching_data.get("weaknesses", []),
        matched_skills=matching_data.get("matched_skills", []),
        missing_skills=matching_data.get("missing_skills", []),
        experience_match=matching_data.get("experience_match", "Unknown"),
        education_match=matching_data.get("education_match", "Unknown"),
    )

    result = generate_json(prompt, fallback={})

    if not isinstance(result, dict):
        result = {}

    return {
        "overall_score": round(float(result.get("overall_score", overall_score)), 1),
        "recommendation": result.get("recommendation", recommendation),
        "strengths": result.get("final_strengths", matching_data.get("strengths", [])),
        "weaknesses": result.get("final_weaknesses", matching_data.get("weaknesses", [])),
        "reasoning": result.get("reasoning", matching_data.get("reasoning", "")),
        "confidence": result.get("confidence", "Medium"),
        # Pass-through from matching
        "match_score": round(match_score, 1),
        "github_score": round(github_score, 1),
        "linkedin_score": round(linkedin_score, 1),
        "matched_skills": matching_data.get("matched_skills", []),
        "missing_skills": matching_data.get("missing_skills", []),
        "experience_match": matching_data.get("experience_match", ""),
        "education_match": matching_data.get("education_match", ""),
    }
