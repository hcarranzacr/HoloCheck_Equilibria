import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBiometricMeasurements } from '@/lib/supabase-admin';

export default function HRMeasurements() {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeasurements();
  }, []);

  async function loadMeasurements() {
    try {
      const data = await getBiometricMeasurements();
      setMeasurements(data.slice(0, 50));
    } catch (error) {
      console.error('Error loading measurements:', error);
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
        <h1 className="text-3xl font-bold text-slate-900">Mediciones de Salud</h1>
        <p className="text-slate-600 mt-2">Historial de mediciones biométricas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mediciones Recientes</CardTitle>
          <CardDescription>Últimas mediciones registradas en la organización</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {measurements.length === 0 ? (
              <p className="text-sm text-slate-600">No hay mediciones registradas</p>
            ) : (
              measurements.map((measurement) => (
                <div key={measurement.id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Usuario: {measurement.user_id}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(measurement.created_at).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Estrés:</span>{' '}
                      <span className="font-medium">{measurement.stress_level}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Fatiga:</span>{' '}
                      <span className="font-medium">{measurement.fatigue_level}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Recuperación:</span>{' '}
                      <span className="font-medium">{measurement.recovery_level}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}