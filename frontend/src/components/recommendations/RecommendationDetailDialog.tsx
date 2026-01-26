import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';

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

interface PartnerBenefit {
  id: string;
  partner_name: string;
  partner_logo_url: string;
  title: string;
  benefit_description: string;
  link_url: string;
}

interface RecommendationDetailDialogProps {
  recommendation: Recommendation | null;
  currentMetrics: Record<string, number>;
  partnerBenefits: PartnerBenefit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkComplete: () => void;
  onPostpone: () => void;
  onDismiss: () => void;
}

const priorityConfig = {
  critical: {
    badge: 'destructive' as const,
    label: 'CRÍTICA',
  },
  high: {
    badge: 'destructive' as const,
    label: 'ALTA',
  },
  medium: {
    badge: 'default' as const,
    label: 'MEDIA',
  },
  low: {
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

export default function RecommendationDetailDialog({
  recommendation,
  currentMetrics,
  partnerBenefits,
  open,
  onOpenChange,
  onMarkComplete,
  onPostpone,
  onDismiss,
}: RecommendationDetailDialogProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!recommendation) return null;

  const config = priorityConfig[recommendation.priority];

  const handleCheckItem = (index: number, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [index]: checked }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={config.badge}>{config.label}</Badge>
            <Badge variant="outline">
              {categoryLabels[recommendation.category] || recommendation.category}
            </Badge>
          </div>
          <DialogTitle className="text-2xl">{recommendation.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">¿Por qué es importante?</h3>
            <p className="text-sm text-gray-700">{recommendation.description}</p>
          </div>

          {/* Action items */}
          {recommendation.action_items && recommendation.action_items.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Pasos a seguir:</h3>
              <ol className="space-y-3">
                {recommendation.action_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Checkbox
                      checked={checkedItems[i] || false}
                      onCheckedChange={(checked) => handleCheckItem(i, checked as boolean)}
                    />
                    <span className="text-sm flex-1">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Related metrics */}
          {recommendation.related_metrics && recommendation.related_metrics.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Indicadores relacionados:</h3>
              <div className="grid grid-cols-2 gap-4">
                {recommendation.related_metrics.map((metric) => (
                  <BiometricGaugeWithInfo
                    key={metric}
                    value={currentMetrics[metric] || 0}
                    indicatorCode={metric}
                    label={metric}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Partner benefits */}
          {partnerBenefits && partnerBenefits.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Beneficios disponibles:</h3>
              <div className="space-y-3">
                {partnerBenefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {benefit.partner_logo_url && (
                        <img
                          src={benefit.partner_logo_url}
                          alt={benefit.partner_name}
                          className="w-12 h-12 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{benefit.title}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          {benefit.benefit_description}
                        </p>
                        {benefit.link_url && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() => window.open(benefit.link_url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Ver beneficio
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Urgency */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Plazo sugerido:</span>
              <span>{recommendation.urgency_text}</span>
            </div>
          </div>

          {/* Impact */}
          <div>
            <h3 className="font-semibold mb-2">Impacto esperado:</h3>
            <Progress value={recommendation.impact_score * 10} className="h-2 mb-2" />
            <p className="text-sm text-gray-600">
              {recommendation.impact_score >= 8
                ? 'Impacto alto en tu bienestar general'
                : recommendation.impact_score >= 6
                ? 'Impacto moderado en tu bienestar'
                : 'Impacto bajo pero beneficioso'}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onDismiss}>
            No es para mí
          </Button>
          <Button variant="secondary" onClick={onPostpone}>
            Recordar después
          </Button>
          <Button onClick={onMarkComplete}>Marcar como completada</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}