import os
import json
import re
import logging
from groq import Groq

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a Principal Systems Architect at a FAANG company 
with 20 years of experience designing large-scale distributed systems.

When given a system design prompt, you MUST respond with ONLY a valid JSON 
object. No markdown, no explanation, no code fences. Pure JSON only.

The JSON must match this exact schema:
{
  "architecture": {
    "overview": ["string"],
    "components": [
      {
        "name": "string",
        "purpose": "string", 
        "why": "string",
        "scale": "string"
      }
    ],
    "data_flow": ["string"],
    "scaling": ["string"],
    "bottlenecks": ["string"],
    "tradeoffs": ["string"]
  },
  "metrics": {
    "latency_ms": 120,
    "requests_per_sec": 100000,
    "db_reads_per_sec": 50000,
    "cache_reads_per_sec": 450000,
    "cache_hit_rate": 0.9,
    "error_rate": 0.02
  },
  "diagram": {
    "nodes": [
      {"id": "1", "label": "API Gateway", "x": 0, "y": 0, "type": "api"}
    ],
    "edges": [
      {"from": "1", "to": "2"}
    ]
  }
}

Rules:
- All metrics must be realistic numbers for the described system
- Include 5-8 components minimum
- Include at least 6 diagram nodes
- Output ONLY the JSON object, nothing else
"""

class LLMService:
    def __init__(self):
        self._client = None

    @property
    def client(self):
        if self._client is None:
            api_key = os.environ.get("GROQ_API_KEY", "")
            self._client = Groq(api_key=api_key)
        return self._client

    async def generate_design(self, prompt: str, context: str = "") -> str:
        user_message = f"Design the following system: {prompt}"
        if context:
            user_message += f"\n\nAdditional context:\n{context}"

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.2,
                max_tokens=4096,
            )
            raw = response.choices[0].message.content
            clean = re.sub(r"```(?:json)?|```", "", raw).strip()
            return clean
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise e

llm_service = LLMService()
