#!/usr/bin/env python3
"""
Knowledge Base Ingest Script
=============================
Run this script to populate the ChromaDB vector store from the data/ directory.

Usage:
    cd backend
    python scripts/ingest.py

The script will:
  1. Scan all files in data/ (PDF, DOCX, TXT, Markdown)
  2. Split them into overlapping chunks (size=1000, overlap=200)
  3. Generate multilingual-e5-large embeddings
  4. Store everything in ChromaDB at ./vectorstore

First run downloads ~1.2 GB of model weights (cached after first use).
"""

import sys
import os
import time

# Make sure we can import app modules when running as a script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from loguru import logger
from app.services.ingest_service import ingest_all_documents
from app.core.config import settings


def main():
    logger.info("=" * 60)
    logger.info("   DutchGuide AI — Knowledge Base Ingestion")
    logger.info("=" * 60)
    logger.info(f"Data directory  : {settings.data_dir}")
    logger.info(f"Vector store    : {settings.chroma_persist_dir}")
    logger.info(f"Embedding model : {settings.embedding_model}")
    logger.info(f"Chunk size      : {settings.rag_chunk_size}")
    logger.info(f"Chunk overlap   : {settings.rag_chunk_overlap}")
    logger.info("=" * 60)

    start = time.time()
    result = ingest_all_documents()
    elapsed = round(time.time() - start, 2)

    logger.info("=" * 60)
    logger.info(f"✅ Ingestion complete!")
    logger.info(f"   Documents loaded : {result.get('documents_loaded', 0)}")
    logger.info(f"   Chunks stored    : {result.get('total_chunks', 0)}")
    logger.info(f"   Time taken       : {elapsed}s")
    logger.info("=" * 60)
    logger.info("You can now start the API server: uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
