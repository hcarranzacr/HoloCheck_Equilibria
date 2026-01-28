"""
FastAPI application entry point
Simplified startup without blocking operations
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import routers
from routers import (
    auth,
    health,
    user_profile,
    dashboards,
    biometric_indicators,
    biometric_measurements,
    deepaffex,
    organizations,
    departments,
    ai_analysis_logs,
    ai_analysis_results,
    app_settings,
    benefits_management,
    department_insights,
    organization_branding,
    organization_insights,
    organization_subscriptions,
    organization_usage_summary,
    param_industries,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager - NO BLOCKING OPERATIONS
    Database initialization happens lazily on first request
    """
    logger.info("🚀 Starting FastAPI application...")
    logger.info(f"📝 Environment: {settings.environment}")
    logger.info(f"🔗 Database URL configured: {bool(settings.database_url)}")
    logger.info("✅ Application startup complete - ready to accept requests")
    
    yield
    
    logger.info("🛑 Shutting down application...")


# Create FastAPI app
app = FastAPI(
    title="Equilibria Backend API",
    version="1.0.0",
    description="Backend API for Equilibria health monitoring platform",
    lifespan=lifespan
)

# Configure CORS
allowed_origins = settings.allowed_origins.split(",") if settings.allowed_origins else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(user_profile.router)
app.include_router(dashboards.router)
app.include_router(biometric_indicators.router)
app.include_router(biometric_measurements.router)
app.include_router(deepaffex.router)
app.include_router(organizations.router)
app.include_router(departments.router)
app.include_router(ai_analysis_logs.router)
app.include_router(ai_analysis_results.router)
app.include_router(app_settings.router)
app.include_router(benefits_management.router)
app.include_router(department_insights.router)
app.include_router(organization_branding.router)
app.include_router(organization_insights.router)
app.include_router(organization_subscriptions.router)
app.include_router(organization_usage_summary.router)
app.include_router(param_industries.router)

logger.info("✅ All routers registered successfully")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Equilibria Backend API",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )