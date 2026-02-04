import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
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
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  organization_name?: string;
}

interface Organization {
  id: string;
  name: string;
}

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    organization_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      console.log('🔍 Loading departments and organizations via apiClient...');

      // Load organizations via apiClient
      const orgsResponse = await apiClient.organizations.list({ limit: 100, sort: 'name' });
      const orgsData = orgsResponse.items || [];
      console.log('✅ Loaded', orgsData.length, 'organizations');
      setOrganizations(orgsData);

      // Load ALL departments via apiClient
      const deptsResponse = await apiClient.departments.listAll({ limit: 1000, sort: '-created_at' });
      const deptsData = deptsResponse.items || [];
      
      // Map organization names to departments
      const deptsWithOrgNames = deptsData.map((dept: any) => ({
        ...dept,
        organization_name: orgsData.find((org: any) => org.id === dept.organization_id)?.name || 'Unknown'
      }));

      console.log('✅ Loaded', deptsWithOrgNames.length, 'departments');
      setDepartments(deptsWithOrgNames);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!formData.name || !formData.organization_id) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await apiClient.departments.create(formData);
      toast.success('Departamento creado exitosamente');
      
      // Log audit
      await apiClient.logAudit('CREATE', 'departments', undefined, {
        name: formData.name,
        organization_id: formData.organization_id,
      });
      
      setIsCreateOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating department:', error);
      toast.error('Error al crear departamento: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleUpdate() {
    if (!selectedDept || !formData.name || !formData.organization_id) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await apiClient.departments.update(selectedDept.id, formData);
      toast.success('Departamento actualizado exitosamente');
      
      // Log audit
      await apiClient.logAudit('UPDATE', 'departments', selectedDept.id, {
        name: formData.name,
        organization_id: formData.organization_id,
      });
      
      setIsEditOpen(false);
      setSelectedDept(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error updating department:', error);
      toast.error('Error al actualizar departamento: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Estás seguro de eliminar el departamento "${name}"?`)) {
      return;
    }

    try {
      await apiClient.departments.delete(id);
      toast.success('Departamento eliminado exitosamente');
      
      // Log audit
      await apiClient.logAudit('DELETE', 'departments', id, { name });
      
      loadData();
    } catch (error: any) {
      console.error('Error deleting department:', error);
      toast.error('Error al eliminar departamento: ' + (error.response?.data?.detail || error.message));
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      organization_id: '',
    });
  };

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      organization_id: dept.organization_id,
    });
    setIsEditOpen(true);
  };

  // Filter departments
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = filterOrg === 'all' || dept.organization_id === filterOrg;
    return matchesSearch && matchesOrg;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Departamentos</h1>
          <p className="text-slate-600 mt-1">Administra todos los departamentos del sistema</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
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
                <Label>Nombre *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del departamento"
                />
              </div>
              <div>
                <Label>Organización *</Label>
                <Select
                  value={formData.organization_id}
                  onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar organización" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreate}
                disabled={!formData.name || !formData.organization_id}
              >
                Crear Departamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterOrg} onValueChange={setFilterOrg}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filtrar por organización" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las organizaciones</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Organización</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No se encontraron departamentos
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.organization_name || '-'}</TableCell>
                  <TableCell>{new Date(dept.created_at).toLocaleDateString('es-ES')}</TableCell>
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
                        onClick={() => handleDelete(dept.id, dept.name)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
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
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdate}>
              Actualizar Departamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}