import { useEffect, useState } from 'react';
import { Users, Building2, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@metagptx/web-sdk';
import { useToast } from '@/hooks/use-toast';

const client = createClient();

interface DashboardData {
  organization_id: string;
  total_users: number;
  subscription: any;
  consumption_metrics: any;
  recent_usage_logs: any[];
  monthly_usage_summary: any[];
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
      
      const url = '/api/v1/dashboards/admin';
      console.log(`📡 [ADMIN DASHBOARD] API Call - URL: ${url}, Method: GET`);
      console.log(`🔑 [ADMIN DASHBOARD] Checking authentication token...`);
      
      // Log token presence (not the actual token for security)
      const token = localStorage.getItem('supabase.auth.token');
      console.log(`🔐 [ADMIN DASHBOARD] Token exists: ${!!token}, Length: ${token?.length || 0}`);

      console.log(`⏳ [ADMIN DASHBOARD] Sending request...`);
      const response = await client.apiCall.invoke({
        url: url,
        method: 'GET',
      });

      console.log(`✅ [ADMIN DASHBOARD] Response received - Status: 200`);
      console.log(`📊 [ADMIN DASHBOARD] Response data keys:`, Object.keys(response.data || {}));
      console.log(`📋 [ADMIN DASHBOARD] Full response data:`, response.data);
      
      console.log(`🔧 [ADMIN DASHBOARD] Processing data...`);
      console.log(`👥 [ADMIN DASHBOARD] Total users: ${response.data?.total_users || 0}`);
      console.log(`📈 [ADMIN DASHBOARD] Recent scans: ${response.data?.recent_scans_count || 0}`);
      console.log(`📊 [ADMIN DASHBOARD] Consumption metrics:`, response.data?.consumption_metrics);

      setData(response.data);
      console.log(`✅ [ADMIN DASHBOARD] SUCCESS - Data loaded and state updated`);
      
    } catch (err: any) {
      console.error(`❌ [ADMIN DASHBOARD] ERROR CAUGHT`);
      console.error(`📛 [ADMIN DASHBOARD] Error type: ${err?.constructor?.name || 'Unknown'}`);
      console.error(`📛 [ADMIN DASHBOARD] Error message: ${err?.message || 'No message'}`);
      
      // Log response details if available
      if (err?.response) {
        console.error(`📛 [ADMIN DASHBOARD] Response status: ${err.response.status}`);
        console.error(`📛 [ADMIN DASHBOARD] Response data:`, err.response.data);
        console.error(`📛 [ADMIN DASHBOARD] Response headers:`, err.response.headers);
      }
      
      // Log request details if available
      if (err?.config) {
        console.error(`📛 [ADMIN DASHBOARD] Request URL: ${err.config.url}`);
        console.error(`📛 [ADMIN DASHBOARD] Request method: ${err.config.method}`);
        console.error(`📛 [ADMIN DASHBOARD] Request headers:`, err.config.headers);
      }
      
      // Log SDK-specific error details
      if (err?.data) {
        console.error(`📛 [ADMIN DASHBOARD] SDK error data:`, err.data);
      }
      
      // Full error object
      console.error(`📛 [ADMIN DASHBOARD] Complete error object:`, err);
      
      const errorMsg =
        err?.data?.detail || err?.response?.data?.detail || err.message || 'Error al cargar el dashboard';
      
      console.error(`📛 [ADMIN DASHBOARD] Final error message: ${errorMsg}`);
      
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log(`🏁 [ADMIN DASHBOARD] Loading finished`);
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
          <AlertDescription>No se encontraron datos de la organización</AlertDescription>
        </Alert>
      </div>
    );
  }

  const subscription = data.subscription || {};
  const consumptionMetrics = data.consumption_metrics || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
        <Badge variant={subscription.active ? 'default' : 'destructive'}>
          {subscription.active ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_users}</div>
            <p className="text-xs text-muted-foreground">usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escaneos Recientes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recent_scans_count}</div>
            <p className="text-xs text-muted-foreground">últimos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Límite de Escaneos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consumptionMetrics.scan_limit || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">por usuario/mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consumptionMetrics.usage_percentage?.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">del límite mensual</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Details */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Suscripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={subscription.active ? 'default' : 'destructive'}>
                  {subscription.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escaneos Usados</p>
                <p className="text-lg font-semibold">{consumptionMetrics.scans_used || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Límite por Usuario</p>
                <p className="text-lg font-semibold">{consumptionMetrics.scan_limit || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uso Actual</p>
                <p className="text-lg font-semibold">
                  {consumptionMetrics.current_month_scans || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {data.recent_scans && data.recent_scans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent_scans.slice(0, 10).map((scan, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">Escaneo #{scan.id?.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(scan.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {scan.ai_stress && (
                      <Badge variant="outline">Estrés: {scan.ai_stress.toFixed(1)}</Badge>
                    )}
                    {scan.wellness_index_score && (
                      <Badge variant="outline">
                        Bienestar: {scan.wellness_index_score.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}