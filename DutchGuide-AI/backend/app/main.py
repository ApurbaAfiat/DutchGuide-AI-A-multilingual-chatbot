"""
DutchGuide AI - Main FastAPI Application Entry Point
====================================================
Initializes the FastAPI app, registers routers, configures CORS,
rate limiting, and lifespan events.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.api import chat, upload, admin, health
from app.core.config import settings
from app.rag.vector_store import get_vector_store
from loguru import logger
import sys

# ── Logging configuration ────────────────────────────────────────────────────
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | <cyan>{name}</cyan> - {message}",
    level="INFO",
)
logger.add("logs/dutchguide.log", rotation="10 MB", retention="7 days", level="DEBUG")

# ── Rate limiter ─────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle manager."""
    logger.info("🇳🇱 DutchGuide AI starting up...")
    # Pre-warm the vector store on startup so first request is fast
    try:
        vs = get_vector_store()
        logger.info(f"✅ Vector store loaded: {vs._collection.count()} documents indexed")
    except Exception as e:
        logger.warning(f"⚠️  Vector store not ready yet (run ingest.py first): {e}")
    yield
    logger.info("🛑 DutchGuide AI shutting down...")


# ── App factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title="DutchGuide AI",
        description="Your Personal Netherlands Companion — Multilingual RAG Chatbot API",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        lifespan=lifespan,
    )

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(health.router, prefix="/api", tags=["Health"])
    app.include_router(chat.router, prefix="/api", tags=["Chat"])
    app.include_router(upload.router, prefix="/api", tags=["Upload"])
    app.include_router(admin.router, prefix="/api", tags=["Admin"])

    # Static files for documents
    from fastapi.staticfiles import StaticFiles
    app.mount("/api/documents", StaticFiles(directory=settings.data_dir), name="documents")

    return app


app = create_app()
