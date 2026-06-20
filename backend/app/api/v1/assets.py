from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.postgres import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse

router = APIRouter()

@router.get("/", response_model=List[AssetResponse])
async def read_assets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Asset).where(Asset.is_deleted == False))
    return result.scalars().all()

@router.post("/", response_model=AssetResponse)
async def create_asset(asset: AssetCreate, db: AsyncSession = Depends(get_db)):
    db_asset = Asset(**asset.model_dump())
    db.add(db_asset)
    await db.commit()
    await db.refresh(db_asset)
    return db_asset

@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(asset_id: int, asset: AssetUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    db_asset = result.scalar_one_or_none()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    update_data = asset.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_asset, key, value)
        
    await db.commit()
    await db.refresh(db_asset)
    return db_asset

@router.delete("/{asset_id}", response_model=AssetResponse)
async def delete_asset(asset_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    db_asset = result.scalar_one_or_none()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db_asset.is_deleted = True
    await db.commit()
    await db.refresh(db_asset)
    return db_asset
