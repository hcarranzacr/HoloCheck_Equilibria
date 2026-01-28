import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  XCircle,
  Building2,
  MessageSquare,
  TrendingUp,
  FileText,
  ArrowRight,
  Sparkles
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

interface OrgStats {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  totalMeasurements: number;
  totalPrompts: number;
}

export default function OrgDashboard() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [usageSummaries, setUsageSummaries] = useState<OrganizationUsageSummary[]>([]);
  const [currentMonthUsage, setCurrentMonthUsage] = useState<OrganizationUsageSummary | null>(null);
  const [userUsage, setUserUsage] = useState<UserScanUsage[]>([]);
  const [orgStats, setOrgStats] = useState<OrgStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
    totalMeasurements: 0,
    totalPrompts: 0
  });
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
      console.log('✅ [Org Admin Dashboard] Organization ID:', orgId);

      // Load organization subscription
      const { data: subData, error: subError } = await supabase
        .from('organization_subscriptions')
        .select('*')
        .eq('organization_id', orgId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!subError && subData) {
        setSubscription(subData);
        console.log('✅ [Org Admin Dashboard] Subscription loaded');
      } else {
        console.log('⚠️ [Org Admin Dashboard] No active subscription found');
      }

      // Load usage summaries (last 6 months)
      const { data: summariesData, error: summariesError } = await supabase
        .from('organization_usage_summary')
        .select('*')
        .eq('organization_id', orgId)
        .order('month', { ascending: false })
        .limit(6);

      if (!summariesError && summariesData) {
        setUsageSummaries(summariesData);
        if (summariesData.length > 0) {
          setCurrentMonthUsage(summariesData[0]);
        }
        console.log('✅ [Org Admin Dashboard] Usage summaries loaded:', summariesData.length);
      }

      // Load user scan usage
      const { data: usageData, error: usageError } = await supabase
        .from('user_scan_usage')
        .select(`
          user_id,
          total_scans,
          last_scan_date,
          user_profiles!inner(full_name, email, organization_id, departments(name))
        `)
        .order('total_scans', { ascending: false })
        .limit(20);

      if (!usageError && usageData) {
        // Filter by organization
        const filteredUsage = usageData.filter((item: any) => 
          item.user_profiles?.organization_id === orgId
        );

        const formattedUsage = filteredUsage.map((item: any) => ({
          user_id: item.user_id,
          full_name: item.user_profiles?.full_name || 'Unknown',
          email: item.user_profiles?.email || '',
          department_name: item.user_profiles?.departments?.name || 'N/A',
          total_scans: item.total_scans,
          last_scan_date: item.last_scan_date
        }));
        
        setUserUsage(formattedUsage);
        console.log('✅ [Org Admin Dashboard] User usage loaded:', formattedUsage.length);
      }

      // Load organization statistics
      // Count total users
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      // Count active users
      const { count: activeUsersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('is_active', true);

      // Count departments
      const { count: deptsCount } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('is_active', true);

      // Count measurements
      const { count: measurementsCount } = await supabase
        .from('biometric_measurements')
        .select('user_id', { count: 'exact', head: true });

      // Count prompts
      const { count: promptsCount } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('is_active', true);

      setOrgStats({
        totalUsers: usersCount || 0,
        activeUsers: activeUsersCount || 0,
        totalDepartments: deptsCount || 0,
        totalMeasurements: measurementsCount || 0,
        totalPrompts: promptsCount || 0
      });

      console.log('✅ [Org Admin Dashboard] Organization stats loaded');
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
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard de Administración</h1>
              <p className="text-blue-100">
                Gestión completa de tu organización
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleRefresh} disabled={refreshing} variant="secondary" size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <ClockIcon className="h-4 w-4" />
                  <span>{lastUpdated.toLocaleTimeString('es-ES')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{orgStats.totalUsers}</div>
              <div className="text-sm text-blue-100">Usuarios Totales</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{orgStats.activeUsers}</div>
              <div className="text-sm text-blue-100">Usuarios Activos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{orgStats.totalDepartments}</div>
              <div className="text-sm text-blue-100">Departamentos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{orgStats.totalMeasurements}</div>
              <div className="text-sm text-blue-100">Mediciones</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{orgStats.totalPrompts}</div>
              <div className="text-sm text-blue-100">Prompts IA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acceso Rápido</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/org/users-management')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-blue-600" />
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra {orgStats.totalUsers} usuarios - Crear, editar y eliminar
              </CardDescription>
              <div className="mt-3">
                <Badge variant="secondary">{orgStats.activeUsers} activos</Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/org/departments-management')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Building2 className="h-8 w-8 text-green-600" />
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Gestión de Departamentos</CardTitle>
              <CardDescription>
                Administra {orgStats.totalDepartments} departamentos - CRUD completo
              </CardDescription>
              <div className="mt-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Crear nuevo
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-teal-500 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/org/prompts-management')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <MessageSquare className="h-8 w-8 text-teal-600" />
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Gestión de Prompts IA</CardTitle>
              <CardDescription>
                {orgStats.totalPrompts} prompts - Crear, editar y eliminar
              </CardDescription>
              <div className="mt-3">
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                  Gestionar
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/org/insights')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Insights</CardTitle>
              <CardDescription>
                Análisis multi-organización y comparativas
              </CardDescription>
              <div className="mt-3">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Ver análisis
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/org/measurements')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-orange-600" />
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Mediciones</CardTitle>
              <CardDescription>
                {orgStats.totalMeasurements} mediciones biométricas registradas
              </CardDescription>
              <div className="mt-3">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Ver historial
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/org/department-insights')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Insights Departamentales</CardTitle>
              <CardDescription>
                Análisis detallado por departamento
              </CardDescription>
              <div className="mt-3">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  Ver detalles
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Suscripción Activa
              </span>
              <Badge variant={subscription.active ? 'default' : 'destructive'} className="bg-green-500">
                {subscription.active ? 'Activa' : 'Inactiva'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Vigencia: {new Date(subscription.start_date).toLocaleDateString('es-ES')} - {new Date(subscription.end_date).toLocaleDateString('es-ES')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Días restantes</span>
              <span className="text-3xl font-bold text-blue-600">{getDaysRemaining()}</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Escaneos utilizados</span>
                  <span className="font-bold text-blue-600">
                    {subscription.used_scans_total} / {subscription.scan_limit_per_user_month || '∞'}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.used_scans_total, subscription.scan_limit_per_user_month)}
                  className="h-3"
                />
              </div>

              {subscription.dept_analysis_limit && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Análisis departamentales</span>
                    <span className="font-bold text-green-600">
                      {subscription.used_dept_analyses} / {subscription.dept_analysis_limit}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(subscription.used_dept_analyses, subscription.dept_analysis_limit)}
                    className="h-3"
                  />
                </div>
              )}

              {subscription.org_analysis_limit && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Análisis organizacionales</span>
                    <span className="font-bold text-purple-600">
                      {subscription.used_org_analyses} / {subscription.org_analysis_limit}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(subscription.used_org_analyses, subscription.org_analysis_limit)}
                    className="h-3"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Month Usage */}
      {currentMonthUsage && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Uso del Mes Actual</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escaneos Este Mes</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{currentMonthUsage.total_scans}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentMonthUsage.total_user_scans} por usuarios
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens IA Usados</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{currentMonthUsage.total_ai_tokens_used.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentMonthUsage.total_prompts_used} prompts
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escaneos Válidos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{currentMonthUsage.total_valid_scans}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentMonthUsage.total_scans > 0 
                    ? ((currentMonthUsage.total_valid_scans / currentMonthUsage.total_scans) * 100).toFixed(1)
                    : 0}% tasa de éxito
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escaneos Inválidos</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{currentMonthUsage.total_invalid_scans}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requieren revisión
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">
            <Calendar className="h-4 w-4 mr-2" />
            Uso Mensual
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Uso por Usuario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Mensual</CardTitle>
              <CardDescription>Últimos 6 meses de uso del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {usageSummaries.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay datos de uso disponibles</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {usageSummaries.map((summary) => (
                    <div key={summary.id} className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-muted/50 p-3 rounded-lg transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          {new Date(summary.month).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {summary.total_user_scans} escaneos de usuarios
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{summary.total_scans} escaneos totales</p>
                        <p className="text-xs text-muted-foreground">
                          {summary.total_ai_tokens_used.toLocaleString()} tokens IA
                        </p>
                        <div className="flex gap-2 justify-end">
                          <Badge variant="outline" className="text-xs bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            {summary.total_valid_scans}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-red-50">
                            <XCircle className="h-3 w-3 mr-1 text-red-600" />
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
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay datos de uso por usuario</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userUsage.map((user, index) => (
                    <div key={user.user_id} className="flex items-center justify-between border-b pb-3 last:border-0 hover:bg-muted/50 p-3 rounded-lg transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>{user.department_name}</span>
                            <span>•</span>
                            <ClockIcon className="h-3 w-3" />
                            <span>{new Date(user.last_scan_date).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{user.total_scans}</div>
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