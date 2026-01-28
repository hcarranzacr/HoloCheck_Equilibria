"""
Dashboard Service - HoloCheck Equilibria (Supabase REST API)
Provides aggregated data for role-based dashboards using Supabase REST API.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from core.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)


class DashboardServiceSupabase:
    """Service layer for dashboard data aggregation using Supabase REST API."""

    def __init__(self):
        self.supabase = get_supabase_client()

    # ==================== EMPLOYEE DASHBOARD ====================
    
    async def get_employee_dashboard(self, user_id: str) -> Dict[str, Any]:
        """
        Get employee dashboard data with latest scan and historical trends.
        """
        try:
            # Get latest scan
            latest_scan_response = self.supabase.table('biometric_measurements').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
            latest_scan = latest_scan_response.data[0] if latest_scan_response.data else None
            
            # Get last 30 days of scans for trends
            thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
            history_response = self.supabase.table('biometric_measurements').select('*').eq('user_id', user_id).gte('created_at', thirty_days_ago).order('created_at', desc=True).execute()
            scan_history = history_response.data or []
            
            # Get user profile
            user_response = self.supabase.table('user_profiles').select('*').eq('user_id', user_id).single().execute()
            user_profile = user_response.data if user_response.data else None
            
            return {
                "latest_scan": latest_scan,
                "scan_history": scan_history,
                "total_scans": len(scan_history),
                "trends": self._calculate_trends(scan_history),
                "user_profile": user_profile
            }
            
        except Exception as e:
            logger.error(f"Error getting employee dashboard for user {user_id}: {e}")
            raise

    # ==================== LEADER DASHBOARD ====================
    
    async def get_leader_dashboard(self, user_id: str) -> Dict[str, Any]:
        """
        Get leader dashboard with team metrics and department insights.
        CRITICAL: Only show users from the same organization AND same department.
        """
        try:
            logger.info(f"🔍 Leader Dashboard - Loading data for user {user_id}")
            
            # Get leader's profile with organization_id and department_id
            leader_response = self.supabase.table('user_profiles').select('*').eq('user_id', user_id).single().execute()
            leader = leader_response.data if leader_response.data else None
            
            if not leader:
                logger.error(f"❌ Leader profile not found for user {user_id}")
                return {"error": "Leader profile not found"}
            
            logger.info(f"✅ Leader profile: email={leader.get('email')}, dept={leader.get('department_id')}, org={leader.get('organization_id')}")
            
            if not leader.get('department_id'):
                logger.error(f"❌ Leader {user_id} not assigned to a department")
                return {"error": "Leader not assigned to a department"}
            
            if not leader.get('organization_id'):
                logger.error(f"❌ Leader {user_id} not assigned to an organization")
                return {"error": "Leader not assigned to an organization"}
            
            department_id = leader['department_id']
            organization_id = leader['organization_id']
            
            logger.info(f"🔒 Filtering team by: department_id={department_id} AND organization_id={organization_id}")
            
            # CRITICAL FIX: Filter team members by BOTH department_id AND organization_id
            team_response = self.supabase.table('user_profiles').select('*').eq('department_id', department_id).eq('organization_id', organization_id).execute()
            team_members = team_response.data or []
            
            logger.info(f"✅ Found {len(team_members)} team members in same department AND organization")
            
            # Log team member emails for verification
            team_emails = [m.get('email', 'no-email') for m in team_members]
            logger.info(f"📧 Team member emails: {', '.join(team_emails)}")
            
            team_user_ids = [member['user_id'] for member in team_members]
            
            # Get recent team scans (last 30 days) - only for users in this department AND organization
            thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
            if team_user_ids:
                scans_response = self.supabase.table('biometric_measurements').select('*').in_('user_id', team_user_ids).gte('created_at', thirty_days_ago).order('created_at', desc=True).execute()
                team_scans = scans_response.data or []
                logger.info(f"✅ Found {len(team_scans)} scans for team members")
            else:
                team_scans = []
                logger.warning(f"⚠️ No team members found, no scans to retrieve")
            
            # Get department insights - FIXED: use updated_at instead of created_at
            insights_response = self.supabase.table('department_insights').select('*').eq('department_id', department_id).order('updated_at', desc=True).limit(1).execute()
            dept_insights = insights_response.data[0] if insights_response.data else None
            
            # Calculate team averages
            team_metrics = self._calculate_team_metrics(team_scans)
            
            result = {
                "department_id": str(department_id),
                "organization_id": str(organization_id),
                "team_size": len(team_members),
                "team_members": team_members,
                "recent_scans": team_scans[:20],
                "team_metrics": team_metrics,
                "department_insights": dept_insights,
                "total_scans": len(team_scans)
            }
            
            logger.info(f"✅ Leader Dashboard - Returning data with {len(team_members)} members, {len(team_scans)} scans")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error getting leader dashboard for user {user_id}: {e}")
            raise Exception(f"Error loading dashboard: {e}")

    # ==================== HR DASHBOARD ====================
    
    async def get_hr_dashboard(self, user_id: str) -> Dict[str, Any]:
        """
        Get HR dashboard with organization-wide metrics and insights.
        CRITICAL: Only show data from the user's organization.
        """
        try:
            logger.info(f"🔍 HR Dashboard - Loading data for user {user_id}")
            
            # Get HR user's profile and organization
            hr_response = self.supabase.table('user_profiles').select('*').eq('user_id', user_id).single().execute()
            hr_user = hr_response.data if hr_response.data else None
            
            if not hr_user or not hr_user.get('organization_id'):
                logger.error(f"❌ HR user {user_id} not assigned to an organization")
                return {"error": "HR user not assigned to an organization"}
            
            organization_id = hr_user['organization_id']
            logger.info(f"🔒 Filtering HR data by organization_id={organization_id}")
            
            # Get organization insights - FIXED: use updated_at instead of created_at
            org_insights_response = self.supabase.table('organization_insights').select('*').eq('organization_id', organization_id).order('updated_at', desc=True).limit(1).execute()
            org_insights = org_insights_response.data[0] if org_insights_response.data else None
            
            # CRITICAL FIX: Get ONLY departments from this organization
            depts_response = self.supabase.table('departments').select('*').eq('organization_id', organization_id).execute()
            departments = depts_response.data or []
            
            logger.info(f"✅ HR Dashboard - Organization {organization_id} has {len(departments)} departments")
            
            # Get department insights for all departments in THIS organization only
            dept_insights_list = []
            for dept in departments:
                insights_response = self.supabase.table('department_insights').select('*').eq('department_id', dept['id']).order('updated_at', desc=True).limit(1).execute()
                dept_insight = insights_response.data[0] if insights_response.data else None
                
                if dept_insight:
                    dept_insights_list.append({
                        "department_name": dept['name'],
                        "department_id": str(dept['id']),
                        "insights": dept_insight
                    })
            
            # Get organization usage summary
            usage_response = self.supabase.table('organization_usage_summary').select('*').eq('organization_id', organization_id).order('month', desc=True).limit(6).execute()
            usage_summary = usage_response.data or []
            
            # CRITICAL FIX: Get total employee count ONLY from this organization
            employees_response = self.supabase.table('user_profiles').select('user_id', count='exact').eq('organization_id', organization_id).execute()
            total_employees = employees_response.count or 0
            
            logger.info(f"✅ HR Dashboard - Returning {len(departments)} departments, {total_employees} employees")
            
            return {
                "organization_id": str(organization_id),
                "total_employees": total_employees,
                "organization_insights": org_insights,
                "department_insights": dept_insights_list,
                "departments_count": len(departments),
                "usage_summary": usage_summary
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting HR dashboard for user {user_id}: {e}")
            raise Exception(f"Error loading dashboard: {e}")

    # ==================== ADMIN DASHBOARD ====================
    
    async def get_admin_dashboard(self, user_id: str) -> Dict[str, Any]:
        """
        Get admin dashboard with operational metrics and consumption control.
        CRITICAL: Only show data from the user's organization.
        """
        try:
            logger.info(f"🔍 Admin Dashboard - Loading data for user {user_id}")
            
            # Get admin user's profile and organization
            admin_response = self.supabase.table('user_profiles').select('*').eq('user_id', user_id).single().execute()
            admin_user = admin_response.data if admin_response.data else None
            
            if not admin_user or not admin_user.get('organization_id'):
                logger.error(f"❌ Admin user {user_id} not assigned to an organization")
                return {"error": "Admin user not assigned to an organization"}
            
            organization_id = admin_user['organization_id']
            logger.info(f"🔒 Filtering Admin data by organization_id={organization_id}")
            
            # Get organization subscription details
            subscription_response = self.supabase.table('organization_subscriptions').select('*').eq('organization_id', organization_id).execute()
            subscription = subscription_response.data[0] if subscription_response.data else None
            
            # Get recent usage logs (last 30 days)
            thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
            usage_logs_response = self.supabase.table('subscription_usage_logs').select('*').eq('organization_id', organization_id).gte('used_at', thirty_days_ago).order('used_at', desc=True).limit(100).execute()
            usage_logs = usage_logs_response.data or []
            
            # Get monthly usage summary
            usage_summary_response = self.supabase.table('organization_usage_summary').select('*').eq('organization_id', organization_id).order('month', desc=True).limit(12).execute()
            usage_summary = usage_summary_response.data or []
            
            # CRITICAL FIX: Get all organization users ONLY from this organization
            users_response = self.supabase.table('user_profiles').select('*').eq('organization_id', organization_id).execute()
            org_users = users_response.data or []
            
            logger.info(f"✅ Admin Dashboard - Found {len(org_users)} users in organization {organization_id}")
            
            # Get recent scans (last 7 days) - only from users in this organization
            seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
            user_ids = [user['user_id'] for user in org_users]
            
            if user_ids:
                recent_scans_response = self.supabase.table('biometric_measurements').select('*').in_('user_id', user_ids).gte('created_at', seven_days_ago).order('created_at', desc=True).execute()
                recent_scans = recent_scans_response.data or []
            else:
                recent_scans = []
            
            # Calculate consumption metrics
            consumption_metrics = self._calculate_consumption_metrics(
                subscription, usage_summary[0] if usage_summary else None
            )
            
            logger.info(f"✅ Admin Dashboard - Returning data for {len(org_users)} users, {len(recent_scans)} recent scans")
            
            return {
                "organization_id": str(organization_id),
                "total_users": len(org_users),
                "subscription": subscription,
                "consumption_metrics": consumption_metrics,
                "recent_usage_logs": usage_logs[:20],
                "monthly_usage_summary": usage_summary,
                "recent_scans_count": len(recent_scans),
                "recent_scans": recent_scans[:10]
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting admin dashboard for user {user_id}: {e}")
            raise Exception(f"Error loading dashboard: {e}")

    # ==================== HELPER METHODS ====================
    
    def _calculate_trends(self, scans: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate trends from scan history."""
        if not scans or len(scans) < 2:
            return {}
        
        # Calculate averages for key metrics
        stress_values = [s['ai_stress'] for s in scans if s.get('ai_stress') is not None]
        fatigue_values = [s['ai_fatigue'] for s in scans if s.get('ai_fatigue') is not None]
        recovery_values = [s['ai_recovery'] for s in scans if s.get('ai_recovery') is not None]
        
        return {
            "avg_stress": sum(stress_values) / len(stress_values) if stress_values else None,
            "avg_fatigue": sum(fatigue_values) / len(fatigue_values) if fatigue_values else None,
            "avg_recovery": sum(recovery_values) / len(recovery_values) if recovery_values else None,
            "trend_direction": "improving" if len(scans) > 1 and scans[0].get('wellness_index_score') and scans[-1].get('wellness_index_score') and scans[0]['wellness_index_score'] > scans[-1]['wellness_index_score'] else "stable"
        }
    
    def _calculate_team_metrics(self, scans: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate aggregated team metrics."""
        if not scans:
            return {}
        
        stress_values = [s['ai_stress'] for s in scans if s.get('ai_stress') is not None]
        fatigue_values = [s['ai_fatigue'] for s in scans if s.get('ai_fatigue') is not None]
        cognitive_values = [s['ai_cognitive_load'] for s in scans if s.get('ai_cognitive_load') is not None]
        recovery_values = [s['ai_recovery'] for s in scans if s.get('ai_recovery') is not None]
        wellness_values = [s['wellness_index_score'] for s in scans if s.get('wellness_index_score') is not None]
        
        return {
            "avg_stress": round(sum(stress_values) / len(stress_values), 2) if stress_values else None,
            "avg_fatigue": round(sum(fatigue_values) / len(fatigue_values), 2) if fatigue_values else None,
            "avg_cognitive_load": round(sum(cognitive_values) / len(cognitive_values), 2) if cognitive_values else None,
            "avg_recovery": round(sum(recovery_values) / len(recovery_values), 2) if recovery_values else None,
            "avg_wellness": round(sum(wellness_values) / len(wellness_values), 2) if wellness_values else None,
            "total_scans": len(scans)
        }
    
    def _calculate_consumption_metrics(self, subscription: Optional[Dict[str, Any]], current_usage: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate consumption metrics and limits."""
        if not subscription:
            return {}
        
        metrics = {
            "scan_limit": subscription.get('scan_limit_per_user_per_month'),
            "scans_used": subscription.get('used_scans_total', 0),
            "subscription_active": subscription.get('active', False)
        }
        
        if current_usage:
            metrics.update({
                "current_month_scans": current_usage.get('total_scans', 0),
                "current_month_prompts": current_usage.get('total_prompts_used', 0),
                "current_month_tokens": current_usage.get('total_ai_tokens_used', 0),
                "limit_reached": current_usage.get('scan_limit_reached', False)
            })
        
        # Calculate usage percentage
        if metrics.get("scan_limit") and metrics.get("scans_used") is not None:
            metrics["usage_percentage"] = round((metrics["scans_used"] / metrics["scan_limit"]) * 100, 2)
        
        return metrics