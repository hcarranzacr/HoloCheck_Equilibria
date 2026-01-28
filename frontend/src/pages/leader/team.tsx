// @ts-nocheck
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SectionHeader from '@/components/dashboard/SectionHeader';
import { getWellnessColor, getWellnessStatusString } from '@/lib/biometric-utils';

interface TeamMember {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  department_id: string;
  organization_id: string;
  latest_scan?: {
    created_at: string;
    wellness_index_score: number;
    ai_stress: number;
    ai_fatigue: number;
    ai_recovery: number;
    heart_rate: number;
  };
}

export default function LeaderTeam() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState('');

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    try {
      setLoading(true);

      // Get current user's department AND organization
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Get user profile to find department_id AND organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('department_id, organization_id, departments(name)')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.department_id || !profile?.organization_id) {
        console.error('Error loading profile:', profileError);
        return;
      }

      setDepartmentName(profile.departments?.name || 'Departamento');

      console.log(`🔒 Loading team for department ${profile.department_id} in organization ${profile.organization_id}`);

      // CRITICAL FIX: Get team members filtered by BOTH department_id AND organization_id
      const { data: members, error: membersError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, email, role, department_id, organization_id')
        .eq('department_id', profile.department_id)
        .eq('organization_id', profile.organization_id)
        .order('full_name', { ascending: true });

      if (membersError) {
        console.error('Error loading team members:', membersError);
        return;
      }

      console.log(`✅ Found ${members?.length || 0} team members in same department AND organization`);

      // Get latest scan for each team member
      const memberIds = members?.map(m => m.user_id) || [];
      
      if (memberIds.length === 0) {
        setTeamMembers([]);
        return;
      }

      const { data: latestScans, error: scansError } = await supabase
        .from('biometric_measurements')
        .select('user_id, created_at, wellness_index_score, ai_stress, ai_fatigue, ai_recovery, heart_rate')
        .in('user_id', memberIds)
        .order('created_at', { ascending: false });

      if (scansError) {
        console.error('Error loading scans:', scansError);
      }

      // Map latest scan to each member
      const membersWithScans = members?.map(member => {
        const latestScan = latestScans?.find(scan => scan.user_id === member.user_id);
        return {
          ...member,
          latest_scan: latestScan || undefined
        };
      }) || [];

      console.log('✅ Loaded team with', membersWithScans.length, 'members from same organization');
      setTeamMembers(membersWithScans);
    } catch (error) {
      console.error('Error loading team:', error);
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

  const membersWithScans = teamMembers.filter(m => m.latest_scan);
  const membersWithoutScans = teamMembers.filter(m => !m.latest_scan);
  const avgWellness = membersWithScans.length > 0
    ? membersWithScans.reduce((acc, m) => acc + (m.latest_scan?.wellness_index_score || 0), 0) / membersWithScans.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                👥 Mi Equipo
              </h1>
              <p className="text-blue-100">
                {departmentName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{teamMembers.length}</div>
              <div className="text-sm text-blue-100">Colaboradores</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-blue-100">Con Escaneos</div>
              <div className="text-2xl font-bold">{membersWithScans.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-blue-100">Sin Escaneos</div>
              <div className="text-2xl font-bold">{membersWithoutScans.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-blue-100">Bienestar Promedio</div>
              <div className="text-2xl font-bold">{avgWellness.toFixed(1)}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Team Members with Scans */}
        <div>
          <SectionHeader
            title="Colaboradores con Datos"
            description={`${membersWithScans.length} miembros con escaneos recientes`}
            metricCount={membersWithScans.length}
            icon="✅"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {membersWithScans.map((member) => (
              <Card key={member.user_id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{member.full_name}</CardTitle>
                      <CardDescription className="text-xs">{member.email}</CardDescription>
                    </div>
                    <Badge 
                      style={{ 
                        backgroundColor: getWellnessColor(member.latest_scan?.wellness_index_score || 0),
                        color: 'white'
                      }}
                    >
                      {getWellnessStatusString(member.latest_scan?.wellness_index_score || 0)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div 
                        className="text-4xl font-bold" 
                        style={{ color: getWellnessColor(member.latest_scan?.wellness_index_score || 0) }}
                      >
                        {member.latest_scan?.wellness_index_score?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">Bienestar</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Estrés:</span>
                      <span className="ml-1 font-semibold">{member.latest_scan?.ai_stress?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fatiga:</span>
                      <span className="ml-1 font-semibold">{member.latest_scan?.ai_fatigue?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">FC:</span>
                      <span className="ml-1 font-semibold">{member.latest_scan?.heart_rate?.toFixed(0) || 'N/A'} bpm</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Recuperación:</span>
                      <span className="ml-1 font-semibold">{member.latest_scan?.ai_recovery?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    Último escaneo: {member.latest_scan?.created_at 
                      ? new Date(member.latest_scan.created_at).toLocaleDateString('es-ES')
                      : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Members without Scans */}
        {membersWithoutScans.length > 0 && (
          <div>
            <SectionHeader
              title="Colaboradores sin Datos"
              description={`${membersWithoutScans.length} miembros sin escaneos`}
              metricCount={membersWithoutScans.length}
              icon="⚠️"
            />

            <Card className="bg-amber-50 border-amber-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                      Colaboradores sin Escaneos Recientes
                    </h3>
                    <p className="text-sm text-amber-800 mb-4">
                      Los siguientes miembros del equipo no tienen escaneos biométricos registrados. 
                      Considera invitarlos a realizar su primer escaneo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {membersWithoutScans.map((member) => (
                    <div 
                      key={member.user_id} 
                      className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-200"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{member.full_name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <Badge variant="outline" className="text-amber-700 border-amber-300">
                        Sin datos
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}