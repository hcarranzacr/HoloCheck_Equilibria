import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard,
  Users,
  Activity,
  TrendingUp,
  Calendar,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UsageSummary {
  month: string;
  total_scans: number;
  total_ai_analyses: number;
  total_credits_used: number;
  unique_users: number;
}

interface LatestScanByUser {
  user_id: string;
  full_name: string;
  last_scan_date: string;
  scan_count: number;
  total_credits_used: number;
}

interface UserScanUsage {
  user_id: string;
  full_name: string;
  department_name: string;
  total_scans: number;
  last_scan_date: string;
}

interface SubscriptionUsageLog {
  id: number;
  organization_id: number;
  action_type: string;
  credits_used: number;
  user_id: string;
  created_at: string;
}

interface OrganizationUsageSummary {
  organization_id: number;
  organization_name: string;
  total_scans: number;
  total_ai_analyses: number;
  total_credits_used: number;
  active_users: number;
}

interface OrganizationSubscription {
  id: number;
  organization_id: number;
  plan_name: string;
  status: string;
  credits_remaining: number;
  credits_total: number;
  start_date: string;
  end_date: string;
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
    console.log(`${emoji} [Org Admin Dashboard] ${action}:`, details);
  } catch (error) {
    console.error('❌ [Org Admin Dashboard] Error logging activity:', error);
  }
}

export default function OrgDashboard() {
  const [usageSummary, setUsageSummary] = useState<UsageSummary[]>([]);
  const [latestScans, setLatestScans] = useState<LatestScanByUser[]>([]);
  const [userUsage, setUserUsage] = useState<UserScanUsage[]>([]);
  const [usageLogs, setUsageLogs] = useState<SubscriptionUsageLog[]>([]);
  const [orgSummary, setOrgSummary] = useState<OrganizationUsageSummary | null>(null);
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('📊 [Org Admin Dashboard] Loading data...');
      await logActivity('dashboard_load_start', { dashboard: 'org_admin' }, 'info');

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
        console.error('❌ [Org Admin Dashboard] Error loading profile:', profileError);
        await logActivity('profile_load_error', { error: profileError.message }, 'error');
        throw new Error('Error loading user profile');
      }

      const orgId = profile.organization_id;
      console.log('✅ [Org Admin Dashboard] User organization:', orgId);

      // Load monthly usage summary from view
      const { data: summaryData, error: summaryError } = await supabase
        .from('vw_usage_monthly_summary')
        .select('*')
        .eq('organization_id', orgId)
        .order('month', { ascending: false })
        .limit(6);

      if (summaryError) {
        console.error('❌ [Org Admin Dashboard] Error loading usage summary:', summaryError);
        await logActivity('usage_summary_load_error', { error: summaryError.message }, 'error');
      } else {
        setUsageSummary(summaryData || []);
        console.log('✅ [Org Admin Dashboard] Usage summary loaded:', summaryData?.length);
        await logActivity('usage_summary_loaded', { count: summaryData?.length }, 'info');
      }

      // Load latest scans by user from view
      const { data: scansData, error: scansError } = await supabase
        .from('vw_latest_scans_by_user')
        .select('*')
        .order('last_scan_date', { ascending: false })
        .limit(10);

      if (scansError) {
        console.error('❌ [Org Admin Dashboard] Error loading latest scans:', scansError);
        await logActivity('latest_scans_load_error', { error: scansError.message }, 'error');
      } else {
        setLatestScans(scansData || []);
        console.log('✅ [Org Admin Dashboard] Latest scans loaded:', scansData?.length);
        await logActivity('latest_scans_loaded', { count: scansData?.length }, 'info');
      }

      // Load user scan usage
      const { data: userUsageData, error: userUsageError } = await supabase
        .from('user_scan_usage')
        .select('*')
        .order('total_scans', { ascending: false })
        .limit(10);

      if (userUsageError) {
        console.error('❌ [Org Admin Dashboard] Error loading user usage:', userUsageError);
        await logActivity('user_usage_load_error', { error: userUsageError.message }, 'error');
      } else {
        setUserUsage(userUsageData || []);
        console.log('✅ [Org Admin Dashboard] User usage loaded:', userUsageData?.length);
        await logActivity('user_usage_loaded', { count: userUsageData?.length }, 'info');
      }

      // Load subscription usage logs
      const { data: logsData, error: logsError } = await supabase
        .from('subscription_usage_logs')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsError) {
        console.error('❌ [Org Admin Dashboard] Error loading usage logs:', logsError);
        await logActivity('usage_logs_load_error', { error: logsError.message }, 'error');
      } else {
        setUsageLogs(logsData || []);
        console.log('✅ [Org Admin Dashboard] Usage logs loaded:', logsData?.length);
        await logActivity('usage_logs_loaded', { count: logsData?.length }, 'info');
      }

      // Load organization usage summary
      const { data: orgData, error: orgError } = await supabase
        .from('organization_usage_summary')
        .select('*')
        .eq('organization_id', orgId)
        .single();

      if (orgError) {
        console.error('❌ [Org Admin Dashboard] Error loading org summary:', orgError);
        await logActivity('org_summary_load_error', { error: orgError.message }, 'error');
      } else {
        setOrgSummary(orgData);
        console.log('✅ [Org Admin Dashboard] Org summary loaded:', orgData);
        await logActivity('org_summary_loaded', { organization_id: orgId }, 'info');
      }

      // Load organization subscription
      const { data: subData, error: subError } = await supabase
        .from('organization_subscriptions')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .single();

      if (subError) {
        console.error('❌ [Org Admin Dashboard] Error loading subscription:', subError);
        await logActivity('subscription_load_error', { error: subError.message }, 'error');
      } else {
        setSubscription(subData);
        console.log('✅ [Org Admin Dashboard] Subscription loaded:', subData);
        await logActivity('subscription_loaded', { plan: subData?.plan_name }, 'info');
      }

      await logActivity('dashboard_load_complete', { dashboard: 'org_admin' }, 'info');

    } catch (err: any) {
      const errorMsg = err?.message || 'Error loading dashboard data';
      console.error('❌ [Org Admin Dashboard] Error:', errorMsg);
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
    console.log('🔄 [Org Admin Dashboard] Refreshing data...');
    setRefreshing(true);
    loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'suspended': return 'warning';
      default: return 'secondary';
    }
  };

  const getUsagePercentage = () => {
    if (!subscription) return 0;
    return ((subscription.credits_total - subscription.credits_remaining) / subscription.credits_total) * 100;
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
          <h1 className="text-3xl font-bold">Organization Dashboard</h1>
          <p className="text-muted-foreground">Usage and subscription management</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Subscription</span>
              <Badge variant={getStatusColor(subscription.status)}>
                {subscription.status}
              </Badge>
            </CardTitle>
            <CardDescription>{subscription.plan_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Credits Remaining</span>
                <span className="text-2xl font-bold">
                  {subscription.credits_remaining.toLocaleString()} / {subscription.credits_total.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${getUsagePercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Valid from {new Date(subscription.start_date).toLocaleDateString()}</span>
                <span>Until {new Date(subscription.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgSummary?.total_scans || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgSummary?.total_ai_analyses || 0}</div>
            <p className="text-xs text-muted-foreground">Generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgSummary?.total_credits_used || 0}</div>
            <p className="text-xs text-muted-foreground">Total consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgSummary?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">Using the system</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Usage</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="logs">Usage Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Usage Summary</CardTitle>
              <CardDescription>Last 6 months of usage data</CardDescription>
            </CardHeader>
            <CardContent>
              {usageSummary.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No usage data available</p>
              ) : (
                <div className="space-y-4">
                  {usageSummary.map((month, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">
                          <Calendar className="inline h-4 w-4 mr-2" />
                          {month.month}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {month.unique_users} active users
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{month.total_scans} scans</p>
                        <p className="text-sm text-muted-foreground">
                          {month.total_ai_analyses} AI analyses
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {month.total_credits_used} credits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Scan Activity</CardTitle>
              <CardDescription>Top users by scan count</CardDescription>
            </CardHeader>
            <CardContent>
              {userUsage.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No user activity data</p>
              ) : (
                <div className="space-y-4">
                  {userUsage.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.department_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last scan: {new Date(user.last_scan_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{user.total_scans}</p>
                        <p className="text-xs text-muted-foreground">scans</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Usage Logs</CardTitle>
              <CardDescription>Recent credit usage activity</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No usage logs available</p>
              ) : (
                <div className="space-y-3">
                  {usageLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{log.action_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {log.credits_used} credits
                      </Badge>
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