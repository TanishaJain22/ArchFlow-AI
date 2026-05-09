from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import SystemDesignRequest
from services.orchestrator import orchestrator
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1", tags=["system-design"])

@router.post("/generate-system")
async def generate_system(request: SystemDesignRequest):
    try:
        return await orchestrator.process_design_request(request)
    except Exception as e:
        logger.error(f"Endpoint Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate design.")
