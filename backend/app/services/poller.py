import asyncio
import random
import os
from datetime import datetime
from sqlalchemy.future import select
from app.db.postgres import AsyncSessionLocal
from app.db.mongo import get_mongo_db
from app.models.asset import Asset
from app.schemas.telemetry import TelemetryData

async def start_polling():
    """
    Background worker that polls mock hardware metrics and writes to MongoDB,
    while occasionally updating the Asset status in PostgreSQL.
    """
    poll_interval = float(os.getenv("POLL_INTERVAL", "3.0"))
    enable_spikes = os.getenv("ENABLE_SPIKES", "true").lower() == "true"
    
    while True:
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(select(Asset).where(Asset.is_deleted == False))
                assets = result.scalars().all()
                
                if assets:
                    db = get_mongo_db()
                    collection = db["telemetry"]
                    
                    telemetry_docs = []
                    for asset in assets:
                        # 20% chance of a spike if enabled
                        is_spike = enable_spikes and random.random() < 0.20
                        
                        if is_spike:
                            # 50% chance high spike, 50% low spike
                            if random.random() < 0.5:
                                # High Spike
                                cpu = round(random.uniform(90.0, 100.0), 2)
                                ram = round(random.uniform(90.0, 100.0), 2)
                                temp = round(random.uniform(90.0, 105.0), 2)
                            else:
                                # Low Spike (e.g. idle/offline)
                                cpu = round(random.uniform(0.0, 5.0), 2)
                                ram = round(random.uniform(5.0, 15.0), 2)
                                temp = round(random.uniform(20.0, 30.0), 2)
                        else:
                            # Normal operation
                            cpu = round(random.uniform(10.0, 70.0), 2)
                            ram = round(random.uniform(20.0, 70.0), 2)
                            temp = round(random.uniform(30.0, 70.0), 2)

                        # Generate mock telemetry
                        data = TelemetryData(
                            asset_id=asset.id,
                            cpu_usage=cpu,
                            ram_usage=ram,
                            temperature=temp,
                            timestamp=datetime.utcnow()
                        )
                        telemetry_docs.append(data.model_dump())
                        
                        # Occasionally randomly change status for optimistic UI demonstration
                        if random.random() > 0.95:
                            asset.status = "Maintenance" if asset.status == "Active" else "Active"
                            session.add(asset)
                    
                    # Insert high-velocity logs to Mongo
                    if telemetry_docs:
                        await collection.insert_many(telemetry_docs)
                        
                    # Commit relational state changes to Postgres
                    await session.commit()
                        
        except Exception as e:
            print(f"Poller error: {e}")
            
        await asyncio.sleep(poll_interval)
