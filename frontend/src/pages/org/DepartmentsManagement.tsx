import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Pencil, Trash2, RefreshCw, Clock, Building2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  employee_count?: number;
}

export default function DepartmentsManagement() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
  });

  async function loadData() {
    try {
      setLoading(true);
      console.log('📊 [Departments Management] Loading data...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error loading profile:', profileError);
        throw new Error('Error loading user profile');
      }

      // Check if user is org admin
      if (profile.role !== 'admin_org' && profile.role !== 'super_admin') {
        throw new Error('Access denied: Only organization administrators can access this page');
      }

      setOrganizationId(profile.organization_id);

      // Load departments
      const { data: deptsData, error: deptsError } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (deptsError) {
        console.error('❌ Error loading departments:', deptsError);
        throw new Error('Error loading departments');
      }

      // Get employee count for each department
      const departmentsWithCount = await Promise.all(
        (deptsData || []).map(async (dept) => {
          const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id)
            .eq('is_active', true);

          return {
            ...dept,
            employee_count: count || 0,
          };
        })
      );

      setDepartments(departmentsWithCount);
      setLastUpdated(new Date());
      console.log('✅ [Departments Management] Data loaded:', departmentsWithCount.length, 'departments');
    } catch (error: any) {
      console.error('❌ [Departments Management] Error:', error);
      toast.error(error.message || 'Error loading data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 [Departments Management] Manual refresh triggered');
    setRefreshing(true);
    loadData();
  };

  function validateForm(): boolean {
    const errors = {
      name: '',
    };

    if (!formData.name.trim()) {
      errors.name = 'El nombre del departamento es requerido';
    }

    setFormErrors(errors);
    return !errors.name;
  }

  async function handleSave() {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingDept) {
        // Update existing department
        const { error } = await supabase
          .from('departments')
          .update({
            name: formData.name,
            description: formData.description,
          })
          .eq('id', editingDept.id);

        if (error) throw error;

        toast.success('Departamento actualizado correctamente');
      } else {
        // Create new department
        const { error } = await supabase
          .from('departments')
          .insert({
            organization_id: organizationId,
            name: formData.name,
            description: formData.description,
            is_active: true,
          });

        if (error) throw error;

        toast.success('Departamento creado correctamente');
      }

      setShowDialog(false);
      setEditingDept(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving department:', error);
      toast.error(error.message || 'Error al guardar el departamento');
    }
  }

  async function handleDelete() {
    if (!deletingDeptId) return;

    try {
      // Check if department has users
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', deletingDeptId);

      if (count && count > 0) {
        toast.error('No se puede eliminar un departamento con usuarios asignados');
        setShowDeleteDialog(false);
        setDeletingDeptId(null);
        return;
      }

      const { error } = await supabase
        .from('departments')
        .update({ is_active: false })
        .eq('id', deletingDeptId);

      if (error) throw error;

      toast.success('Departamento eliminado correctamente');
      setShowDeleteDialog(false);
      setDeletingDeptId(null);
      loadData();
    } catch (error: any) {
      console.error('Error deleting department:', error);
      toast.error(error.message || 'Error al eliminar el departamento');
    }
  }

  function openEditDialog(dept: Department) {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
    });
    setFormErrors({ name: '' });
    setShowDialog(true);
  }

  function openCreateDialog() {
    setEditingDept(null);
    resetForm();
    setFormErrors({ name: '' });
    setShowDialog(true);
  }

  function openDeleteDialog(deptId: string) {
    setDeletingDeptId(deptId);
    setShowDeleteDialog(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
    });
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-green-600" />
            Gestión de Departamentos
          </h1>
          <p className="text-slate-600 mt-2">Administra los departamentos de tu organización</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Departamento
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}</span>
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
          <CardDescription>
            {filteredDepartments.length} departamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
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

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Empleados</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No se encontraron departamentos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="max-w-md truncate">{dept.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{dept.employee_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={dept.is_active ? 'default' : 'destructive'}>
                          {dept.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
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
                            onClick={() => openDeleteDialog(dept.id)}
                            disabled={!dept.is_active || (dept.employee_count || 0) > 0}
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}</DialogTitle>
            <DialogDescription>
              {editingDept ? 'Modifica los datos del departamento' : 'Agrega un nuevo departamento a la organización'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Recursos Humanos"
              />
              {formErrors.name && (
                <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Descripción del departamento..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el departamento. No se puede eliminar un departamento con usuarios asignados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}