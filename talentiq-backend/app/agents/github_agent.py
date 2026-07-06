"""
GitHub Agent — wraps the GitHub service and computes a normalized GitHub score.
"""

import logging
from app.services.github_service import fetch_github_profile

logger = logging.getLogger(__name__)


def run_github_agent(github_url: str | None) -> dict:
    """
    Fetch and score a candidate's GitHub profile.
    Returns {} if URL is missing or fetch fails.
    """
    if not github_url or not github_url.strip():
        return {}

    try:
        data = fetch_github_profile(github_url.strip())
        return data  # Already contains activity_score
    except Exception as exc:
        logger.error("[github_agent] Error: %s", exc)
        return {}
