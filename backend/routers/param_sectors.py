from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.param_sectors import ParamSector

router = APIRouter(prefix="/api/v1/entities/param_sectors", tags=["parameters"])


@router.get("")
async def list_sectors(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all sectors"""
    query = select(ParamSector).order_by(ParamSector.name)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return {
        "items": [
            {
                "id": item.id,
                "name": item.name,
            }
            for item in items
        ]
    }