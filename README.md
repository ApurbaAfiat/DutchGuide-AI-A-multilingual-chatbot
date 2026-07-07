# 🤖 Multilingual RAG Chatbot Workspace

Welcome to the workspace for the **Multilingual RAG Chatbot** project. This repository contains the source code, documentation, and configuration files for **DutchGuide AI**, a production-ready assistant designed to help expats, travelers, international students, and migrants navigate life in the Netherlands.

---

## 📂 Repository Structure

The workspace is organized as follows:

- **[`DutchGuide-AI/`](file:///e:/Study/Multilingual%20Rag%20Chatbot/DutchGuide-AI)**: The core application containing both the frontend and backend services.
  - **[`backend/`](file:///e:/Study/Multilingual%20Rag%20Chatbot/DutchGuide-AI/backend)**: Python (FastAPI) API backend, featuring:
    - Langdetect for automatic language detection (supporting English, Dutch, Bengali, and Hindi).
    - Sentence Transformers (`multilingual-e5-large`) for generating multilingual text embeddings.
    - ChromaDB vector store for retrieval-augmented generation (RAG) storage.
    - Google Gemini / OpenAI GPT integration for contextual response generation.
    - Document ingestion pipelines and administrative endpoints.
  - **[`frontend/`](file:///e:/Study/Multilingual%20Rag%20Chatbot/DutchGuide-AI/frontend)**: Next.js frontend application providing a responsive and modern chat UI with support for voice input (speech-to-text) and reading answers aloud (text-to-speech).
  - **[`docs/`](file:///e:/Study/Multilingual%20Rag%20Chatbot/DutchGuide-AI/docs)**: Core architecture, API design, and deployment documentation.
- **`.venv/`**: Local Python virtual environment for isolated workspace dependencies.

---

## 🚀 Getting Started

To get started with the chatbot, please navigate into the core project directory:

```bash
cd DutchGuide-AI
```

Follow the setup instructions provided in the **[DutchGuide-AI README](file:///e:/Study/Multilingual%20Rag%20Chatbot/DutchGuide-AI/README.md)** to:
1. Configure backend environment variables (`.env`).
2. Set up the local virtual environment and install backend dependencies.
3. Ingest documents into the vector store.
4. Run the FastAPI development server.
5. Set up and start the Next.js frontend development server.

---

## 🐳 Docker Deployment

The application supports Docker Compose to spin up both the FastAPI backend and Next.js frontend seamlessly:

```bash
cd DutchGuide-AI
docker-compose up --build
```

For more details on deploying, running, and managing database updates, see the comprehensive guides in the subfolders.
