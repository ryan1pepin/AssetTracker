import json
import asyncio
import os
from typing import Optional
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.db.mongo import get_mongo_db

router = APIRouter()

@router.get("/history")
async def get_telemetry_history(limit: int = 100):
    """
    Retrieve historical telemetry data from MongoDB, ordered chronologically.
    """
    db = get_mongo_db()
    collection = db["telemetry"]
    
    cursor = collection.find({}).sort("_id", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    
    formatted_docs = []
    for doc in reversed(docs):
        doc["_id"] = str(doc["_id"])
        doc["timestamp"] = doc["timestamp"].isoformat()
        formatted_docs.append(doc)
        
    return formatted_docs

@router.get("/stream")
async def stream_telemetry(request: Request, last_id: Optional[str] = None):
    """
    Server-Sent Events endpoint that streams telemetry data from MongoDB.
    Starts streaming from last_id if provided.
    """
    db = get_mongo_db()
    collection = db["telemetry"]
    poll_interval = float(os.getenv("POLL_INTERVAL", "3.0"))
    
    async def event_generator():
        last_mongo_id = None
        if last_id:
            try:
                last_mongo_id = ObjectId(last_id)
            except Exception:
                pass
                
        if not last_mongo_id:
            newest_doc = await collection.find_one(sort=[("_id", -1)])
            if newest_doc:
                last_mongo_id = newest_doc["_id"]
                
        while True:
            if await request.is_disconnected():
                break
                
            query = {"_id": {"$gt": last_mongo_id}} if last_mongo_id else {}
            cursor = collection.find(query).sort("_id", -1).limit(100)
            docs = await cursor.to_list(length=100)
            
            if docs:
                last_mongo_id = docs[0]["_id"]
                for doc in reversed(docs):
                    doc["_id"] = str(doc["_id"])
                    doc["timestamp"] = doc["timestamp"].isoformat()
                    yield {
                        "event": "message",
                        "data": json.dumps(doc)
                    }
            
            await asyncio.sleep(poll_interval)
            
    return EventSourceResponse(event_generator())
