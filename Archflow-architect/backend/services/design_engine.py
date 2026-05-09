import json
import re
from typing import Dict, Any
from models.schemas import SystemDesignResponse
from utils.logger import get_logger

logger = get_logger(__name__)

class DesignEngine:
    def parse_json_output(self, llm_output: str) -> SystemDesignResponse:
        try:
            # Clean markdown JSON block formatting if present
            clean_output = re.sub(r'```json\s*', '', llm_output)
            clean_output = re.sub(r'```\s*', '', clean_output)
            
            # Find the actual JSON block in case LLM outputs preamble text
            start_idx = clean_output.find('{')
            end_idx = clean_output.rfind('}')
            
            if start_idx != -1 and end_idx != -1:
                clean_output = clean_output[start_idx:end_idx + 1]
            
            data = json.loads(clean_output)
            
            return SystemDesignResponse(**data)
            
        except Exception as e:
            logger.error(f"Failed to parse LLM JSON output: {e}\nRaw output: {llm_output}")
            # Return empty analytical scaffold on fallback
            return SystemDesignResponse()

design_engine = DesignEngine()
