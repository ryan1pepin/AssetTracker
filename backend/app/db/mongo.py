from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

mongo_db = MongoDB()

async def connect_to_mongo():
    mongo_db.client = AsyncIOMotorClient(settings.MONGO_URL)
    mongo_db.db = mongo_db.client.asset_tracker

async def close_mongo_connection():
    if mongo_db.client:
        mongo_db.client.close()

def get_mongo_db():
    return mongo_db.db
