import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import configuration
from core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("🚀 Starting HoloCheck Equilibria Backend...")
    yield
    logger.info("👋 Shutting down HoloCheck Equilibria Backend...")

# Create FastAPI app
app = FastAPI(
    title="HoloCheck Equilibria API",
    description="Backend API for HoloCheck Equilibria - Organizational Wellness Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - CRITICAL: Allow all origins for Atoms platform
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Atoms platform compatibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Import routers
try:
    from routers import (
        auth, 
        user_profiles, 
        departments, 
        biometric_indicators, 
        dashboards, 
        prompts, 
        benefits_management,
        organization_branding,
        i18n
    )
    
    # Include routers
    app.include_router(auth.router, tags=["Authentication"])
    app.include_router(user_profiles.router, tags=["User Profiles"])
    app.include_router(departments.router, tags=["Departments"])
    app.include_router(biometric_indicators.router, tags=["Biometric Indicators"])
    app.include_router(dashboards.router, tags=["Dashboards"])
    app.include_router(prompts.router, tags=["Prompts"])
    app.include_router(benefits_management.router, tags=["Benefits Management"])
    app.include_router(organization_branding.router, tags=["Organization Branding"])
    app.include_router(i18n.router, tags=["Internationalization"])
    
    logger.info("✅ All routers imported successfully")
except Exception as e:
    logger.error(f"❌ Error importing routers: {e}")
    raise

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={"status": "healthy"}
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "HoloCheck Equilibria API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

logger.info("✅ Application startup complete")