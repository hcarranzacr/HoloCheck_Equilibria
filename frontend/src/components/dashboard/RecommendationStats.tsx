import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface RecommendationStatsProps {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export default function RecommendationStats({
  total,
  completed,
  pending,
  completionRate,
}: RecommendationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white rounded-xl shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Total Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <p className="text-xs text-gray-500 mt-1">Generadas para ti</p>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Completadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{completed}</div>
          <p className="text-xs text-gray-500 mt-1">
            {total > 0 ? Math.round((completed / total) * 100) : 0}% del total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">{pending}</div>
          <p className="text-xs text-gray-500 mt-1">Por completar</p>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Tasa de Cumplimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {completionRate.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}