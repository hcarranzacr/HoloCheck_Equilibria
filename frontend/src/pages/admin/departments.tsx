import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Papa from 'papaparse';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Upload, Download, Pencil, Trash2 } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  organization_id: string;
  leader_id: string | null;
  created_at: string;
  organizations?: { name: string };
  user_profiles?: { full_name: string };
}

export default function AdminDepartments() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    organization_id: '',
    leader_id: '',
  });

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments', searchTerm, filterOrg],
    queryFn: async () => {
      let query = supabase
        .from('departments')
        .select('*, organizations(name), user_profiles(full_name)')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (filterOrg !== 'all') {
        query = query.eq('organization_id', filterOrg);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Department[];
    },
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: leaders = [] } = useQuery({
    queryKey: ['leaders', formData.organization_id],
    queryFn: async () => {
      if (!formData.organization_id) return [];
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('organization_id', formData.organization_id)
        .in('role', ['leader', 'admin_org'])
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!formData.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('departments').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento creado exitosamente');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error al crear departamento: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from('departments')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento actualizado exitosamente');
      setIsEditOpen(false);
      setSelectedDept(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar departamento: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar departamento: ${error.message}`);
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (depts: any[]) => {
      const { error } = await supabase.from('departments').insert(depts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamentos cargados exitosamente');
      setIsBulkUploadOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error en carga masiva: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      organization_id: '',
      leader_id: '',
    });
  };

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      organization_id: dept.organization_id,
      leader_id: dept.leader_id || '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este departamento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validDepts = results.data.filter((row: any) => row.name && row.organization_id);
        if (validDepts.length > 0) {
          bulkUploadMutation.mutate(validDepts);
        } else {
          toast.error('No se encontraron departamentos válidos en el archivo');
        }
      },
      error: (error) => {
        toast.error(`Error al leer archivo: ${error.message}`);
      },
    });
  };

  const downloadTemplate = () => {
    const csv = 'name,organization_id,leader_id\n' +
                'Departamento Ejemplo,org-id,leader-id';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_departamentos.csv';
    a.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Departamentos</h1>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Plantilla CSV
          </Button>
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Carga Masiva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Carga Masiva de Departamentos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sube un archivo CSV con las columnas: name, organization_id, leader_id
                </p>
                <Input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                />
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear Departamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Departamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre del departamento"
                  />
                </div>
                <div>
                  <Label>Organización</Label>
                  <Select
                    value={formData.organization_id}
                    onValueChange={(value) => setFormData({ ...formData, organization_id: value, leader_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar organización" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org: any) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Líder (Opcional)</Label>
                  <Select
                    value={formData.leader_id}
                    onValueChange={(value) => setFormData({ ...formData, leader_id: value })}
                    disabled={!formData.organization_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar líder" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaders.map((leader: any) => (
                        <SelectItem key={leader.id} value={leader.id}>
                          {leader.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={!formData.name || !formData.organization_id}
                >
                  Crear Departamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar departamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterOrg} onValueChange={setFilterOrg}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por organización" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las organizaciones</SelectItem>
            {organizations.map((org: any) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Organización</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No se encontraron departamentos
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.organizations?.name || '-'}</TableCell>
                  <TableCell>{dept.user_profiles?.full_name || 'Sin asignar'}</TableCell>
                  <TableCell>{new Date(dept.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(dept)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Organización</Label>
              <Select
                value={formData.organization_id}
                onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org: any) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Líder</Label>
              <Select
                value={formData.leader_id}
                onValueChange={(value) => setFormData({ ...formData, leader_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leaders.map((leader: any) => (
                    <SelectItem key={leader.id} value={leader.id}>
                      {leader.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() =>
                selectedDept &&
                updateMutation.mutate({ id: selectedDept.id, data: formData })
              }
            >
              Actualizar Departamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}