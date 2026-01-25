import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserProfiles } from '@/lib/supabase-admin';

export default function LeaderTeam() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getUserProfiles();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Colaboradores</h1>
        <p className="text-slate-600 mt-2">Miembros del equipo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mi Equipo</CardTitle>
          <CardDescription>Colaboradores del departamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-sm text-slate-600">No hay usuarios registrados</p>
            ) : (
              users.filter((u) => u.role === 'employee').map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  <Badge>{user.role}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}