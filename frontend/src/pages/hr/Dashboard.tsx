import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Building2,
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface OrganizationMetrics {
  total_employees: number;
  total_departments: number;
  scanned_employees: number;
  avg_stress_level: number;
  avg_energy_level: number;
  avg_focus_level: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
}

interface DepartmentMetrics {
  department_id: number;
  department_name: string;
  total_employees: number;
  scanned_employees: number;
  avg_stress_level: number;
  high_risk_count: number;
  last_updated: string;
}

interface OrganizationInsight {
  id: number;
  insight_type: string;
  insight_text: string;
  severity: string;
  created_at: string;
}

interface EmployeeAtRisk {
  user_id: string;
  full_name: string;
  department_name: string;
  risk_level: string;
  avg_stress_level: number;
  last_scan_date: string;
  scan_count: number;
}

// Centralized logging function
async function logActivity(action: string, details: any, level: 'info' | 'warning' | 'error' = 'info') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('system_logs').insert({
      user_id: user?.id,
      action,
      details: JSON.stringify(details),
      level,
      created_at: new Date().toISOString()
    });
    
    const emoji = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : '✅';
    console.log(`${emoji} [HR Dashboard] ${action}:`, details);
  } catch (error) {
    console.error('❌ [HR Dashboard] Error logging activity:', error);
  }
}

export default function HRDashboard() {
  const [orgMetrics, setOrgMetrics] = useState<OrganizationMetrics | null>(null);
  const [deptMetrics, setDeptMetrics] = useState<DepartmentMetrics[]>([]);
  const [insights, setInsights] = useState<OrganizationInsight[]>([]);
  const [atRiskEmployees, setAtRiskEmployees] = useState<EmployeeAtRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('📊 [HR Dashboard] Loading data...');
      await logActivity('dashboard_load_start', { dashboard: 'hr' }, 'info');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get user's organization
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ [HR Dashboard] Error loading profile:', profileError);
        await logActivity('profile_load_error', { error: profileError.message }, 'error');
        throw new Error('Error loading user profile');
      }

      const orgId = profile.organization_id;
      console.log('✅ [HR Dashboard] User organization:', orgId);

      // Load organization-wide metrics from organization_usage_summary
      const { data: orgSummary, error: orgError } = await supabase
        .from('organization_usage_summary')
        .select('*')
        .eq('organization_id', orgId)
        .single();

      if (orgError) {
        console.error('❌ [HR Dashboard] Error loading org metrics:', orgError);
        await logActivity('org_metrics_load_error', { error: orgError.message }, 'error');
      } else {
        // Calculate organization metrics from usage summary and other sources
        const { data: allUsers, error: usersError } = await supabase
          .from('user_profiles')
          .select('user_id, department_id')
          .eq('organization_id', orgId);

        const { data: allDepts, error: deptsError } = await supabase
          .from('departments')
          .select('id')
          .eq('organization_id', orgId);

        const { data: scannedUsers, error: scansError } = await supabase
          .from('biometric_measurements')
          .select('user_id')
          .in('user_id', allUsers?.map(u => u.user_id) || []);

        const uniqueScannedUsers = new Set(scannedUsers?.map(s => s.user_id) || []).size;

        // Get average stress from recent scans
        const { data: recentScans, error: recentError } = await supabase
          .from('biometric_measurements')
          .select('ai_stress, ai_energy, ai_focus, risk_level')
          .in('user_id', allUsers?.map(u => u.user_id) || [])
          .order('created_at', { ascending: false })
          .limit(100);

        const avgStress = recentScans?.length > 0
          ? recentScans.reduce((acc, s) => acc + (s.ai_stress || 0), 0) / recentScans.length
          : 0;
        const avgEnergy = recentScans?.length > 0
          ? recentScans.reduce((acc, s) => acc + (s.ai_energy || 0), 0) / recentScans.length
          : 0;
        const avgFocus = recentScans?.length > 0
          ? recentScans.reduce((acc, s) => acc + (s.ai_focus || 0), 0) / recentScans.length
          : 0;

        const highRisk = recentScans?.filter(s => s.risk_level === 'high').length || 0;
        const mediumRisk = recentScans?.filter(s => s.risk_level === 'medium').length || 0;
        const lowRisk = recentScans?.filter(s => s.risk_level === 'low').length || 0;

        setOrgMetrics({
          total_employees: allUsers?.length || 0,
          total_departments: allDepts?.length || 0,
          scanned_employees: uniqueScannedUsers,
          avg_stress_level: avgStress,
          avg_energy_level: avgEnergy,
          avg_focus_level: avgFocus,
          high_risk_count: highRisk,
          medium_risk_count: mediumRisk,
          low_risk_count: lowRisk
        });
        console.log('✅ [HR Dashboard] Org metrics calculated');
        await logActivity('org_metrics_loaded', { organization_id: orgId }, 'info');
      }

      // Load all department metrics
      const { data: deptData, error: deptError } = await supabase
        .from('vw_current_department_metrics')
        .select('*')
        .order('department_name');

      if (deptError) {
        console.error('❌ [HR Dashboard] Error loading department metrics:', deptError);
        await logActivity('dept_metrics_load_error', { error: deptError.message }, 'error');
      } else {
        setDeptMetrics(deptData || []);
        console.log('✅ [HR Dashboard] Department metrics loaded:', deptData?.length);
        await logActivity('dept_metrics_loaded', { count: deptData?.length }, 'info');
      }

      // Load organization insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('organization_insights')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (insightsError) {
        console.error('❌ [HR Dashboard] Error loading insights:', insightsError);
        await logActivity('insights_load_error', { error: insightsError.message }, 'error');
      } else {
        setInsights(insightsData || []);
        console.log('✅ [HR Dashboard] Insights loaded:', insightsData?.length);
        await logActivity('insights_loaded', { count: insightsData?.length }, 'info');
      }

      // Load employees at risk from view
      const { data: riskData, error: riskError } = await supabase
        .from('vw_employees_at_risk')
        .select('*')
        .order('avg_stress_level', { ascending: false })
        .limit(20);

      if (riskError) {
        console.error('❌ [HR Dashboard] Error loading at-risk employees:', riskError);
        await logActivity('at_risk_load_error', { error: riskError.message }, 'error');
      } else {
        setAtRiskEmployees(riskData || []);
        console.log('✅ [HR Dashboard] At-risk employees loaded:', riskData?.length);
        await logActivity('at_risk_loaded', { count: riskData?.length }, 'info');
      }

      await logActivity('dashboard_load_complete', { dashboard: 'hr' }, 'info');

    } catch (err: any) {
      const errorMsg = err?.message || 'Error loading dashboard data';
      console.error('❌ [HR Dashboard] Error:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      await logActivity('dashboard_load_error', { error: errorMsg }, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 [HR Dashboard] Refreshing data...');
    setRefreshing(true);
    loadDashboardData();
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground">Organization-wide health and wellness overview</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgMetrics?.total_employees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orgMetrics?.scanned_employees || 0} scanned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgMetrics?.total_departments || 0}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stress Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orgMetrics?.avg_stress_level?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {orgMetrics?.avg_stress_level > 7 ? (
                <span className="text-red-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> High
                </span>
              ) : (
                <span className="text-green-500 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" /> Normal
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {orgMetrics?.high_risk_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {orgMetrics?.medium_risk_count || 0} medium, {orgMetrics?.low_risk_count || 0} low
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="at-risk">At Risk Employees</TabsTrigger>
          <TabsTrigger value="insights">Organization Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Health metrics across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              {deptMetrics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No department data available</p>
              ) : (
                <div className="space-y-4">
                  {deptMetrics.map((dept) => (
                    <div key={dept.department_id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{dept.department_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dept.total_employees} employees • {dept.scanned_employees} scanned
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Avg Stress: {dept.avg_stress_level?.toFixed(1) || 'N/A'}
                          </p>
                          <p className="text-sm text-red-500">
                            {dept.high_risk_count || 0} at risk
                          </p>
                        </div>
                        <Badge variant={dept.high_risk_count > 0 ? 'destructive' : 'default'}>
                          {dept.high_risk_count > 0 ? 'Attention' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employees At Risk</CardTitle>
              <CardDescription>Employees requiring attention or support</CardDescription>
            </CardHeader>
            <CardContent>
              {atRiskEmployees.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No at-risk employees</p>
              ) : (
                <div className="space-y-4">
                  {atRiskEmployees.map((employee, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{employee.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.department_name} • {employee.scan_count} scans
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last scan: {new Date(employee.last_scan_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Avg Stress: {employee.avg_stress_level?.toFixed(1)}
                          </p>
                        </div>
                        <Badge variant={getRiskColor(employee.risk_level)}>
                          {employee.risk_level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Insights</CardTitle>
              <CardDescription>AI-generated insights for the entire organization</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No insights available</p>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(insight.severity)}>
                              {insight.severity}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {insight.insight_type}
                            </span>
                          </div>
                          <p className="text-sm">{insight.insight_text}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(insight.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}