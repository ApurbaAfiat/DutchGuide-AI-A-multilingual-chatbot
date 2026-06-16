"""
Chat Service
============
Orchestrates the full RAG pipeline:
  1. Detect language
  2. Retrieve relevant chunks
  3. Build system prompt
  4. Call LLM (OpenAI)
  5. Format response with sources and suggested questions
"""

from typing import List, Tuple
from openai import AsyncOpenAI
from loguru import logger

from app.core.config import settings
from app.models.schemas import ChatMessage, ChatRequest, ChatResponse, Source
from app.rag.retriever import retrieve_relevant_chunks, format_context
from app.prompts.system_prompts import get_system_prompt
from app.prompts.suggested_questions import get_suggested_questions
from app.utils.language_detector import detect_language, get_language_instruction
from app.utils.text_utils import truncate_text

# Async OpenAI client (reused across requests)
_openai_client = AsyncOpenAI(api_key=settings.openai_api_key)


async def process_chat(request: ChatRequest) -> ChatResponse:
    """
    Main chat handler. Runs the full RAG pipeline and returns a structured response.
    """
    # ── 1. Language detection ─────────────────────────────────────────────────
    if request.language.value == "auto":
        lang_code, lang_name = detect_language(request.message)
    else:
        lang_code = request.language.value
        from app.utils.language_detector import SUPPORTED_LANGUAGES
        lang_name = SUPPORTED_LANGUAGES.get(lang_code, "English")

    logger.info(f"Language: {lang_name} ({lang_code}) | Session: {request.session_id}")

    # ── 2. Retrieve relevant chunks ───────────────────────────────────────────
    chunks = retrieve_relevant_chunks(request.message, top_k=settings.rag_top_k)
    context = format_context(chunks)

    # ── 3. Build prompts ──────────────────────────────────────────────────────
    lang_instruction = get_language_instruction(lang_code)
    system_prompt = get_system_prompt(lang_code, context, lang_instruction)

    # Build message history for multi-turn conversation
    messages = [{"role": "system", "content": system_prompt}]

    # Add last N conversation turns
    history = request.conversation_history[-(settings.max_conversation_history):]
    for turn in history:
        messages.append({"role": turn.role.value, "content": turn.content})

    # Current user message
    messages.append({"role": "user", "content": request.message})

    # ── 4. LLM generation ─────────────────────────────────────────────────────
    try:
        completion = await _openai_client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            max_tokens=settings.openai_max_tokens,
            temperature=settings.openai_temperature,
            stream=False,
        )
        answer = completion.choices[0].message.content or "I'm sorry, I couldn't generate a response."
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise RuntimeError(f"LLM generation failed: {e}")

    # ── 5. Format sources ─────────────────────────────────────────────────────
    sources: List[Source] = []
    for doc, score in chunks:
        sources.append(
            Source(
                title=doc.metadata.get("title", "Unknown Source"),
                content_preview=truncate_text(doc.page_content, 200),
                category=doc.metadata.get("category", "general"),
                relevance_score=round(score, 3),
            )
        )

    # ── 6. Suggested questions ────────────────────────────────────────────────
    suggestions = get_suggested_questions(request.message, lang_code)

    return ChatResponse(
        answer=answer,
        sources=sources,
        detected_language=lang_code,
        session_id=request.session_id,
        suggested_questions=suggestions,
        model_used=settings.openai_model,
    )
