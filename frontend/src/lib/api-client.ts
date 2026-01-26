import axios, { AxiosInstance, AxiosError } from 'axios';
import { supabase } from './supabase';

// API Client Configuration - Now uses Supabase directly
class APIClient {
  private client: AxiosInstance;

  constructor() {
    // Fallback axios client for any remaining HTTP calls
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('sb-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('sb-token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication using Supabase
  auth = {
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem('sb-token');
      return { success: true };
    },
  };

  // Organizations - Using Supabase directly
  organizations = {
    list: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      let query = supabase.from('organizations').select('*');
      
      if (params?.query) {
        const filters = JSON.parse(params.query);
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (params?.sort) {
        const descending = params.sort.startsWith('-');
        const field = descending ? params.sort.slice(1) : params.sort;
        query = query.order(field, { ascending: !descending });
      }
      
      if (params?.skip) query = query.range(params.skip, params.skip + (params?.limit || 10) - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return { items: data, total: data?.length || 0 };
    },
    get: async (id: string) => {
      const { data, error } = await supabase.from('organizations').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('organizations').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('organizations').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('organizations').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };

  // User Profiles - Using Supabase directly
  userProfiles = {
    list: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      let query = supabase.from('user_profiles').select('*');
      
      if (params?.query) {
        const filters = JSON.parse(params.query);
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (params?.sort) {
        const descending = params.sort.startsWith('-');
        const field = descending ? params.sort.slice(1) : params.sort;
        query = query.order(field, { ascending: !descending });
      }
      
      if (params?.skip) query = query.range(params.skip, params.skip + (params?.limit || 10) - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return { items: data, total: data?.length || 0 };
    },
    listAll: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      return this.userProfiles.list(params);
    },
    get: async (id: string) => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('user_profiles').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('user_profiles').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };

  // Departments - Using Supabase directly
  departments = {
    list: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      let query = supabase.from('departments').select('*');
      
      if (params?.query) {
        const filters = JSON.parse(params.query);
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (params?.sort) {
        const descending = params.sort.startsWith('-');
        const field = descending ? params.sort.slice(1) : params.sort;
        query = query.order(field, { ascending: !descending });
      }
      
      if (params?.skip) query = query.range(params.skip, params.skip + (params?.limit || 10) - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return { items: data, total: data?.length || 0 };
    },
    listAll: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      return this.departments.list(params);
    },
    get: async (id: string) => {
      const { data, error } = await supabase.from('departments').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('departments').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('departments').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };

  // Biometric Measurements - Using Supabase directly
  measurements = {
    list: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      let query = supabase.from('biometric_measurements').select('*');
      
      if (params?.query) {
        const filters = JSON.parse(params.query);
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (params?.sort) {
        const descending = params.sort.startsWith('-');
        const field = descending ? params.sort.slice(1) : params.sort;
        query = query.order(field, { ascending: !descending });
      }
      
      if (params?.skip) query = query.range(params.skip, params.skip + (params?.limit || 10) - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return { items: data, total: data?.length || 0 };
    },
    listAll: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      return this.measurements.list(params);
    },
    get: async (id: string) => {
      const { data, error } = await supabase.from('biometric_measurements').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('biometric_measurements').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('biometric_measurements').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('biometric_measurements').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };

  // AI Analysis Results - Using Supabase directly
  aiAnalyses = {
    list: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      let query = supabase.from('ai_analysis_results').select('*');
      
      if (params?.query) {
        const filters = JSON.parse(params.query);
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (params?.sort) {
        const descending = params.sort.startsWith('-');
        const field = descending ? params.sort.slice(1) : params.sort;
        query = query.order(field, { ascending: !descending });
      }
      
      if (params?.skip) query = query.range(params.skip, params.skip + (params?.limit || 10) - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return { items: data, total: data?.length || 0 };
    },
    listAll: async (params?: { query?: string; sort?: string; skip?: number; limit?: number }) => {
      return this.aiAnalyses.list(params);
    },
    get: async (id: string) => {
      const { data, error } = await supabase.from('ai_analysis_results').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('ai_analysis_results').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('ai_analysis_results').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('ai_analysis_results').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };

  // Dashboards - Using Supabase directly with error handling
  dashboards = {
    employee: async () => {
      console.log('📊 [Dashboard] Loading employee dashboard data from Supabase...');
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) console.error('Profile error:', profileError);

        // ✅ BUG FIX 1: Changed 'measurement_date' to 'created_at'
        const { data: measurements, error: measError } = await supabase
          .from('biometric_measurements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (measError) console.error('Measurements error:', measError);

        // ✅ BUG FIX 2: Fixed AI analyses query - using two-step approach
        const measurementIds = measurements?.map(m => m.id) || [];
        const { data: analyses, error: analError } = await supabase
          .from('ai_analysis_results')
          .select('*')
          .in('measurement_id', measurementIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (analError) console.error('Analyses error:', analError);

        // Format response to match EmployeeDashboard expectations
        const latestMeasurement = measurements?.[0];
        const result = {
          user_profile: profile || null,
          latest_scan: latestMeasurement || null,
          scan_history: measurements || [],
          total_scans: measurements?.length || 0,
          trends: {
            avg_stress: measurements?.reduce((acc, m) => acc + (m.ai_stress || 0), 0) / (measurements?.length || 1),
            avg_fatigue: measurements?.reduce((acc, m) => acc + (m.ai_fatigue || 0), 0) / (measurements?.length || 1),
            avg_recovery: measurements?.reduce((acc, m) => acc + (m.ai_recovery || 0), 0) / (measurements?.length || 1),
          }
        };

        console.log('✅ [Dashboard] Employee data loaded successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ [Dashboard] Error loading employee data:', error);
        return {
          user_profile: null,
          latest_scan: null,
          scan_history: [],
          total_scans: 0,
          trends: {}
        };
      }
    },
    leader: async () => {
      console.log('📊 [Dashboard] Loading leader dashboard data from Supabase...');
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get user profile to find department
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*, departments(*)')
          .eq('user_id', user.id)
          .single();

        if (profileError) console.error('Profile error:', profileError);

        // Get department members
        const { data: members, error: membersError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('department_id', profile?.department_id);

        if (membersError) console.error('Members error:', membersError);

        // ✅ BUG FIX 3: Changed 'measurement_date' to 'created_at'
        const memberIds = (members || []).map(m => m.user_id);
        const { data: recentScans, error: scansError } = await supabase
          .from('biometric_measurements')
          .select('*')
          .in('user_id', memberIds)
          .order('created_at', { ascending: false })
          .limit(50);

        if (scansError) console.error('Scans error:', scansError);

        // Get department insights
        const { data: insights, error: insightsError } = await supabase
          .from('department_insights')
          .select('*')
          .eq('department_id', profile?.department_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (insightsError) console.error('Insights error:', insightsError);

        // Calculate team metrics
        const scans = recentScans || [];
        const teamMetrics = {
          avg_stress: scans.reduce((acc, s) => acc + (s.ai_stress || 0), 0) / (scans.length || 1),
          avg_fatigue: scans.reduce((acc, s) => acc + (s.ai_fatigue || 0), 0) / (scans.length || 1),
          avg_cognitive_load: scans.reduce((acc, s) => acc + (s.ai_cognitive_load || 0), 0) / (scans.length || 1),
          avg_recovery: scans.reduce((acc, s) => acc + (s.ai_recovery || 0), 0) / (scans.length || 1),
          avg_wellness: scans.reduce((acc, s) => acc + (s.wellness_index_score || 0), 0) / (scans.length || 1),
          total_scans: scans.length
        };

        const result = {
          department_id: profile?.department_id || '',
          team_size: members?.length || 0,
          team_members: members || [],
          recent_scans: recentScans || [],
          team_metrics: teamMetrics,
          department_insights: insights || null,
          total_scans: scans.length
        };

        console.log('✅ [Dashboard] Leader data loaded successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ [Dashboard] Error loading leader data:', error);
        return {
          department_id: '',
          team_size: 0,
          team_members: [],
          recent_scans: [],
          team_metrics: {
            avg_stress: 0,
            avg_fatigue: 0,
            avg_cognitive_load: 0,
            avg_recovery: 0,
            avg_wellness: 0,
            total_scans: 0
          },
          department_insights: null,
          total_scans: 0
        };
      }
    },
    hr: async () => {
      console.log('📊 [Dashboard] Loading HR dashboard data from Supabase...');
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (profileError) console.error('Profile error:', profileError);

        // Get all users in organization
        const { data: users, error: usersError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('organization_id', profile?.organization_id);

        if (usersError) console.error('Users error:', usersError);

        // Get all departments
        const { data: departments, error: deptsError } = await supabase
          .from('departments')
          .select('*')
          .eq('organization_id', profile?.organization_id);

        if (deptsError) console.error('Departments error:', deptsError);

        // Get department insights
        const { data: departmentInsights, error: insightsError } = await supabase
          .from('department_insights')
          .select('*')
          .order('created_at', { ascending: false });

        if (insightsError) console.error('Department insights error:', insightsError);

        // Get organization insights
        const { data: orgInsights, error: orgInsightsError } = await supabase
          .from('organization_insights')
          .select('*')
          .eq('organization_id', profile?.organization_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (orgInsightsError) console.error('Org insights error:', orgInsightsError);

        // Get usage summary
        const { data: usageSummary, error: usageError } = await supabase
          .from('organization_usage_summary')
          .select('*')
          .eq('organization_id', profile?.organization_id)
          .order('month', { ascending: false });

        if (usageError) console.error('Usage summary error:', usageError);

        const result = {
          organization_id: profile?.organization_id || '',
          total_employees: users?.length || 0,
          organization_insights: orgInsights || {},
          department_insights: (departmentInsights || []).map((insight: any) => ({
            department_name: insight.department_name || 'Unknown',
            department_id: insight.department_id || '',
            insights: insight
          })),
          departments_count: departments?.length || 0,
          usage_summary: usageSummary || []
        };

        console.log('✅ [Dashboard] HR Data loaded successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ [Dashboard] Error loading HR data:', error);
        return {
          organization_id: '',
          total_employees: 0,
          organization_insights: {},
          department_insights: [],
          departments_count: 0,
          usage_summary: []
        };
      }
    },
    admin: async () => {
      console.log('📊 [Dashboard] Loading admin dashboard data from Supabase...');
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (profileError) console.error('Profile error:', profileError);

        // Get all users in organization
        const { data: users, error: usersError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('organization_id', profile?.organization_id);

        if (usersError) console.error('Users error:', usersError);

        // Get subscription info
        const { data: subscription, error: subError } = await supabase
          .from('organization_subscriptions')
          .select('*')
          .eq('organization_id', profile?.organization_id)
          .single();

        if (subError) console.error('Subscription error:', subError);

        // ✅ BUG FIX 4: Changed 'measurement_date' to 'created_at'
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: recentScans, error: scansError } = await supabase
          .from('biometric_measurements')
          .select('*')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (scansError) console.error('Recent scans error:', scansError);

        // ✅ BUG FIX 5: Changed 'organization_usage_logs' to 'subscription_usage_logs'
        const { data: usageLogs, error: logsError } = await supabase
          .from('subscription_usage_logs')
          .select('*')
          .eq('organization_id', profile?.organization_id)
          .order('used_at', { ascending: false })
          .limit(50);

        if (logsError) console.error('Usage logs error:', logsError);

        // Get monthly usage summary
        const { data: monthlyUsage, error: monthlyError } = await supabase
          .from('organization_usage_summary')
          .select('*')
          .eq('organization_id', profile?.organization_id)
          .order('month', { ascending: false })
          .limit(12);

        if (monthlyError) console.error('Monthly usage error:', monthlyError);

        const currentMonth = monthlyUsage?.[0] || {};
        
        // ✅ BUG FIX 6: Changed 'is_active' to 'active'
        const consumptionMetrics = {
          scan_limit: subscription?.scan_limit_per_user_per_month * (users?.length || 1) || 1000,
          scans_used: subscription?.used_scans_total || 0,
          subscription_active: subscription?.active || false,
          current_month_scans: currentMonth.total_scans || 0,
          current_month_prompts: currentMonth.total_prompts_used || 0,
          current_month_tokens: currentMonth.total_ai_tokens_used || 0,
          limit_reached: false,
          usage_percentage: ((currentMonth.total_scans || 0) / (subscription?.scan_limit_per_user_per_month * (users?.length || 1) || 1000)) * 100
        };

        const result = {
          organization_id: profile?.organization_id || '',
          total_users: users?.length || 0,
          subscription: subscription || {},
          consumption_metrics: consumptionMetrics,
          recent_usage_logs: usageLogs || [],
          monthly_usage_summary: monthlyUsage || [],
          recent_scans_count: recentScans?.length || 0,
          recent_scans: recentScans || []
        };

        console.log('✅ [Dashboard] Admin data loaded successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ [Dashboard] Error loading admin data:', error);
        return {
          organization_id: '',
          total_users: 0,
          subscription: {},
          consumption_metrics: {
            scan_limit: 1000,
            scans_used: 0,
            subscription_active: false,
            current_month_scans: 0,
            current_month_prompts: 0,
            current_month_tokens: 0,
            limit_reached: false,
            usage_percentage: 0
          },
          recent_usage_logs: [],
          monthly_usage_summary: [],
          recent_scans_count: 0,
          recent_scans: []
        };
      }
    },
  };

  // Audit Logging Helper using Supabase - silently fail if no permissions
  async logAudit(action: string, entity: string, entityId?: string, metadata?: any) {
    try {
      await supabase.from('system_logs').insert({
        log_type: 'audit',
        action,
        entity,
        entity_id: entityId,
        metadata,
        severity: 'info',
        source: 'frontend',
        route: window.location.pathname,
      });
    } catch (error) {
      console.warn('Could not log audit (may not have permissions):', error);
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;