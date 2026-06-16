"""
Chat API Router
===============
POST /api/chat  — The main chat endpoint.
"""

from fastapi import APIRouter, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from loguru import logger

from app.models.schemas import ChatRequest, ChatResponse
from app.services.chat_service import process_chat
from app.core.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/chat", response_model=ChatResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def chat(request: Request, body: ChatRequest) -> ChatResponse:
    """
    Main RAG chat endpoint.

    - Accepts a user message plus optional conversation history.
    - Auto-detects language (or uses override).
    - Retrieves relevant knowledge base chunks.
    - Returns an LLM-generated answer with source citations.
    """
    try:
        response = await process_chat(body)
        return response
    except RuntimeError as e:
        logger.error(f"Chat processing error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception(f"Unexpected error in /chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
