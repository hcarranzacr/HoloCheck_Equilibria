import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubscriptionUsageLogs } from '@/lib/supabase-admin';

export default function AdminUsageLogs() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Uso de Créditos</h1>
        <p className="text-slate-600 mt-2">Registro de consumo de suscripciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Uso</CardTitle>
          <CardDescription>Consumo de créditos por organización</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-slate-600">No hay registros de uso</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Organización: {log.organization_id}</p>
                    <p className="text-xs text-slate-600">Tipo: {log.usage_type}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <Badge>1 crédito</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}