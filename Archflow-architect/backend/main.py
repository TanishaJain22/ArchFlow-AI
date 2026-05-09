import os
from dotenv import load_dotenv

# Ensure variables are loaded before ALL other imports
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import system
from db.database import init_db
from utils.logger import get_logger

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema (safe — will not crash if DB is unavailable)
    logger.info("Initializing Database...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"DB init failed, continuing without DB: {e}")

    # Trigger RAG initialization in background (safe — will not crash)
    try:
        import asyncio
        from services.rag_engine import rag_engine
        logger.info("Starting RAG engine background initialization...")
        asyncio.create_task(asyncio.to_thread(rag_engine.initialize))
    except Exception as e:
        logger.error(f"RAG engine startup failed, continuing without RAG: {e}")

    yield
    logger.info("Shutting down the application.")

app = FastAPI(
    title="ARCHFLOW - AI System Designer Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(system.router)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
