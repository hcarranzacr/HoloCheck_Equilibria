"""
Biometric Indicators API Router
Provides endpoints for retrieving biometric indicator information and ranges
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import Dict, Any
import logging

from core.database import get_db

router = APIRouter(prefix="/api/v1/biometric-indicators", tags=["biometric-indicators"])
logger = logging.getLogger(__name__)


@router.get("/ranges", response_model=Dict[str, Any])
async def get_biometric_indicator_ranges(db: AsyncSession = Depends(get_db)):
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
        # Query param_biometric_indicators_info table directly via PostgreSQL
        query = text("""
            SELECT indicator_code, risk_ranges 
            FROM param_biometric_indicators_info
            WHERE risk_ranges IS NOT NULL
        """)
        
        result = await db.execute(query)
        rows = result.fetchall()
        
        if not rows:
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
        for row in rows:
            indicator_code = row[0]
            risk_ranges = row[1]
            
            if indicator_code and risk_ranges:
                ranges_dict[indicator_code] = risk_ranges
        
        logger.info(f"Retrieved risk ranges for {len(ranges_dict)} indicators")
        return ranges_dict
        
    except Exception as e:
        logger.error(f"Error retrieving biometric indicator ranges: {e}")
        # Return default ranges on error
        logger.warning("Returning default ranges due to error")
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
        query = text("""
            SELECT * FROM param_biometric_indicators_info
            WHERE indicator_code = :indicator_code
        """)
        
        result = await db.execute(query, {"indicator_code": indicator_code})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=404,
                detail=f"Indicator '{indicator_code}' not found"
            )
        
        # Convert row to dict
        columns = result.keys()
        indicator = dict(zip(columns, row))
        
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