import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Building, Calendar, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  department_id?: string;
  department_name?: string;
  organization_id?: string;
  organization_name?: string;
  created_at: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    console.log('👤 [Profile] Loading profile...');
    
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      console.log('🔑 [Profile] Checking authentication...');
      const session = await apiClient.auth.getSession();
      console.log(`🔐 [Profile] Session exists: ${!!session}, Token length: ${session?.access_token?.length || 0}`);
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      // Get current user
      console.log('👤 [Profile] Fetching current user...');
      const user = await apiClient.auth.getUser();
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      console.log(`✅ [Profile] User found: ${user.email}`);

      // Get user profile
      console.log('📋 [Profile] Fetching user profile...');
      const profileResponse = await apiClient.userProfiles.query({
        query: { user_id: user.id },
        limit: 1
      });

      const userProfile = profileResponse.items?.[0];
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      console.log('✅ [Profile] Profile loaded:', userProfile);
      setProfile(userProfile);

    } catch (err: any) {
      console.error('❌ [Profile] ERROR:', err);
      const errorMsg = err?.message || err?.data?.detail || err?.response?.data?.detail || 'Error al cargar el perfil';
      console.error('📛 [Profile] Error message:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      console.log('🏁 [Profile] Finished');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se encontró el perfil del usuario</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nombre Completo</p>
              <p className="font-medium">{profile.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <Badge variant="outline">{profile.role}</Badge>
            </div>
          </div>

          {profile.department_name && (
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium">{profile.department_name}</p>
              </div>
            </div>
          )}

          {profile.organization_name && (
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Organización</p>
                <p className="font-medium">{profile.organization_name}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Miembro desde</p>
              <p className="font-medium">
                {new Date(profile.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}