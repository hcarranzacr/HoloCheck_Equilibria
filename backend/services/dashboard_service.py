"""
Dashboard Service - HoloCheck Equilibria
Provides aggregated data for role-based dashboards following 3-tier architecture.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

# Import models with CORRECT class names
from models.biometric_measurements import Biometric_measurements
from models.user_profiles import UserProfile
from models.departments import Departments
from models.department_insights import Department_insights
from models.organizations import Organizations
from models.organization_insights import OrganizationInsight
from models.subscription_usage_logs import Subscription_usage_logs
from models.organization_usage_summary import OrganizationUsageSummary
from models.organization_subscriptions import OrganizationSubscription

logger = logging.getLogger(__name__)


class DashboardService:
    """Service layer for dashboard data aggregation and business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ==================== EMPLOYEE DASHBOARD ====================
    
    async def get_employee_dashboard(self, user_id: str) -> Dict[str, Any]:
        """
        Get employee dashboard data with latest scan and historical trends.
        
        SQL Reference:
        SELECT * FROM biometric_measurements 
        WHERE user_id = '<user_id>' 
        ORDER BY created_at DESC LIMIT 1;
        """
        try:
            # Get latest scan
            latest_scan_query = select(Biometric_measurements).where(
                Biometric_measurements.user_id == user_id
            ).order_by(desc(Biometric_measurements.created_at)).limit(1)
            
            result = await self.db.execute(latest_scan_query)
            latest_scan = result.scalar_one_or_none()
            
            # Get last 30 days of scans for trends
            thirty_days_ago = datetime.now() - timedelta(days=30)
            history_query = select(Biometric_measurements).where(
                and_(
                    Biometric_measurements.user_id == user_id,
                    Biometric_measurements.created_at >= thirty_days_ago
                )
            ).order_by(desc(Biometric_measurements.created_at))
            
            result = await self.db.execute(history_query)
            scan_history = result.scalars().all()
            
            # Get user profile for context
            user_query = select(UserProfile).where(UserProfile.user_id == user_id)
            result = await self.db.execute(user_query)
            user_profile = result.scalar_one_or_none()
            
            return {
                "latest_scan": self._serialize_biometric(latest_scan) if latest_scan else None,
                "scan_history": [self._serialize_biometric(scan) for scan in scan_history],
                "total_scans": len(scan_history),
                "trends": self._calculate_trends(scan_history),
                "user_profile": self._serialize_user_profile(user_profile) if user_profile else None
            }
            
        except Exception as e:
            logger.error(f"Error getting employee dashboard for user {user_id}: {e}")
            raise

    # ==================== LEADER DASHBOARD ====================
    
    async def get_leader_dashboard(self, user_id: str) -> Dict[str, Any]:
        """
        Get leader dashboard with team metrics and department insights.
        
        SQL Reference:
        SELECT * FROM biometric_measurements bm
        JOIN user_profiles u ON bm.user_id = u.user_id
        WHERE u.department_id = '<department_id>'
        ORDER BY bm.created_at DESC;
        """
        try:
            # Get leader's department
            user_query = select(UserProfile).where(UserProfile.user_id == user_id)
            result = await self.db.execute(user_query)
            leader = result.scalar_one_or_none()
            
            if not leader or not leader.department_id:
                return {"error": "Leader not assigned to a department"}
            
            department_id = leader.department_id
            
            # Get team members
            team_query = select(UserProfile).where(
                UserProfile.department_id == department_id
            )
            result = await self.db.execute(team_query)
            team_members = result.scalars().all()
            team_user_ids = [member.user_id for member in team_members]
            
            # Get recent team scans (last 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            scans_query = select(Biometric_measurements).where(
                and_(
                    Biometric_measurements.user_id.in_(team_user_ids),
                    Biometric_measurements.created_at >= thirty_days_ago
                )
            ).order_by(desc(Biometric_measurements.created_at))
            
            result = await self.db.execute(scans_query)
            team_scans = result.scalars().all()
            
            # Get department insights
            insights_query = select(Department_insights).where(
                Department_insights.department_id == department_id
            ).order_by(desc(Department_insights.created_at)).limit(1)
            
            result = await self.db.execute(insights_query)
            dept_insights = result.scalar_one_or_none()
            
            # Calculate team averages
            team_metrics = self._calculate_team_metrics(team_scans)
            
            return {
                "department_id": str(department_id),
                "team_size": len(team_members),
                "team_members": [self._serialize_user_profile(member) for member in team_members],
                "recent_scans": [self._serialize_biometric(scan) for scan in team_scans[:20]],
                "team_metrics": team_metrics,
                "department_insights": self._serialize_dept_insights(dept_insights) if dept_insights else None,
                "total_scans": len(team_scans)
            }
            
        except Exception as e:
            logger.error(f"Error getting leader dashboard for user {user_id}: {e}")
            raise

    # ==================== HR DASHBOARD ====================
    
    async def get_hr_dashboard(self, user_id: str) -> Dict[str, Any]:
        """
        Get HR dashboard with organization-wide metrics and insights.
        
        SQL Reference:
        SELECT * FROM organization_insights
        WHERE organization_id = '<organization_id>';
        """
        try:
            # Get HR user's organization
            user_query = select(UserProfile).where(UserProfile.user_id == user_id)
            result = await self.db.execute(user_query)
            hr_user = result.scalar_one_or_none()
            
            if not hr_user or not hr_user.organization_id:
                return {"error": "HR user not assigned to an organization"}
            
            organization_id = hr_user.organization_id
            
            # Get organization insights
            org_insights_query = select(OrganizationInsight).where(
                OrganizationInsight.organization_id == organization_id
            ).order_by(desc(OrganizationInsight.created_at)).limit(1)
            
            result = await self.db.execute(org_insights_query)
            org_insights = result.scalar_one_or_none()
            
            # Get all departments in organization
            depts_query = select(Departments).where(
                Departments.organization_id == organization_id
            )
            result = await self.db.execute(depts_query)
            departments = result.scalars().all()
            
            # Get department insights for all departments
            dept_insights_list = []
            for dept in departments:
                insights_query = select(Department_insights).where(
                    Department_insights.department_id == dept.id
                ).order_by(desc(Department_insights.created_at)).limit(1)
                
                result = await self.db.execute(insights_query)
                dept_insight = result.scalar_one_or_none()
                
                if dept_insight:
                    dept_insights_list.append({
                        "department_name": dept.name,
                        "department_id": str(dept.id),
                        "insights": self._serialize_dept_insights(dept_insight)
                    })
            
            # Get organization usage summary
            usage_query = select(OrganizationUsageSummary).where(
                OrganizationUsageSummary.organization_id == organization_id
            ).order_by(desc(OrganizationUsageSummary.month)).limit(6)
            
            result = await self.db.execute(usage_query)
            usage_summary = result.scalars().all()
            
            # Get total employee count
            employees_query = select(func.count(UserProfile.user_id)).where(
                UserProfile.organization_id == organization_id
            )
            result = await self.db.execute(employees_query)
            total_employees = result.scalar() or 0
            
            return {
                "organization_id": str(organization_id),
                "total_employees": total_employees,
                "organization_insights": self._serialize_org_insights(org_insights) if org_insights else None,
                "department_insights": dept_insights_list,
                "departments_count": len(departments),
                "usage_summary": [self._serialize_usage_summary(usage) for usage in usage_summary]
            }
            
        except Exception as e:
            logger.error(f"Error getting HR dashboard for user {user_id}: {e}")
            raise

    # ==================== ADMIN DASHBOARD ====================
    
    async def get_admin_dashboard(self, user_id: str) -> Dict[str, Any]:
        """
        Get admin dashboard with operational metrics and consumption control.
        
        SQL Reference:
        SELECT * FROM biometric_measurements bm
        JOIN user_profiles u ON bm.user_id = u.user_id
        WHERE u.organization_id = '<organization_id>'
        ORDER BY bm.created_at DESC;
        """
        try:
            # Get admin user's organization
            user_query = select(UserProfile).where(UserProfile.user_id == user_id)
            result = await self.db.execute(user_query)
            admin_user = result.scalar_one_or_none()
            
            if not admin_user or not admin_user.organization_id:
                return {"error": "Admin user not assigned to an organization"}
            
            organization_id = admin_user.organization_id
            
            # Get organization subscription details
            subscription_query = select(OrganizationSubscription).where(
                OrganizationSubscription.organization_id == organization_id
            )
            result = await self.db.execute(subscription_query)
            subscription = result.scalar_one_or_none()
            
            # Get recent usage logs (last 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            usage_logs_query = select(Subscription_usage_logs).where(
                and_(
                    Subscription_usage_logs.organization_id == organization_id,
                    Subscription_usage_logs.used_at >= thirty_days_ago
                )
            ).order_by(desc(Subscription_usage_logs.used_at)).limit(100)
            
            result = await self.db.execute(usage_logs_query)
            usage_logs = result.scalars().all()
            
            # Get monthly usage summary
            usage_summary_query = select(OrganizationUsageSummary).where(
                OrganizationUsageSummary.organization_id == organization_id
            ).order_by(desc(OrganizationUsageSummary.month)).limit(12)
            
            result = await self.db.execute(usage_summary_query)
            usage_summary = result.scalars().all()
            
            # Get all organization users
            users_query = select(UserProfile).where(
                UserProfile.organization_id == organization_id
            )
            result = await self.db.execute(users_query)
            org_users = result.scalars().all()
            
            # Get recent scans (last 7 days)
            seven_days_ago = datetime.now() - timedelta(days=7)
            user_ids = [user.user_id for user in org_users]
            
            recent_scans_query = select(Biometric_measurements).where(
                and_(
                    Biometric_measurements.user_id.in_(user_ids),
                    Biometric_measurements.created_at >= seven_days_ago
                )
            ).order_by(desc(Biometric_measurements.created_at))
            
            result = await self.db.execute(recent_scans_query)
            recent_scans = result.scalars().all()
            
            # Calculate consumption metrics
            consumption_metrics = self._calculate_consumption_metrics(
                subscription, usage_summary[0] if usage_summary else None
            )
            
            return {
                "organization_id": str(organization_id),
                "total_users": len(org_users),
                "subscription": self._serialize_subscription(subscription) if subscription else None,
                "consumption_metrics": consumption_metrics,
                "recent_usage_logs": [self._serialize_usage_log(log) for log in usage_logs[:20]],
                "monthly_usage_summary": [self._serialize_usage_summary(usage) for usage in usage_summary],
                "recent_scans_count": len(recent_scans),
                "recent_scans": [self._serialize_biometric(scan) for scan in recent_scans[:10]]
            }
            
        except Exception as e:
            logger.error(f"Error getting admin dashboard for user {user_id}: {e}")
            raise

    # ==================== HELPER METHODS ====================
    
    def _serialize_biometric(self, measurement: Biometric_measurements) -> Dict[str, Any]:
        """Serialize biometric measurement to dict."""
        if not measurement:
            return None
        
        return {
            "id": str(measurement.id),
            "user_id": str(measurement.user_id),
            "heart_rate": float(measurement.heart_rate) if measurement.heart_rate else None,
            "sdnn": float(measurement.sdnn) if measurement.sdnn else None,
            "rmssd": float(measurement.rmssd) if measurement.rmssd else None,
            "ai_stress": float(measurement.ai_stress) if measurement.ai_stress else None,
            "ai_fatigue": float(measurement.ai_fatigue) if measurement.ai_fatigue else None,
            "ai_cognitive_load": float(measurement.ai_cognitive_load) if measurement.ai_cognitive_load else None,
            "ai_recovery": float(measurement.ai_recovery) if measurement.ai_recovery else None,
            "bio_age_basic": float(measurement.bio_age_basic) if measurement.bio_age_basic else None,
            "vital_index_score": float(measurement.vital_index_score) if measurement.vital_index_score else None,
            "wellness_index_score": float(measurement.wellness_index_score) if measurement.wellness_index_score else None,
            "cv_risk_heart_attack": float(measurement.cv_risk_heart_attack) if measurement.cv_risk_heart_attack else None,
            "cv_risk_stroke": float(measurement.cv_risk_stroke) if measurement.cv_risk_stroke else None,
            "bmi": float(measurement.bmi) if measurement.bmi else None,
            "created_at": measurement.created_at.isoformat() if measurement.created_at else None
        }
    
    def _serialize_user_profile(self, user: UserProfile) -> Dict[str, Any]:
        """Serialize user profile to dict."""
        if not user:
            return None
        
        return {
            "user_id": str(user.user_id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department_id": str(user.department_id) if user.department_id else None,
            "organization_id": str(user.organization_id) if user.organization_id else None
        }
    
    def _serialize_dept_insights(self, insights: Department_insights) -> Dict[str, Any]:
        """Serialize department insights to dict."""
        if not insights:
            return None
        
        return {
            "id": str(insights.id),
            "department_id": str(insights.department_id),
            "analysis_period": insights.analysis_period.isoformat() if hasattr(insights, 'analysis_period') and insights.analysis_period else None,
            "employee_count": insights.employee_count if hasattr(insights, 'employee_count') else None,
            "avg_stress": float(insights.avg_stress) if hasattr(insights, 'avg_stress') and insights.avg_stress else None,
            "avg_fatigue": float(insights.avg_fatigue) if hasattr(insights, 'avg_fatigue') and insights.avg_fatigue else None,
            "avg_cognitive_load": float(insights.avg_cognitive_load) if hasattr(insights, 'avg_cognitive_load') and insights.avg_cognitive_load else None,
            "avg_recovery": float(insights.avg_recovery) if hasattr(insights, 'avg_recovery') and insights.avg_recovery else None,
            "burnout_risk_score": float(insights.burnout_risk_score) if hasattr(insights, 'burnout_risk_score') and insights.burnout_risk_score else None,
            "wellness_index": float(insights.wellness_index) if hasattr(insights, 'wellness_index') and insights.wellness_index else None,
            "insight_summary": insights.insight_summary if hasattr(insights, 'insight_summary') else insights.summary if hasattr(insights, 'summary') else None,
            "created_at": insights.created_at.isoformat() if insights.created_at else None
        }
    
    def _serialize_org_insights(self, insights: OrganizationInsight) -> Dict[str, Any]:
        """Serialize organization insights to dict."""
        if not insights:
            return None
        
        return {
            "id": str(insights.id),
            "organization_id": str(insights.organization_id),
            "summary": insights.summary,
            "created_at": insights.created_at.isoformat() if insights.created_at else None
        }
    
    def _serialize_usage_summary(self, usage: OrganizationUsageSummary) -> Dict[str, Any]:
        """Serialize usage summary to dict."""
        if not usage:
            return None
        
        return {
            "id": str(usage.id),
            "organization_id": str(usage.organization_id),
            "month": usage.month.isoformat() if usage.month else None,
            "total_scans": usage.total_scans or 0,
            "total_prompts_used": usage.total_prompts_used or 0,
            "total_ai_tokens_used": usage.total_ai_tokens_used or 0,
            "total_user_scans": usage.total_user_scans or 0 if hasattr(usage, 'total_user_scans') else 0,
            "total_valid_scans": usage.total_valid_scans or 0 if hasattr(usage, 'total_valid_scans') else 0,
            "scan_limit_reached": usage.scan_limit_reached if hasattr(usage, 'scan_limit_reached') else False
        }
    
    def _serialize_subscription(self, subscription: OrganizationSubscription) -> Dict[str, Any]:
        """Serialize subscription to dict."""
        if not subscription:
            return None
        
        return {
            "id": str(subscription.id),
            "organization_id": str(subscription.organization_id),
            "scan_limit_per_user_per_month": subscription.scan_limit_per_user_per_month,
            "used_scans_total": subscription.used_scans_total,
            "active": subscription.active,
            "start_date": subscription.start_date.isoformat() if subscription.start_date else None,
            "end_date": subscription.end_date.isoformat() if subscription.end_date else None
        }
    
    def _serialize_usage_log(self, log: Subscription_usage_logs) -> Dict[str, Any]:
        """Serialize usage log to dict."""
        if not log:
            return None
        
        return {
            "id": log.id,
            "organization_id": str(log.organization_id),
            "user_id": str(log.user_id),
            "scan_type": log.scan_type,
            "used_at": log.used_at.isoformat() if log.used_at else None,
            "source": log.source if hasattr(log, 'source') else None,
            "scan_success": log.scan_success if hasattr(log, 'scan_success') else True
        }
    
    def _calculate_trends(self, scans: List[Biometric_measurements]) -> Dict[str, Any]:
        """Calculate trends from scan history."""
        if not scans or len(scans) < 2:
            return {}
        
        # Calculate averages for key metrics
        stress_values = [s.ai_stress for s in scans if s.ai_stress is not None]
        fatigue_values = [s.ai_fatigue for s in scans if s.ai_fatigue is not None]
        recovery_values = [s.ai_recovery for s in scans if s.ai_recovery is not None]
        
        return {
            "avg_stress": sum(stress_values) / len(stress_values) if stress_values else None,
            "avg_fatigue": sum(fatigue_values) / len(fatigue_values) if fatigue_values else None,
            "avg_recovery": sum(recovery_values) / len(recovery_values) if recovery_values else None,
            "trend_direction": "improving" if len(scans) > 1 and scans[0].wellness_index_score and scans[-1].wellness_index_score and scans[0].wellness_index_score > scans[-1].wellness_index_score else "stable"
        }
    
    def _calculate_team_metrics(self, scans: List[Biometric_measurements]) -> Dict[str, Any]:
        """Calculate aggregated team metrics."""
        if not scans:
            return {}
        
        stress_values = [s.ai_stress for s in scans if s.ai_stress is not None]
        fatigue_values = [s.ai_fatigue for s in scans if s.ai_fatigue is not None]
        cognitive_values = [s.ai_cognitive_load for s in scans if s.ai_cognitive_load is not None]
        recovery_values = [s.ai_recovery for s in scans if s.ai_recovery is not None]
        wellness_values = [s.wellness_index_score for s in scans if s.wellness_index_score is not None]
        
        return {
            "avg_stress": round(sum(stress_values) / len(stress_values), 2) if stress_values else None,
            "avg_fatigue": round(sum(fatigue_values) / len(fatigue_values), 2) if fatigue_values else None,
            "avg_cognitive_load": round(sum(cognitive_values) / len(cognitive_values), 2) if cognitive_values else None,
            "avg_recovery": round(sum(recovery_values) / len(recovery_values), 2) if recovery_values else None,
            "avg_wellness": round(sum(wellness_values) / len(wellness_values), 2) if wellness_values else None,
            "total_scans": len(scans)
        }
    
    def _calculate_consumption_metrics(self, subscription: OrganizationSubscription, current_usage: OrganizationUsageSummary) -> Dict[str, Any]:
        """Calculate consumption metrics and limits."""
        if not subscription:
            return {}
        
        metrics = {
            "scan_limit": subscription.scan_limit_per_user_per_month if hasattr(subscription, 'scan_limit_per_user_per_month') else None,
            "scans_used": subscription.used_scans_total if hasattr(subscription, 'used_scans_total') else 0,
            "subscription_active": subscription.active if hasattr(subscription, 'active') else False
        }
        
        if current_usage:
            metrics.update({
                "current_month_scans": current_usage.total_scans or 0,
                "current_month_prompts": current_usage.total_prompts_used or 0,
                "current_month_tokens": current_usage.total_ai_tokens_used or 0,
                "limit_reached": current_usage.scan_limit_reached if hasattr(current_usage, 'scan_limit_reached') else False
            })
        
        # Calculate usage percentage
        if metrics.get("scan_limit") and metrics.get("scans_used") is not None:
            metrics["usage_percentage"] = round((metrics["scans_used"] / metrics["scan_limit"]) * 100, 2)
        
        return metrics