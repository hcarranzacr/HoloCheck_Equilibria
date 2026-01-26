import { useState, useEffect } from 'react';
import { Info, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import BiometricGauge from './BiometricGauge';
import { getIndicatorCode, RISK_LEVEL_COLORS, getRiskLevel } from '@/lib/indicator-mapping';

interface IndicatorInfo {
  id: string;
  indicator_code: string;
  display_name: string;
  unit: string | null;
  min_value: number;
  max_value: number;
  description: string;
  interpretation: string;
  influencing_factors: string;
  tips: string;
  risk_ranges: Record<string, [number, number]>;
  is_clinical: boolean;
}

interface BenefitLink {
  id: string;
  benefit_id: string;
  indicator_code: string;
  relevance_level: string;
  notes: string;
  partner_benefits: {
    title: string;
    benefit_description: string;
  };
}

interface BiometricGaugeWithInfoProps {
  value: number;
  indicatorCode: string;
  label?: string;
  className?: string;
}

export default function BiometricGaugeWithInfo({
  value,
  indicatorCode,
  label,
  className,
}: BiometricGaugeWithInfoProps) {
  const [indicatorInfo, setIndicatorInfo] = useState<IndicatorInfo | null>(null);
  const [benefitLinks, setBenefitLinks] = useState<BenefitLink[]>([]);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isBenefitsDialogOpen, setIsBenefitsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [indicatorCode]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [BiometricGaugeWithInfo] Loading indicator:', indicatorCode);
      
      const code = getIndicatorCode(indicatorCode);
      console.log('🔍 [BiometricGaugeWithInfo] Mapped code:', code);
      
      // Load indicator info
      const { data: infoData, error: fetchError } = await supabase
        .from('param_biometric_indicators_info')
        .select('*')
        .eq('indicator_code', code)
        .single();

      if (fetchError) {
        console.error('❌ [BiometricGaugeWithInfo] Error loading indicator info:', fetchError);
        setError(fetchError.message);
        return;
      }

      console.log('✅ [BiometricGaugeWithInfo] Indicator data loaded:', infoData);
      setIndicatorInfo(infoData);

      // Load benefit links for this indicator
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Get user's organization
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Load benefit links
      const { data: benefitsData, error: benefitsError } = await supabase
        .from('organization_benefit_indicator_links')
        .select(`
          *,
          partner_benefits:benefit_id (
            title,
            benefit_description
          )
        `)
        .eq('organization_id', profile.organization_id)
        .eq('indicator_code', code);

      if (benefitsError) {
        console.error('Error loading benefits:', benefitsError);
      } else {
        console.log('✅ [BiometricGaugeWithInfo] Benefits loaded:', benefitsData);
        setBenefitLinks(benefitsData || []);
      }
    } catch (err: any) {
      console.error('❌ [BiometricGaugeWithInfo] Exception:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  // Validate value
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  
  console.log('🔍 [BiometricGaugeWithInfo] Render:', {
    value: safeValue,
    indicatorCode,
    loading,
    hasIndicatorInfo: !!indicatorInfo,
    hasBenefits: benefitLinks.length > 0,
    error
  });

  if (loading || !indicatorInfo) {
    return (
      <BiometricGauge
        value={safeValue}
        label={label || indicatorCode}
        unit=""
        min={0}
        max={100}
        className={className}
      />
    );
  }

  const currentRiskLevel = getRiskLevel(safeValue, indicatorInfo.risk_ranges || {});
  const riskColor = RISK_LEVEL_COLORS[currentRiskLevel] || RISK_LEVEL_COLORS.normal;
  const hasBenefits = benefitLinks.length > 0;

  return (
    <div className="relative">
      <BiometricGauge
        value={safeValue}
        label={label || indicatorInfo.display_name}
        unit={indicatorInfo.unit || ''}
        min={indicatorInfo.min_value}
        max={indicatorInfo.max_value}
        className={className}
      />
      
      {/* Benefits Star Button (if benefits exist) */}
      {hasBenefits && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-10 h-6 w-6 p-0 rounded-full hover:bg-amber-100"
          onClick={() => setIsBenefitsDialogOpen(true)}
        >
          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
        </Button>
      )}

      {/* Info Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full hover:bg-slate-100"
        onClick={() => setIsInfoDialogOpen(true)}
      >
        <Info className="h-4 w-4 text-slate-500" />
      </Button>

      {/* Benefits Dialog */}
      <Dialog open={isBenefitsDialogOpen} onOpenChange={setIsBenefitsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              Beneficios Asociados
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Los siguientes beneficios están relacionados con el indicador <strong>{indicatorInfo.display_name}</strong>:
            </p>

            {benefitLinks.map((link) => (
              <div
                key={link.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    {link.partner_benefits?.title || 'Beneficio'}
                  </h3>
                  <Badge
                    variant={
                      link.relevance_level === 'alto'
                        ? 'destructive'
                        : link.relevance_level === 'moderado'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {link.relevance_level}
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  {link.partner_benefits?.benefit_description || 'Sin descripción disponible'}
                </p>

                {link.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                    <strong>Nota:</strong> {link.notes}
                  </div>
                )}
              </div>
            ))}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span className="text-amber-900">
                  Puedes ver el beneficio detallado haciendo clic en la <strong>estrella de beneficios</strong> en el dashboard principal.
                </span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Information Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                {indicatorInfo.display_name}
              </DialogTitle>
              {indicatorInfo.is_clinical && (
                <Badge 
                  style={{ 
                    backgroundColor: '#dbeafe', 
                    color: '#1e40af',
                    border: '1px solid #93c5fd'
                  }}
                >
                  Clínico
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Current Value Section */}
            <div 
              className="p-4 rounded-lg border-2"
              style={{
                backgroundColor: riskColor.bg,
                borderColor: riskColor.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium" style={{ color: riskColor.text }}>
                    Valor Actual
                  </div>
                  <div className="text-3xl font-bold mt-1" style={{ color: riskColor.text }}>
                    {safeValue.toFixed(1)} {indicatorInfo.unit || ''}
                  </div>
                </div>
                <Badge
                  style={{
                    backgroundColor: riskColor.bg,
                    color: riskColor.text,
                    border: `2px solid ${riskColor.border}`,
                    fontSize: '14px',
                    padding: '6px 12px',
                  }}
                >
                  {currentRiskLevel.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-blue-600">📊</span>
                ¿Qué significa?
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {indicatorInfo.description}
              </p>
            </div>

            {/* Interpretation */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-purple-600">🔍</span>
                Interpretación general
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {indicatorInfo.interpretation}
              </p>
            </div>

            {/* Influencing Factors */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-orange-600">⚙️</span>
                ¿De qué depende?
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {indicatorInfo.influencing_factors}
              </p>
            </div>

            {/* Tips */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd' }}
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-blue-600">💡</span>
                Tip de uso
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {indicatorInfo.tips}
              </p>
            </div>

            {/* Risk Ranges */}
            {indicatorInfo.risk_ranges && typeof indicatorInfo.risk_ranges === 'object' && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-green-600">📏</span>
                  Rangos de referencia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(indicatorInfo.risk_ranges)
                    .sort((a, b) => {
                      const rangeA = a[1];
                      const rangeB = b[1];
                      if (!Array.isArray(rangeA) || rangeA.length !== 2) return 1;
                      if (!Array.isArray(rangeB) || rangeB.length !== 2) return -1;
                      return rangeA[0] - rangeB[0];
                    })
                    .map(([level, range]: [string, any]) => {
                      if (!Array.isArray(range) || range.length !== 2) {
                        console.warn(`❌ Invalid range for ${level}:`, range);
                        return null;
                      }
                      
                      const [min, max] = range;
                      
                      if (typeof min !== 'number' || typeof max !== 'number') {
                        console.warn(`❌ Invalid range values for ${level}:`, { min, max });
                        return null;
                      }
                      
                      const color = RISK_LEVEL_COLORS[level] || RISK_LEVEL_COLORS.normal;
                      
                      return (
                        <div
                          key={level}
                          className="p-3 rounded-lg border-2 flex items-center justify-between"
                          style={{
                            backgroundColor: color.bg,
                            borderColor: color.border,
                          }}
                        >
                          <span 
                            className="font-medium capitalize"
                            style={{ color: color.text }}
                          >
                            {level.replace('_', ' ')}
                          </span>
                          <span 
                            className="font-semibold"
                            style={{ color: color.text }}
                          >
                            {min} - {max} {indicatorInfo.unit || ''}
                          </span>
                        </div>
                      );
                    })
                    .filter(Boolean)}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="text-xs text-slate-500 italic border-t pt-4">
              <p>
                <strong>Nota:</strong> Esta información es orientativa y no sustituye el consejo médico profesional. 
                Ante cualquier duda o síntoma, consulta con un profesional de la salud.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}