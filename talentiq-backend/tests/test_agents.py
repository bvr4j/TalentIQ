"""
Tests for agent functions (unit tests with mocked LLM).
"""

import pytest
from unittest.mock import patch


def test_resume_agent_empty_text():
    from app.agents.resume_agent import run_resume_agent
    result = run_resume_agent("")
    assert isinstance(result, dict)
    assert result["name"] is None
    assert result["skills"] == []


def test_resume_agent_short_text():
    from app.agents.resume_agent import run_resume_agent
    result = run_resume_agent("Hi")
    assert isinstance(result, dict)


def test_resume_agent_with_mock():
    from app.agents.resume_agent import run_resume_agent

    mock_result = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "555-1234",
        "skills": ["Python", "FastAPI"],
        "education": [],
        "experience": [],
        "certifications": [],
        "projects": [],
        "strengths": ["Strong Python skills"],
        "weaknesses": [],
        "summary": "Experienced backend developer",
        "github_url": None,
        "linkedin_url": None,
    }

    with patch("app.agents.resume_agent.generate_json", return_value=mock_result):
        result = run_resume_agent("John is a Python developer with 5 years of experience at various companies.")

    assert result["name"] == "Jane Doe"
    assert "Python" in result["skills"]


def test_matching_agent_no_job():
    from app.agents.matching_agent import run_matching_agent
    result = run_matching_agent({"name": "Jane", "skills": ["Python"]}, {})
    assert isinstance(result, dict)
    assert "match_score" in result


def test_matching_agent_with_mock():
    from app.agents.matching_agent import run_matching_agent

    mock_result = {
        "match_score": 78.5,
        "experience_match": "Strong",
        "education_match": "Moderate",
        "matched_skills": ["Python", "FastAPI"],
        "missing_skills": ["Go"],
        "strengths": ["Great Python skills"],
        "weaknesses": ["No Go experience"],
        "reasoning": "Strong match overall.",
    }

    with patch("app.agents.matching_agent.generate_json", return_value=mock_result):
        result = run_matching_agent(
            {"name": "Jane", "skills": ["Python", "FastAPI"], "experience": [], "education": []},
            {"title": "Backend Engineer", "description": "Build APIs", "required_skills": "Python, Go"},
        )

    assert result["match_score"] == 78.5
    assert "Python" in result["matched_skills"]


def test_scoring_service():
    from app.services.scoring_service import compute_overall_score, score_to_recommendation

    # Only match score
    assert compute_overall_score(80.0) == 80.0

    # With GitHub
    score = compute_overall_score(80.0, github_score=60.0, github_available=True)
    assert score == pytest.approx(74.0, abs=0.5)

    # Recommendations
    assert score_to_recommendation(85) == "Strong Hire"
    assert score_to_recommendation(70) == "Hire"
    assert score_to_recommendation(50) == "Consider"
    assert score_to_recommendation(30) == "Reject"


def test_github_agent_no_url():
    from app.agents.github_agent import run_github_agent
    result = run_github_agent(None)
    assert result == {}

    result = run_github_agent("")
    assert result == {}


def test_linkedin_agent_no_url():
    from app.agents.linkedin_agent import run_linkedin_agent
    result = run_linkedin_agent(None, {})
    assert result == {}


def test_pdf_parser_nonexistent():
    from app.services.pdf_parser import extract_text_from_pdf
    result = extract_text_from_pdf("/nonexistent/path/file.pdf")
    assert result == ""
