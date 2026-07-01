"""
Pydantic Schemas
================
Request/Response models for all API endpoints.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum


class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    DUTCH = "nl"
    BENGALI = "bn"
    HINDI = "hi"
    AUTO = "auto"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# ── Chat Schemas ──────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    """A single conversation turn."""
    role: MessageRole
    content: str


class ChatRequest(BaseModel):
    """Incoming chat request from the frontend."""
    message: str = Field(..., min_length=1, max_length=2000, description="User's question")
    session_id: str = Field(..., description="Unique session identifier")
    language: SupportedLanguage = Field(SupportedLanguage.AUTO, description="Language override")
    conversation_history: List[ChatMessage] = Field(
        default_factory=list, max_items=20
    )

    @validator("message")
    def sanitize_message(cls, v: str) -> str:
        # Strip leading/trailing whitespace
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        return v


class Source(BaseModel):
    """A single retrieved source document."""
    title: str
    content_preview: str = Field(..., description="First 200 chars of the chunk")
    category: str
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    source_path: str = Field(..., description="Relative path of the source document")


class ChatResponse(BaseModel):
    """Response returned to the frontend."""
    answer: str
    sources: List[Source]
    detected_language: str
    session_id: str
    suggested_questions: List[str] = Field(default_factory=list)
    model_used: str


# ── Upload Schemas ────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    message: str
    filename: str
    chunks_created: int
    category: str


# ── Admin / Stats Schemas ─────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_documents: int
    documents_by_category: dict
    vector_store_size: int
    embedding_model: str
    llm_model: str


class RebuildResponse(BaseModel):
    message: str
    total_chunks: int
    time_taken_seconds: float


# ── Health Schema ─────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    vector_store_ready: bool
    llm_ready: bool
    version: str = "1.0.0"
