import { useState, useEffect } from 'react';
import { Info, Star } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
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
  indicator_codes?: string[];
  all_notes?: string[];
  partner_benefits: {
    title: string;
    benefit_description: string;
    how_to_use: string;
    link_url: string;
    image_url: string;
    tags: string[];
  };
}

interface BiometricGaugeWithInfoProps {
  value: number;
  indicatorCode: string;
  title?: string;
  label?: string;
  className?: string;
  riskRanges?: Record<string, [number, number]> | null;
  icon?: React.ReactElement;
}

export default function BiometricGaugeWithInfo({
  value,
  indicatorCode,
  title,
  label,
  className,
  riskRanges,
  icon,
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
      
      // Load indicator info via apiClient
      const infoData = await apiClient.getBiometricIndicatorInfo(code);
      
      if (!infoData) {
        console.error('❌ [BiometricGaugeWithInfo] Error loading indicator info');
        setError('Failed to load indicator info');
        return;
      }

      console.log('✅ [BiometricGaugeWithInfo] Indicator data loaded:', infoData);
      setIndicatorInfo(infoData as any);

      // Load benefit links for this indicator via apiClient
      const user = await apiClient.getCurrentUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Get user's organization via apiClient
      const profileResponse = await apiClient.userProfiles.query({
        query: { user_id: user.id },
        limit: 1,
      });

      const profile = profileResponse.items?.[0];
      if (!profile?.organization_id) {
        console.error('Error loading profile');
        return;
      }

      // Load benefit links via apiClient
      try {
        const benefitsResponse = await apiClient.call(
          `/api/v1/organization-benefit-indicator-links?organization_id=${profile.organization_id}&indicator_code=${code}`,
          'GET'
        );
        
        console.log('✅ [BiometricGaugeWithInfo] Raw benefits loaded:', benefitsResponse);
        
        // Deduplicate by benefit_id
        const uniqueBenefitsMap = new Map<string, BenefitLink>();
        benefitsResponse?.forEach((item: any) => {
          if (!uniqueBenefitsMap.has(item.benefit_id)) {
            uniqueBenefitsMap.set(item.benefit_id, {
              ...item,
              indicator_codes: [item.indicator_code],
              all_notes: item.notes ? [item.notes] : []
            });
          } else {
            // Add additional indicator codes and notes
            const existing = uniqueBenefitsMap.get(item.benefit_id)!;
            if (!existing.indicator_codes?.includes(item.indicator_code)) {
              existing.indicator_codes?.push(item.indicator_code);
            }
            if (item.notes && !existing.all_notes?.includes(item.notes)) {
              existing.all_notes?.push(item.notes);
            }
          }
        });
        
        const uniqueBenefits = Array.from(uniqueBenefitsMap.values());
        console.log('✅ [BiometricGaugeWithInfo] Deduplicated benefits:', uniqueBenefits.length, 'unique benefits');
        setBenefitLinks(uniqueBenefits);
      } catch (benefitsError) {
        console.error('Error loading benefits:', benefitsError);
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
        label={label || title || indicatorCode}
        unit=""
        min={0}
        max={100}
        className={className}
        riskRanges={riskRanges}
        indicatorCode={indicatorCode}
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
        label={label || title || indicatorInfo.display_name}
        unit={indicatorInfo.unit || ''}
        min={indicatorInfo.min_value}
        max={indicatorInfo.max_value}
        className={className}
        riskRanges={riskRanges || indicatorInfo.risk_ranges}
        indicatorCode={indicatorCode}
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
              Beneficios Recomendados
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Basado en tu indicador <strong>{indicatorInfo.display_name}</strong>, te recomendamos los siguientes beneficios:
            </p>

            {benefitLinks.map((link) => (
              <div
                key={link.benefit_id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Benefit Image */}
                {link.partner_benefits?.image_url && (
                  <div className="w-full h-48 bg-gray-100">
                    <img
                      src={link.partner_benefits.image_url}
                      alt={link.partner_benefits.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="p-4">
                  {/* Title and Relevance Badge */}
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

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-3">
                    {link.partner_benefits?.benefit_description || 'Sin descripción disponible'}
                  </p>

                  {/* How to Use */}
                  {link.partner_benefits?.how_to_use && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm">
                      <strong className="text-blue-900">Cómo usar:</strong>
                      <p className="text-blue-800 mt-1">{link.partner_benefits.how_to_use}</p>
                    </div>
                  )}

                  {/* Notes - show all notes if multiple indicators */}
                  {link.all_notes && link.all_notes.length > 0 && link.all_notes.some(n => n) && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-3 text-sm">
                      <strong className="text-amber-900">Notas:</strong>
                      {link.all_notes.filter(n => n).map((note, idx) => (
                        <p key={idx} className="text-amber-800 mt-1">• {note}</p>
                      ))}
                    </div>
                  )}

                  {/* Show which indicators trigger this benefit */}
                  {link.indicator_codes && link.indicator_codes.length > 1 && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-3 text-sm">
                      <strong className="text-purple-900">También recomendado para:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {link.indicator_codes.map((code, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {link.partner_benefits?.tags && link.partner_benefits.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {link.partner_benefits.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Link Button */}
                  {link.partner_benefits?.link_url && (
                    <a
                      href={link.partner_benefits.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Acceder al beneficio →
                    </a>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span className="text-green-900">
                  Estos beneficios están personalizados según tus indicadores de salud. Aprovecha estas oportunidades para mejorar tu bienestar.
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