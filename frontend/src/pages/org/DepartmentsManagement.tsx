// @ts-nocheck
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export default function OrgDepartments() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      setLoading(true);
      
      // Get current user from backend
      const user = await apiClient.auth.me();
      if (!user) return;

      // Get user's organization_id from their profile
      const profileResponse = await apiClient.userProfiles.list({
        query: JSON.stringify({ user_id: user.id }),
        limit: 1
      });

      const profile = profileResponse?.items?.[0];
      if (!profile?.organization_id) return;
      
      setOrganizationId(profile.organization_id);

      // Get departments for the organization
      const response = await apiClient.departments.listAll({
        query: JSON.stringify({ organization_id: profile.organization_id }),
        sort: 'name'
      });

      setDepartments(response.items || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los departamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.name) {
        toast({
          title: 'Error',
          description: 'El nombre es requerido',
          variant: 'destructive',
        });
        return;
      }

      if (editingDept) {
        await apiClient.departments.update(editingDept.id, {
          name: formData.name,
          description: formData.description,
        });

        toast({
          title: 'Éxito',
          description: 'Departamento actualizado correctamente',
        });
      } else {
        await apiClient.departments.create({
          organization_id: organizationId,
          name: formData.name,
          description: formData.description,
          is_active: true,
        });

        toast({
          title: 'Éxito',
          description: 'Departamento creado correctamente',
        });
      }

      setShowDialog(false);
      setEditingDept(null);
      setFormData({ name: '', description: '' });
      loadDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el departamento',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(deptId: string) {
    if (!confirm('¿Estás seguro de eliminar este departamento?')) return;

    try {
      await apiClient.departments.update(deptId, { is_active: false });

      toast({
        title: 'Éxito',
        description: 'Departamento eliminado correctamente',
      });
      loadDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el departamento',
        variant: 'destructive',
      });
    }
  }

  function openEditDialog(dept: Department) {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
    });
    setShowDialog(true);
  }

  function openCreateDialog() {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setShowDialog(true);
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Departamentos</h1>
          <p className="text-slate-600 mt-2">Gestiona los departamentos de tu organización</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Departamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
          <CardDescription>
            {filteredDepartments.length} departamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar departamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500">
                      No se encontraron departamentos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.description || '-'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dept.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {dept.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(dept)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(dept.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}</DialogTitle>
            <DialogDescription>
              {editingDept ? 'Modifica los datos del departamento' : 'Agrega un nuevo departamento'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}