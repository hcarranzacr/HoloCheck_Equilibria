"""
Biometric Indicators API Router
Provides endpoints for retrieving biometric indicator information and ranges
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import logging

from core.database import get_db
from core.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/v1/biometric-indicators", tags=["biometric-indicators"])
logger = logging.getLogger(__name__)


@router.get("/ranges", response_model=Dict[str, Any])
async def get_biometric_indicator_ranges():
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
        supabase = get_supabase_client()
        
        # Query all indicators with their risk ranges
        result = supabase.table('param_biometric_indicators_info').select(
            'indicator_code, risk_ranges'
        ).execute()
        
        if not result.data:
            logger.warning("No biometric indicators found in database")
            return {}
        
        # Build response dictionary
        ranges_dict = {}
        for indicator in result.data:
            indicator_code = indicator.get('indicator_code')
            risk_ranges = indicator.get('risk_ranges')
            
            if indicator_code and risk_ranges:  # Only include if both exist
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
async def get_biometric_indicator_info(indicator_code: str):
    """
    Get detailed information for a specific biometric indicator
    
    Args:
        indicator_code: The indicator code (e.g., 'heart_rate', 'bmi')
    
    Returns:
        Complete indicator information including ranges, description, tips, etc.
    """
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('param_biometric_indicators_info').select('*').eq(
            'indicator_code', indicator_code
        ).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Indicator '{indicator_code}' not found"
            )
        
        indicator = result.data[0]
        
        return {
            "indicator_code": indicator.get('indicator_code'),
            "display_name": indicator.get('display_name'),
            "unit": indicator.get('unit'),
            "min_value": indicator.get('min_value'),
            "max_value": indicator.get('max_value'),
            "description": indicator.get('description'),
            "interpretation": indicator.get('interpretation'),
            "influencing_factors": indicator.get('influencing_factors'),
            "tips": indicator.get('tips'),
            "risk_ranges": indicator.get('risk_ranges'),
            "is_clinical": indicator.get('is_clinical')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving indicator info for '{indicator_code}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve indicator info: {str(e)}"
        )