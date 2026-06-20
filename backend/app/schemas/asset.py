from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssetBase(BaseModel):
    name: str
    ip_address: str
    mac_address: Optional[str] = None
    description: Optional[str] = None
    type: str
    status: Optional[str] = "Offline"

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None

class AssetResponse(AssetBase):
    id: int
    is_deleted: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
