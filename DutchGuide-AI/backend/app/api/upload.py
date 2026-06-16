"""
Upload API Router
=================
POST /api/upload  — Upload a document to the knowledge base.
"""

import os
import shutil
import tempfile
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from loguru import logger

from app.models.schemas import UploadResponse
from app.services.ingest_service import ingest_single_document

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}
MAX_FILE_SIZE_MB = 20


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(default="general"),
) -> UploadResponse:
    """
    Upload a PDF, DOCX, TXT, or Markdown file.
    The document is chunked and added to the ChromaDB vector store.

    - **file**: The document to upload.
    - **category**: Knowledge category (transportation, housing, etc.)
    """
    # Validate extension
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Validate category
    valid_categories = {
        "transportation", "housing", "tourism", "immigration",
        "healthcare", "universities", "culture", "general",
    }
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

    # Read file content and check size
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Max allowed: {MAX_FILE_SIZE_MB} MB",
        )

    # Save to a temp file and ingest
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        result = ingest_single_document(tmp_path, category)
        logger.info(f"Uploaded and ingested: {file.filename} → {result['chunks_created']} chunks")

        return UploadResponse(
            message="Document uploaded and indexed successfully",
            filename=file.filename or "unknown",
            chunks_created=result["chunks_created"],
            category=category,
        )
    except Exception as e:
        logger.error(f"Upload failed for {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {e}")
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
