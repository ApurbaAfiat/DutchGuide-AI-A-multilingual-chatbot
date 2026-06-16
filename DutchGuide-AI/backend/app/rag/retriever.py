"""
Retriever
=========
Queries the ChromaDB vector store for the most relevant document chunks.
Implements simple re-ranking by relevance score to surface the best context.
"""

from typing import List, Tuple
from langchain.schema import Document
from loguru import logger

from app.rag.vector_store import get_vector_store
from app.core.config import settings


def retrieve_relevant_chunks(
    query: str, top_k: int | None = None
) -> List[Tuple[Document, float]]:
    """
    Retrieve the top-K most relevant chunks for a given query.

    Returns:
        List of (Document, relevance_score) sorted by score descending.
        relevance_score is normalised to [0, 1] (higher = more relevant).
    """
    k = top_k or settings.rag_top_k
    vector_store = get_vector_store()

    try:
        # similarity_search_with_relevance_scores returns cosine similarity
        results: List[Tuple[Document, float]] = (
            vector_store.similarity_search_with_relevance_scores(query, k=k)
        )
    except Exception as e:
        logger.error(f"Vector store query failed: {e}")
        return []

    # Re-rank: sort by score descending (should already be sorted, but enforce)
    results.sort(key=lambda x: x[1], reverse=True)

    logger.info(
        f"Retrieved {len(results)} chunk(s) for query: '{query[:60]}...'"
        if len(query) > 60
        else f"Retrieved {len(results)} chunk(s) for query: '{query}'"
    )
    return results


def format_context(chunks: List[Tuple[Document, float]]) -> str:
    """
    Format retrieved chunks into a single context string for the LLM prompt.
    Each chunk is numbered and includes its source title.
    """
    if not chunks:
        return "No relevant information found in the knowledge base."

    context_parts = []
    for i, (doc, score) in enumerate(chunks, 1):
        title = doc.metadata.get("title", "Unknown Source")
        category = doc.metadata.get("category", "general").title()
        context_parts.append(
            f"[{i}] **{title}** ({category}) — relevance: {score:.2f}\n{doc.page_content}"
        )

    return "\n\n---\n\n".join(context_parts)
