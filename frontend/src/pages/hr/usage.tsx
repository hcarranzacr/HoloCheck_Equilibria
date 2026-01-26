import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Activity, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SectionHeader from '@/components/dashboard/SectionHeader';

interface UsageSummary {
  id: string;
  organization_id: string;
  month: string;
  total_ai_tokens_used: number;
  total_scans: number;
  total_prompts_used: number;
  total_user_scans: number;
  total_valid_scans: number;
  total_invalid_scans: number;
  created_at: string;
}

export default function HRUsage() {
  const [usageSummary, setUsageSummary] = useState<UsageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  async function loadUsage() {
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

      // Query organization_usage_summary
      const { data, error } = await supabase
        .from('organization_usage_summary')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('month', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error loading usage summary:', error);
      } else {
        console.log('✅ Loaded', data?.length || 0, 'usage summary records');
        setUsageSummary(data || []);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
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

  const currentMonth = usageSummary[0];
  const totalScans = usageSummary.reduce((acc, m) => acc + (m.total_scans || 0), 0);
  const totalPrompts = usageSummary.reduce((acc, m) => acc + (m.total_prompts_used || 0), 0);
  const totalTokens = usageSummary.reduce((acc, m) => acc + (m.total_ai_tokens_used || 0), 0);
  const successRate = currentMonth 
    ? ((currentMonth.total_valid_scans / currentMonth.total_scans) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                📊 Uso de Plataforma
              </h1>
              <p className="text-teal-100">
                Consumo de recursos y créditos
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{currentMonth?.total_scans || 0}</div>
              <div className="text-sm text-teal-100">Escaneos este mes</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Current Month Summary */}
        {currentMonth && (
          <div>
            <SectionHeader
              title="Resumen del Mes Actual"
              description={`Datos de ${new Date(currentMonth.month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
              metricCount={4}
              icon="📅"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white rounded-xl shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Activity className="w-8 h-8 text-blue-500" />
                    <Badge variant="secondary">{currentMonth.total_scans}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl font-bold">{currentMonth.total_scans}</CardTitle>
                  <CardDescription>Total Escaneos</CardDescription>
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
                  <CardTitle className="text-2xl font-bold">{currentMonth.total_valid_scans}</CardTitle>
                  <CardDescription>Escaneos Válidos</CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <Badge variant="outline">{currentMonth.total_invalid_scans}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl font-bold">{currentMonth.total_invalid_scans}</CardTitle>
                  <CardDescription>Escaneos Inválidos</CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <Badge variant="secondary">{currentMonth.total_prompts_used}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl font-bold">{currentMonth.total_prompts_used}</CardTitle>
                  <CardDescription>Prompts Usados</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Historical Usage */}
        <div>
          <SectionHeader
            title="Historial de Uso"
            description={`Últimos ${usageSummary.length} meses`}
            metricCount={usageSummary.length}
            icon="📈"
          />

          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader>
              <CardTitle>Consumo Mensual</CardTitle>
              <CardDescription>Desglose de uso por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageSummary.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">
                    No hay datos de uso disponibles
                  </p>
                ) : (
                  usageSummary.map((summary) => (
                    <div key={summary.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {new Date(summary.month).toLocaleDateString('es-ES', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {summary.total_scans} escaneos
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Válidos:</span>{' '}
                          <span className="font-semibold text-green-600">{summary.total_valid_scans}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Inválidos:</span>{' '}
                          <span className="font-semibold text-red-600">{summary.total_invalid_scans}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Prompts:</span>{' '}
                          <span className="font-semibold">{summary.total_prompts_used}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tokens IA:</span>{' '}
                          <span className="font-semibold">{summary.total_ai_tokens_used.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{totalScans}</div>
              <div className="text-sm text-gray-600 mt-1">Total Escaneos (12 meses)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{totalPrompts}</div>
              <div className="text-sm text-gray-600 mt-1">Total Prompts (12 meses)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600">{totalTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Total Tokens IA (12 meses)</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}