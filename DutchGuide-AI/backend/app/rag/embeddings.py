"""
Embeddings Service
==================
Wraps the intfloat/multilingual-e5-large sentence transformer model.
Uses a module-level singleton so the model is loaded only once.
"""

from sentence_transformers import SentenceTransformer
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.config import settings
from loguru import logger
from functools import lru_cache


@lru_cache(maxsize=1)
def get_embeddings() -> HuggingFaceEmbeddings:
    """
    Returns a cached LangChain-compatible HuggingFace embeddings object.
    multilingual-e5-large supports 100+ languages including all our targets.
    """
    logger.info(f"Loading embedding model: {settings.embedding_model}")
    embeddings = HuggingFaceEmbeddings(
        model_name=settings.embedding_model,
        model_kwargs={"device": "cpu"},  # switch to "cuda" if GPU available
        encode_kwargs={
            "normalize_embeddings": True,  # required for cosine similarity
            "batch_size": 32,
        },
    )
    logger.info("✅ Embedding model loaded successfully")
    return embeddings
