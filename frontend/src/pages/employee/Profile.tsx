import { useState, useEffect } from 'react';
import { User, Building2, Users, Mail, Calendar, Shield, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@metagptx/web-sdk';

const client = createClient();

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  organization_id: string;
  department_id: string;
  created_at: string;
  last_login_at?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  address?: string;
  phone?: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
}

export default function Profile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      console.log('👤 [Profile] Loading profile...');

      // Get authenticated user
      const user = await client.auth.me();
      console.log('✅ [Profile] Auth user loaded:', user.data?.id);
      setAuthUser(user.data);

      if (!user.data?.id) {
        throw new Error('No authenticated user found');
      }

      // Get user profile from user_profiles table
      const profileResponse = await client.apiCall.invoke({
        url: '/api/v1/auth/me',
        method: 'GET',
      });

      console.log('✅ [Profile] Profile data loaded');

      // Since we can't query user_profiles directly via entities, we'll use Supabase client
      // Get full profile with organization and department info
      const supabase = (window as any).supabaseClient;
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.data.id)
        .single();

      if (profileError) {
        console.error('❌ [Profile] Error loading profile:', profileError);
        throw profileError;
      }

      setProfile(profileData);
      console.log('✅ [Profile] Profile set:', profileData);

      // Load organization
      if (profileData.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        if (!orgError && orgData) {
          setOrganization(orgData);
          console.log('✅ [Profile] Organization loaded:', orgData.name);
        }
      }

      // Load department
      if (profileData.department_id) {
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .eq('id', profileData.department_id)
          .single();

        if (!deptError && deptData) {
          setDepartment(deptData);
          console.log('✅ [Profile] Department loaded:', deptData.name);
        }
      }
    } catch (error: any) {
      console.error('❌ [Profile] Error loading profile:', error);
      toast({
        title: 'Error',
        description: error?.data?.detail || error?.response?.data?.detail || error.message || 'Error al cargar el perfil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: any = {
      employee: 'Empleado',
      leader: 'Líder de Equipo',
      hr: 'Recursos Humanos',
      admin_org: 'Administrador de Organización',
      admin: 'Administrador de Plataforma',
    };
    return roles[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const statuses: any = {
      active: 'Activo',
      invited: 'Invitado',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'text-green-600 bg-green-50',
      invited: 'text-yellow-600 bg-yellow-50',
      inactive: 'text-gray-600 bg-gray-50',
      suspended: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">No se pudo cargar el perfil del usuario</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">Información personal y de la organización</p>
      </div>

      {/* Personal Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre Completo</Label>
              <p className="text-lg font-semibold mt-1">{profile.full_name}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Correo Electrónico</Label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg">{profile.email}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Rol</Label>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg font-semibold">{getRoleLabel(profile.role)}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile.status)}`}>
                  {getStatusLabel(profile.status)}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg">{new Date(profile.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {profile.last_login_at && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Último Acceso</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg">{new Date(profile.last_login_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Organization Information Card */}
      {organization && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Organización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nombre de la Empresa</Label>
                <p className="text-lg font-semibold mt-1">{organization.name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Identificador</Label>
                <p className="text-lg mt-1">{organization.slug}</p>
              </div>

              {organization.industry && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Industria</Label>
                  <p className="text-lg mt-1">{organization.industry}</p>
                </div>
              )}

              {organization.address && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg">{organization.address}</p>
                  </div>
                </div>
              )}

              {organization.phone && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg">{organization.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Information Card */}
      {department && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Información del Departamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Departamento</Label>
                <p className="text-lg font-semibold mt-1">{department.name}</p>
              </div>

              {department.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                  <p className="text-lg mt-1">{department.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User ID Information (for debugging) */}
      <Card className="mt-6 border-dashed">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Información Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">ID de Usuario (Auth)</Label>
              <p className="font-mono text-xs mt-1">{authUser?.id || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ID de Perfil</Label>
              <p className="font-mono text-xs mt-1">{profile.id}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ID de Organización</Label>
              <p className="font-mono text-xs mt-1">{profile.organization_id}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ID de Departamento</Label>
              <p className="font-mono text-xs mt-1">{profile.department_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}