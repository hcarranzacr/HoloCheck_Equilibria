import { useEffect } from 'react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeeRecommendations() {
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    logActivity('page_view', { page: 'Employee Recommendations' });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Recomendaciones</h1>
        <p className="text-sky-100">
          Recomendaciones personalizadas para tu bienestar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones de IA</CardTitle>
          <CardDescription>
            Sugerencias basadas en tus mediciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Funcionalidad en desarrollo...</p>
        </CardContent>
      </Card>
    </div>
  );
}