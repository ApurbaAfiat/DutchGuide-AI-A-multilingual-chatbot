# DutchGuide AI — Deployment Guide

## Option 1: Render (Backend) + Vercel (Frontend) — Recommended

### Step 1: Deploy Backend to Render

1. Push your code to GitHub

2. Go to [render.com](https://render.com) → **New Web Service**

3. Connect your GitHub repo

4. Configuration:
   ```
   Name: dutchguide-api
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

5. Environment Variables (add all from `.env.example`):
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4.1
   EMBEDDING_MODEL=intfloat/multilingual-e5-large
   CHROMA_PERSIST_DIR=/var/data/vectorstore
   DATA_DIR=/var/data/data
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

6. Add a **Persistent Disk**:
   - Mount Path: `/var/data`
   - Size: 5 GB (minimum)

7. Deploy → wait ~5 minutes

8. After deploy, run ingest via Render Shell:
   ```bash
   cd /app && python scripts/ingest.py
   ```

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**

2. Import your GitHub repo

3. Configuration:
   ```
   Framework: Next.js
   Root Directory: frontend
   ```

4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://dutchguide-api.onrender.com
   ```

5. Deploy → done!

---

## Option 2: Railway (Full Stack)

1. Go to [railway.app](https://railway.app) → **New Project**

2. Deploy from GitHub

3. Create two services:
   - **backend**: Root directory = `backend`, Start = `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **frontend**: Root directory = `frontend`, Start = `npm start`

4. Add a **Volume** to the backend service for ChromaDB persistence

5. Set environment variables for both services

---

## Option 3: Docker Compose (Self-hosted / VPS)

```bash
# On your server:
git clone https://github.com/yourname/dutchguide-ai.git
cd DutchGuide-AI

# Configure
cp backend/.env.example backend/.env
nano backend/.env  # Add your API key

# Start
docker-compose up -d --build

# Ingest knowledge base
docker-compose exec backend python scripts/ingest.py

# Check logs
docker-compose logs -f backend
```

For HTTPS with a domain, add Nginx + Certbot in front of the stack.

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | Your OpenAI API key |
| `OPENAI_MODEL` | ❌ | `gpt-4.1` | OpenAI model to use |
| `EMBEDDING_MODEL` | ❌ | `intfloat/multilingual-e5-large` | HuggingFace embedding model |
| `CHROMA_PERSIST_DIR` | ❌ | `./vectorstore` | ChromaDB storage path |
| `DATA_DIR` | ❌ | `./data` | Knowledge base documents path |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:3000` | Comma-separated CORS origins |
| `RATE_LIMIT_PER_MINUTE` | ❌ | `20` | Requests per minute per IP |
| `RAG_TOP_K` | ❌ | `5` | Number of chunks to retrieve |
| `RAG_CHUNK_SIZE` | ❌ | `1000` | Characters per chunk |
| `RAG_CHUNK_OVERLAP` | ❌ | `200` | Overlap between chunks |

### Frontend (.env.local)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:8000` | Backend API base URL |

---

## First-Time Setup Checklist

- [ ] Set `OPENAI_API_KEY`
- [ ] Set `ALLOWED_ORIGINS` to your frontend URL
- [ ] Run `python scripts/ingest.py` to populate vector store
- [ ] Verify health at `/api/health`
- [ ] Test chat at `/api/docs`
- [ ] Set `NEXT_PUBLIC_API_URL` to backend URL in frontend
