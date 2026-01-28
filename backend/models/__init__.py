"""
Models package - imports all models for SQLAlchemy metadata
"""
from core.database import Base

# Import all models so they are registered with Base.metadata
from models.user_profiles import UserProfile
from models.organizations import Organizations
from models.departments import Department
from models.biometric_measurements import Biometric_measurements
from models.ai_analysis_logs import Ai_analysis_logs
from models.ai_analysis_results import Ai_analysis_results
from models.app_settings import App_settings
from models.department_insights import Department_insights
from models.organization_branding import OrganizationBranding
from models.organization_insights import Organization_insights
from models.organization_subscriptions import Organization_subscriptions
from models.organization_usage_summary import Organization_usage_summary
from models.param_industries import Param_industries
from models.param_sectors import Param_sectors
from models.param_subscription_plans import Param_subscription_plans
from models.prompts import Prompts
from models.subscription_plans import Subscription_plans
from models.subscription_usage_logs import Subscription_usage_logs
from models.system_audit_logs import System_audit_logs
from models.system_logs import System_logs
from models.tenant_settings import TenantSettings
from models.tenants import Tenant
from models.recommendations import Recommendation

__all__ = [
    "Base",
    "UserProfile",
    "Organizations",
    "Department",
    "Biometric_measurements",
    "Ai_analysis_logs",
    "Ai_analysis_results",
    "App_settings",
    "Department_insights",
    "OrganizationBranding",
    "Organization_insights",
    "Organization_subscriptions",
    "Organization_usage_summary",
    "Param_industries",
    "Param_sectors",
    "Param_subscription_plans",
    "Prompts",
    "Subscription_plans",
    "Subscription_usage_logs",
    "System_audit_logs",
    "System_logs",
    "TenantSettings",
    "Tenant",
    "Recommendation",
]