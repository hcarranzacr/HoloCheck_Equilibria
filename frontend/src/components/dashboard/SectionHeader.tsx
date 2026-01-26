import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SectionHeaderProps {
  title: string;
  description: string;
  metricCount: number;
  icon: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  metricCount,
  icon
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {metricCount} métricas
        </Badge>
      </div>
      <Separator className="mt-4" />
    </div>
  );
};

export default SectionHeader;