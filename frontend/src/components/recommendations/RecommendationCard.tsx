import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Eye, Clock } from 'lucide-react';

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

interface RecommendationCardProps {
  recommendation: Recommendation;
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  onMarkComplete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onPostpone?: (id: string) => void;
}

const priorityConfig = {
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-l-red-500',
    badge: 'destructive' as const,
    label: 'CRÍTICA',
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-l-orange-500',
    badge: 'destructive' as const,
    label: 'ALTA',
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-l-yellow-500',
    badge: 'default' as const,
    label: 'MEDIA',
  },
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-l-green-500',
    badge: 'secondary' as const,
    label: 'BAJA',
  },
};

const categoryLabels: Record<string, string> = {
  cardiovascular: '❤️ Cardiovascular',
  stress_management: '🧘 Manejo del Estrés',
  body_composition: '⚖️ Composición Corporal',
  recovery: '😴 Recuperación',
  physical_health: '💪 Salud Física',
  mental_health: '🧠 Salud Mental',
  lifestyle: '✨ Estilo de Vida',
  nutrition: '🍎 Nutrición',
  sleep: '🌙 Sueño',
};

export default function RecommendationCard({
  recommendation,
  status = 'pending',
  onMarkComplete,
  onViewDetails,
  onPostpone,
}: RecommendationCardProps) {
  const config = priorityConfig[recommendation.priority];
  const isCompleted = status === 'completed';

  return (
    <Card className={`border-l-4 ${config.border} ${isCompleted ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={config.badge}>{config.label}</Badge>
          <Badge variant="outline">
            {categoryLabels[recommendation.category] || recommendation.category}
          </Badge>
        </div>
        <CardTitle className="text-lg flex items-center gap-2">
          {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
          {recommendation.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>

        {/* Action items preview */}
        {recommendation.action_items && recommendation.action_items.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Acciones sugeridas:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {recommendation.action_items.slice(0, 2).map((item, i) => (
                <li key={i} className="text-gray-700">
                  {item}
                </li>
              ))}
              {recommendation.action_items.length > 2 && (
                <li className="text-blue-600 font-medium">
                  +{recommendation.action_items.length - 2} más...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Urgency */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Clock className="w-4 h-4" />
          <span>{recommendation.urgency_text}</span>
        </div>

        {/* Related metrics */}
        {recommendation.related_metrics && recommendation.related_metrics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recommendation.related_metrics.map((metric) => (
              <Badge key={metric} variant="secondary" className="text-xs">
                {metric}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="default" size="sm" onClick={() => onViewDetails(recommendation.id)}>
          <Eye className="w-4 h-4 mr-1" />
          Ver detalles
        </Button>
        {!isCompleted && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkComplete(recommendation.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Completar
            </Button>
            {onPostpone && (
              <Button variant="ghost" size="sm" onClick={() => onPostpone(recommendation.id)}>
                Posponer
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}