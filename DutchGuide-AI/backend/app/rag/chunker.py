"""
Document Chunker
================
Splits loaded documents into overlapping chunks suitable for embedding.
Uses RecursiveCharacterTextSplitter for natural boundary splitting.
"""

from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from loguru import logger

from app.core.config import settings


def chunk_documents(documents: List[Document]) -> List[Document]:
    """
    Split documents into chunks.

    Chunk size: 1000 characters
    Overlap:    200 characters  (ensures context isn't lost at boundaries)
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.rag_chunk_size,
        chunk_overlap=settings.rag_chunk_overlap,
        # Try to split on paragraph/sentence boundaries first
        separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""],
        length_function=len,
    )

    chunks = splitter.split_documents(documents)

    # Add chunk index to metadata for traceability
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = i

    logger.info(
        f"Chunked {len(documents)} document(s) into {len(chunks)} chunks "
        f"(size={settings.rag_chunk_size}, overlap={settings.rag_chunk_overlap})"
    )
    return chunks
