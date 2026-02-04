"""
Biometric Indicators API Router
Provides endpoints for retrieving biometric indicator information and ranges
Uses ONLY Supabase API (centralized method) - NO SQLAlchemy
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import logging

from core.supabase_client import get_supabase_admin
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

router = APIRouter(prefix="/api/v1/biometric-indicators", tags=["biometric-indicators"])
logger = logging.getLogger(__name__)


@router.get("/ranges", response_model=Dict[str, Any])
async def get_biometric_indicator_ranges(
    current_user: UserResponse = Depends(get_current_user)
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
        logger.info(f"📊 [Ranges] User {current_user.id} requesting biometric indicator ranges")
        
        # Use centralized Supabase admin client
        supabase = get_supabase_admin()
        
        response = supabase.table('param_biometric_indicators_info')\
            .select('indicator_code, risk_ranges')\
            .not_.is_('risk_ranges', 'null')\
            .execute()
        
        if not response.data:
            logger.warning("No biometric indicators found in database")
            # Return default ranges if table is empty
            return {
                "heart_rate": {
                    "baja": [40, 59],
                    "normal": [60, 100],
                    "alta": [101, 140]
                },
                "bmi": {
                    "bajo_peso": [0, 18.4],
                    "normal": [18.5, 24.9],
                    "sobrepeso": [25.0, 29.9],
                    "obesidad": [30.0, 100]
                },
                "sdnn": {
                    "baja": [0, 49],
                    "normal": [50, 100],
                    "alta": [101, 200]
                },
                "rmssd": {
                    "baja": [0, 29],
                    "normal": [30, 80],
                    "alta": [81, 200]
                }
            }
        
        # Build response dictionary
        ranges_dict = {}
        for item in response.data:
            indicator_code = item.get('indicator_code')
            risk_ranges = item.get('risk_ranges')
            
            if indicator_code and risk_ranges:
                ranges_dict[indicator_code] = risk_ranges
        
        logger.info(f"✅ [Ranges] Retrieved risk ranges for {len(ranges_dict)} indicators")
        return ranges_dict
        
    except Exception as e:
        logger.error(f"❌ [Ranges] Error retrieving biometric indicator ranges: {e}")
        # Return default ranges on error
        logger.warning("⚠️ [Ranges] Returning default ranges due to error")
        return {
            "heart_rate": {
                "baja": [40, 59],
                "normal": [60, 100],
                "alta": [101, 140]
            },
            "bmi": {
                "bajo_peso": [0, 18.4],
                "normal": [18.5, 24.9],
                "sobrepeso": [25.0, 29.9],
                "obesidad": [30.0, 100]
            },
            "sdnn": {
                "baja": [0, 49],
                "normal": [50, 100],
                "alta": [101, 200]
            },
            "rmssd": {
                "baja": [0, 29],
                "normal": [30, 80],
                "alta": [81, 200]
            }
        }


@router.get("/info/{indicator_code}")
async def get_biometric_indicator_info(
    indicator_code: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get detailed information for a specific biometric indicator
    
    Args:
        indicator_code: The indicator code (e.g., 'heart_rate', 'bmi')
    
    Returns:
        Complete indicator information including ranges, description, tips, etc.
    """
    try:
        logger.info(f"📊 [Info] User {current_user.id} requesting info for indicator: {indicator_code}")
        
        # Use centralized Supabase admin client
        supabase = get_supabase_admin()
        
        response = supabase.table('param_biometric_indicators_info')\
            .select('*')\
            .eq('indicator_code', indicator_code)\
            .execute()
        
        if not response.data or len(response.data) == 0:
            logger.warning(f"⚠️ [Info] Indicator '{indicator_code}' not found")
            raise HTTPException(
                status_code=404,
                detail=f"Indicator '{indicator_code}' not found"
            )
        
        indicator = response.data[0]
        
        logger.info(f"✅ [Info] Successfully retrieved info for indicator: {indicator_code}")
        
        return {
            "indicator_code": indicator.get('indicator_code'),
            "display_name": indicator.get('display_name'),
            "indicator_name": indicator.get('indicator_name'),
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
        logger.error(f"❌ [Info] Error retrieving indicator info for '{indicator_code}': {e}")
        import traceback
        logger.error(f"❌ [Info] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve indicator info: {str(e)}"
        )