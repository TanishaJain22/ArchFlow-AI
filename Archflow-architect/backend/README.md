# ARCHFLOW - AI System Designer (Backend)

This is the FastAPI backend supporting the ARCHFLOW AI System Designer UI. It requires PostgreSQL and runs logic via LangChain + Groq integrations for RAG and text generation.

## Prerequisites
- Python 3.10+
- Docker & Docker Compose (for PostgreSQL)

---

## 1. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Open `.env` and fill in your **Groq API Key**:
   ```env
   GROQ_API_KEY=your_actual_key
   ```
   *(The database string is pre-configured to point to the local Docker container)*

## 2. Start PostgreSQL via Docker

Run the `docker-compose.yml` located in the **project root directory** to spin up a local PostgreSQL instance:

```bash
# From the archflow-architect root directory
docker compose up -d
```
*To stop it later, use `docker compose down`.*

## 3. Install Python Dependencies

It's recommended to create a virtual environment first:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

## 4. Run the Backend Server

Start the FastAPI application using uvicorn:

```bash
uvicorn main:app --reload
```

The server will be running at `http://localhost:8000`.

## 5. Testing the API

You can test the API using curl (or just load it with Postman):

```bash
curl -X POST "http://localhost:8000/api/v1/generate-system" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Design a highly available URL shortener service"}'
```

*Note: The frontend should be running separately on `http://localhost:5173`, and the CORS rules allow requests originating from it.*
