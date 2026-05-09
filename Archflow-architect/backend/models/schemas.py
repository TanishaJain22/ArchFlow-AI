from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SystemDesignRequest(BaseModel):
    prompt: str = Field(..., description="The user prompt detailing the system to be designed")

class ArchitectureComponent(BaseModel):
    name: str = ""
    purpose: str = ""
    why: str = ""
    scale: str = ""

class ArchitectureSchema(BaseModel):
    overview: List[str] = Field(default_factory=list)
    components: List[ArchitectureComponent] = Field(default_factory=list)
    data_flow: List[str] = Field(default_factory=list)
    scaling: List[str] = Field(default_factory=list)
    bottlenecks: List[str] = Field(default_factory=list)
    tradeoffs: List[str] = Field(default_factory=list)

class MetricsSchema(BaseModel):
    latency_ms: int = 0
    requests_per_sec: int = 0
    db_reads_per_sec: int = 0
    cache_reads_per_sec: int = 0
    cache_hit_rate: float = 0.0
    error_rate: float = 0.0

class DiagramData(BaseModel):
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)

class SystemDesignResponse(BaseModel):
    architecture: ArchitectureSchema = Field(default_factory=ArchitectureSchema)
    metrics: MetricsSchema = Field(default_factory=MetricsSchema)
    diagram: DiagramData = Field(default_factory=DiagramData)
