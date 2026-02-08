import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@/hooks/useBranding';
import { useLobbyPreference } from '@/hooks/useLobbyPreference';
import { ROLE_ROUTES } from '@/types/branding';
import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/lobby/HeroSection';
import MissionVisionSection from '@/components/lobby/MissionVisionSection';
import FooterSection from '@/components/lobby/FooterSection';
import HealthStatusIndicator from '@/components/health-status/HealthStatusIndicator';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadTranslations } from '@/i18n/config';
import { logger } from '@/lib/logger';

interface UserProfile {
  id: string;
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
  // Use 'lobby' namespace as per official guide (matches screen_code in database)
  const { t, i18n } = useTranslation('lobby');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  
  const { branding, loading: brandingLoading } = useBranding(profile?.organization_id);
  const { skipLobby, updatePreference } = useLobbyPreference(profile?.user_id);

  // Component mount
  useEffect(() => {
    logger.componentMount('Lobby');
    return () => logger.componentUnmount('Lobby');
  }, []);

  // Load translations from backend using 'lobby' screen_code
  useEffect(() => {
    async function initTranslations() {
      logger.info('Lobby', 'Initializing translations for lobby screen...');
      await loadTranslations('lobby');
      setTranslationsLoaded(true);
      logger.info('Lobby', '✓ Translations initialized for lobby');
    }
    initTranslations();
  }, []);

  // Set language from branding preferences
  useEffect(() => {
    if (branding?.preferred_locale) {
      logger.componentUpdate('Lobby', 'Branding locale changed', {
        from: i18n.language,
        to: branding.preferred_locale,
      });
      i18n.changeLanguage(branding.preferred_locale);
    }
  }, [branding, i18n]);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        setProfileLoading(true);
        logger.info('Lobby', 'Fetching user profile...');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          logger.error('Lobby', 'User not authenticated', userError);
          navigate('/login', { replace: true });
          return;
        }

        logger.debug('Lobby', 'User authenticated', { userId: user.id });

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
          logger.error('Lobby', 'Error fetching profile', profileError);
          throw profileError;
        }

        const userProfile: UserProfile = {
          id: profileData.user_id,
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

        logger.info('Lobby', '✓ Profile loaded', {
          role: userProfile.role,
          organization: userProfile.organization_name,
        });
        setProfile(userProfile);
      } catch (error) {
        logger.error('Lobby', 'Error loading profile', error);
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
      const route = ROLE_ROUTES[profile.role] || '/employee/dashboard';
      logger.info('Lobby', `Skip lobby enabled, redirecting to ${route}`);
      navigate(route, { replace: true });
    }
  }, [profile, skipLobby, profileLoading, navigate]);

  const handleContinue = () => {
    if (profile) {
      const route = ROLE_ROUTES[profile.role] || '/employee/dashboard';
      logger.info('Lobby', `User clicked continue, navigating to ${route}`);
      navigate(route);
    }
  };

  // Loading state - use lobby.main_message key
  if (profileLoading || brandingLoading || !translationsLoaded) {
    logger.debug('Lobby', 'Loading...', {
      profileLoading,
      brandingLoading,
      translationsLoaded,
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 text-lg">{t('lobby.main_message', 'Cargando...')}</p>
        </div>
      </div>
    );
  }

  logger.debug('Lobby', 'Rendering lobby page', {
    profile: profile?.role,
    branding: branding?.organization_name,
    currentLanguage: i18n.language,
    namespace: 'lobby',
  });

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
      
      {/* Health Status Indicator - Fixed bottom-right corner */}
      <HealthStatusIndicator />
    </div>
  );
}