import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, CheckCircle, XCircle, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SectionHeader from '@/components/dashboard/SectionHeader';

interface UsageLog {
  id: string;
  organization_id: string;
  scan_type: string;
  used_at: string;
  user_id: string;
  source: string;
  scan_success: boolean;
  organization_name?: string;
  user_name?: string;
}

export default function AdminCreditUsage() {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreditUsage();
  }, []);

  async function loadCreditUsage() {
    try {
      setLoading(true);

      // Get all organizations
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name');

      if (orgsError) {
        console.error('Error loading organizations:', orgsError);
      }

      // Get all user profiles
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name');

      if (usersError) {
        console.error('Error loading users:', usersError);
      }

      // Get subscription usage logs
      const { data: logs, error: logsError } = await supabase
        .from('subscription_usage_logs')
        .select('*')
        .order('used_at', { ascending: false })
        .limit(200);

      if (logsError) {
        console.error('Error loading usage logs:', logsError);
        return;
      }

      // Map organization and user names to logs
      const logsWithNames = logs?.map(log => ({
        ...log,
        organization_name: orgs?.find(org => org.id === log.organization_id)?.name || 'Desconocida',
        user_name: users?.find(user => user.user_id === log.user_id)?.full_name || 'Usuario Desconocido'
      })) || [];

      console.log('✅ Loaded', logsWithNames.length, 'credit usage logs');
      setUsageLogs(logsWithNames);
    } catch (error) {
      console.error('Error loading credit usage:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const totalUsage = usageLogs.length;
  const successfulScans = usageLogs.filter(log => log.scan_success).length;
  const failedScans = usageLogs.filter(log => !log.scan_success).length;
  const successRate = totalUsage > 0 ? ((successfulScans / totalUsage) * 100).toFixed(1) : '0';

  // Group by organization
  const orgUsage = usageLogs.reduce((acc, log) => {
    const orgName = log.organization_name || 'Desconocida';
    if (!acc[orgName]) {
      acc[orgName] = { total: 0, successful: 0, failed: 0 };
    }
    acc[orgName].total++;
    if (log.scan_success) {
      acc[orgName].successful++;
    } else {
      acc[orgName].failed++;
    }
    return acc;
  }, {} as Record<string, { total: number; successful: number; failed: number }>);

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                💳 Uso de Créditos
              </h1>
              <p className="text-orange-100">
                Monitoreo de consumo de créditos en toda la plataforma
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{totalUsage}</div>
              <div className="text-sm text-orange-100">Total de Usos</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div>
          <SectionHeader
            title="Resumen de Uso"
            description="Estadísticas generales de consumo de créditos"
            metricCount={4}
            icon="📊"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Activity className="w-8 h-8 text-blue-500" />
                  <Badge variant="secondary">{totalUsage}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{totalUsage}</CardTitle>
                <CardDescription>Total de Usos</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <Badge style={{ backgroundColor: '#10b981', color: 'white' }}>
                    {successRate}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{successfulScans}</CardTitle>
                <CardDescription>Escaneos Exitosos</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    {failedScans}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{failedScans}</CardTitle>
                <CardDescription>Escaneos Fallidos</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <Badge variant="secondary">{Object.keys(orgUsage).length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{Object.keys(orgUsage).length}</CardTitle>
                <CardDescription>Organizaciones Activas</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage by Organization */}
        <div>
          <SectionHeader
            title="Uso por Organización"
            description="Desglose de créditos por organización"
            metricCount={Object.keys(orgUsage).length}
            icon="🏢"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(orgUsage)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([orgName, stats]) => (
                <Card key={orgName} className="bg-white rounded-xl shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{orgName}</CardTitle>
                      <Badge variant="secondary">{stats.total} usos</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">Total</div>
                        <div className="text-xl font-bold">{stats.total}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Exitosos</div>
                        <div className="text-xl font-bold text-green-600">{stats.successful}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Fallidos</div>
                        <div className="text-xl font-bold text-red-600">{stats.failed}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Recent Usage Logs */}
        <div>
          <SectionHeader
            title="Registros Recientes"
            description={`Últimos ${usageLogs.length} usos de créditos`}
            metricCount={usageLogs.length}
            icon="📋"
          />

          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader>
              <CardTitle>Historial de Uso</CardTitle>
              <CardDescription>Detalle de consumo de créditos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageLogs.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">
                    No hay registros de uso disponibles
                  </p>
                ) : (
                  usageLogs.slice(0, 50).map((log) => (
                    <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{log.organization_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.scan_type}
                          </Badge>
                          {log.scan_success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {log.user_name} • {log.source} • {new Date(log.used_at).toLocaleString('es-ES')}
                        </div>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: log.scan_success ? '#10b981' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        {log.scan_success ? 'Exitoso' : 'Fallido'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}