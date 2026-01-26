from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.param_subscription_plans import ParamSubscriptionPlan

router = APIRouter(prefix="/api/v1/entities/param_subscription_plans", tags=["parameters"])


@router.get("")
async def list_param_subscription_plans(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all subscription plan parameters"""
    query = select(ParamSubscriptionPlan).order_by(ParamSubscriptionPlan.name)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return {
        "items": [
            {
                "id": item.id,
                "name": item.name,
                "min_users": item.min_users,
                "max_users": item.max_users,
                "scans_per_user_month": item.scans_per_user_month,
                "dept_analyses_per_month": item.dept_analyses_per_month,
                "org_analyses_per_month": item.org_analyses_per_month,
                "price_usd": float(item.price_usd) if item.price_usd else None,
            }
            for item in items
        ]
    }