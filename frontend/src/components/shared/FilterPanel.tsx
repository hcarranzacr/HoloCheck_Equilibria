import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

export type FilterValues = Record<string, any>;

interface FilterPanelProps {
  filters: FilterConfig[];
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
  values?: FilterValues;
}

export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  values = {}
}: FilterPanelProps) {
  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900">Filtros</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="w-4 h-4 mr-1" />
          Limpiar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {filter.label}
            </label>
            
            {filter.type === 'text' && (
              <Input
                placeholder={`Buscar por ${filter.label.toLowerCase()}`}
                value={values[filter.key] || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
              />
            )}

            {filter.type === 'select' && filter.options && (
              <Select
                value={values[filter.key] || ''}
                onValueChange={(value) => onFilterChange(filter.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Seleccionar ${filter.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filter.type === 'number' && (
              <Input
                type="number"
                placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
                value={values[filter.key] || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
              />
            )}

            {filter.type === 'date' && (
              <Input
                type="date"
                value={values[filter.key] || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}