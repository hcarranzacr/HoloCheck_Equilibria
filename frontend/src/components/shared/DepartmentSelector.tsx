import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
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
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, [organizationId]);

  async function loadDepartments() {
    try {
      setLoading(true);
      const response = await apiClient.departments.list();
      setDepartments(response.data.items || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }

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