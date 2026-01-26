import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { MetricCard, ConsumptionWidget, BiometricTable, TrendChart } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Building, Users, Activity, AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AdminDashboardData {
  organization_id: string;
  total_users: number;
  subscription: any;
  consumption_metrics: {
    scan_limit: number;
    scans_used: number;
    subscription_active: boolean;
    current_month_scans: number;
    current_month_prompts: number;
    current_month_tokens: number;
    limit_reached: boolean;
    usage_percentage: number;
  };
  recent_usage_logs: any[];
  monthly_usage_summary: any[];
  recent_scans_count: number;
  recent_scans: any[];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.dashboards.admin();
      setData(response);
      console.log('✅ Admin dashboard data loaded:', response);
    } catch (err: any) {
      console.error('❌ Error loading admin dashboard:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar datos del dashboard');
      toast.error('Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
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
        <Button onClick={fetchDashboardData} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>No hay datos disponibles para la organización</AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = data.consumption_metrics || {};
  const subscription = data.subscription || {};

  // Prepare usage trend data
  const usageTrendData = data.monthly_usage_summary.map(usage => ({
    date: usage.month,
    value: usage.total_scans
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Control operativo y gestión de recursos
          </p>
        </div>
        <Button size="lg">
          <Building className="mr-2 h-5 w-5" />
          Configuración
        </Button>
      </div>

      {/* Métricas operativas clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Usuarios Totales"
          value={data.total_users}
          icon={Users}
          status="neutral"
          description="Cuentas activas"
        />
        
        <MetricCard
          title="Escaneos (7 días)"
          value={data.recent_scans_count}
          icon={Activity}
          status="neutral"
          description="Última semana"
        />
        
        <MetricCard
          title="Uso del Límite"
          value={metrics.usage_percentage?.toFixed(1) || 0}
          unit="%"
          icon={AlertCircle}
          status={metrics.usage_percentage > 90 ? 'danger' : metrics.usage_percentage > 70 ? 'warning' : 'success'}
          description="Consumo mensual"
        />
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Estado Suscripción</p>
                <div className="mt-2">
                  {metrics.subscription_active ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Activa
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Inactiva</Badge>
                  )}
                </div>
              </div>
              <Calendar className="w-8 h-8 text-sky-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de suscripción */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de Suscripción</CardTitle>
          <CardDescription>Información del plan actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Límite por Usuario/Mes</p>
              <p className="text-2xl font-bold">{subscription.scan_limit_per_user_per_month || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Escaneos Usados Total</p>
              <p className="text-2xl font-bold">{subscription.used_scans_total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Fecha Inicio</p>
              <p className="text-lg font-semibold">
                {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Fecha Fin</p>
              <p className="text-lg font-semibold">
                {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widgets de consumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConsumptionWidget
          title="Escaneos del Mes"
          description="Consumo mensual de escaneos biométricos"
          used={metrics.current_month_scans || 0}
          limit={metrics.scan_limit || 1000}
          type="scans"
          showAlert={true}
        />
        
        <ConsumptionWidget
          title="Prompts del Mes"
          description="Consultas AI realizadas este mes"
          used={metrics.current_month_prompts || 0}
          limit={metrics.current_month_prompts ? metrics.current_month_prompts * 1.5 : 500}
          type="prompts"
          showAlert={true}
        />
        
        <ConsumptionWidget
          title="Tokens AI del Mes"
          description="Uso de recursos de inteligencia artificial"
          used={metrics.current_month_tokens || 0}
          limit={metrics.current_month_tokens ? metrics.current_month_tokens * 1.5 : 100000}
          type="tokens"
          showAlert={false}
        />
      </div>

      {/* Tendencia de uso mensual */}
      {usageTrendData.length > 1 && (
        <TrendChart
          title="Tendencia de Uso (últimos 12 meses)"
          description="Evolución del consumo de escaneos por mes"
          data={usageTrendData}
          color="#0ea5e9"
          height={300}
        />
      )}

      {/* Actividad reciente */}
      {data.recent_scans && data.recent_scans.length > 0 && (
        <BiometricTable
          title="Actividad Reciente"
          description="Últimos escaneos realizados en la organización"
          measurements={data.recent_scans}
          showUser={false}
          maxRows={10}
        />
      )}

      {/* Logs de uso recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Uso Reciente</CardTitle>
          <CardDescription>Últimas actividades registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recent_usage_logs.slice(0, 10).map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">{log.scan_type || 'Escaneo'}</p>
                    <p className="text-xs text-slate-500">
                      Usuario: {log.user_id?.substring(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {new Date(log.used_at).toLocaleString('es-ES')}
                  </p>
                  {log.scan_success !== undefined && (
                    <Badge variant={log.scan_success ? 'default' : 'destructive'} className="text-xs">
                      {log.scan_success ? 'Exitoso' : 'Fallido'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}