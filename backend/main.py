"""
FastAPI Application Entry Point
"""
import logging
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

from routers import (
    auth,
    health,
    user_profile,
    user_profiles,
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
    recommendations,
)

logger.info("✅ All routers imported successfully")

app = FastAPI(
    title="HoloCheck Equilibria API",
    description="Backend API for HoloCheck Equilibria health monitoring platform",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health check endpoint - MUST be simple and fast
@app.get("/")
async def root():
    """Root endpoint - simple health check for deployment"""
    return {"status": "healthy"}


@app.get("/health")
async def health_check():
    """Health check endpoint - simple response for deployment verification"""
    return {"status": "healthy"}


# Register routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(user_profile.router)
app.include_router(user_profiles.router)
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
app.include_router(recommendations.router)

logger.info("✅ Application startup complete")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)