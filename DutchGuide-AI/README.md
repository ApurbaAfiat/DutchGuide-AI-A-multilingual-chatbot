# 🇳🇱 DutchGuide AI

**Your Personal Netherlands Companion**

A production-ready multilingual RAG (Retrieval-Augmented Generation) chatbot that helps international students, migrants, travelers, and expats navigate life in the Netherlands.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5-purple)](https://trychroma.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌍 **Multilingual** | Auto-detects and responds in English, Dutch, Bengali, Hindi |
| 📚 **RAG Pipeline** | multilingual-e5-large embeddings + ChromaDB vector store |
| 🤖 **GPT-4.1** | OpenAI LLM for natural, grounded answers |
| 📎 **Citations** | Every answer cites knowledge base sources |
| 💬 **Conversation Memory** | Retains last 10 turns per session |
| 🎤 **Voice Input** | Browser-based speech recognition |
| 🔊 **Text-to-Speech** | Reads answers aloud |
| 📤 **Admin Upload** | Upload PDFs/DOCX to expand knowledge base |
| 🔒 **Security** | Rate limiting, CORS, input validation |

---

## 🏗️ Architecture

```
User Query (any language)
        ↓
Language Detection (langdetect)
        ↓
multilingual-e5-large Embedding
        ↓
ChromaDB Similarity Search (Top-K=5)
        ↓
Context Re-ranking
        ↓
System Prompt Construction (language-specific)
        ↓
OpenAI GPT-4.1 Generation
        ↓
Structured Response (answer + sources + suggestions)
```

---

## 📁 Project Structure

```
DutchGuide-AI/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers
│   │   ├── rag/          # Embeddings, vector store, retriever, chunker
│   │   ├── services/     # Chat and ingest business logic
│   │   ├── models/       # Pydantic schemas
│   │   ├── prompts/      # Multilingual system prompts
│   │   ├── utils/        # Language detection, text utils
│   │   ├── core/         # App config (settings)
│   │   └── main.py       # FastAPI app factory
│   ├── data/             # Knowledge base documents (Markdown)
│   │   ├── transportation/
│   │   ├── housing/
│   │   ├── immigration/
│   │   ├── healthcare/
│   │   ├── universities/
│   │   ├── tourism/
│   │   └── culture/
│   ├── scripts/
│   │   ├── ingest.py          # Populate vector store
│   │   └── update_knowledge.py # Add individual files
│   ├── vectorstore/      # ChromaDB persistent storage
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/              # Next.js App Router
│   ├── components/       # React UI components
│   ├── hooks/            # useChat, useVoice, useDarkMode
│   ├── lib/              # API client, types, utils
│   ├── styles/           # Tailwind global CSS
│   └── Dockerfile
├── docs/
│   ├── architecture.md
│   ├── api_docs.md
│   └── deployment.md
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- OpenAI API key
- ~2 GB disk (for embedding model weights)

### 1. Clone and setup

```bash
git clone https://github.com/yourname/dutchguide-ai.git
cd DutchGuide-AI
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Populate the knowledge base

```bash
# This will download multilingual-e5-large (~1.2 GB) on first run
python scripts/ingest.py
```

### 4. Start the backend

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/api/docs

### 5. Frontend setup

```bash
cd ../frontend
npm install

cp .env.local.example .env.local
# Edit .env.local if your backend is not on localhost:8000

npm run dev
```

Open: http://localhost:3000

---

## 🐳 Docker (Full Stack)

```bash
# Copy and configure environment
cp backend/.env.example backend/.env
# Add your OPENAI_API_KEY to backend/.env

# Build and run everything
docker-compose up --build

# First run: populate the vector store
docker-compose exec backend python scripts/ingest.py
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/docs

---

## 🌐 Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (OPENAI_API_KEY, etc.)
6. Add a **Persistent Disk** for the vectorstore (mount at `/app/vectorstore`)

### Frontend → Vercel

1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
4. Deploy!

See `docs/deployment.md` for detailed instructions.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message, receive RAG response |
| `POST` | `/api/upload` | Upload a document to knowledge base |
| `POST` | `/api/rebuild` | Rebuild entire vector database |
| `GET` | `/api/stats` | Knowledge base statistics |
| `GET` | `/api/health` | Health check |

---

## 🧠 Knowledge Base Topics

- 🚆 **Transportation**: NS trains, OV-chipkaart, OVpay, trams, buses, metro
- 🏠 **Housing**: Student rooms, Kamernet, SSH, rental contracts, deposits
- 📋 **Immigration**: BSN, DigiD, IND, municipality registration
- ⚕️ **Healthcare**: Health insurance, GP system, emergency numbers
- 🎓 **Universities**: Leiden, TU Delft, Erasmus, UvA, Utrecht
- 🏛️ **Tourism**: Amsterdam, Rotterdam, Leiden, Giethoorn, Keukenhof
- 🌷 **Culture**: Dutch customs, gezelligheid, cycling, cost of living, food

---

## 🔧 Adding New Knowledge

```bash
# Add a single file
python scripts/update_knowledge.py --file path/to/guide.pdf --category housing

# Full rebuild after adding multiple files
python scripts/update_knowledge.py --rebuild
```

Or use the **Admin Dashboard** in the web UI.

---

## 🌍 Supported Languages

| Language | Code | Auto-Detect |
|---|---|---|
| English | `en` | ✅ |
| Dutch | `nl` | ✅ |
| Bengali | `bn` | ✅ |
| Hindi | `hi` | ✅ |

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

Built with ❤️ for the international community in the Netherlands.
