import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
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

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  organization_id: string;
  department_id: string | null;
  role: string;
  is_active: boolean;
}

interface Organization {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    organization_id: '',
    department_id: '',
    role: 'employee',
  });

  useEffect(() => {
    loadData();
  }, [searchTerm, filterOrg, filterRole]);

  useEffect(() => {
    if (formData.organization_id) {
      loadDepartments(formData.organization_id);
    }
  }, [formData.organization_id]);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load users
      const queryParams: any = {
        sort: '-created_at',
        limit: 100,
      };
      
      if (filterOrg !== 'all') {
        queryParams.query = JSON.stringify({ organization_id: filterOrg });
      }
      if (filterRole !== 'all') {
        queryParams.query = JSON.stringify({ 
          ...(queryParams.query ? JSON.parse(queryParams.query) : {}),
          role: filterRole 
        });
      }

      const usersResponse = await apiClient.userProfiles.listAll(queryParams);
      let filteredUsers = usersResponse.items || [];

      // Client-side search filter
      if (searchTerm) {
        filteredUsers = filteredUsers.filter((user: UserProfile) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setUsers(filteredUsers);

      // Load organizations
      const orgsResponse = await apiClient.organizations.list({ limit: 100 });
      setOrganizations(orgsResponse.items || []);

      // Log navigation
      await apiClient.logAudit('VIEW', 'user_profiles', undefined, {
        page: 'admin/users',
        action: 'list',
      });
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments(orgId: string) {
    try {
      const response = await apiClient.departments.listAll({
        query: JSON.stringify({ organization_id: orgId }),
        limit: 100,
      });
      setDepartments(response.items || []);
    } catch (error: any) {
      console.error('Error loading departments:', error);
    }
  }

  async function handleCreate() {
    try {
      await apiClient.userProfiles.create({
        email: formData.email,
        full_name: formData.full_name,
        organization_id: formData.organization_id,
        department_id: formData.department_id || null,
        role: formData.role,
      });

      toast.success('Usuario creado exitosamente');
      
      // Log audit
      await apiClient.logAudit('CREATE', 'user_profiles', undefined, {
        email: formData.email,
        full_name: formData.full_name,
      });

      setIsCreateOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleUpdate() {
    if (!selectedUser) return;

    try {
      await apiClient.userProfiles.update(selectedUser.id, {
        email: formData.email,
        full_name: formData.full_name,
        organization_id: formData.organization_id,
        department_id: formData.department_id || null,
        role: formData.role,
      });

      toast.success('Usuario actualizado exitosamente');
      
      // Log audit
      await apiClient.logAudit('UPDATE', 'user_profiles', selectedUser.id, {
        email: formData.email,
        full_name: formData.full_name,
      });

      setIsEditOpen(false);
      setSelectedUser(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${name}"?`)) return;

    try {
      await apiClient.userProfiles.delete(id);
      toast.success('Usuario eliminado exitosamente');
      
      // Log audit
      await apiClient.logAudit('DELETE', 'user_profiles', id, {
        full_name: name,
      });

      loadData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario: ' + (error.response?.data?.detail || error.message));
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      organization_id: '',
      department_id: '',
      role: 'employee',
    });
    setDepartments([]);
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      organization_id: user.organization_id,
      department_id: user.department_id || '',
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validUsers = results.data.filter((row: any) => row.email && row.full_name);
        if (validUsers.length === 0) {
          toast.error('No se encontraron usuarios válidos en el archivo');
          return;
        }

        try {
          for (const userData of validUsers) {
            await apiClient.userProfiles.create(userData);
          }
          toast.success(`${validUsers.length} usuarios cargados exitosamente`);
          setIsBulkUploadOpen(false);
          loadData();
        } catch (error: any) {
          toast.error('Error en carga masiva: ' + (error.response?.data?.detail || error.message));
        }
      },
      error: (error) => {
        toast.error(`Error al leer archivo: ${error.message}`);
      },
    });
  };

  const downloadTemplate = () => {
    const csv = 'email,full_name,organization_id,department_id,role\n' +
                'usuario@ejemplo.com,Juan Pérez,org-id,dept-id,employee';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_usuarios.csv';
    a.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
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
                <DialogTitle>Carga Masiva de Usuarios</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sube un archivo CSV con las columnas: email, full_name, organization_id, department_id, role
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre Completo *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organización *</Label>
                    <Select
                      value={formData.organization_id}
                      onValueChange={(value) => setFormData({ ...formData, organization_id: value, department_id: '' })}
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
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Select
                      value={formData.department_id}
                      onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                      disabled={!formData.organization_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
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
                <div className="space-y-2">
                  <Label>Rol *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Empleado</SelectItem>
                      <SelectItem value="leader">Líder</SelectItem>
                      <SelectItem value="rrhh">RRHH</SelectItem>
                      <SelectItem value="admin_org">Admin Org</SelectItem>
                      <SelectItem value="admin_global">Admin Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.email || !formData.full_name || !formData.organization_id}
                  className="w-full"
                >
                  Crear Usuario
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre o email..."
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
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="employee">Empleado</SelectItem>
            <SelectItem value="leader">Líder</SelectItem>
            <SelectItem value="rrhh">RRHH</SelectItem>
            <SelectItem value="admin_org">Admin Org</SelectItem>
            <SelectItem value="admin_global">Admin Global</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id, user.full_name)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Empleado</SelectItem>
                  <SelectItem value="leader">Líder</SelectItem>
                  <SelectItem value="rrhh">RRHH</SelectItem>
                  <SelectItem value="admin_org">Admin Org</SelectItem>
                  <SelectItem value="admin_global">Admin Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Actualizar Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}