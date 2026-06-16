"""
Text Utilities
==============
Helper functions for text processing, sanitisation, and formatting.
"""

import re
from typing import List


def truncate_text(text: str, max_chars: int = 200) -> str:
    """Truncate text to max_chars and append ellipsis if needed."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(" ", 1)[0] + "..."


def clean_text(text: str) -> str:
    """Remove excessive whitespace and control characters."""
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_category_from_path(file_path: str) -> str:
    """
    Infer the knowledge category from the file's directory path.
    e.g., 'data/transportation/ns_trains.md' → 'transportation'
    """
    parts = file_path.replace("\\", "/").split("/")
    known_categories = {
        "transportation", "housing", "tourism",
        "immigration", "healthcare", "universities", "culture",
    }
    for part in reversed(parts[:-1]):
        if part.lower() in known_categories:
            return part.lower()
    return "general"


def format_sources_for_response(sources: List[dict]) -> str:
    """Format source list as a numbered citation string."""
    if not sources:
        return ""
    lines = ["\n\n**Sources:**"]
    for i, src in enumerate(sources, 1):
        lines.append(f"[{i}] {src.get('title', 'Unknown Source')} — {src.get('category', '').title()}")
    return "\n".join(lines)
