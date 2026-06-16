"""
Ingest Service
==============
Handles document ingestion into the ChromaDB vector store.
Used by both the /rebuild endpoint and the ingest.py script.
"""

import time
from typing import List
from langchain.schema import Document
from loguru import logger

from app.rag.document_loader import load_documents_from_directory, load_single_file
from app.rag.chunker import chunk_documents
from app.rag.vector_store import get_vector_store, reset_vector_store
from app.core.config import settings


def ingest_all_documents() -> dict:
    """
    Full ingest pipeline:
    1. Load all documents from the data directory
    2. Chunk them
    3. Store embeddings in ChromaDB

    Returns a summary dict with stats.
    """
    start = time.time()
    logger.info(f"Starting full ingest from: {settings.data_dir}")

    # Load
    documents = load_documents_from_directory(settings.data_dir)
    if not documents:
        logger.warning("No documents found. Add files to the data/ directory.")
        return {"total_chunks": 0, "time_taken": 0.0}

    # Chunk
    chunks = chunk_documents(documents)

    # Store (reset first for clean rebuild)
    reset_vector_store()
    vs = get_vector_store()

    # Add in batches to avoid memory issues
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i: i + batch_size]
        vs.add_documents(batch)
        logger.info(f"Stored batch {i // batch_size + 1} / {-(-len(chunks) // batch_size)}")

    elapsed = round(time.time() - start, 2)
    logger.info(f"✅ Ingest complete: {len(chunks)} chunks in {elapsed}s")

    return {
        "total_chunks": len(chunks),
        "time_taken": elapsed,
        "documents_loaded": len(documents),
    }


def ingest_single_document(file_path: str, category: str) -> dict:
    """
    Ingest a single uploaded file into the existing vector store (no reset).
    """
    docs = load_single_file(file_path, category)
    chunks = chunk_documents(docs)
    vs = get_vector_store()
    vs.add_documents(chunks)
    logger.info(f"Ingested {len(chunks)} chunks from {file_path}")
    return {"chunks_created": len(chunks)}
