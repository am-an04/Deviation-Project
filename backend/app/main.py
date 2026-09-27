import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db
from app.routers.deviations import router as deviations_router

from app.ai.rag import init_vector_store

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("qms.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing QMS Deviation Intake Application...")
    init_db()
    logger.info("QMS Database ready.")
    logger.info("Initializing MVP Severity Assessment Knowledge Base...")
    init_vector_store()
    logger.info("Knowledge Base ready.")
    yield
    logger.info("Shutting down QMS Deviation Intake Application.")

app = FastAPI(
    title="Quality Management System - Deviation Intake API",
    description="Enterprise API for AI-assisted deviation extraction, severity assessment, and human-in-the-loop review.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
allowed_origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include deviation endpoints
app.include_router(deviations_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "AI-Powered Deviation Intake Module",
        "version": "1.0.0",
        "groq_configured": bool(settings.GROQ_API_KEY)
    }
