import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface RecommendationFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priorities: string[];
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  statuses: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categoryLabels: Record<string, string> = {
  all: 'Todas las categorías',
  cardiovascular: '❤️ Cardiovascular',
  stress_management: '🧘 Manejo del Estrés',
  body_composition: '⚖️ Composición Corporal',
  recovery: '😴 Recuperación',
  physical_health: '💪 Salud Física',
  mental_health: '🧠 Salud Mental',
  lifestyle: '✨ Estilo de Vida',
  nutrition: '🍎 Nutrición',
  sleep: '🌙 Sueño',
};

const priorityLabels: Record<string, string> = {
  all: 'Todas las prioridades',
  critical: '🔴 Crítica',
  high: '🟠 Alta',
  medium: '🟡 Media',
  low: '🟢 Baja',
};

const statusLabels: Record<string, string> = {
  all: 'Todos los estados',
  pending: '⏳ Pendiente',
  in_progress: '🔄 En progreso',
  completed: '✅ Completada',
  dismissed: '❌ Descartada',
};

export default function RecommendationFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priorities,
  selectedPriority,
  onPriorityChange,
  statuses,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: RecommendationFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Category filter */}
      <div>
        <Label htmlFor="category-filter" className="text-sm font-medium mb-2 block">
          Categoría
        </Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger id="category-filter">
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat] || cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Priority filter */}
      <div>
        <Label htmlFor="priority-filter" className="text-sm font-medium mb-2 block">
          Prioridad
        </Label>
        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger id="priority-filter">
            <SelectValue placeholder="Seleccionar prioridad" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priorityLabels[priority] || priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status filter */}
      <div>
        <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">
          Estado
        </Label>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status] || status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div>
        <Label htmlFor="search-filter" className="text-sm font-medium mb-2 block">
          Buscar
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search-filter"
            type="text"
            placeholder="Buscar recomendaciones..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}