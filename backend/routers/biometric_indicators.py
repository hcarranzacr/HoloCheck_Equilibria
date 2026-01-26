"""
Biometric Indicators API Router
Provides endpoints for retrieving biometric indicator information and ranges
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any
import logging

from core.database import get_db
from models.param_biometric_indicators_info import ParamBiometricIndicatorsInfo

router = APIRouter(prefix="/api/v1/biometric-indicators", tags=["biometric-indicators"])
logger = logging.getLogger(__name__)


@router.get("/ranges", response_model=Dict[str, Any])
async def get_biometric_indicator_ranges(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all biometric indicator risk ranges for frontend evaluation
    
    Returns:
        Dict mapping indicator_code to risk_ranges JSON object
        Example: {
            "heart_rate": {"normal": [60, 100], "alta": [101, 140], "baja": [40, 59]},
            "bmi": {"normal": [18.5, 24.9], "sobrepeso": [25.0, 29.9], ...},
            ...
        }
    """
    try:
        # Query all indicators with their risk ranges
        result = await db.execute(
            select(
                ParamBiometricIndicatorsInfo.indicator_code,
                ParamBiometricIndicatorsInfo.risk_ranges
            )
        )
        indicators = result.all()
        
        # Build response dictionary
        ranges_dict = {}
        for indicator_code, risk_ranges in indicators:
            if risk_ranges:  # Only include if risk_ranges is not null
                ranges_dict[indicator_code] = risk_ranges
        
        logger.info(f"Retrieved risk ranges for {len(ranges_dict)} indicators")
        return ranges_dict
        
    except Exception as e:
        logger.error(f"Error retrieving biometric indicator ranges: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve biometric indicator ranges: {str(e)}"
        )


@router.get("/info/{indicator_code}")
async def get_biometric_indicator_info(
    indicator_code: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information for a specific biometric indicator
    
    Args:
        indicator_code: The indicator code (e.g., 'heart_rate', 'bmi')
    
    Returns:
        Complete indicator information including ranges, description, tips, etc.
    """
    try:
        result = await db.execute(
            select(ParamBiometricIndicatorsInfo)
            .where(ParamBiometricIndicatorsInfo.indicator_code == indicator_code)
        )
        indicator = result.scalar_one_or_none()
        
        if not indicator:
            raise HTTPException(
                status_code=404,
                detail=f"Indicator '{indicator_code}' not found"
            )
        
        return {
            "indicator_code": indicator.indicator_code,
            "display_name": indicator.display_name,
            "unit": indicator.unit,
            "min_value": indicator.min_value,
            "max_value": indicator.max_value,
            "description": indicator.description,
            "interpretation": indicator.interpretation,
            "influencing_factors": indicator.influencing_factors,
            "tips": indicator.tips,
            "risk_ranges": indicator.risk_ranges,
            "is_clinical": indicator.is_clinical
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving indicator info for '{indicator_code}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve indicator info: {str(e)}"
        )