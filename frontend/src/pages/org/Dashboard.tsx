import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  Users,
  Activity,
  Calendar,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Clock as ClockIcon,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface OrganizationSubscription {
  id: string;
  organization_id: string;
  subscription_plan_id: string;
  start_date: string;
  end_date: string;
  active: boolean;
  scan_limit_per_user_month: number;
  used_scans_total: number;
  used_dept_analyses: number;
  used_org_analyses: number;
  dept_analysis_limit: number;
  org_analysis_limit: number;
  current_month: string;
}

interface OrganizationUsageSummary {
  id: string;
  organization_id: string;
  month: string;
  total_ai_tokens_used: number;
  total_scans: number;
  total_prompts_used: number;
  total_user_scans: number;
  total_valid_scans: number;
  total_invalid_scans: number;
}

interface UserScanUsage {
  user_id: string;
  full_name: string;
  email: string;
  department_name: string;
  total_scans: number;
  last_scan_date: string;
}

export default function OrgDashboard() {
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [usageSummaries, setUsageSummaries] = useState<OrganizationUsageSummary[]>([]);
  const [currentMonthUsage, setCurrentMonthUsage] = useState<OrganizationUsageSummary | null>(null);
  const [userUsage, setUserUsage] = useState<UserScanUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('📊 [Org Admin Dashboard] Loading data...');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ [Org Admin Dashboard] Error loading profile:', profileError);
        throw new Error('Error loading user profile');
      }

      const orgId = profile.organization_id;

      // Load organization subscription
      const { data: subData, error: subError } = await supabase
        .from('organization_subscriptions')
        .select('*')
        .eq('organization_id', orgId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!subError) {
        setSubscription(subData);
      }

      // Load usage summaries (last 6 months)
      const { data: summariesData, error: summariesError } = await supabase
        .from('organization_usage_summary')
        .select('*')
        .eq('organization_id', orgId)
        .order('month', { ascending: false })
        .limit(6);

      if (!summariesError) {
        setUsageSummaries(summariesData || []);
        if (summariesData && summariesData.length > 0) {
          setCurrentMonthUsage(summariesData[0]);
        }
      }

      // Load user scan usage
      const { data: usageData, error: usageError } = await supabase
        .from('user_scan_usage')
        .select(`
          user_id,
          total_scans,
          last_scan_date,
          user_profiles!inner(full_name, email, departments(name))
        `)
        .order('total_scans', { ascending: false })
        .limit(20);

      if (!usageError) {
        const formattedUsage = usageData?.map(item => ({
          user_id: item.user_id,
          full_name: (item.user_profiles as any)?.full_name || 'Unknown',
          email: (item.user_profiles as any)?.email || '',
          department_name: (item.user_profiles as any)?.departments?.name || 'N/A',
          total_scans: item.total_scans,
          last_scan_date: item.last_scan_date
        })) || [];
        
        setUserUsage(formattedUsage);
      }

      console.log('✅ [Org Admin Dashboard] Data loaded');
      setLastUpdated(new Date());

    } catch (err: any) {
      const errorMsg = err?.message || 'Error loading dashboard data';
      console.error('❌ [Org Admin Dashboard] Error:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 [Org Admin Dashboard] Manual refresh triggered');
    setRefreshing(true);
    loadDashboardData();
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
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
          <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
          <p className="text-muted-foreground">
            Uso del sistema y gestión de suscripción
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClockIcon className="h-4 w-4" />
              <span>{lastUpdated.toLocaleTimeString('es-ES')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Suscripción Activa
              </span>
              <Badge variant={subscription.active ? 'default' : 'destructive'}>
                {subscription.active ? 'Activa' : 'Inactiva'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Vigencia: {new Date(subscription.start_date).toLocaleDateString()} - {new Date(subscription.end_date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Días restantes</span>
              <span className="text-2xl font-bold">{getDaysRemaining()}</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Escaneos utilizados</span>
                  <span className="font-medium">
                    {subscription.used_scans_total} / {subscription.scan_limit_per_user_month || '∞'}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.used_scans_total, subscription.scan_limit_per_user_month)} 
                />
              </div>

              {subscription.dept_analysis_limit && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Análisis departamentales</span>
                    <span className="font-medium">
                      {subscription.used_dept_analyses} / {subscription.dept_analysis_limit}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(subscription.used_dept_analyses, subscription.dept_analysis_limit)} 
                  />
                </div>
              )}

              {subscription.org_analysis_limit && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Análisis organizacionales</span>
                    <span className="font-medium">
                      {subscription.used_org_analyses} / {subscription.org_analysis_limit}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(subscription.used_org_analyses, subscription.org_analysis_limit)} 
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Month Usage */}
      {currentMonthUsage && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escaneos Este Mes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMonthUsage.total_scans}</div>
              <p className="text-xs text-muted-foreground">
                {currentMonthUsage.total_user_scans} por usuarios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens IA Usados</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMonthUsage.total_ai_tokens_used}</div>
              <p className="text-xs text-muted-foreground">
                {currentMonthUsage.total_prompts_used} prompts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escaneos Válidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{currentMonthUsage.total_valid_scans}</div>
              <p className="text-xs text-muted-foreground">
                {currentMonthUsage.total_scans > 0 
                  ? ((currentMonthUsage.total_valid_scans / currentMonthUsage.total_scans) * 100).toFixed(1)
                  : 0}% tasa de éxito
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escaneos Inválidos</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{currentMonthUsage.total_invalid_scans}</div>
              <p className="text-xs text-muted-foreground">
                Requieren revisión
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Uso Mensual</TabsTrigger>
          <TabsTrigger value="users">Uso por Usuario</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Mensual</CardTitle>
              <CardDescription>Últimos 6 meses de uso del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {usageSummaries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay datos de uso disponibles</p>
              ) : (
                <div className="space-y-4">
                  {usageSummaries.map((summary) => (
                    <div key={summary.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(summary.month).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {summary.total_user_scans} escaneos de usuarios
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{summary.total_scans} escaneos totales</p>
                        <p className="text-xs text-muted-foreground">
                          {summary.total_ai_tokens_used} tokens IA
                        </p>
                        <div className="flex gap-2 justify-end">
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {summary.total_valid_scans}
                          </Badge>
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            {summary.total_invalid_scans}
                          </Badge>
                        </div>
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
              <CardTitle>Uso por Usuario</CardTitle>
              <CardDescription>Top usuarios por cantidad de escaneos</CardDescription>
            </CardHeader>
            <CardContent>
              {userUsage.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay datos de uso por usuario</p>
              ) : (
                <div className="space-y-3">
                  {userUsage.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{user.department_name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {new Date(user.last_scan_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{user.total_scans}</div>
                        <p className="text-xs text-muted-foreground">escaneos</p>
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