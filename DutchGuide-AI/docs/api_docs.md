# DutchGuide AI — API Documentation

Base URL: `http://localhost:8000/api` (development)
Interactive docs: `http://localhost:8000/api/docs`

---

## POST /chat

Send a chat message and receive a RAG-powered response.

### Request Body

```json
{
  "message": "How do I get a BSN number?",
  "session_id": "session_1234567890_abc",
  "language": "auto",
  "conversation_history": [
    { "role": "user", "content": "I just arrived in the Netherlands" },
    { "role": "assistant", "content": "Welcome! Here's what you should do first..." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string (1–2000 chars) | ✅ | User's question |
| `session_id` | string | ✅ | Unique session identifier |
| `language` | `auto\|en\|nl\|bn\|hi` | ❌ | Default: `auto` |
| `conversation_history` | array | ❌ | Last N message turns |

### Response

```json
{
  "answer": "To get a BSN (Burgerservicenummer), you need to...\n\n**Sources:**\n[1] Bsn Digid — Immigration\n[2] First Steps — Immigration",
  "sources": [
    {
      "title": "Bsn Digid",
      "content_preview": "The BSN is a unique 8 or 9-digit personal identification...",
      "category": "immigration",
      "relevance_score": 0.923
    }
  ],
  "detected_language": "en",
  "session_id": "session_1234567890_abc",
  "suggested_questions": [
    "How do I register at the municipality?",
    "What documents do I need for BSN registration?",
    "How do I get a DigiD?"
  ],
  "model_used": "gpt-4.1"
}
```

### Error Responses

| Status | Description |
|---|---|
| 422 | Validation error (message too long, invalid language) |
| 429 | Rate limit exceeded (20 requests/minute) |
| 503 | LLM unavailable |
| 500 | Internal server error |

---

## POST /upload

Upload a document to add to the knowledge base.

### Request (multipart/form-data)

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✅ | PDF, DOCX, TXT, or Markdown (max 20 MB) |
| `category` | string | ❌ | One of: transportation, housing, immigration, healthcare, universities, tourism, culture, general |

### Response

```json
{
  "message": "Document uploaded and indexed successfully",
  "filename": "housing_guide_2024.pdf",
  "chunks_created": 47,
  "category": "housing"
}
```

---

## POST /rebuild

Rebuild the entire vector database from the `data/` directory.

### Response

```json
{
  "message": "Knowledge base rebuilt successfully",
  "total_chunks": 312,
  "time_taken_seconds": 145.3
}
```

⚠️ This operation takes several minutes and resets all indexed content.

---

## GET /health

Health check endpoint. Used by Render/Railway deployment probes.

### Response

```json
{
  "status": "healthy",
  "vector_store_ready": true,
  "llm_ready": true,
  "version": "1.0.0"
}
```

`status` can be: `"healthy"` or `"degraded"`

---

## GET /stats

Returns knowledge base statistics.

### Response

```json
{
  "total_documents": 312,
  "documents_by_category": {
    "transportation": 45,
    "housing": 63,
    "immigration": 58,
    "healthcare": 41,
    "universities": 52,
    "tourism": 38,
    "culture": 15
  },
  "vector_store_size": 312,
  "embedding_model": "intfloat/multilingual-e5-large",
  "llm_model": "gpt-4.1"
}
```

---

## Rate Limiting

All endpoints are rate-limited to **20 requests per minute** per IP address.

Rate limit headers are returned on each response:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

When the limit is exceeded, the API returns HTTP 429 with a `Retry-After` header.
