#!/usr/bin/env python3
"""
Update Knowledge Base Script
==============================
Adds new documents to an EXISTING vector store without rebuilding from scratch.
Use this when you've added new files to a category folder and want to
update the index without re-processing all existing documents.

Usage:
    cd backend
    python scripts/update_knowledge.py --file path/to/file.pdf --category transportation

Options:
    --file      Path to the file to ingest
    --category  Knowledge category (transportation, housing, etc.)
    --rebuild   Flag to do a full rebuild instead
"""

import sys
import os
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from loguru import logger
from app.services.ingest_service import ingest_single_document, ingest_all_documents


VALID_CATEGORIES = [
    "transportation", "housing", "tourism", "immigration",
    "healthcare", "universities", "culture", "general",
]


def main():
    parser = argparse.ArgumentParser(description="Update DutchGuide AI knowledge base")
    parser.add_argument("--file", type=str, help="Path to file to add")
    parser.add_argument(
        "--category",
        type=str,
        choices=VALID_CATEGORIES,
        default="general",
        help="Knowledge category",
    )
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="Perform a full rebuild of the vector store",
    )
    args = parser.parse_args()

    if args.rebuild:
        logger.info("🔄 Starting full rebuild...")
        result = ingest_all_documents()
        logger.info(f"✅ Full rebuild complete: {result}")
    elif args.file:
        if not os.path.exists(args.file):
            logger.error(f"File not found: {args.file}")
            sys.exit(1)
        logger.info(f"📄 Adding file: {args.file} → category: {args.category}")
        result = ingest_single_document(args.file, args.category)
        logger.info(f"✅ Done: {result['chunks_created']} chunks added")
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
