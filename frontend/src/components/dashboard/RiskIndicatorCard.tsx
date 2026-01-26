import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RiskIndicatorCardProps {
  value: number;
  max: number;
  label: string;
  status: string;
  statusColor: string;
  icon: string;
  showProgressBar?: boolean;
  recommendation?: string;
}

const RiskIndicatorCard: React.FC<RiskIndicatorCardProps> = ({
  value,
  max,
  label,
  status,
  statusColor,
  icon,
  showProgressBar = true,
  recommendation
}) => {
  const percentage = (value / max) * 100;
  
  // Determine risk color based on percentage
  const getRiskColor = (pct: number): string => {
    if (pct < 25) return '#06b6d4'; // Cyan - Very low
    if (pct < 45) return '#10b981'; // Green - Low
    if (pct < 65) return '#fbbf24'; // Yellow - Moderate
    if (pct < 85) return '#f59e0b'; // Orange - High
    return '#ef4444'; // Red - Very high
  };
  
  const progressColor = getRiskColor(percentage);
  
  return (
    <Card className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        </div>
      </div>
      
      {/* Value and status */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-3xl font-bold text-gray-900">
            {value.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">de {max.toFixed(1)}</div>
        </div>
        <Badge 
          className="text-xs"
          style={{ 
            backgroundColor: `${statusColor}20`, 
            color: statusColor,
            border: `1px solid ${statusColor}40`
          }}
        >
          {status}
        </Badge>
      </div>
      
      {/* Progress bar */}
      {showProgressBar && (
        <div className="mb-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, percentage)}%`,
                backgroundColor: progressColor
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Bajo</span>
            <span>Moderado</span>
            <span>Alto</span>
          </div>
        </div>
      )}
      
      {/* Recommendation */}
      {recommendation && (
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>💡</strong> {recommendation}
          </p>
        </div>
      )}
    </Card>
  );
};

export default RiskIndicatorCard;