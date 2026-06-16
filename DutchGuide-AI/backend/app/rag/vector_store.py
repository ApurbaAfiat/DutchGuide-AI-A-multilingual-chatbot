"""
ChromaDB Vector Store
=====================
Manages the persistent ChromaDB vector store.
Provides get/create operations with a module-level singleton.
"""

import chromadb
from langchain_chroma import Chroma
from app.rag.embeddings import get_embeddings
from app.core.config import settings
from loguru import logger
from functools import lru_cache


@lru_cache(maxsize=1)
def get_vector_store() -> Chroma:
    """
    Returns a cached LangChain Chroma vector store backed by persistent storage.
    Creates the collection if it doesn't exist yet.
    """
    logger.info(f"Connecting to ChromaDB at: {settings.chroma_persist_dir}")
    embeddings = get_embeddings()

    vector_store = Chroma(
        collection_name=settings.chroma_collection_name,
        embedding_function=embeddings,
        persist_directory=settings.chroma_persist_dir,
    )
    return vector_store


def reset_vector_store() -> None:
    """
    Deletes and recreates the ChromaDB collection.
    Used during knowledge base rebuilds.
    """
    # Clear the lru_cache so a fresh instance is created
    get_vector_store.cache_clear()
    get_embeddings.cache_clear()

    client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    try:
        client.delete_collection(settings.chroma_collection_name)
        logger.info(f"Deleted collection: {settings.chroma_collection_name}")
    except Exception:
        pass  # Collection didn't exist

    logger.info("Vector store reset complete")
