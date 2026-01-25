import { MetricCard } from './MetricCard';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  loading?: boolean;
}

interface StatsGridProps {
  stats: MetricCardProps[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
}

export function StatsGrid({ stats, columns = 4, loading }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {stats.map((stat, index) => (
        <MetricCard key={index} {...stat} loading={loading} />
      ))}
    </div>
  );
}