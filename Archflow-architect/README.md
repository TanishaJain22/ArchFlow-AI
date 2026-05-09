<div align="center">

# ⚡ ARCHFLOW — AI System Designer

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/LLM-Llama--3.3--70B-F97316?style=flat-square)](https://groq.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

**Describe a system → Get production-grade architecture, metrics & an interactive diagram.**

</div>

---

## What It Does

Type a prompt like *"Design a highly available URL shortener"* and ARCHFLOW returns:

- **Architecture** — components, data flow, scaling, bottlenecks & tradeoffs
- **Metrics** — latency (ms), RPS, cache hit rate, DB I/O, error rate (via charts)
- **Diagram** — draggable React Flow node graph of the system
- **History** — last 10 designs, persisted in LocalStorage

---

## Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TanStack Router, React Flow, Recharts, Tailwind CSS 4, Framer Motion |
| **Backend** | FastAPI, Uvicorn, Pydantic v2, SQLAlchemy (async), Groq SDK (Llama-3.3-70B) |
| **Database** | PostgreSQL 15 via Docker Compose |
| **RAG** *(optional)* | FAISS + HuggingFace `all-MiniLM-L6-v2` embeddings |

---

## Prerequisites

- **Node.js** v20+ (or Bun)
- **Python** 3.10+
- **Docker & Docker Compose**
- **Groq API Key** → [console.groq.com](https://console.groq.com)

---

## Quick Start

### 1. Clone & Enter Project

```bash
git clone https://github.com/TanishaJain22/ArchFlow-AI.git
cd ArchFlow-AI/Archflow-architect
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
# Fill in your GROQ_API_KEY in .env
```

`.env` template:
```env
DATABASE_URL=postgresql+asyncpg://archflow_user:archflow_pass@localhost:5432/archflow_db
GROQ_API_KEY=gsk_your_key_here
```

### 4. Run Backend

```bash
python -m venv venv && .\venv\Scripts\activate   # Windows
# source venv/bin/activate                        # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload
```

→ API live at `http://localhost:8000` · Docs at `http://localhost:8000/docs`

### 5. Run Frontend

```bash
# Back in Archflow-architect/
npm install && npm run dev
```

→ App live at `http://localhost:5173`

---

## API

### `POST /api/v1/generate-system`

```json
// Request
{ "prompt": "Design a real-time chat app for 10M users" }
```

```json
// Response shape
{
  "architecture": { "overview": [], "components": [], "data_flow": [], "scaling": [], "bottlenecks": [], "tradeoffs": [] },
  "metrics": { "latency_ms": 120, "requests_per_sec": 100000, "cache_hit_rate": 0.9, "error_rate": 0.02 },
  "diagram": { "nodes": [{ "id": "1", "label": "API Gateway" }], "edges": [{ "from": "1", "to": "2" }] }
}
```

### `GET /api/health` → `{ "status": "ok" }`

---

## RAG Engine *(Optional)*

Place `.txt` knowledge files in `backend/data/`, then install extras:

```bash
pip install langchain langchain-community faiss-cpu sentence-transformers
```

The engine initializes in the background on startup and **gracefully degrades** if dependencies are missing.

---

## Project Structure

```
Archflow-architect/
├── src/                  # React frontend
│   ├── components/       # Sidebar, PromptInput, DiagramPanel, MetricsChartPanel, OutputPanel
│   ├── routes/index.tsx  # Main workspace page
│   └── config.ts         # Backend base URL
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── routes/system.py  # POST /api/v1/generate-system
│   ├── services/
│   │   ├── orchestrator.py   # RAG + LLM + Design Engine pipeline
│   │   ├── llm_service.py    # Groq API + prompt engineering
│   │   ├── rag_engine.py     # FAISS vector store
│   │   └── design_engine.py  # JSON parser & schema hydrator
│   ├── models/schemas.py # Pydantic schemas
│   ├── db/database.py    # Async SQLAlchemy
│   └── requirements.txt
└── docker-compose.yml    # PostgreSQL container
```

---

<div align="center">

Built by [Tanisha Jain](https://github.com/TanishaJain22) · **[⭐ Star on GitHub](https://github.com/TanishaJain22/ArchFlow-AI)**

</div>
