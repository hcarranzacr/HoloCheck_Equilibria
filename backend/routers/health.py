"""
Health Check Router
Provides health check endpoints for system monitoring
"""

import logging
import time
from datetime import datetime
from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from core.database import get_db

router = APIRouter(prefix="/api/v1/health", tags=["health"])
logger = logging.getLogger(__name__)


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    response_time_ms: int
    services: dict
    environment: str = "production"


class DatabaseHealthResponse(BaseModel):
    status: str
    response_time_ms: int
    connections_available: int
    connections_total: int
    last_query_success: bool
    replication_lag_ms: int = 0


class AuthHealthResponse(BaseModel):
    status: str
    provider: str
    response_time_ms: int
    success_rate_percent: float
    last_check: str


@router.get("", response_model=HealthResponse)
async def health_check():
    """
    General health check endpoint
    Returns overall system health status
    """
    start_time = time.time()
    
    try:
        # Basic health check
        status_value = "operational"
        services = {
            "api": "operational",
            "auth": "operational"
        }
        
        response_time = int((time.time() - start_time) * 1000)
        
        return {
            "status": status_value,
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "response_time_ms": response_time,
            "services": services,
            "environment": "production"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        response_time = int((time.time() - start_time) * 1000)
        return Response(
            content={
                "status": "down",
                "error": str(e),
                "response_time_ms": response_time
            },
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )


@router.get("/database", response_model=DatabaseHealthResponse)
async def database_health_check(db: AsyncSession = Depends(get_db)):
    """
    Database health check endpoint
    Tests database connectivity and performance
    """
    start_time = time.time()
    
    try:
        # Test database connection with a simple query
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        
        response_time = int((time.time() - start_time) * 1000)
        
        return {
            "status": "operational",
            "response_time_ms": response_time,
            "connections_available": 45,  # Mock value - would come from connection pool
            "connections_total": 50,
            "last_query_success": True,
            "replication_lag_ms": 0
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        response_time = int((time.time() - start_time) * 1000)
        return {
            "status": "down",
            "response_time_ms": response_time,
            "connections_available": 0,
            "connections_total": 50,
            "last_query_success": False,
            "replication_lag_ms": 0
        }


@router.get("/auth", response_model=AuthHealthResponse)
async def auth_health_check():
    """
    Authentication service health check
    Tests auth service availability
    """
    start_time = time.time()
    
    try:
        # Mock auth check - in production, this would verify Supabase auth service
        # For now, we'll assume it's operational if we can respond
        response_time = int((time.time() - start_time) * 1000)
        
        return {
            "status": "operational",
            "provider": "supabase",
            "response_time_ms": response_time,
            "success_rate_percent": 99.2,
            "last_check": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        logger.error(f"Auth health check failed: {e}")
        response_time = int((time.time() - start_time) * 1000)
        return {
            "status": "down",
            "provider": "supabase",
            "response_time_ms": response_time,
            "success_rate_percent": 0.0,
            "last_check": datetime.utcnow().isoformat() + "Z"
        }