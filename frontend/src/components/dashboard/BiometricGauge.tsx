import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { evaluateRange } from '@/lib/biometric-range-evaluator';

interface BiometricGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  status?: string;
  statusColor?: string;
  description?: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  gradientColors?: string[];
  showRecommendation?: boolean;
  recommendation?: string;
  showRanges?: boolean;
  ranges?: Array<{
    min: number;
    max: number;
    label: string;
    color: string;
  }>;
  className?: string;
  // NEW PROPS for dynamic color evaluation
  riskRanges?: Record<string, [number, number]> | null;
  indicatorCode?: string;
}

const BiometricGauge: React.FC<BiometricGaugeProps> = ({
  value,
  min,
  max,
  unit,
  label,
  status,
  statusColor,
  description,
  icon,
  size = 'medium',
  gradientColors,
  showRecommendation = false,
  recommendation,
  showRanges = false,
  ranges = [],
  className = '',
  riskRanges,
  indicatorCode
}) => {
  // Validate and sanitize inputs
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const safeMin = typeof min === 'number' && !isNaN(min) ? min : 0;
  const safeMax = typeof max === 'number' && !isNaN(max) ? max : 100;
  
  // Evaluate range dynamically if riskRanges provided
  const evaluation = riskRanges 
    ? evaluateRange(safeValue, riskRanges, indicatorCode)
    : null;
  
  // Use evaluated color and status, or fall back to props
  const finalStatusColor = evaluation?.color || statusColor || '#10b981';
  const finalStatus = evaluation ? `${evaluation.emoji} ${evaluation.level}` : (status || 'Normal');
  const finalRangeLabel = evaluation?.rangeLabel || '';
  
  // Determine gradient colors based on evaluation
  let finalGradientColors = gradientColors;
  if (!finalGradientColors && evaluation) {
    // Use single color for gradient based on evaluation
    finalGradientColors = [evaluation.color, evaluation.color];
  }
  if (!finalGradientColors) {
    finalGradientColors = ['#10b981', '#06b6d4']; // Default
  }
  
  const safeGradientColors = Array.isArray(finalGradientColors) && finalGradientColors.length > 0 
    ? finalGradientColors 
    : ['#10b981', '#06b6d4'];
  
  // Calculate percentage for gauge
  const percentage = Math.min(100, Math.max(0, ((safeValue - safeMin) / (safeMax - safeMin)) * 100));
  
  // Size classes for gauge
  const sizeClasses = {
    small: 'w-32 h-16',
    medium: 'w-40 h-20',
    large: 'w-48 h-24'
  };
  
  // Generate unique ID for gradient
  const gradientId = `gradient-${label.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`;
  
  // Calculate angle for indicator (180 degrees = semicircle)
  const angle = (percentage / 100) * 180;
  const radians = (angle * Math.PI) / 180;
  const indicatorX = 50 + 40 * Math.cos(Math.PI - radians);
  const indicatorY = 50 - 40 * Math.sin(Math.PI - radians);
  
  // Format value display
  const formatValue = (val: number): string => {
    if (val < 10) return val.toFixed(2);
    if (val < 100) return val.toFixed(1);
    return Math.round(val).toString();
  };
  
  return (
    <Card className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow ${className}`}>
      {/* Header with icon and label */}
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
      </div>
      
      {/* Gauge semicircular */}
      <div className="flex items-center justify-center mb-4">
        <div className={`relative ${sizeClasses[size]}`}>
          <svg viewBox="0 0 100 50" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                {safeGradientColors.map((color, index) => (
                  <stop
                    key={index}
                    offset={`${(index / (safeGradientColors.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </linearGradient>
            </defs>
            
            {/* Colored arc based on value */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 125.66} 125.66`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            
            {/* Current position indicator */}
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r="4"
              fill={finalStatusColor}
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      
      {/* Value and unit */}
      <div className="text-center mb-2">
        <div className="text-5xl font-bold text-gray-900">
          {formatValue(safeValue)}
        </div>
        <div className="text-sm font-medium text-gray-500 mt-1">{unit}</div>
      </div>
      
      {/* Status badge with range */}
      <div className="text-center mb-3">
        <Badge 
          className="text-sm px-3 py-1"
          style={{ 
            backgroundColor: `${finalStatusColor}20`, 
            color: finalStatusColor,
            border: `1px solid ${finalStatusColor}40`
          }}
        >
          {finalStatus}
        </Badge>
        {finalRangeLabel && finalRangeLabel !== 'N/D' && (
          <p className="text-xs text-gray-500 mt-1">Rango: {finalRangeLabel}</p>
        )}
        {description && (
          <p className="text-xs text-gray-600 mt-2">{description}</p>
        )}
      </div>
      
      {/* Optional ranges display */}
      {showRanges && ranges.length > 0 && (
        <div className="mt-4 space-y-1 text-xs text-gray-600">
          {ranges.map((range, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: range.color }}
                ></div>
                {range.label}
              </span>
              <span className="font-medium">
                {range.min} - {range.max}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Optional recommendation */}
      {showRecommendation && recommendation && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>💡 Recomendación:</strong> {recommendation}
          </p>
        </div>
      )}
    </Card>
  );
};

export default BiometricGauge;