import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@/hooks/useBranding';
import { useLobbyPreference } from '@/hooks/useLobbyPreference';
import { ROLE_ROUTES } from '@/types/branding';
import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/lobby/HeroSection';
import MissionVisionSection from '@/components/lobby/MissionVisionSection';
import FooterSection from '@/components/lobby/FooterSection';
import { Loader2 } from 'lucide-react';

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  organization_id: string;
  organization_name?: string;
  department_name?: string;
}

export default function Lobby() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const { branding, loading: brandingLoading } = useBranding(profile?.organization_id);
  const { skipLobby, updatePreference } = useLobbyPreference(profile?.user_id);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        setProfileLoading(true);
        console.log('👤 [Lobby] Fetching user profile...');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ [Lobby] User not authenticated:', userError);
          navigate('/login', { replace: true });
          return;
        }

        // Get user profile with organization info
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            user_id,
            full_name,
            email,
            role,
            organization_id,
            department_id,
            organizations!inner(name),
            departments(name)
          `)
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('❌ [Lobby] Error fetching profile:', profileError);
          throw profileError;
        }

        const userProfile: UserProfile = {
          user_id: profileData.user_id,
          full_name: profileData.full_name,
          email: profileData.email,
          role: profileData.role,
          organization_id: profileData.organization_id,
          organization_name: Array.isArray(profileData.organizations) 
            ? profileData.organizations[0]?.name 
            : (profileData.organizations as any)?.name,
          department_name: Array.isArray(profileData.departments) 
            ? profileData.departments[0]?.name 
            : (profileData.departments as any)?.name
        };

        console.log('✅ [Lobby] Profile loaded:', userProfile.role);
        setProfile(userProfile);
      } catch (error) {
        console.error('❌ [Lobby] Error loading profile:', error);
        navigate('/login', { replace: true });
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  // Auto-redirect if user has skipLobby enabled
  useEffect(() => {
    if (!profileLoading && profile && skipLobby) {
      console.log('⏭️ [Lobby] Skip lobby enabled, redirecting to dashboard...');
      const route = ROLE_ROUTES[profile.role] || '/employee/dashboard';
      navigate(route, { replace: true });
    }
  }, [profile, skipLobby, profileLoading, navigate]);

  const handleContinue = () => {
    if (profile) {
      const route = ROLE_ROUTES[profile.role] || '/employee/dashboard';
      console.log('➡️ [Lobby] Navigating to:', route);
      navigate(route);
    }
  };

  // Loading state
  if (profileLoading || brandingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-page min-h-screen bg-white">
      <HeroSection
        branding={branding}
        profile={profile}
        onContinue={handleContinue}
        skipLobby={skipLobby}
        onSkipChange={updatePreference}
      />
      
      <MissionVisionSection branding={branding} />
      
      <FooterSection branding={branding} />
    </div>
  );
}