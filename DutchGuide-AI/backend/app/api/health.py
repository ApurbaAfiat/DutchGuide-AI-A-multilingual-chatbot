"""
Health Check Router
===================
GET /api/health  — Liveness + readiness probe.
"""

from fastapi import APIRouter
from loguru import logger

from app.models.schemas import HealthResponse
from app.rag.vector_store import get_vector_store
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Returns the health status of the application.
    Used by Render / Railway health check probes.
    """
    vector_store_ready = False
    llm_ready = False

    # Check vector store
    try:
        vs = get_vector_store()
        _ = vs._collection.count()
        vector_store_ready = True
    except Exception as e:
        logger.warning(f"Vector store health check failed: {e}")

    # Check LLM availability (simple key presence check)
    try:
        if settings.openai_api_key and settings.openai_api_key != "sk-your-openai-api-key-here":
            llm_ready = True
    except Exception:
        pass

    overall_status = "healthy" if (vector_store_ready and llm_ready) else "degraded"

    return HealthResponse(
        status=overall_status,
        vector_store_ready=vector_store_ready,
        llm_ready=llm_ready,
        version="1.0.0",
    )
