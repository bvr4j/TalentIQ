"""
Scoring service — compute final overall score from sub-scores.
"""


def compute_overall_score(
    match_score: float,
    github_score: float = 0.0,
    linkedin_score: float = 0.0,
    github_available: bool = False,
    linkedin_available: bool = False,
) -> float:
    """
    Weighted combination of available scores.

    Weights:
    - match_score:    50%
    - github_score:   25% (if available, else redistributed to match)
    - linkedin_score: 25% (if available, else redistributed to match)
    """
    if github_available and linkedin_available:
        score = match_score * 0.50 + github_score * 0.25 + linkedin_score * 0.25
    elif github_available:
        score = match_score * 0.70 + github_score * 0.30
    elif linkedin_available:
        score = match_score * 0.70 + linkedin_score * 0.30
    else:
        score = match_score

    return round(min(100.0, max(0.0, score)), 1)


def score_to_recommendation(overall_score: float) -> str:
    """Map a 0-100 score to a hiring recommendation."""
    if overall_score >= 80:
        return "Strong Hire"
    elif overall_score >= 65:
        return "Hire"
    elif overall_score >= 45:
        return "Consider"
    else:
        return "Reject"
