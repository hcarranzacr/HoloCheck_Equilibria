import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, TrendingUp, Calendar, Eye, Settings } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import SectionHeader from '@/components/dashboard/SectionHeader';
import { toast } from 'sonner';

interface PromptTemplate {
  id: string;
  scope: string;
  type: string;
  content: string;
}

interface AIPromptConfig {
  id: string;
  config_name: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  system_prompt: string;
  is_active: boolean;
  created_at: string;
}

interface PromptUsageLog {
  id: string;
  template_id: string;
  user_id: string;
  organization_id: string;
  used_at: string;
  response_generated: boolean;
  template_type?: string;
  user_name?: string;
  organization_name?: string;
}

export default function AdminPrompts() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [aiConfigs, setAiConfigs] = useState<AIPromptConfig[]>([]);
  const [usageLogs, setUsageLogs] = useState<PromptUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<AIPromptConfig | null>(null);

  useEffect(() => {
    loadPromptsData();
  }, []);

  async function loadPromptsData() {
    try {
      setLoading(true);

      console.log('🔍 Loading prompts data via apiClient...');

      // Get prompt templates via apiClient
      try {
        const templatesResponse = await apiClient.paramPromptTemplates.listAll({
          limit: 1000,
          sort: 'scope,type',
        });
        const templatesData = templatesResponse.items || [];
        console.log('✅ Loaded', templatesData.length, 'prompt templates');
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error loading templates:', error);
      }

      // Get AI prompt configs via apiClient
      try {
        const configsResponse = await apiClient.paramAiPromptConfigs.listAll({
          limit: 1000,
          sort: '-created_at',
        });
        const configsData = configsResponse.items || [];
        console.log('✅ Loaded', configsData.length, 'AI prompt configs');
        setAiConfigs(configsData);
      } catch (error) {
        console.error('Error loading AI configs:', error);
      }

      // Get organizations and users for mapping
      const orgsResponse = await apiClient.organizations.list({ limit: 1000 });
      const orgs = orgsResponse.items || [];

      const usersResponse = await apiClient.userProfiles.listAll({ limit: 10000 });
      const users = usersResponse.items || [];

      // Get prompt usage logs via apiClient (if endpoint exists)
      try {
        const logsResponse = await apiClient.call('/api/v1/param-prompt-usage-logs?limit=100&sort=-used_at', 'GET');
        const logsData = logsResponse.items || logsResponse || [];
        
        // Map template types, user names, and org names to logs
        const logsWithDetails = logsData.map((log: any) => ({
          ...log,
          template_type: templates.find((t: any) => t.id === log.template_id)?.type || 'Desconocido',
          user_name: users.find((u: any) => u.user_id === log.user_id)?.full_name || 'Usuario Desconocido',
          organization_name: orgs.find((o: any) => o.id === log.organization_id)?.name || 'Organización Desconocida'
        }));

        console.log('✅ Loaded', logsWithDetails.length, 'prompt usage logs');
        setUsageLogs(logsWithDetails);
      } catch (error) {
        console.error('Error loading usage logs:', error);
      }
    } catch (error: any) {
      console.error('Error loading prompts data:', error);
      toast.error('Error al cargar datos de prompts: ' + (error.response?.data?.detail || error.message));
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

  const totalUsage = usageLogs.length;
  const employeePrompts = templates.filter(t => t.scope === 'employee').length;
  const orgPrompts = templates.filter(t => t.scope === 'org').length;
  const activeConfigs = aiConfigs.filter(c => c.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                💬 Gestión de Prompts
              </h1>
              <p className="text-pink-100">
                Templates, configuraciones de IA y uso de prompts
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{templates.length + aiConfigs.length}</div>
              <div className="text-sm text-pink-100">Total Configuraciones</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div>
          <SectionHeader
            title="Resumen de Prompts"
            description="Estadísticas de templates y configuraciones"
            metricCount={5}
            icon="📊"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                  <Badge variant="secondary">{templates.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{templates.length}</CardTitle>
                <CardDescription>Templates</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Settings className="w-8 h-8 text-purple-500" />
                  <Badge variant="secondary">{aiConfigs.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{aiConfigs.length}</CardTitle>
                <CardDescription>Configs IA</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <Badge style={{ backgroundColor: '#10b981', color: 'white' }}>
                    {totalUsage}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{totalUsage}</CardTitle>
                <CardDescription>Usos Totales</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Calendar className="w-8 h-8 text-blue-500" />
                  <Badge variant="outline">{employeePrompts}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{employeePrompts}</CardTitle>
                <CardDescription>Empleado</CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Calendar className="w-8 h-8 text-orange-500" />
                  <Badge variant="outline">{orgPrompts}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl font-bold">{orgPrompts}</CardTitle>
                <CardDescription>Organización</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Prompt Templates Section */}
        <div>
          <SectionHeader
            title="Templates de Prompts"
            description={`${templates.length} templates configurados`}
            metricCount={templates.length}
            icon="📝"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.length === 0 ? (
              <Card className="bg-white rounded-2xl p-12 text-center col-span-2">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay templates configurados
                </h3>
                <p className="text-gray-500">
                  Los templates de prompts aparecerán aquí
                </p>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{template.type}</CardTitle>
                        <CardDescription className="text-xs">
                          Scope: {template.scope}
                        </CardDescription>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: template.scope === 'employee' ? '#3b82f6' : '#f97316',
                          color: 'white'
                        }}
                      >
                        {template.scope}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {template.content}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Completo
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* AI Prompt Configs Section */}
        <div>
          <SectionHeader
            title="Configuraciones de IA"
            description={`${aiConfigs.length} configuraciones de modelos de IA`}
            metricCount={aiConfigs.length}
            icon="⚙️"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiConfigs.length === 0 ? (
              <Card className="bg-white rounded-2xl p-12 text-center col-span-2">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay configuraciones de IA
                </h3>
                <p className="text-gray-500">
                  Las configuraciones de IA aparecerán aquí
                </p>
              </Card>
            ) : (
              aiConfigs.map((config) => (
                <Card key={config.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{config.config_name}</CardTitle>
                        <CardDescription className="text-xs">
                          Modelo: {config.model_name}
                        </CardDescription>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: config.is_active ? '#10b981' : '#94a3b8',
                          color: 'white'
                        }}
                      >
                        {config.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Temp:</span>
                        <span className="ml-1 font-semibold">{config.temperature}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Tokens:</span>
                        <span className="ml-1 font-semibold">{config.max_tokens}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Top P:</span>
                        <span className="ml-1 font-semibold">{config.top_p}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Freq Penalty:</span>
                        <span className="ml-1 font-semibold">{config.frequency_penalty}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedConfig(config)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Usage Logs */}
        <div>
          <SectionHeader
            title="Historial de Uso"
            description={`Últimos ${usageLogs.length} usos de prompts`}
            metricCount={usageLogs.length}
            icon="📋"
          />

          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader>
              <CardTitle>Registros de Uso</CardTitle>
              <CardDescription>Detalle de uso de prompts por usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageLogs.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">
                    No hay registros de uso disponibles
                  </p>
                ) : (
                  usageLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{log.template_type}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.organization_name}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {log.user_name} • {new Date(log.used_at).toLocaleString('es-ES')}
                        </div>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: log.response_generated ? '#10b981' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        {log.response_generated ? 'Generado' : 'Fallido'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedTemplate.type}</CardTitle>
                  <CardDescription className="mt-1">
                    Scope: {selectedTemplate.scope}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Contenido del Template:</div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedTemplate.content}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedTemplate(null)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Config Detail Modal */}
      {selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedConfig.config_name}</CardTitle>
                  <CardDescription className="mt-1">
                    Modelo: {selectedConfig.model_name}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedConfig(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Temperature</div>
                    <div className="text-xl font-bold">{selectedConfig.temperature}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Max Tokens</div>
                    <div className="text-xl font-bold">{selectedConfig.max_tokens}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Top P</div>
                    <div className="text-xl font-bold">{selectedConfig.top_p}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Frequency Penalty</div>
                    <div className="text-xl font-bold">{selectedConfig.frequency_penalty}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Presence Penalty</div>
                    <div className="text-xl font-bold">{selectedConfig.presence_penalty}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Estado</div>
                    <div className="text-xl font-bold">{selectedConfig.is_active ? 'Activo' : 'Inactivo'}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">System Prompt:</div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedConfig.system_prompt}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedConfig(null)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}