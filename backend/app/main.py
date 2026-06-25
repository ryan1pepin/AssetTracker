import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.postgres import engine, Base
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.api.v1.endpoints import api_router
from app.services.poller import start_polling

app = FastAPI(title=settings.PROJECT_NAME)

# Allow React frontend to communicate with API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

poller_task = None

@app.on_event("startup")
async def startup_event():
    # Setup PostgreSQL tables automatically
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Setup MongoDB connection
    await connect_to_mongo()
    
    # Start background poller loop
    global poller_task
    poller_task = asyncio.create_task(start_polling())

@app.on_event("shutdown")
async def shutdown_event():
    if poller_task:
        poller_task.cancel()
    await close_mongo_connection()
    await engine.dispose()
