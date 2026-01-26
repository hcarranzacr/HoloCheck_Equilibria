import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, AlertTriangle, Moon, Activity, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SectionHeader from '@/components/dashboard/SectionHeader';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';

interface OrganizationInsights {
  id: string;
  organization_id: string;
  analysis_date: string;
  total_employees: number;
  stress_index: number;
  burnout_risk: number;
  sleep_index: number;
  actuarial_risk: number;
  claim_risk: number;
  updated_at: string;
}

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

export default function HRInsights() {
  const [orgInsights, setOrgInsights] = useState<OrganizationInsights | null>(null);
  const [deptMetrics, setDeptMetrics] = useState<DepartmentMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      setLoading(true);

      // Get current user's organization
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Get user profile to find organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Query organization_insights
      const { data: orgData, error: orgError } = await supabase
        .from('organization_insights')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      if (orgError) {
        console.error('Error loading organization insights:', orgError);
      } else {
        console.log('✅ Loaded organization insights:', orgData);
        setOrgInsights(orgData);
      }

      // Query vw_current_department_metrics for all departments
      const { data: deptData, error: deptError } = await supabase
        .from('vw_current_department_metrics')
        .select('*')
        .order('avg_wellness_index', { ascending: false });

      if (deptError) {
        console.error('Error loading department metrics:', deptError);
      } else {
        console.log('✅ Loaded department metrics:', deptData);
        setDeptMetrics(deptData || []);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
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

  if (!orgInsights) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Insights Organizacionales</h1>
          <p className="text-slate-600 mt-2">Análisis detallado de métricas de bienestar</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600">No hay datos disponibles para tu organización</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🏢 Insights Organizacionales
              </h1>
              <p className="text-emerald-100">
                Análisis actualizado al {new Date(orgInsights.analysis_date).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{orgInsights.total_employees}</div>
              <div className="text-sm text-emerald-100">Empleados</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Organization-Level Metrics */}
        <div>
          <SectionHeader
            title="Métricas Organizacionales"
            description="Indicadores clave de la organización"
            metricCount={5}
            icon="📊"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Stress Index */}
            <BiometricGaugeWithInfo
              value={orgInsights.stress_index || 0}
              indicatorCode="mental_stress_index"
              label="Índice de Estrés"
            />

            {/* Burnout Risk - using risk_score */}
            <BiometricGaugeWithInfo
              value={orgInsights.burnout_risk || 0}
              indicatorCode="risk_score"
              label="Riesgo de Burnout"
            />

            {/* Sleep Index - using physical_score */}
            <BiometricGaugeWithInfo
              value={orgInsights.sleep_index || 0}
              indicatorCode="physical_score"
              label="Índice de Sueño"
            />

            {/* Actuarial Risk - using risk_score */}
            <BiometricGaugeWithInfo
              value={orgInsights.actuarial_risk || 0}
              indicatorCode="risk_score"
              label="Riesgo Actuarial"
            />

            {/* Claim Risk - using risk_score */}
            <BiometricGaugeWithInfo
              value={orgInsights.claim_risk || 0}
              indicatorCode="risk_score"
              label="Riesgo de Reclamos"
            />
          </div>
        </div>

        {/* Department Comparison */}
        <div>
          <SectionHeader
            title="Comparación por Departamentos"
            description={`${deptMetrics.length} departamentos`}
            metricCount={deptMetrics.length}
            icon="🏢"
          />

          <div className="grid grid-cols-1 gap-4">
            {deptMetrics.map((dept) => (
              <Card key={dept.department_id} className="bg-white rounded-xl shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{dept.department_name}</CardTitle>
                      <CardDescription>{dept.employee_count} colaboradores</CardDescription>
                    </div>
                    <Badge 
                      style={{ 
                        backgroundColor: dept.avg_wellness_index >= 70 ? '#10b981' : dept.avg_wellness_index >= 50 ? '#fbbf24' : '#ef4444',
                        color: 'white'
                      }}
                    >
                      Bienestar: {dept.avg_wellness_index.toFixed(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Estrés</div>
                      <div className="text-xl font-bold" style={{ color: dept.avg_stress < 30 ? '#10b981' : dept.avg_stress < 60 ? '#fbbf24' : '#ef4444' }}>
                        {dept.avg_stress.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Fatiga</div>
                      <div className="text-xl font-bold" style={{ color: dept.avg_fatigue < 30 ? '#10b981' : dept.avg_fatigue < 60 ? '#fbbf24' : '#ef4444' }}>
                        {dept.avg_fatigue.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Carga Cognitiva</div>
                      <div className="text-xl font-bold" style={{ color: dept.avg_cognitive_load < 40 ? '#10b981' : dept.avg_cognitive_load < 70 ? '#fbbf24' : '#ef4444' }}>
                        {dept.avg_cognitive_load.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Recuperación</div>
                      <div className="text-xl font-bold" style={{ color: dept.avg_recovery >= 70 ? '#10b981' : dept.avg_recovery >= 50 ? '#fbbf24' : '#ef4444' }}>
                        {dept.avg_recovery.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alerts and Recommendations */}
        <Card className="bg-amber-50 border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Alertas y Recomendaciones
              </h3>
              <ul className="text-sm text-amber-800 space-y-2">
                {orgInsights.stress_index > 60 && (
                  <li>• <strong>Alto Estrés Organizacional:</strong> Implementar programas de bienestar y gestión del estrés</li>
                )}
                {orgInsights.burnout_risk > 6 && (
                  <li>• <strong>Riesgo Alto de Burnout:</strong> Revisar cargas de trabajo y promover balance vida-trabajo</li>
                )}
                {orgInsights.sleep_index < 50 && (
                  <li>• <strong>Bajo Índice de Sueño:</strong> Fomentar mejores hábitos de descanso y recuperación</li>
                )}
                {orgInsights.claim_risk > 20 && (
                  <li>• <strong>Alto Riesgo de Reclamos:</strong> Reforzar programas de prevención de salud</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}