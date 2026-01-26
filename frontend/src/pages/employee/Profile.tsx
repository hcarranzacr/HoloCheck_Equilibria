import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Building2, Briefcase, Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  organization_id?: string;
  department_id?: string;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

export default function EmployeeProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      console.log('👤 [Profile] Loading profile...');

      // Get current user info
      const currentUser = await apiClient.auth.me();
      
      // Get user profile
      const profileResponse = await apiClient.userProfiles.list({
        query: JSON.stringify({ user_id: currentUser.id }),
        limit: 1,
      });

      if (profileResponse.items && profileResponse.items.length > 0) {
        const profileData = profileResponse.items[0];
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
        });
        console.log('✅ [Profile] Profile loaded');

        // Load organization if exists
        if (profileData.organization_id) {
          try {
            const orgData = await apiClient.organizations.get(profileData.organization_id);
            setOrganization(orgData);
            console.log('✅ [Profile] Organization loaded');
          } catch (error) {
            console.log('ℹ️ [Profile] Organization not found');
          }
        }

        // Load department if exists
        if (profileData.department_id) {
          try {
            const deptData = await apiClient.departments.get(profileData.department_id);
            setDepartment(deptData);
            console.log('✅ [Profile] Department loaded');
          } catch (error) {
            console.log('ℹ️ [Profile] Department not found');
          }
        }
      }

      // Log navigation
      await apiClient.logAudit('VIEW', 'user_profiles', undefined, {
        page: 'employee/profile',
      });
    } catch (error: any) {
      console.error('❌ [Profile] Error loading profile:', error);
      toast.error('Error al cargar el perfil: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    try {
      await apiClient.userProfiles.update(profile.id, {
        full_name: formData.full_name,
        email: formData.email,
      });

      toast.success('Perfil actualizado exitosamente');
      
      // Log audit
      await apiClient.logAudit('UPDATE', 'user_profiles', profile.id, {
        full_name: formData.full_name,
        email: formData.email,
      });

      await loadProfile();
    } catch (error: any) {
      console.error('❌ [Profile] Error saving:', error);
      toast.error('Error al guardar el perfil: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'admin_platform': 'Administrador de Plataforma',
      'admin_global': 'Administrador Global',
      'admin_org': 'Administrador de Organización',
      'rrhh': 'Recursos Humanos',
      'leader': 'Líder de Departamento',
      'employee': 'Empleado',
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontró el perfil</h3>
            <p className="text-muted-foreground">
              Por favor, contacta al administrador del sistema
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tus datos personales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan.perez@empresa.com"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>Detalles de tu cuenta en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Rol</p>
                <p className="text-sm text-muted-foreground">{getRoleLabel(profile.role)}</p>
              </div>
            </div>

            {organization && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Organización</p>
                  <p className="text-sm text-muted-foreground">{organization.name}</p>
                </div>
              </div>
            )}

            {department && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Departamento</p>
                  <p className="text-sm text-muted-foreground">{department.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Miembro desde</p>
                <p className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">ID de Usuario</p>
                <p className="text-sm text-muted-foreground font-mono text-xs">{profile.user_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}