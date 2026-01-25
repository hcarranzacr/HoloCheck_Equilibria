"""
DeepAffex API Routes
Provides endpoints for DeepAffex SDK authentication
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user_optional
from schemas.auth import UserResponse
from services.deepaffex_service import DeepAffexService

router = APIRouter(prefix="/api/v1/deepaffex", tags=["deepaffex"])


@router.get("/studyId")
async def get_study_id(
    current_user: UserResponse | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Get DeepAffex study ID for SDK initialization
    
    Returns:
        dict: Study ID response
    """
    try:
        service = DeepAffexService()
        result = await service.get_study_id()
        
        if result.get("status") != "200":
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to get study ID")
            )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/token")
async def generate_token(
    current_user: UserResponse | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate authentication token for DeepAffex SDK
    
    Returns:
        dict: Token response with token and refreshToken
    """
    try:
        service = DeepAffexService()
        result = await service.generate_token()
        
        if result.get("status") != "200":
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to generate token")
            )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")