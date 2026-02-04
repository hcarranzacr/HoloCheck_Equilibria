import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Pencil, Trash2, RefreshCw, Clock, Users as UsersIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  department_id: string;
  department_name?: string;
  is_active: boolean;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

export default function UsersManagement() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'employee',
    department_id: '',
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState({
    full_name: '',
    email: '',
    department_id: '',
  });

  async function loadData() {
    try {
      setLoading(true);
      console.log('📊 [Users Management] Loading data...');
      
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
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('name');

      if (deptsError) {
        console.error('❌ Error loading departments:', deptsError);
      } else {
        setDepartments(deptsData || []);
      }

      // Load users with department names
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          full_name,
          email,
          role,
          department_id,
          is_active,
          created_at,
          departments(name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('full_name');

      if (usersError) {
        console.error('❌ Error loading users:', usersError);
        throw new Error('Error loading users');
      }

      const formattedUsers = usersData?.map((u: any) => ({
        ...u,
        department_name: u.departments?.name || 'Sin departamento',
      })) || [];

      setUsers(formattedUsers);
      setLastUpdated(new Date());
      console.log('✅ [Users Management] Data loaded:', formattedUsers.length, 'users');
    } catch (error: any) {
      console.error('❌ [Users Management] Error:', error);
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
    console.log('🔄 [Users Management] Manual refresh triggered');
    setRefreshing(true);
    loadData();
  };

  function validateForm(): boolean {
    const errors = {
      full_name: '',
      email: '',
      department_id: '',
    };

    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.department_id) {
      errors.department_id = 'El departamento es requerido';
    }

    setFormErrors(errors);
    return !errors.full_name && !errors.email && !errors.department_id;
  }

  async function handleSave() {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.full_name,
            email: formData.email,
            role: formData.role,
            department_id: formData.department_id,
            is_active: formData.is_active,
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        toast.success('Usuario actualizado correctamente');
      } else {
        // Create new user - Note: This requires backend support for user creation
        toast.error('La creación de usuarios debe hacerse desde el panel de administración principal');
        return;
      }

      setShowDialog(false);
      setEditingUser(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Error al guardar el usuario');
    }
  }

  async function handleDelete() {
    if (!deletingUserId) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', deletingUserId);

      if (error) throw error;

      toast.success('Usuario desactivado correctamente');
      setShowDeleteDialog(false);
      setDeletingUserId(null);
      loadData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Error al desactivar el usuario');
    }
  }

  function openEditDialog(user: User) {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      is_active: user.is_active,
    });
    setFormErrors({ full_name: '', email: '', department_id: '' });
    setShowDialog(true);
  }

  function openCreateDialog() {
    setEditingUser(null);
    resetForm();
    setFormErrors({ full_name: '', email: '', department_id: '' });
    setShowDialog(true);
  }

  function openDeleteDialog(userId: string) {
    setDeletingUserId(userId);
    setShowDeleteDialog(true);
  }

  function resetForm() {
    setFormData({
      full_name: '',
      email: '',
      role: 'employee',
      department_id: '',
      is_active: true,
    });
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <UsersIcon className="h-8 w-8 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-slate-600 mt-2">Administra los usuarios de tu organización</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
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
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuario(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email o departamento..."
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
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department_name}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(user.id)}
                            disabled={!user.is_active}
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
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica los datos del usuario' : 'Agrega un nuevo usuario a la organización'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Juan Pérez"
              />
              {formErrors.full_name && (
                <p className="text-sm text-red-600 mt-1">{formErrors.full_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@empresa.com"
                disabled={!!editingUser}
              />
              {formErrors.email && (
                <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Rol *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Empleado</SelectItem>
                  <SelectItem value="leader">Líder</SelectItem>
                  <SelectItem value="rrhh">RRHH</SelectItem>
                  <SelectItem value="admin_org">Admin Organización</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Departamento *</Label>
              <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.department_id && (
                <p className="text-sm text-red-600 mt-1">{formErrors.department_id}</p>
              )}
            </div>

            {editingUser && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active">Usuario activo</Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
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
              Esta acción desactivará el usuario. El usuario no podrá acceder al sistema pero sus datos se conservarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}