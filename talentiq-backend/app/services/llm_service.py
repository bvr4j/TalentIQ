"""
LLM service — Google Gemini API wrapper.
Provides a single structured JSON generation function used by all agents.
"""

import json
import re
import logging
from typing import Any

import google.generativeai as genai  # type: ignore[import-untyped]
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini once at module load
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


def _get_model() -> Any:
    return genai.GenerativeModel(settings.GEMINI_MODEL)


def generate_json(prompt: str, fallback: dict | list | None = None) -> dict | list:
    """
    Call Gemini and return parsed JSON.
    Falls back to `fallback` dict/list on any error.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("[llm_service] No GEMINI_API_KEY set — returning fallback")
        return fallback if fallback is not None else {}

    try:
        model = _get_model()
        full_prompt = (
            f"{prompt}\n\n"
            "IMPORTANT: Return ONLY valid JSON with no markdown, no code fences, "
            "no explanation. The response must be parseable by json.loads()."
        )
        response = model.generate_content(full_prompt)
        text = response.text.strip()

        # Strip markdown code fences if present
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

        return json.loads(text)  # type: ignore[no-any-return]

    except json.JSONDecodeError as exc:
        logger.error("[llm_service] JSON decode error: %s", exc)
        return fallback if fallback is not None else {}
    except Exception as exc:
        logger.error("[llm_service] Gemini API error: %s", exc)
        return fallback if fallback is not None else {}


def generate_text(prompt: str, fallback: str = "") -> str:
    """
    Call Gemini and return plain text.
    """
    if not settings.GEMINI_API_KEY:
        return fallback

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as exc:
        logger.error("[llm_service] Gemini text error: %s", exc)
        return fallback
