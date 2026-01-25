import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LeaderInsights() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Insights del Equipo</h1>
        <p className="text-slate-600 mt-2">Análisis detallado de métricas del departamento</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departamento</CardTitle>
          <CardDescription>Métricas de bienestar del equipo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Datos disponibles próximamente</p>
        </CardContent>
      </Card>
    </div>
  );
}