import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Sparkles, AlertCircle, Clock, Trophy, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import RecommendationStats from '@/components/dashboard/RecommendationStats';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import RecommendationFilters from '@/components/recommendations/RecommendationFilters';
import RecommendationDetailDialog from '@/components/recommendations/RecommendationDetailDialog';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action_items: string[];
  related_metrics: string[];
  urgency: string;
  urgency_text: string;
  impact_score: number;
  tags?: string[];
}

interface AIAnalysis {
  id: string;
  user_id: string;
  scan_id: string;
  recommendations: {
    physical_health?: Recommendation[];
    mental_health?: Recommendation[];
    lifestyle?: Recommendation[];
    nutrition?: Recommendation[];
    sleep?: Recommendation[];
  };
  overall_risk_level: string;
  priority_actions: string[];
  created_at: string;
}

interface RecommendationTracking {
  id: string;
  recommendation_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  completed_at?: string;
}

export default function EmployeeRecommendations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);
  const [tracking, setTracking] = useState<RecommendationTracking[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<Record<string, number>>({});
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Load latest AI analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('ai_analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (analysisError) {
        console.error('Error loading analysis:', analysisError);
        setAnalysis(null);
      } else {
        setAnalysis(analysisData);
        
        // Extract all recommendations
        const recs: Recommendation[] = [];
        if (analysisData.recommendations) {
          Object.values(analysisData.recommendations).forEach((categoryRecs: any) => {
            if (Array.isArray(categoryRecs)) {
              recs.push(...categoryRecs);
            }
          });
        }
        setAllRecommendations(recs);
      }

      // Load tracking data (mock for now - table doesn't exist yet)
      // In production, this would query user_recommendation_tracking table
      setTracking([]);

      // Load current metrics
      const { data: scanData, error: scanError } = await supabase
        .from('biometric_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!scanError && scanData) {
        setCurrentMetrics(scanData);
      }

      console.log('✅ [Recommendations] Data loaded');
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete(recId: string) {
    try {
      // In production, this would insert into user_recommendation_tracking
      toast.success('¡Excelente! Recomendación completada');
      
      // Update local state
      setTracking((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          recommendation_id: recId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Error al marcar como completada');
    }
  }

  function handleViewDetails(recId: string) {
    const rec = allRecommendations.find((r) => r.id === recId);
    if (rec) {
      setSelectedRecommendation(rec);
      setDialogOpen(true);
    }
  }

  function handlePostpone(recId: string) {
    toast.info('Recomendación pospuesta');
  }

  function handleDismiss() {
    toast.info('Recomendación descartada');
    setDialogOpen(false);
  }

  // Filter recommendations
  const filteredRecommendations = allRecommendations.filter((rec) => {
    // Category filter
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) {
      return false;
    }
    
    // Priority filter
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) {
      return false;
    }
    
    // Status filter
    const recTracking = tracking.find((t) => t.recommendation_id === rec.id);
    const status = recTracking?.status || 'pending';
    if (selectedStatus !== 'all' && status !== selectedStatus) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        rec.title.toLowerCase().includes(query) ||
        rec.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Group by category
  const groupedRecommendations: Record<string, Recommendation[]> = {};
  filteredRecommendations.forEach((rec) => {
    if (!groupedRecommendations[rec.category]) {
      groupedRecommendations[rec.category] = [];
    }
    groupedRecommendations[rec.category].push(rec);
  });

  // Sort by priority within each category
  Object.keys(groupedRecommendations).forEach((category) => {
    groupedRecommendations[category].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  });

  // Get priority recommendations
  const priorityRecommendations = allRecommendations
    .filter((rec) => analysis?.priority_actions?.includes(rec.id))
    .slice(0, 3);

  // Calculate stats
  const totalRecs = allRecommendations.length;
  const completedRecs = tracking.filter((t) => t.status === 'completed').length;
  const pendingRecs = totalRecs - completedRecs;
  const completionRate = totalRecs > 0 ? (completedRecs / totalRecs) * 100 : 0;

  // Check if analysis is outdated
  const daysSinceAnalysis = analysis
    ? Math.floor(
        (new Date().getTime() - new Date(analysis.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;
  const isOutdated = daysSinceAnalysis > 30;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // No recommendations case
  if (!analysis || allRecommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl shadow-xl p-6 mb-6">
            <h1 className="text-3xl font-bold">💡 Mis Recomendaciones Personalizadas</h1>
            <p className="text-sky-100 mt-2">Sugerencias basadas en tu análisis de salud</p>
          </Card>

          <div className="flex flex-col items-center justify-center py-12">
            <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aún no tienes recomendaciones</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Realiza tu primer escaneo biométrico para recibir recomendaciones personalizadas
              basadas en tu salud y bienestar.
            </p>
            <Button onClick={() => navigate('/employee/scan')}>Realizar escaneo ahora</Button>
          </div>
        </div>
      </div>
    );
  }

  // All completed case
  if (completedRecs === totalRecs && totalRecs > 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl shadow-xl p-6 mb-6">
            <h1 className="text-3xl font-bold">💡 Mis Recomendaciones Personalizadas</h1>
            <p className="text-sky-100 mt-2">Sugerencias basadas en tu análisis de salud</p>
          </Card>

          <div className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">¡Felicitaciones!</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Has completado todas tus recomendaciones actuales. Sigue así y mantén tu bienestar en
              óptimas condiciones.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/employee/dashboard')}>
                Ver mi progreso
              </Button>
              <Button onClick={() => navigate('/employee/scan')}>Nuevo escaneo</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">💡 Mis Recomendaciones Personalizadas</h1>
              <p className="text-sky-100">
                Última actualización: {new Date(analysis.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
            <Badge
              className="text-lg px-4 py-2"
              variant={
                analysis.overall_risk_level === 'low'
                  ? 'secondary'
                  : analysis.overall_risk_level === 'moderate'
                  ? 'default'
                  : 'destructive'
              }
            >
              {analysis.overall_risk_level === 'low'
                ? 'Riesgo Bajo'
                : analysis.overall_risk_level === 'moderate'
                ? 'Riesgo Moderado'
                : 'Riesgo Alto'}
            </Badge>
          </div>
        </Card>

        {/* Outdated warning */}
        {isOutdated && (
          <Alert variant="default" className="border-yellow-500 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Recomendaciones desactualizadas</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Tu último análisis fue hace {daysSinceAnalysis} días. Te recomendamos realizar un
              nuevo escaneo para obtener recomendaciones actualizadas.
              <Button
                variant="outline"
                size="sm"
                className="mt-2 ml-2"
                onClick={() => navigate('/employee/scan')}
              >
                Actualizar ahora
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Critical recommendations alert */}
        {priorityRecommendations.some((r) => r.priority === 'critical') && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atención: Recomendación urgente</AlertTitle>
            <AlertDescription>
              Tienes recomendaciones que requieren atención inmediata. Por favor, revísalas lo
              antes posible.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <RecommendationStats
          total={totalRecs}
          completed={completedRecs}
          pending={pendingRecs}
          completionRate={completionRate}
        />

        {/* Priority Recommendations */}
        {priorityRecommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🔥 Recomendaciones Prioritarias
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {priorityRecommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  status={
                    tracking.find((t) => t.recommendation_id === rec.id)?.status || 'pending'
                  }
                  onMarkComplete={handleMarkComplete}
                  onViewDetails={handleViewDetails}
                  onPostpone={handlePostpone}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Todas las Recomendaciones</h2>
          <RecommendationFilters
            categories={['all', ...Array.from(new Set(allRecommendations.map((r) => r.category)))]}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priorities={['all', 'critical', 'high', 'medium', 'low']}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            statuses={['all', 'pending', 'in_progress', 'completed', 'dismissed']}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Grouped Recommendations */}
        <Accordion type="multiple" className="space-y-4">
          {Object.entries(groupedRecommendations).map(([category, recs]) => (
            <AccordionItem key={category} value={category} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="text-lg font-semibold">
                    {category === 'physical_health' && '💪 Salud Física'}
                    {category === 'mental_health' && '🧠 Salud Mental'}
                    {category === 'lifestyle' && '✨ Estilo de Vida'}
                    {category === 'nutrition' && '🍎 Nutrición'}
                    {category === 'sleep' && '🌙 Sueño'}
                    {category === 'cardiovascular' && '❤️ Cardiovascular'}
                    {category === 'stress_management' && '🧘 Manejo del Estrés'}
                    {category === 'body_composition' && '⚖️ Composición Corporal'}
                    {category === 'recovery' && '😴 Recuperación'}
                  </span>
                  <Badge variant="secondary">{recs.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 mt-4">
                  {recs.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      status={
                        tracking.find((t) => t.recommendation_id === rec.id)?.status || 'pending'
                      }
                      onMarkComplete={handleMarkComplete}
                      onViewDetails={handleViewDetails}
                      onPostpone={handlePostpone}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Detail Dialog */}
      <RecommendationDetailDialog
        recommendation={selectedRecommendation}
        currentMetrics={currentMetrics}
        partnerBenefits={[]} // TODO: Load matching benefits
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onMarkComplete={() => {
          if (selectedRecommendation) {
            handleMarkComplete(selectedRecommendation.id);
          }
          setDialogOpen(false);
        }}
        onPostpone={() => {
          if (selectedRecommendation) {
            handlePostpone(selectedRecommendation.id);
          }
          setDialogOpen(false);
        }}
        onDismiss={handleDismiss}
      />
    </div>
  );
}