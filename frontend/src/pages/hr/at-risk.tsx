import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Users, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SectionHeader from '@/components/dashboard/SectionHeader';

interface EmployeeAtRisk {
  user_id: string;
  full_name: string;
  email: string;
  department_name: string;
  latest_scan_date: string;
  wellness_index_score: number;
  ai_stress: number;
  ai_fatigue: number;
  burnout_risk: number;
  mental_stress_index: number;
  risk_level: string;
  risk_factors: string[];
}

export default function HRAtRisk() {
  const [atRiskEmployees, setAtRiskEmployees] = useState<EmployeeAtRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAtRiskEmployees();
  }, []);

  async function loadAtRiskEmployees() {
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

      // Query vw_employees_at_risk view
      const { data, error } = await supabase
        .from('vw_employees_at_risk')
        .select('*')
        .order('risk_level', { ascending: false })
        .order('wellness_index_score', { ascending: true });

      if (error) {
        console.error('Error loading at-risk employees:', error);
      } else {
        console.log('✅ Loaded', data?.length || 0, 'at-risk employees');
        setAtRiskEmployees(data || []);
      }
    } catch (error) {
      console.error('Error loading at-risk employees:', error);
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

  const highRisk = atRiskEmployees.filter(e => e.risk_level === 'high' || e.risk_level === 'alto');
  const mediumRisk = atRiskEmployees.filter(e => e.risk_level === 'medium' || e.risk_level === 'moderado');
  const lowRisk = atRiskEmployees.filter(e => e.risk_level === 'low' || e.risk_level === 'bajo');

  function getRiskColor(riskLevel: string): string {
    const level = riskLevel.toLowerCase();
    if (level === 'high' || level === 'alto') return '#ef4444';
    if (level === 'medium' || level === 'moderado') return '#fbbf24';
    return '#10b981';
  }

  function getRiskBadgeText(riskLevel: string): string {
    const level = riskLevel.toLowerCase();
    if (level === 'high' || level === 'alto') return 'Alto Riesgo';
    if (level === 'medium' || level === 'moderado') return 'Riesgo Moderado';
    return 'Bajo Riesgo';
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                ⚠️ Empleados en Riesgo
              </h1>
              <p className="text-red-100">
                Colaboradores que requieren atención prioritaria
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{atRiskEmployees.length}</div>
              <div className="text-sm text-red-100">Total en Riesgo</div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-red-100">Alto Riesgo</div>
              <div className="text-2xl font-bold">{highRisk.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-red-100">Riesgo Moderado</div>
              <div className="text-2xl font-bold">{mediumRisk.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-red-100">Bajo Riesgo</div>
              <div className="text-2xl font-bold">{lowRisk.length}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* High Risk Employees */}
        {highRisk.length > 0 && (
          <div>
            <SectionHeader
              title="Alto Riesgo"
              description="Requieren atención inmediata"
              metricCount={highRisk.length}
              icon="🚨"
            />

            <div className="grid grid-cols-1 gap-4">
              {highRisk.map((employee) => (
                <Card key={employee.user_id} className="bg-red-50 border-red-200 rounded-xl shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{employee.full_name}</CardTitle>
                        <CardDescription>{employee.department_name}</CardDescription>
                      </div>
                      <Badge style={{ backgroundColor: getRiskColor(employee.risk_level), color: 'white' }}>
                        {getRiskBadgeText(employee.risk_level)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Bienestar</div>
                        <div className="text-2xl font-bold text-red-600">
                          {employee.wellness_index_score?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Estrés</div>
                        <div className="text-2xl font-bold">{employee.ai_stress?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Fatiga</div>
                        <div className="text-2xl font-bold">{employee.ai_fatigue?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Riesgo Burnout</div>
                        <div className="text-2xl font-bold">{employee.burnout_risk?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Estrés Mental</div>
                        <div className="text-2xl font-bold">{employee.mental_stress_index?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>

                    {employee.risk_factors && employee.risk_factors.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Factores de Riesgo:</div>
                        <div className="flex flex-wrap gap-2">
                          {employee.risk_factors.map((factor, idx) => (
                            <Badge key={idx} variant="outline" className="text-red-700 border-red-300">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        Contactar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 mt-3 text-right">
                      Último escaneo: {new Date(employee.latest_scan_date).toLocaleDateString('es-ES')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Medium Risk Employees */}
        {mediumRisk.length > 0 && (
          <div>
            <SectionHeader
              title="Riesgo Moderado"
              description="Requieren seguimiento"
              metricCount={mediumRisk.length}
              icon="⚠️"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediumRisk.map((employee) => (
                <Card key={employee.user_id} className="bg-amber-50 border-amber-200 rounded-xl shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{employee.full_name}</CardTitle>
                        <CardDescription className="text-xs">{employee.department_name}</CardDescription>
                      </div>
                      <Badge style={{ backgroundColor: getRiskColor(employee.risk_level), color: 'white' }}>
                        {getRiskBadgeText(employee.risk_level)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                      <div>
                        <div className="text-gray-500 text-xs">Bienestar</div>
                        <div className="text-lg font-bold">{employee.wellness_index_score?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Estrés</div>
                        <div className="text-lg font-bold">{employee.ai_stress?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Fatiga</div>
                        <div className="text-lg font-bold">{employee.ai_fatigue?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 text-right">
                      {new Date(employee.latest_scan_date).toLocaleDateString('es-ES')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Low Risk Employees */}
        {lowRisk.length > 0 && (
          <div>
            <SectionHeader
              title="Bajo Riesgo"
              description="Monitoreo regular"
              metricCount={lowRisk.length}
              icon="✅"
            />

            <Card className="bg-white rounded-xl shadow-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowRisk.map((employee) => (
                    <div 
                      key={employee.user_id}
                      className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{employee.full_name}</p>
                        <p className="text-sm text-gray-600">{employee.department_name}</p>
                      </div>
                      <Badge style={{ backgroundColor: getRiskColor(employee.risk_level), color: 'white' }}>
                        {employee.wellness_index_score?.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Data */}
        {atRiskEmployees.length === 0 && (
          <Card className="bg-white rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay empleados en riesgo
            </h3>
            <p className="text-gray-500">
              Todos los colaboradores tienen métricas dentro de rangos normales
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}