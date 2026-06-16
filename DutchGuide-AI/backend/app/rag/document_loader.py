"""
Document Loader
===============
Loads documents from the knowledge base directory.
Supports: PDF, DOCX, TXT, Markdown.
Attaches metadata (source, category, title) to each document.
"""

import os
from pathlib import Path
from typing import List

from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    UnstructuredMarkdownLoader,
)
from langchain.schema import Document
from loguru import logger

from app.utils.text_utils import extract_category_from_path


LOADER_MAP = {
    ".pdf": PyPDFLoader,
    ".docx": Docx2txtLoader,
    ".txt": TextLoader,
    ".md": UnstructuredMarkdownLoader,
}


def load_documents_from_directory(data_dir: str) -> List[Document]:
    """
    Recursively load all supported documents from data_dir.
    Attaches metadata: source, category, title.
    """
    data_path = Path(data_dir)
    all_documents: List[Document] = []

    if not data_path.exists():
        logger.warning(f"Data directory not found: {data_dir}")
        return all_documents

    for file_path in data_path.rglob("*"):
        if file_path.is_dir():
            continue
        suffix = file_path.suffix.lower()
        if suffix not in LOADER_MAP:
            logger.debug(f"Skipping unsupported file type: {file_path.name}")
            continue

        try:
            logger.info(f"Loading: {file_path.relative_to(data_path)}")
            loader_cls = LOADER_MAP[suffix]

            # TextLoader needs explicit encoding for non-ASCII files
            if suffix == ".txt":
                loader = loader_cls(str(file_path), encoding="utf-8")
            else:
                loader = loader_cls(str(file_path))

            docs = loader.load()
            category = extract_category_from_path(str(file_path))
            title = file_path.stem.replace("_", " ").title()

            for doc in docs:
                doc.metadata.update({
                    "source": str(file_path.relative_to(data_path)),
                    "category": category,
                    "title": title,
                    "file_type": suffix.lstrip("."),
                })

            all_documents.extend(docs)
            logger.info(f"  → Loaded {len(docs)} page(s) from {file_path.name}")

        except Exception as e:
            logger.error(f"Failed to load {file_path.name}: {e}")
            continue

    logger.info(f"Total documents loaded: {len(all_documents)}")
    return all_documents


def load_single_file(file_path: str, category: str) -> List[Document]:
    """Load a single uploaded file and attach metadata."""
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix not in LOADER_MAP:
        raise ValueError(f"Unsupported file type: {suffix}")

    loader_cls = LOADER_MAP[suffix]
    loader = loader_cls(str(path)) if suffix != ".txt" else loader_cls(str(path), encoding="utf-8")
    docs = loader.load()
    title = path.stem.replace("_", " ").title()

    for doc in docs:
        doc.metadata.update({
            "source": path.name,
            "category": category,
            "title": title,
            "file_type": suffix.lstrip("."),
        })

    return docs
