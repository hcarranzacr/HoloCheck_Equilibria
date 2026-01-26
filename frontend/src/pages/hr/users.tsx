import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  department_id: string;
  department_name?: string;
}

export default function HRUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      
      // Get current user from backend
      const user = await apiClient.auth.me();
      if (!user) throw new Error('No user found');

      // Get user's organization_id from their profile
      const profileResponse = await apiClient.userProfiles.list({
        query: JSON.stringify({ user_id: user.id }),
        limit: 1
      });

      const profile = profileResponse?.items?.[0];
      if (!profile) throw new Error('No profile found');

      // Load users from same organization (READ ONLY)
      const usersResponse = await apiClient.userProfiles.listAll({
        query: JSON.stringify({ organization_id: profile.organization_id }),
        sort: 'email'
      });

      // Load departments to map names
      const deptsResponse = await apiClient.departments.listAll({
        query: JSON.stringify({ organization_id: profile.organization_id })
      });

      const deptMap = new Map(deptsResponse.items.map((d: any) => [d.id, d.name]));

      const formattedUsers = usersResponse.items.map((u: any) => ({
        ...u,
        department_name: deptMap.get(u.department_id) || 'N/A',
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleView(user: User) {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Usuarios (Solo Consulta)</h1>
          <p className="text-slate-600 mt-1">Vista de usuarios de la organización - Solo lectura</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No se encontraron usuarios
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {user.role || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.department_name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                <p className="text-slate-900">{selectedUser.full_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Rol</label>
                <p className="text-slate-900">{selectedUser.role || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Departamento</label>
                <p className="text-slate-900">{selectedUser.department_name || 'N/A'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}