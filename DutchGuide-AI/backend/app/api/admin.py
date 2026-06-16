"""
Admin API Router
================
POST /api/rebuild  — Rebuild the vector DB from scratch.
GET  /api/stats    — View knowledge base statistics.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from loguru import logger

from app.models.schemas import RebuildResponse, StatsResponse
from app.services.ingest_service import ingest_all_documents
from app.rag.vector_store import get_vector_store
from app.core.config import settings

router = APIRouter()

# Track rebuild status (simple in-memory flag)
_rebuild_in_progress = False


@router.post("/rebuild", response_model=RebuildResponse)
async def rebuild_knowledge_base(background_tasks: BackgroundTasks) -> RebuildResponse:
    """
    Rebuild the entire vector database from the data/ directory.
    This re-reads all documents, re-chunks, re-embeds, and re-stores everything.

    ⚠️  This operation resets the existing vector store.
    """
    global _rebuild_in_progress
    if _rebuild_in_progress:
        raise HTTPException(status_code=409, detail="Rebuild already in progress. Please wait.")

    try:
        _rebuild_in_progress = True
        logger.info("🔄 Starting knowledge base rebuild...")
        result = ingest_all_documents()
        logger.info(f"✅ Rebuild complete: {result}")
        return RebuildResponse(
            message="Knowledge base rebuilt successfully",
            total_chunks=result.get("total_chunks", 0),
            time_taken_seconds=result.get("time_taken", 0.0),
        )
    except Exception as e:
        logger.error(f"Rebuild failed: {e}")
        raise HTTPException(status_code=500, detail=f"Rebuild failed: {e}")
    finally:
        _rebuild_in_progress = False


@router.get("/stats", response_model=StatsResponse)
async def get_stats() -> StatsResponse:
    """
    Returns statistics about the current knowledge base state.
    """
    try:
        vs = get_vector_store()
        count = vs._collection.count()

        # Get per-category document counts
        all_docs = vs.get(include=["metadatas"])
        categories: dict = {}
        for meta in all_docs.get("metadatas", []):
            cat = meta.get("category", "unknown") if meta else "unknown"
            categories[cat] = categories.get(cat, 0) + 1

        return StatsResponse(
            total_documents=vs._collection.count(),
            documents_by_category=categories,
            vector_store_size=count,
            embedding_model=settings.embedding_model,
            llm_model=settings.openai_model,
        )
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve stats: {e}")
