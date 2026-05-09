import asyncio
import logging
from models.schemas import SystemDesignRequest, SystemDesignResponse
from services.llm_service import llm_service
from services.rag_engine import rag_engine
from services.design_engine import design_engine

logger = logging.getLogger(__name__)

class Orchestrator:
    async def process_design_request(self, request: SystemDesignRequest) -> dict:
        context = ""
        try:
            context = rag_engine.get_relevant_context(request.prompt)
        except Exception as e:
            logger.warning(f"RAG unavailable, continuing without context: {e}")

        try:
            raw_output = await llm_service.generate_design(request.prompt, context)
            result = design_engine.parse_json_output(raw_output)
            return result.dict()
        except Exception as e:
            logger.error(f"Design generation failed: {e}")
            raise e

orchestrator = Orchestrator()
