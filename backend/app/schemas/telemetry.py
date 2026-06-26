from pydantic import BaseModel, Field
from datetime import datetime

class TelemetryData(BaseModel):
    asset_id: int
    cpu_usage: float
    ram_usage: float
    temperature: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
