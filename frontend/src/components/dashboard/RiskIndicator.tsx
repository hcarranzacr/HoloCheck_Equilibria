import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface RiskIndicatorProps {
  level: 'low' | 'medium' | 'high';
  label: string;
  value?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskIndicator({
  level,
  label,
  value,
  showIcon = true,
  size = 'md'
}: RiskIndicatorProps) {
  const config = {
    low: {
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
      text: 'Bajo'
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: AlertTriangle,
      text: 'Moderado'
    },
    high: {
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: AlertCircle,
      text: 'Alto'
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const Icon = config[level].icon;

  return (
    <div className="inline-flex items-center gap-2">
      <Badge
        variant="outline"
        className={`${config[level].color} ${sizeClasses[size]} font-medium border`}
      >
        {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
        {label}: {config[level].text}
        {value !== undefined && ` (${value}%)`}
      </Badge>
    </div>
  );
}

// Utility function to determine risk level from value
export function getRiskLevel(value: number, thresholds: { low: number; medium: number }): 'low' | 'medium' | 'high' {
  if (value <= thresholds.low) return 'low';
  if (value <= thresholds.medium) return 'medium';
  return 'high';
}