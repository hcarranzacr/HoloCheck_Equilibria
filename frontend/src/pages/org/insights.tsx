import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Building2, Activity, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SectionHeader from '@/components/dashboard/SectionHeader';

interface OrgUsageSummary {
  id: string;
  organization_id: string;
  organization_name?: string;
  month: string;
  total_ai_tokens_used: number;
  total_scans: number;
  total_prompts_used: number;
  total_user_scans: number;
  total_valid_scans: number;
  total_invalid_scans: number;
  created_at: string;
}

export default function OrgInsights() {
  const [allOrgsUsage, setAllOrgsUsage] = useState<OrgUsageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMultiOrgInsights();
  }, []);

  async function loadMultiOrgInsights() {
    try {
      setLoading(true);

      // Get all organizations
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name', { ascending: true });

      if (orgsError) {
        console.error('Error loading organizations:', orgsError);
        return;
      }

      // Get usage summary for all organizations (current month)
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: usageData, error: usageError } = await supabase
        .from('organization_usage_summary')
        .select('*')
        .gte('month', currentMonth)
        .order('total_scans', { ascending: false });

      if (usageError) {
        console.error('Error loading usage summary:', usageError);
        return;
      }

      // Map organization names to usage data
      const usageWithNames = usageData?.map(usage => ({
        ...usage,
        organization_name: orgs?.find(org => org.id === usage.organization_id)?.name || 'Organización Desconocida'
      })) || [];

      console.log('✅ Loaded multi-org usage for', usageWithNames.length, 'organizations');
      setAllOrgsUsage(usageWithNames);
    } catch (error) {
      console.error('Error loading multi-org insights:', error);
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

  const totalScans = allOrgsUsage.reduce((acc, org) => acc + (org.total_scans || 0), 0);
  const totalPrompts = allOrgsUsage.reduce((acc, org) => acc + (org.total_prompts_used || 0), 0);
  const totalTokens = allOrgsUsage.reduce((acc, org) => acc + (org.total_ai_tokens_used || 0), 0);
  const totalValidScans = allOrgsUsage.reduce((acc, org) => acc + (org.total_valid_scans || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🏢 Insights Multi-Organización
              </h1>
              <p className="text-blue-100">
                Comparativa de uso entre todas las organizaciones
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{allOrgsUsage.length}</div>
              <div className="text-sm text-blue-100">Organizaciones</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Platform Summary */}
        <div>
          <SectionHeader
            title="Resumen de Plataforma"
            description="Totales agregados de todas las organizaciones"
            metricCount={4}
            icon="📊"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Activity className="w-8 h-8 text-blue-500" />
                  <Badge variant="secondary">{totalScans}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{totalScans.toLocaleString()}</CardTitle>
                <CardDescription>Total Escaneos</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <Badge style={{ backgroundColor: '#10b981', color: 'white' }}>
                    {totalScans > 0 ? ((totalValidScans / totalScans) * 100).toFixed(1) : '0'}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{totalValidScans.toLocaleString()}</CardTitle>
                <CardDescription>Escaneos Válidos</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <Badge variant="secondary">{totalPrompts}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{totalPrompts.toLocaleString()}</CardTitle>
                <CardDescription>Total Prompts</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Building2 className="w-8 h-8 text-teal-500" />
                  <Badge variant="secondary">{totalTokens}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{totalTokens.toLocaleString()}</CardTitle>
                <CardDescription>Tokens IA Usados</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Organizations Comparison */}
        <div>
          <SectionHeader
            title="Comparativa por Organización"
            description={`${allOrgsUsage.length} organizaciones activas`}
            metricCount={allOrgsUsage.length}
            icon="🏢"
          />

          <div className="grid grid-cols-1 gap-4">
            {allOrgsUsage.length === 0 ? (
              <Card className="bg-white rounded-2xl p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay datos de uso
                </h3>
                <p className="text-gray-500">
                  Los datos de uso de las organizaciones aparecerán aquí
                </p>
              </Card>
            ) : (
              allOrgsUsage.map((org) => {
                const successRate = org.total_scans > 0 
                  ? ((org.total_valid_scans / org.total_scans) * 100).toFixed(1)
                  : '0';
                
                return (
                  <Card key={org.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{org.organization_name}</CardTitle>
                          <CardDescription>
                            {new Date(org.month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </CardDescription>
                        </div>
                        <Badge 
                          style={{ 
                            backgroundColor: org.total_scans > 100 ? '#10b981' : org.total_scans > 50 ? '#fbbf24' : '#94a3b8',
                            color: 'white'
                          }}
                        >
                          {org.total_scans} escaneos
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Escaneos Totales</div>
                          <div className="text-2xl font-bold">{org.total_scans}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Válidos</div>
                          <div className="text-2xl font-bold text-green-600">{org.total_valid_scans}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Inválidos</div>
                          <div className="text-2xl font-bold text-red-600">{org.total_invalid_scans}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Prompts</div>
                          <div className="text-2xl font-bold">{org.total_prompts_used}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Tasa de Éxito</div>
                          <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          Tokens IA: <span className="font-semibold text-gray-900">{org.total_ai_tokens_used.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Top Performers */}
        {allOrgsUsage.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Top 3 Organizaciones por Uso
                </h3>
                <div className="space-y-2">
                  {allOrgsUsage.slice(0, 3).map((org, idx) => (
                    <div key={org.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-green-600">#{idx + 1}</div>
                        <div>
                          <div className="font-medium text-gray-900">{org.organization_name}</div>
                          <div className="text-sm text-gray-600">{org.total_scans} escaneos</div>
                        </div>
                      </div>
                      <Badge style={{ backgroundColor: '#10b981', color: 'white' }}>
                        {org.total_prompts_used} prompts
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}