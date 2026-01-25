import { supabase } from '../supabase';

export class PermissionsService {
  static async getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return profile;
  }

  static async canViewOrganization(userId: string, organizationId: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return false;

    // admin_global puede ver todas las organizaciones
    if (profile.role === 'admin_global') return true;

    // Otros roles solo pueden ver su propia organización
    return profile.organization_id === organizationId;
  }

  static async canViewDepartment(userId: string, departmentId: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return false;

    // admin_global puede ver todos los departamentos
    if (profile.role === 'admin_global') return true;

    // admin_org y rrhh pueden ver departamentos de su organización
    if (profile.role === 'admin_org' || profile.role === 'rrhh') {
      const { data: dept } = await supabase
        .from('departments')
        .select('organization_id')
        .eq('id', departmentId)
        .single();

      return dept?.organization_id === profile.organization_id;
    }

    // leader solo puede ver su propio departamento
    if (profile.role === 'leader') {
      return profile.department_id === departmentId;
    }

    return false;
  }

  static async canViewUser(userId: string, targetUserId: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return false;

    // admin_global puede ver todos los usuarios
    if (profile.role === 'admin_global') return true;

    // Usuarios pueden ver su propio perfil
    if (profile.user_id === targetUserId) return true;

    const { data: targetProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (!targetProfile) return false;

    // admin_org y rrhh pueden ver usuarios de su organización
    if (profile.role === 'admin_org' || profile.role === 'rrhh') {
      return profile.organization_id === targetProfile.organization_id;
    }

    // leader puede ver usuarios de su departamento
    if (profile.role === 'leader') {
      return profile.department_id === targetProfile.department_id;
    }

    return false;
  }

  static async canEditUser(userId: string, targetUserId: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return false;

    // admin_global puede editar todos
    if (profile.role === 'admin_global') return true;

    // Usuarios pueden editar su propio perfil
    if (profile.user_id === targetUserId) return true;

    const { data: targetProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (!targetProfile) return false;

    // admin_org puede editar usuarios de su organización
    if (profile.role === 'admin_org') {
      return profile.organization_id === targetProfile.organization_id;
    }

    return false;
  }

  static async canDeleteUser(userId: string, targetUserId: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return false;

    // Solo admin_global y admin_org pueden eliminar usuarios
    if (profile.role === 'admin_global') return true;

    if (profile.role === 'admin_org') {
      const { data: targetProfile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', targetUserId)
        .single();

      return targetProfile?.organization_id === profile.organization_id;
    }

    return false;
  }

  static async canExportData(userId: string, dataType: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return false;

    // admin_global puede exportar todo
    if (profile.role === 'admin_global') return true;

    // admin_org, rrhh y leader pueden exportar datos de su ámbito
    if (['admin_org', 'rrhh', 'leader'].includes(profile.role)) {
      return true;
    }

    // employee solo puede exportar sus propios datos
    return dataType === 'own_data';
  }

  static async canRunAIAnalysis(userId: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return false;

    // Todos los roles pueden ejecutar análisis IA
    return true;
  }

  static async getAccessibleOrganizations(userId: string): Promise<string[]> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return [];

    // admin_global puede acceder a todas las organizaciones
    if (profile.role === 'admin_global') {
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id');

      return orgs?.map(o => o.id) || [];
    }

    // Otros roles solo acceden a su organización
    return profile.organization_id ? [profile.organization_id] : [];
  }

  static async getAccessibleDepartments(userId: string): Promise<string[]> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return [];

    // admin_global puede acceder a todos los departamentos
    if (profile.role === 'admin_global') {
      const { data: depts } = await supabase
        .from('departments')
        .select('id');

      return depts?.map(d => d.id) || [];
    }

    // admin_org y rrhh pueden acceder a departamentos de su organización
    if (profile.role === 'admin_org' || profile.role === 'rrhh') {
      const { data: depts } = await supabase
        .from('departments')
        .select('id')
        .eq('organization_id', profile.organization_id);

      return depts?.map(d => d.id) || [];
    }

    // leader solo accede a su departamento
    if (profile.role === 'leader' && profile.department_id) {
      return [profile.department_id];
    }

    return [];
  }
}