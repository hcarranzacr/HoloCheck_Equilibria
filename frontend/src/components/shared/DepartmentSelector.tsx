import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { departmentsAPI } from '@/lib/supabase-admin';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { Loader2 } from 'lucide-react';

interface DepartmentSelectorProps {
  organizationId: string;
  value?: string;
  onChange: (departmentId: string) => void;
  allowMultiple?: boolean;
  showHierarchy?: boolean;
  placeholder?: string;
}

export function DepartmentSelector({
  organizationId,
  value,
  onChange,
  placeholder = 'Seleccionar departamento'
}: DepartmentSelectorProps) {
  const { data: departments, loading } = useSupabaseQuery(
    () => departmentsAPI.getAll(organizationId),
    [organizationId]
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-slate-600">Cargando departamentos...</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(departments || []).map((dept) => (
          <SelectItem key={dept.id} value={dept.id}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}