import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DepartmentMetrics {
  department_id: number;
  department_name: string;
  total_employees: number;
  scanned_employees: number;
  avg_stress_level: number;
  avg_energy_level: number;
  avg_focus_level: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  last_updated: string;
}

interface DepartmentInsight {
  id: number;
  department_id: number;
  insight_type: string;
  insight_text: string;
  severity: string;
  created_at: string;
}

interface LatestScan {
  user_id: string;
  full_name: string;
  scan_date: string;
  stress_level: number;
  energy_level: number;
  focus_level: number;
  risk_level: string;
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
    console.log(`${emoji} [Leader Dashboard] ${action}:`, details);
  } catch (error) {
    console.error('❌ [Leader Dashboard] Error logging activity:', error);
  }
}

export default function LeaderDashboard() {
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [insights, setInsights] = useState<DepartmentInsight[]>([]);
  const [latestScans, setLatestScans] = useState<LatestScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userDepartmentId, setUserDepartmentId] = useState<number | null>(null);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('📊 [Leader Dashboard] Loading data...');
      await logActivity('dashboard_load_start', { dashboard: 'leader' }, 'info');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get user's department
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('department_id, departments(id, name)')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ [Leader Dashboard] Error loading profile:', profileError);
        await logActivity('profile_load_error', { error: profileError.message }, 'error');
        throw new Error('Error loading user profile');
      }

      const deptId = profile.department_id;
      setUserDepartmentId(deptId);
      console.log('✅ [Leader Dashboard] User department:', deptId);

      // Load department metrics from view
      const { data: metricsData, error: metricsError } = await supabase
        .from('vw_current_department_metrics')
        .select('*')
        .eq('department_id', deptId)
        .single();

      if (metricsError) {
        console.error('❌ [Leader Dashboard] Error loading metrics:', metricsError);
        await logActivity('metrics_load_error', { error: metricsError.message }, 'error');
      } else {
        setMetrics(metricsData);
        console.log('✅ [Leader Dashboard] Metrics loaded:', metricsData);
        await logActivity('metrics_loaded', { department_id: deptId, metrics: metricsData }, 'info');
      }

      // Load department insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('department_insights')
        .select('*')
        .eq('department_id', deptId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (insightsError) {
        console.error('❌ [Leader Dashboard] Error loading insights:', insightsError);
        await logActivity('insights_load_error', { error: insightsError.message }, 'error');
      } else {
        setInsights(insightsData || []);
        console.log('✅ [Leader Dashboard] Insights loaded:', insightsData?.length);
        await logActivity('insights_loaded', { count: insightsData?.length }, 'info');
      }

      // Load latest scans from department members
      const { data: deptUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('department_id', deptId);

      if (usersError) {
        console.error('❌ [Leader Dashboard] Error loading department users:', usersError);
        await logActivity('users_load_error', { error: usersError.message }, 'error');
      } else {
        const userIds = deptUsers?.map(u => u.user_id) || [];
        
        if (userIds.length > 0) {
          const { data: scansData, error: scansError } = await supabase
            .from('biometric_measurements')
            .select(`
              user_id,
              created_at,
              ai_stress,
              ai_energy,
              ai_focus,
              risk_level,
              user_profiles!inner(full_name)
            `)
            .in('user_id', userIds)
            .order('created_at', { ascending: false })
            .limit(10);

          if (scansError) {
            console.error('❌ [Leader Dashboard] Error loading scans:', scansError);
            await logActivity('scans_load_error', { error: scansError.message }, 'error');
          } else {
            const formattedScans = scansData?.map(scan => ({
              user_id: scan.user_id,
              full_name: (scan.user_profiles as any)?.full_name || 'Unknown',
              scan_date: scan.created_at,
              stress_level: scan.ai_stress || 0,
              energy_level: scan.ai_energy || 0,
              focus_level: scan.ai_focus || 0,
              risk_level: scan.risk_level || 'unknown'
            })) || [];
            
            setLatestScans(formattedScans);
            console.log('✅ [Leader Dashboard] Scans loaded:', formattedScans.length);
            await logActivity('scans_loaded', { count: formattedScans.length }, 'info');
          }
        }
      }

      await logActivity('dashboard_load_complete', { dashboard: 'leader' }, 'info');

    } catch (err: any) {
      const errorMsg = err?.message || 'Error loading dashboard data';
      console.error('❌ [Leader Dashboard] Error:', errorMsg);
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
    console.log('🔄 [Leader Dashboard] Refreshing data...');
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
          <h1 className="text-3xl font-bold">Team Dashboard</h1>
          <p className="text-muted-foreground">
            {metrics?.department_name || 'Your Department'} Overview
          </p>
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
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_employees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.scanned_employees || 0} scanned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stress Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avg_stress_level?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.avg_stress_level > 7 ? (
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
            <CardTitle className="text-sm font-medium">Avg Energy Level</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avg_energy_level?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Out of 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Members</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {metrics?.high_risk_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.medium_risk_count || 0} medium, {metrics?.low_risk_count || 0} low
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scans">Latest Scans</TabsTrigger>
          <TabsTrigger value="insights">Department Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Team Scans</CardTitle>
              <CardDescription>Latest biometric measurements from your team</CardDescription>
            </CardHeader>
            <CardContent>
              {latestScans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent scans available</p>
              ) : (
                <div className="space-y-4">
                  {latestScans.map((scan, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{scan.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {new Date(scan.scan_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Stress: {scan.stress_level}</p>
                          <p className="text-sm text-muted-foreground">Energy: {scan.energy_level}</p>
                        </div>
                        <Badge variant={getRiskColor(scan.risk_level)}>
                          {scan.risk_level}
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
              <CardTitle>Department Insights</CardTitle>
              <CardDescription>AI-generated insights for your department</CardDescription>
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