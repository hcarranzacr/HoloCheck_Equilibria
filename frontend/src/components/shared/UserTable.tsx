import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface UserTableProps {
  organizationId?: string;
  departmentId?: string;
  role?: string;
  onUserSelect?: (user: any) => void;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export function UserTable({
  organizationId,
  departmentId,
  role,
  onUserSelect,
  allowEdit = true,
  allowDelete = true
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    loadUsers();
  }, [organizationId]);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await apiClient.userProfiles.list(organizationId);
      const userData = response.data.items || [];
      setUsers(userData);
      logActivity('users_loaded', { 
        count: userData.length,
        organization_id: organizationId 
      });
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentId || user.department_id === departmentId;
    const matchesRole = !role || user.role === role;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  useEffect(() => {
    if (searchTerm) {
      logActivity('users_searched', { 
        query: searchTerm, 
        results_count: filteredUsers.length 
      });
    }
  }, [searchTerm, filteredUsers.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">No se encontraron usuarios</p>
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
              <TableRow 
                key={user.user_id || user.id}
                onClick={() => onUserSelect?.(user)}
                className={onUserSelect ? 'cursor-pointer hover:bg-slate-50' : ''}
              >
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>{user.departments?.name || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {allowEdit && (
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {allowDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}