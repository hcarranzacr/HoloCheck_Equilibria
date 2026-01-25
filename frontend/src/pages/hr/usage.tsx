import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSubscriptionUsageLogs } from '@/lib/supabase-admin';

export default function HRUsage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const data = await getSubscriptionUsageLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading usage logs:', error);
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

  const totalUsage = logs.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Uso de Suscripción</h1>
        <p className="text-slate-600 mt-2">Consumo de créditos y recursos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Consumido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsage}</div>
            <p className="text-sm text-slate-600">créditos utilizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs.length}</div>
            <p className="text-sm text-slate-600">eventos de uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {logs.length > 0 ? (totalUsage / logs.length).toFixed(1) : '0'}
            </div>
            <p className="text-sm text-slate-600">créditos por evento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Uso</CardTitle>
          <CardDescription>Detalle de consumo de créditos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-slate-600">No hay registros de uso</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium">{log.usage_type}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(log.created_at).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <p className="font-bold">1 crédito</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}