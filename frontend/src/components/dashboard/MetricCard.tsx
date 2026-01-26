import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  description?: string;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  loading?: boolean;
  unit?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  status = 'neutral',
  loading,
  unit
}: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    neutral: 'bg-sky-100 text-sky-600'
  };

  const valueColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    neutral: 'text-slate-900'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend.direction === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.direction === 'up') return 'text-green-600';
    if (trend.direction === 'down') return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${valueColors[status]}`}>
                {value}
              </p>
              {unit && (
                <span className="text-sm text-slate-500 font-medium">{unit}</span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-xs font-medium">
                  {Math.abs(trend.value)}% vs anterior
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className={`w-12 h-12 rounded-full ${statusColors[status]} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}