"""
Chat Service
============
Orchestrates the full RAG pipeline:
  1. Detect language
  2. Retrieve relevant chunks
  3. Build system prompt
  4. Call LLM (Gemini or OpenAI)
  5. Format response with sources and suggested questions
"""

from typing import List, Tuple
from loguru import logger

from app.core.config import settings
from app.models.schemas import ChatMessage, ChatRequest, ChatResponse, Source
from app.rag.retriever import retrieve_relevant_chunks, format_context
from app.prompts.system_prompts import get_system_prompt
from app.prompts.suggested_questions import get_suggested_questions
from app.utils.language_detector import detect_language, get_language_instruction
from app.utils.text_utils import truncate_text


# ── LLM Client Initialization ────────────────────────────────────────────────

def _get_model_name() -> str:
    """Return the active model name based on provider."""
    if settings.llm_provider == "gemini":
        return settings.gemini_model
    return settings.openai_model


async def _call_gemini(messages: list, system_prompt: str) -> str:
    """Call Google Gemini API using the new google-genai SDK."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.gemini_api_key)

    # Convert message history to Gemini format
    gemini_contents = []
    for msg in messages:
        if msg["role"] == "system":
            continue  # Passed separately as system_instruction
        role = "user" if msg["role"] == "user" else "model"
        gemini_contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])])
        )

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=gemini_contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=settings.openai_max_tokens,
            temperature=settings.openai_temperature,
        ),
    )
    return response.text


async def _call_openai(messages: list) -> str:
    """Call OpenAI API."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    completion = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        max_tokens=settings.openai_max_tokens,
        temperature=settings.openai_temperature,
        stream=False,
    )
    return completion.choices[0].message.content or "I'm sorry, I couldn't generate a response."


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
        if settings.llm_provider == "gemini":
            logger.info("Using Gemini provider")
            answer = await _call_gemini(messages, system_prompt)
        else:
            logger.info("Using OpenAI provider")
            answer = await _call_openai(messages)
    except Exception as e:
        logger.error(f"LLM API error ({settings.llm_provider}): {e}")
        raise RuntimeError(f"LLM generation failed: {e}")

    # ── 5. Format sources ─────────────────────────────────────────────────────
    DOCUMENT_URLS = {
        "culture/cost_of_living.md": "https://www.studyinnl.org/plan-your-stay/daily-expenses",
        "culture/dutch_culture.md": "https://www.netherlandsandyou.nl/about-the-kingdom/history-and-culture",
        "healthcare/health_insurance.md": "https://www.studyinnl.org/plan-your-stay/healthcare-insurance",
        "housing/banking.md": "https://www.studyinnl.org/plan-your-stay/open-a-dutch-bank-account",
        "housing/student_housing.md": "https://www.studyinnl.org/plan-your-stay/housing",
        "immigration/bsn_digid.md": "https://www.digid.nl/en/",
        "immigration/first_steps.md": "https://www.studyinnl.org/plan-your-stay/upon-arrival",
        "tourism/amsterdam.md": "https://www.iamsterdam.com/",
        "tourism/netherlands_cities.md": "https://www.holland.com/",
        "transportation/ns_trains.md": "https://www.ns.nl/en",
        "transportation/ov_chipkaart.md": "https://www.ov-chipkaart.nl/en",
        "transportation/trams_buses_metro.md": "https://www.9292.nl/en",
        "universities/universities_overview.md": "https://www.studielink.nl/",
    }

    sources: List[Source] = []
    for doc, score in chunks:
        raw_source = doc.metadata.get("source", "Unknown Source")
        normalized_source = raw_source.replace("\\", "/")
        
        # If there's an official website mapping, use that; otherwise fall back to static file URL
        logger.info(f"Source matching: {normalized_source!r} against keys: {list(DOCUMENT_URLS.keys())}")
        if normalized_source in DOCUMENT_URLS:
            source_link = DOCUMENT_URLS[normalized_source]
        else:
            source_link = f"api/documents/{normalized_source}"
            
        sources.append(
            Source(
                title=doc.metadata.get("title", "Unknown Source"),
                content_preview=truncate_text(doc.page_content, 200),
                category=doc.metadata.get("category", "general"),
                relevance_score=round(score, 3),
                source_path=source_link, # Passes the mapped web URL directly
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
        model_used=_get_model_name(),
    )

