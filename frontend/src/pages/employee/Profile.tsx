import { useEffect, useState } from 'react';
import { User, Building2, Users, Mail, Calendar, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@metagptx/web-sdk';
import { useToast } from '@/hooks/use-toast';

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
  industry?: string;
  size?: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
}

interface Leader {
  full_name: string;
  email: string;
}

export default function EmployeeProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [leader, setLeader] = useState<Leader | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('👤 [Profile] Loading profile...');

      // Get current user info
      const userResponse = await client.auth.me();
      console.log('✅ [Profile] User authenticated:', userResponse.data);

      if (!userResponse.data?.id) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      const userId = userResponse.data.id;

      // Get user profile from database
      const profileResponse = await client.apiCall.invoke({
        url: '/api/v1/user-profile',
        method: 'GET',
      });

      console.log('✅ [Profile] Profile loaded:', profileResponse.data);
      const profileData = profileResponse.data;
      setProfile(profileData);

      // Get organization data
      if (profileData.organization_id) {
        try {
          const orgResponse = await client.apiCall.invoke({
            url: `/api/v1/organizations/${profileData.organization_id}`,
            method: 'GET',
          });
          setOrganization(orgResponse.data);
          console.log('✅ [Profile] Organization loaded:', orgResponse.data);
        } catch (err) {
          console.warn('⚠️ Could not load organization data:', err);
        }
      }

      // Get department data
      if (profileData.department_id) {
        try {
          const deptResponse = await client.apiCall.invoke({
            url: `/api/v1/departments/${profileData.department_id}`,
            method: 'GET',
          });
          setDepartment(deptResponse.data);
          console.log('✅ [Profile] Department loaded:', deptResponse.data);

          // Get leader data if available
          if (deptResponse.data.leader_id) {
            try {
              const leaderResponse = await client.apiCall.invoke({
                url: `/api/v1/users/${deptResponse.data.leader_id}`,
                method: 'GET',
              });
              setLeader(leaderResponse.data);
              console.log('✅ [Profile] Leader loaded:', leaderResponse.data);
            } catch (err) {
              console.warn('⚠️ Could not load leader data:', err);
            }
          }
        } catch (err) {
          console.warn('⚠️ Could not load department data:', err);
        }
      }
    } catch (err: any) {
      console.error('❌ [Profile] Error loading profile:', err);
      const errorMsg = err?.data?.detail || err?.response?.data?.detail || err.message || 'Error al cargar el perfil';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin_org':
        return 'default';
      case 'hr':
        return 'secondary';
      case 'leader':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin_org: 'Administrador',
      hr: 'Recursos Humanos',
      leader: 'Líder de Equipo',
      employee: 'Empleado',
    };
    return labels[role] || role;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'invited':
        return 'secondary';
      case 'inactive':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Activo',
      invited: 'Invitado',
      inactive: 'Inactivo',
    };
    return labels[status] || status;
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
          <AlertDescription>No se encontró información del perfil</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <Badge variant={getStatusBadgeVariant(profile.status)}>
          {getStatusLabel(profile.status)}
        </Badge>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
              <p className="text-lg font-semibold mt-1">{profile.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Correo Electrónico</label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg">{profile.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rol</label>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(profile.role)} className="text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel(profile.role)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg">
                  {new Date(profile.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {profile.last_login_at && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Último Acceso</label>
                <p className="text-sm mt-1">
                  {new Date(profile.last_login_at).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Organization Information Card */}
      {organization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                <p className="text-lg font-semibold mt-1">{organization.name}</p>
              </div>
              {organization.industry && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Industria</label>
                  <p className="text-lg mt-1">{organization.industry}</p>
                </div>
              )}
              {organization.size && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tamaño</label>
                  <p className="text-lg mt-1">{organization.size}</p>
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
              Departamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre del Departamento</label>
                <p className="text-lg font-semibold mt-1">{department.name}</p>
              </div>
              {department.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                  <p className="text-lg mt-1">{department.description}</p>
                </div>
              )}
            </div>

            {leader && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Líder del Departamento</label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{leader.full_name}</p>
                      <p className="text-sm text-muted-foreground">{leader.email}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* System IDs Card (for debugging) */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Identificadores del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-muted-foreground">User ID</label>
              <p className="mt-1 break-all">{profile.user_id}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Profile ID</label>
              <p className="mt-1 break-all">{profile.id}</p>
            </div>
            {profile.organization_id && (
              <div>
                <label className="text-muted-foreground">Organization ID</label>
                <p className="mt-1 break-all">{profile.organization_id}</p>
              </div>
            )}
            {profile.department_id && (
              <div>
                <label className="text-muted-foreground">Department ID</label>
                <p className="mt-1 break-all">{profile.department_id}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}