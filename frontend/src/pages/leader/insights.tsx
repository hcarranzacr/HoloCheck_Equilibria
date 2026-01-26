import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Activity, Brain, Heart, Battery } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SectionHeader from '@/components/dashboard/SectionHeader';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';

interface DepartmentMetrics {
  department_id: string;
  department_name: string;
  employee_count: number;
  avg_stress: number;
  avg_fatigue: number;
  avg_cognitive_load: number;
  avg_recovery: number;
  avg_bio_age: number;
  avg_wellness_index: number;
}

export default function LeaderInsights() {
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartmentMetrics();
  }, []);

  async function loadDepartmentMetrics() {
    try {
      setLoading(true);

      // Get current user's department
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Get user profile to find department_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('department_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.department_id) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Query vw_current_department_metrics
      const { data, error } = await supabase
        .from('vw_current_department_metrics')
        .select('*')
        .eq('department_id', profile.department_id)
        .single();

      if (error) {
        console.error('Error loading department metrics:', error);
      } else {
        console.log('✅ Loaded department metrics:', data);
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error loading department metrics:', error);
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

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Insights del Equipo</h1>
          <p className="text-slate-600 mt-2">Análisis detallado de métricas del departamento</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600">No hay datos disponibles para tu departamento</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                📊 Insights del Equipo
              </h1>
              <p className="text-purple-100">
                {metrics.department_name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{metrics.employee_count}</div>
              <div className="text-sm text-purple-100">Colaboradores</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Key Metrics Overview */}
        <div>
          <SectionHeader
            title="Métricas Principales"
            description="Indicadores clave de bienestar del equipo"
            metricCount={6}
            icon="📈"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Wellness Index */}
            <BiometricGaugeWithInfo
              value={metrics.avg_wellness_index || 0}
              indicatorCode="global_health_score"
              label="Índice de Bienestar"
            />

            {/* Stress */}
            <BiometricGaugeWithInfo
              value={metrics.avg_stress || 0}
              indicatorCode="mental_stress_index"
              label="Estrés Promedio"
            />

            {/* Fatigue - using mental_score as proxy */}
            <BiometricGaugeWithInfo
              value={metrics.avg_fatigue || 0}
              indicatorCode="mental_score"
              label="Fatiga Promedio"
            />

            {/* Cognitive Load - using mental_score */}
            <BiometricGaugeWithInfo
              value={metrics.avg_cognitive_load || 0}
              indicatorCode="mental_score"
              label="Carga Cognitiva"
            />

            {/* Recovery - using physical_score */}
            <BiometricGaugeWithInfo
              value={metrics.avg_recovery || 0}
              indicatorCode="physical_score"
              label="Recuperación"
            />

            {/* Bio Age - using vital_index_score */}
            <BiometricGaugeWithInfo
              value={metrics.avg_bio_age || 0}
              indicatorCode="vital_index_score"
              label="Edad Biológica"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div>
          <SectionHeader
            title="Resumen del Equipo"
            description="Estado general del departamento"
            metricCount={4}
            icon="📋"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Users className="w-8 h-8 text-blue-500" />
                  <Badge variant="secondary">{metrics.employee_count}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{metrics.employee_count}</CardTitle>
                <CardDescription>Colaboradores</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Heart className="w-8 h-8 text-red-500" />
                  <Badge 
                    style={{ 
                      backgroundColor: metrics.avg_wellness_index >= 70 ? '#10b981' : '#fbbf24',
                      color: 'white'
                    }}
                  >
                    {metrics.avg_wellness_index >= 70 ? 'Excelente' : 'Bueno'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{metrics.avg_wellness_index.toFixed(1)}</CardTitle>
                <CardDescription>Bienestar Promedio</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Brain className="w-8 h-8 text-purple-500" />
                  <Badge 
                    style={{ 
                      backgroundColor: metrics.avg_stress < 30 ? '#10b981' : metrics.avg_stress < 60 ? '#fbbf24' : '#ef4444',
                      color: 'white'
                    }}
                  >
                    {metrics.avg_stress < 30 ? 'Bajo' : metrics.avg_stress < 60 ? 'Moderado' : 'Alto'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{metrics.avg_stress.toFixed(1)}</CardTitle>
                <CardDescription>Estrés Promedio</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Battery className="w-8 h-8 text-green-500" />
                  <Badge 
                    style={{ 
                      backgroundColor: metrics.avg_recovery >= 70 ? '#10b981' : '#fbbf24',
                      color: 'white'
                    }}
                  >
                    {metrics.avg_recovery >= 70 ? 'Excelente' : 'Buena'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{metrics.avg_recovery.toFixed(1)}</CardTitle>
                <CardDescription>Recuperación</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        <Card className="bg-blue-50 border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Activity className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Recomendaciones para el Equipo
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                {metrics.avg_stress > 60 && (
                  <li>• <strong>Alto Estrés:</strong> Considera implementar pausas activas y técnicas de relajación</li>
                )}
                {metrics.avg_fatigue > 60 && (
                  <li>• <strong>Alta Fatiga:</strong> Revisa la carga de trabajo y promueve mejores hábitos de descanso</li>
                )}
                {metrics.avg_recovery < 50 && (
                  <li>• <strong>Baja Recuperación:</strong> Fomenta actividades de recuperación y balance vida-trabajo</li>
                )}
                {metrics.avg_wellness_index >= 70 && (
                  <li>• <strong>Excelente Bienestar:</strong> ¡Mantén las buenas prácticas actuales!</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}