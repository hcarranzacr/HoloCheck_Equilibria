import { Circle } from 'lucide-react';
import type { HealthStatusLevel } from '@/types/health-status';

interface StatusIconProps {
  status: HealthStatusLevel;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusIcon({ status, size = 'md' }: StatusIconProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const colorClasses = {
    green: 'text-green-500 fill-green-500',
    amber: 'text-amber-500 fill-amber-500',
    red: 'text-red-500 fill-red-500',
    grey: 'text-gray-400 fill-gray-400'
  };

  return (
    <Circle 
      className={`${sizeClasses[size]} ${colorClasses[status]}`}
      aria-label={`Status: ${status}`}
    />
  );
}