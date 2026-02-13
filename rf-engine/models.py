from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Tuple

class NodeConfig(BaseModel):
    id: str
    lat: float
    lon: float
    height: float = 10.0
    name: Optional[str] = None
    radius: float = 5000.0  # Max coverage radius in meters

    @field_validator('lat')
    @classmethod
    def validate_lat(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @field_validator('lon')
    @classmethod
    def validate_lon(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v

class NodeCollection(BaseModel):
    nodes: List[NodeConfig]
    bounds: Optional[Tuple[float, float, float, float]] = None # min_lat, min_lon, max_lat, max_lon
    optimize_n: Optional[int] = None # If set, select N best nodes greedily

class CoverageResult(BaseModel):
    node_id: str
    viewshed_id: str # Redis key for bitmap
    coverage_area_km2: float
    population_covered: Optional[int] = 0

class OptimizationScenario(BaseModel):
    candidate_nodes: List[NodeConfig]
    num_nodes_to_place: int = 3
    objectives: dict = {"coverage": 1.0, "cost": 0.0}
    constraints: dict = {"max_cost": 1000}
