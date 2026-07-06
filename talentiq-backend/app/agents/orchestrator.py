"""
LangGraph Orchestrator — the main AI pipeline for candidate analysis.

Pipeline:
  upload_resume → resume_agent → matching_agent → github_agent (optional)
  → linkedin_agent (optional) → recommendation_agent → interview_agent
  → store_results → return_response

Each node receives a shared state dict and enriches it.
Optional agents (GitHub, LinkedIn) fail gracefully — the pipeline continues.
"""

import logging
from typing import Any, TypedDict

from langgraph.graph import StateGraph, END

from app.agents.resume_agent import run_resume_agent
from app.agents.matching_agent import run_matching_agent
from app.agents.github_agent import run_github_agent
from app.agents.linkedin_agent import run_linkedin_agent
from app.agents.recommendation_agent import run_recommendation_agent
from app.agents.interview_agent import run_interview_agent

logger = logging.getLogger(__name__)


# ── State definition ──────────────────────────────────────────────────────────

class PipelineState(TypedDict, total=False):
    # Inputs
    resume_text: str
    job: dict
    github_url: str | None
    linkedin_url: str | None

    # Agent outputs
    resume_data: dict
    matching_data: dict
    github_data: dict
    linkedin_data: dict
    recommendation_data: dict
    interview_data: dict

    # Status
    error: str | None
    completed: bool


# ── Node implementations ──────────────────────────────────────────────────────

def node_resume_agent(state: PipelineState) -> PipelineState:
    logger.info("[pipeline] Running resume agent")
    try:
        resume_data = run_resume_agent(state.get("resume_text", ""))
        return {**state, "resume_data": resume_data}
    except Exception as exc:
        logger.error("[pipeline] Resume agent error: %s", exc)
        return {**state, "resume_data": {}, "error": str(exc)}


def node_matching_agent(state: PipelineState) -> PipelineState:
    logger.info("[pipeline] Running matching agent")
    try:
        job = state.get("job") or {}
        resume_data = state.get("resume_data") or {}

        # Skip if no job description available
        if not job.get("description") and not job.get("required_skills"):
            logger.info("[pipeline] No job context — skipping matching agent")
            return {**state, "matching_data": {"match_score": 50.0}}

        matching_data = run_matching_agent(resume_data, job)
        return {**state, "matching_data": matching_data}
    except Exception as exc:
        logger.error("[pipeline] Matching agent error: %s", exc)
        return {**state, "matching_data": {"match_score": 0.0}, "error": str(exc)}


def node_github_agent(state: PipelineState) -> PipelineState:
    logger.info("[pipeline] Running GitHub agent (optional)")
    try:
        # Check resume_data for github_url if not provided directly
        github_url = state.get("github_url")
        if not github_url:
            resume_data = state.get("resume_data") or {}
            github_url = resume_data.get("github_url")

        github_data = run_github_agent(github_url)
        return {**state, "github_data": github_data}
    except Exception as exc:
        logger.warning("[pipeline] GitHub agent failed (continuing): %s", exc)
        return {**state, "github_data": {}}


def node_linkedin_agent(state: PipelineState) -> PipelineState:
    logger.info("[pipeline] Running LinkedIn agent (optional)")
    try:
        linkedin_url = state.get("linkedin_url")
        if not linkedin_url:
            resume_data = state.get("resume_data") or {}
            linkedin_url = resume_data.get("linkedin_url")

        resume_data = state.get("resume_data") or {}
        linkedin_data = run_linkedin_agent(linkedin_url, resume_data)
        return {**state, "linkedin_data": linkedin_data}
    except Exception as exc:
        logger.warning("[pipeline] LinkedIn agent failed (continuing): %s", exc)
        return {**state, "linkedin_data": {}}


def node_recommendation_agent(state: PipelineState) -> PipelineState:
    logger.info("[pipeline] Running recommendation agent")
    try:
        recommendation_data = run_recommendation_agent(
            resume_data=state.get("resume_data") or {},
            matching_data=state.get("matching_data") or {},
            github_data=state.get("github_data") or {},
            linkedin_data=state.get("linkedin_data") or {},
            job=state.get("job") or {},
        )
        return {**state, "recommendation_data": recommendation_data}
    except Exception as exc:
        logger.error("[pipeline] Recommendation agent error: %s", exc)
        return {**state, "recommendation_data": {}, "error": str(exc)}


def node_interview_agent(state: PipelineState) -> PipelineState:
    logger.info("[pipeline] Running interview agent")
    try:
        interview_data = run_interview_agent(
            resume_data=state.get("resume_data") or {},
            matching_data=state.get("matching_data") or {},
            recommendation_data=state.get("recommendation_data") or {},
            job=state.get("job") or {},
        )
        return {**state, "interview_data": interview_data, "completed": True}
    except Exception as exc:
        logger.error("[pipeline] Interview agent error: %s", exc)
        return {**state, "interview_data": {}, "completed": True, "error": str(exc)}


# ── Graph construction ────────────────────────────────────────────────────────

def build_pipeline() -> Any:
    """Build and compile the LangGraph analysis pipeline."""
    graph = StateGraph(PipelineState)

    graph.add_node("resume_agent", node_resume_agent)
    graph.add_node("matching_agent", node_matching_agent)
    graph.add_node("github_agent", node_github_agent)
    graph.add_node("linkedin_agent", node_linkedin_agent)
    graph.add_node("recommendation_agent", node_recommendation_agent)
    graph.add_node("interview_agent", node_interview_agent)

    graph.set_entry_point("resume_agent")
    graph.add_edge("resume_agent", "matching_agent")
    graph.add_edge("matching_agent", "github_agent")
    graph.add_edge("github_agent", "linkedin_agent")
    graph.add_edge("linkedin_agent", "recommendation_agent")
    graph.add_edge("recommendation_agent", "interview_agent")
    graph.add_edge("interview_agent", END)

    return graph.compile()


# Singleton compiled pipeline
_pipeline = None


def get_pipeline() -> Any:
    global _pipeline
    if _pipeline is None:
        _pipeline = build_pipeline()
    return _pipeline


# ── Public entry point ────────────────────────────────────────────────────────

def run_analysis_pipeline(
    resume_text: str,
    job: dict,
    github_url: str | None = None,
    linkedin_url: str | None = None,
) -> dict:
    """
    Run the full analysis pipeline for a candidate.

    Returns a dict with all agent outputs:
    {
        resume_data, matching_data, github_data, linkedin_data,
        recommendation_data, interview_data, completed, error
    }
    """
    pipeline = get_pipeline()

    initial_state: PipelineState = {
        "resume_text": resume_text,
        "job": job,
        "github_url": github_url,
        "linkedin_url": linkedin_url,
        "resume_data": {},
        "matching_data": {},
        "github_data": {},
        "linkedin_data": {},
        "recommendation_data": {},
        "interview_data": {},
        "error": None,
        "completed": False,
    }

    try:
        final_state = pipeline.invoke(initial_state)
        return dict(final_state)
    except Exception as exc:
        logger.error("[orchestrator] Pipeline failed: %s", exc)
        initial_state["error"] = str(exc)
        initial_state["completed"] = False
        return dict(initial_state)
