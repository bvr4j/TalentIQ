"""
GitHub service — fetch public profile data via GitHub REST API v3.
"""

import logging
import re
import httpx
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

GITHUB_API_BASE = "https://api.github.com"


def _headers() -> dict:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if settings.GITHUB_TOKEN:
        h["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
    return h


def extract_username(github_url: str) -> str | None:
    """Extract GitHub username from a profile URL."""
    match = re.search(r"github\.com/([a-zA-Z0-9\-_]+)", github_url)
    return match.group(1) if match else None


def fetch_github_profile(github_url: str) -> dict:
    """
    Fetch user profile, repos, languages and compute an activity score.
    Returns a dict ready to be stored in GitHubProfile.
    Returns {} if anything fails.
    """
    username = extract_username(github_url)
    if not username:
        logger.warning("[github_service] Could not extract username from %s", github_url)
        return {}

    try:
        with httpx.Client(timeout=15.0, headers=_headers()) as client:
            # User profile
            resp = client.get(f"{GITHUB_API_BASE}/users/{username}")
            resp.raise_for_status()
            profile = resp.json()

            # Repositories (up to 100, sorted by updated)
            repos_resp = client.get(
                f"{GITHUB_API_BASE}/users/{username}/repos",
                params={"per_page": 100, "sort": "updated"},
            )
            repos_resp.raise_for_status()
            repos = repos_resp.json()

        total_stars = sum(r.get("stargazers_count", 0) for r in repos if isinstance(r, dict))
        languages: list[str] = list(
            {r.get("language") for r in repos if isinstance(r, dict) and r.get("language")}
        )

        # Recent activity — top 5 repos by updated_at
        recent = sorted(
            [r for r in repos if isinstance(r, dict)],
            key=lambda r: r.get("updated_at", ""),
            reverse=True,
        )[:5]
        recent_activity = [
            {"name": r.get("name"), "stars": r.get("stargazers_count", 0), "language": r.get("language")}
            for r in recent
        ]

        public_repos = profile.get("public_repos", len(repos))

        # Simple activity score (0-100)
        score = min(100.0, (public_repos * 1.5) + (total_stars * 0.5) + (len(languages) * 3))

        freq = "High" if score >= 60 else "Medium" if score >= 30 else "Low"

        return {
            "username": username,
            "public_repos": public_repos,
            "total_stars": total_stars,
            "languages": languages,
            "recent_activity": recent_activity,
            "contribution_frequency": freq,
            "activity_score": round(score, 1),
        }

    except httpx.HTTPStatusError as exc:
        logger.warning("[github_service] HTTP %s for %s: %s", exc.response.status_code, username, exc)
        return {}
    except Exception as exc:
        logger.error("[github_service] Error fetching %s: %s", username, exc)
        return {}
