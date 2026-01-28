import { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface Subscription {
  id: string;
  organization_id: string;
  plan_name: string;
  scan_limit_per_user_per_month: number;
  active: boolean;
  used_scans_total: number;
}

interface ConsumptionMetrics {
  scan_limit?: number;
  scans_used?: number;
  subscription_active?: boolean;
  current_month_scans?: number;
  usage_percentage?: number;
}

interface UsageSummary {
  month: string;
  total_scans: number;
  total_prompts_used: number;
  total_ai_tokens_used: number;
}

interface DashboardData {
  organization_id: string;
  total_users: number;
  subscription: Subscription | null;
  consumption_metrics: ConsumptionMetrics;
  recent_usage_logs: any[];
  monthly_usage_summary: UsageSummary[];
  recent_scans_count: number;
  recent_scans: any[];
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const timestamp = new Date().toISOString();
    console.log(`🎯 [ADMIN DASHBOARD] START - Loading data at ${timestamp}`);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔑 [ADMIN DASHBOARD] Checking authentication...`);
      const session = await apiClient.auth.getSession();
      console.log(`🔐 [ADMIN DASHBOARD] Session exists: ${!!session}, Token length: ${session?.access_token?.length || 0}`);
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      console.log(`📡 [ADMIN DASHBOARD] Calling API...`);
      const response = await apiClient.dashboards.admin();

      console.log(`✅ [ADMIN DASHBOARD] Response received`);
      console.log(`📊 [ADMIN DASHBOARD] Data keys:`, Object.keys(response || {}));
      console.log(`📋 [ADMIN DASHBOARD] Full data:`, response);
      
      const dashboardData: DashboardData = {
        ...response,
        monthly_usage_summary: response.monthly_usage_summary || [],
        recent_usage_logs: response.recent_usage_logs || [],
        recent_scans: response.recent_scans || [],
        consumption_metrics: response.consumption_metrics || {},
      };
      
      setData(dashboardData);
      console.log(`✅ [ADMIN DASHBOARD] SUCCESS`);
      
    } catch (err: any) {
      console.error(`❌ [ADMIN DASHBOARD] ERROR`);
      console.error(`📛 [ADMIN DASHBOARD] Error:`, err);
      
      const errorMsg = err?.message || err?.data?.detail || err?.response?.data?.detail || 'Error al cargar el dashboard';
      console.error(`📛 [ADMIN DASHBOARD] Error message: ${errorMsg}`);
      
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log(`🏁 [ADMIN DASHBOARD] Finished`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se encontraron datos del dashboard</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getUsagePercentageColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-500';
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const monthlyUsage = (data.monthly_usage_summary || []).slice(0, 6);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_users}</div>
            <p className="text-xs text-muted-foreground">
              En la organización
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escaneos Recientes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recent_scans_count}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Límite de Escaneos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.consumption_metrics.scan_limit || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Por usuario/mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso del Plan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUsagePercentageColor(data.consumption_metrics.usage_percentage)}`}>
              {data.consumption_metrics.usage_percentage 
                ? `${data.consumption_metrics.usage_percentage.toFixed(1)}%` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.consumption_metrics.scans_used || 0} / {data.consumption_metrics.scan_limit || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {data.subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Información de Suscripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{data.subscription.plan_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="text-lg font-semibold">
                  {data.subscription.active ? (
                    <span className="text-green-600">Activo</span>
                  ) : (
                    <span className="text-red-600">Inactivo</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escaneos Usados</p>
                <p className="text-lg font-semibold">{data.subscription.used_scans_total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {monthlyUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Uso Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mes</th>
                    <th className="text-right p-2">Escaneos</th>
                    <th className="text-right p-2">Prompts</th>
                    <th className="text-right p-2">Tokens AI</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyUsage.map((usage, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{usage.month}</td>
                      <td className="text-right p-2">{usage.total_scans}</td>
                      <td className="text-right p-2">{usage.total_prompts_used || 0}</td>
                      <td className="text-right p-2">{usage.total_ai_tokens_used || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data.recent_usage_logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recent_usage_logs.slice(0, 10).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{log.action_type || 'Actividad'}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.used_at ? new Date(log.used_at).toLocaleString('es-ES') : 'Fecha desconocida'}
                    </p>
                  </div>
                  <div className="text-right">
                    {log.scans_used && (
                      <p className="text-sm">
                        <span className="font-semibold">{log.scans_used}</span> escaneos
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.recent_usage_logs.length === 0 && monthlyUsage.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No hay datos de uso disponibles
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}