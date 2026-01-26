// @ts-nocheck
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  department_id: string;
  department_name?: string;
  is_active: boolean;
}

interface Department {
  id: string;
  name: string;
}

export default function OrgUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'employee',
    department_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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

      // Load departments
      const deptsResponse = await apiClient.departments.listAll({
        query: JSON.stringify({ organization_id: profile.organization_id }),
        sort: 'name'
      });

      setDepartments(deptsResponse.items || []);

      // Load users
      const usersResponse = await apiClient.userProfiles.listAll({
        query: JSON.stringify({ organization_id: profile.organization_id }),
        sort: 'full_name'
      });

      // Map department names
      const deptMap = new Map(deptsResponse.items.map((d: any) => [d.id, d.name]));
      
      const formattedUsers = usersResponse.items.map((u: any) => ({
        ...u,
        department_name: deptMap.get(u.department_id) || 'Sin departamento',
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.full_name || !formData.email || !formData.department_id) {
        toast({
          title: 'Error',
          description: 'Por favor completa todos los campos',
          variant: 'destructive',
        });
        return;
      }

      if (editingUser) {
        await apiClient.userProfiles.update(editingUser.id, {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          department_id: formData.department_id,
        });

        toast({
          title: 'Éxito',
          description: 'Usuario actualizado correctamente',
        });
      } else {
        toast({
          title: 'Información',
          description: 'La creación de usuarios debe hacerse desde Admin > Usuarios',
        });
      }

      setShowDialog(false);
      setEditingUser(null);
      setFormData({ full_name: '', email: '', role: 'employee', department_id: '' });
      loadData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el usuario',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('¿Estás seguro de desactivar este usuario?')) return;

    try {
      await apiClient.userProfiles.update(userId, { is_active: false });

      toast({
        title: 'Éxito',
        description: 'Usuario desactivado correctamente',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo desactivar el usuario',
        variant: 'destructive',
      });
    }
  }

  function openEditDialog(user: User) {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
    });
    setShowDialog(true);
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-slate-900">Usuarios de la Organización</h1>
          <p className="text-slate-600 mt-2">Gestiona los usuarios de tu organización</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuario(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
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
                    <TableCell colSpan={6} className="text-center text-slate-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{user.department_name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
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
                            onClick={() => handleDelete(user.id)}
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
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica los datos del usuario' : 'Agrega un nuevo usuario'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingUser}
              />
            </div>

            <div>
              <Label htmlFor="role">Rol</Label>
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
              <Label htmlFor="department">Departamento</Label>
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