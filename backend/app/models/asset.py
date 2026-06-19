from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.db.postgres import Base

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    ip_address = Column(String, unique=True, index=True)
    mac_address = Column(String, index=True, nullable=True)
    description = Column(Text, nullable=True)
    type = Column(String) # e.g., 'Server', 'Switch'
    status = Column(String, default="Offline")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
