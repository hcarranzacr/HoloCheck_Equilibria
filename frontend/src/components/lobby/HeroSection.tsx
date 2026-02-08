import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OrganizationBranding, UserProfile, ROLE_DISPLAY_NAMES } from '@/types/branding';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/common/LanguageSelector';
import { logger } from '@/lib/logger';

interface HeroSectionProps {
  branding: OrganizationBranding | null;
  profile: UserProfile | null;
  onContinue: () => void;
  skipLobby: boolean;
  onSkipChange: (skip: boolean) => void;
}

export default function HeroSection({
  branding,
  profile,
  onContinue,
  skipLobby,
  onSkipChange
}: HeroSectionProps) {
  // Use 'lobby' namespace as per official guide
  const { t, i18n } = useTranslation('lobby');
  
  // Official keys from Guia_i18n_Equilibria_Final.docx:
  // - lobby.login_welcome
  // - lobby.dashboard_welcome
  // - lobby.security_note
  const welcomeMessage = t('lobby.login_welcome', branding?.login_message || 'Bienvenido');
  const dashboardWelcome = t('lobby.dashboard_welcome', branding?.dashboard_welcome_text || 'Apoyamos tu salud y rendimiento');
  const securityNote = t('lobby.security_note', 'Tus datos biométricos están protegidos con los más altos estándares de seguridad');
  
  const roleName = profile?.role ? ROLE_DISPLAY_NAMES[profile.role] : 'Usuario';

  logger.debug('HeroSection', 'Translation keys used', {
    language: i18n.language,
    namespace: 'lobby',
    keys: ['lobby.login_welcome', 'lobby.dashboard_welcome', 'lobby.security_note'],
    values: { welcomeMessage, dashboardWelcome, securityNote }
  });

  return (
    <div 
      className="relative min-h-[60vh] flex items-center justify-center text-center px-4 py-16 overflow-hidden"
      style={{
        background: branding?.background_image_url 
          ? `linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(30, 64, 175, 0.9)), url(${branding.background_image_url}) center/cover`
          : `linear-gradient(135deg, ${branding?.primary_color || '#0EA5E9'}, ${branding?.secondary_color || '#1E40AF'})`
      }}
    >
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        {/* Logo */}
        {branding?.logo_url && (
          <div className="flex justify-center mb-8">
            <img 
              src={branding.logo_url} 
              alt="Logo de la organización" 
              className="max-w-[200px] h-auto drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Welcome message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
            {welcomeMessage}
          </h1>
          
          {profile && (
            <div className="text-xl md:text-2xl text-white/90 space-y-2">
              <p className="font-semibold">
                Hola, {profile.full_name || 'Usuario'}
              </p>
              <p className="text-lg">
                {roleName} {profile.organization_name && `en ${profile.organization_name}`}
              </p>
            </div>
          )}

          {/* Dashboard welcome text */}
          <p className="text-xl md:text-2xl text-white/95 italic font-light">
            "{dashboardWelcome}"
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-4 pt-8">
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            {t('lobby.main_message', 'Continuar al Dashboard')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          {/* Skip lobby checkbox */}
          <div className="flex items-center justify-center space-x-2 text-white/90">
            <Checkbox
              id="skip-lobby"
              checked={skipLobby}
              onCheckedChange={(checked) => onSkipChange(checked === true)}
              className="border-white data-[state=checked]:bg-white data-[state=checked]:text-gray-900"
            />
            <label
              htmlFor="skip-lobby"
              className="text-sm cursor-pointer hover:text-white transition-colors"
            >
              {t('lobby.login_hint', 'No mostrar esta página nuevamente')}
            </label>
          </div>
        </div>

        {/* Security note */}
        <p className="text-xs text-white/70 max-w-2xl mx-auto pt-4">
          🔒 {securityNote}
        </p>
      </div>
    </div>
  );
}