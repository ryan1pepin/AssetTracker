from fastapi import APIRouter
from app.api.v1 import assets, telemetry

api_router = APIRouter()
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["telemetry"])
