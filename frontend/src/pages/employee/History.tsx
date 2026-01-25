import { useEffect } from 'react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeeHistory() {
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    logActivity('page_view', { page: 'Employee History' });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Mi Historial</h1>
        <p className="text-sky-100">
          Revisa tu historial de mediciones biométricas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Mediciones</CardTitle>
          <CardDescription>
            Todas tus mediciones anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Funcionalidad en desarrollo...</p>
        </CardContent>
      </Card>
    </div>
  );
}