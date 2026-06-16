# DutchGuide AI — Architecture Document

## System Overview

DutchGuide AI is a production-ready multilingual RAG (Retrieval-Augmented Generation) system consisting of:

1. **Next.js Frontend** — Single-page React application with real-time chat UI
2. **FastAPI Backend** — Python REST API orchestrating the RAG pipeline
3. **ChromaDB** — Persistent local vector database
4. **multilingual-e5-large** — HuggingFace embedding model (supports 100+ languages)
5. **OpenAI GPT-4.1** — Large language model for answer generation

## RAG Pipeline (Step-by-Step)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                              │
│  Message: "OV-chipkaart কীভাবে ব্যবহার করবো?"                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │  Language Detection  │  langdetect → "bn" (Bengali)
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │    E5 Embedding      │  intfloat/multilingual-e5-large
              │  (1024-dim vector)   │  Multilingual semantic embedding
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │   ChromaDB Search    │  Cosine similarity search
              │   Top-K=5 chunks     │  From 300+ indexed documents
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │   Context Building   │  Format retrieved chunks
              │   + Re-ranking       │  Sort by relevance score
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Bengali System      │  Language-specific prompt
              │  Prompt Template     │  + Context injection
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │   OpenAI GPT-4.1     │  Generate grounded answer
              │   (async call)       │  in Bengali with citations
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Response Assembly   │  Answer + Sources + Suggestions
              └──────────┬──────────┘
                         │
                    Frontend UI
```

## Data Ingestion Pipeline

```
data/ directory (Markdown files)
         │
         ▼
Document Loader (LangChain)
  PDF → PyPDFLoader
  DOCX → Docx2txtLoader
  TXT  → TextLoader
  MD   → UnstructuredMarkdownLoader
         │
         ▼
Text Splitter
  chunk_size = 1000 chars
  chunk_overlap = 200 chars
  separators: \n\n, \n, ., space
         │
         ▼
Metadata Enrichment
  source, category, title, file_type, chunk_index
         │
         ▼
Embedding Generation
  intfloat/multilingual-e5-large
  1024-dimensional dense vectors
  Normalized (for cosine similarity)
         │
         ▼
ChromaDB Storage
  Persistent at ./vectorstore
  Collection: dutchguide_knowledge
```

## API Architecture

```
FastAPI Application
├── /api/health    GET  → HealthResponse
├── /api/chat      POST → ChatResponse (rate limited: 20/min)
├── /api/upload    POST → UploadResponse
├── /api/rebuild   POST → RebuildResponse
└── /api/stats     GET  → StatsResponse

Middleware stack:
  CORS → RateLimiter → Router → Service → Response
```

## Frontend Architecture

```
Next.js 14 App Router
├── app/
│   ├── layout.tsx      # Root layout, metadata, fonts
│   └── page.tsx        # Single-page app entry point
├── components/
│   ├── Header          # Navigation + dark mode toggle
│   ├── Hero            # Landing section with CTA
│   ├── ChatWindow      # Main chat container (auto-scroll)
│   ├── ChatMessage     # Message bubble + sources + TTS
│   ├── ChatInput       # Textarea + voice input + language picker
│   ├── SuggestedQuestions  # Follow-up question chips
│   ├── Features        # Feature cards section
│   ├── AdminPanel      # Upload/stats/rebuild modal
│   └── Footer          # Links and credits
├── hooks/
│   ├── useChat         # Chat state + API calls + history
│   ├── useVoice        # Web Speech API (STT + TTS)
│   └── useDarkMode     # Dark mode with localStorage
└── lib/
    ├── api.ts          # Axios API client
    ├── types.ts        # Shared TypeScript interfaces
    └── utils.ts        # Helper functions
```

## Security Measures

| Layer | Mechanism |
|---|---|
| Rate Limiting | 20 req/min per IP via SlowAPI |
| Input Validation | Pydantic schema validation (1–2000 chars) |
| CORS | Whitelist-based origin checking |
| File Upload | Extension + size validation (max 20 MB) |
| Environment | All secrets in .env, never committed |
| SQL Injection | N/A (no SQL database) |
| Prompt Injection | System prompt separated from user input |

## Technology Choices

| Technology | Reason |
|---|---|
| `multilingual-e5-large` | Best-in-class multilingual embeddings, supports all 4 target languages |
| ChromaDB | Simple persistent vector DB, no external service required |
| FastAPI | Modern async Python framework, auto-generated OpenAPI docs |
| Next.js 14 | App Router, RSC, great DX, Vercel deployment |
| Tailwind CSS | Utility-first, easy theming, dark mode |
| LangChain | Rich document loading and text splitting ecosystem |
