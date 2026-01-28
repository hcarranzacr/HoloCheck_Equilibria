"""
Models package - imports all models for SQLAlchemy metadata
"""
from core.database import Base

# Import all models so they are registered with Base.metadata
from models.user_profiles import UserProfile
from models.organizations import Organizations
from models.departments import Departments
from models.biometric_measurements import Biometric_measurements
from models.ai_analysis_logs import AIAnalysisLog
from models.ai_analysis_results import Ai_analysis_results
from models.app_settings import App_settings
from models.department_insights import Department_insights
from models.organization_branding import OrganizationBranding
from models.organization_insights import OrganizationInsight
from models.organization_subscriptions import OrganizationSubscription
from models.organization_usage_summary import OrganizationUsageSummary
from models.param_industries import ParamIndustry
from models.param_sectors import ParamSector
from models.param_subscription_plans import ParamSubscriptionPlan
from models.prompts import Prompts
from models.subscription_plans import SubscriptionPlan
from models.subscription_usage_logs import Subscription_usage_logs
from models.system_audit_logs import SystemAuditLog
from models.system_logs import System_logs
from models.tenant_settings import Tenant_settings
from models.tenants import Tenants
from models.recommendations import Recommendation

__all__ = [
    "Base",
    "UserProfile",
    "Organizations",
    "Departments",
    "Biometric_measurements",
    "AIAnalysisLog",
    "Ai_analysis_results",
    "App_settings",
    "Department_insights",
    "OrganizationBranding",
    "OrganizationInsight",
    "OrganizationSubscription",
    "OrganizationUsageSummary",
    "ParamIndustry",
    "ParamSector",
    "ParamSubscriptionPlan",
    "Prompts",
    "SubscriptionPlan",
    "Subscription_usage_logs",
    "SystemAuditLog",
    "System_logs",
    "Tenant_settings",
    "Tenants",
    "Recommendation",
]