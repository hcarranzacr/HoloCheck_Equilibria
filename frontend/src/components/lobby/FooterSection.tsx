import { OrganizationBranding } from '@/types/branding';
import { Mail, Phone, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/logger';

interface FooterSectionProps {
  branding: OrganizationBranding | null;
}

export default function FooterSection({ branding }: FooterSectionProps) {
  // Use 'lobby' namespace as per official guide
  const { t, i18n } = useTranslation('lobby');
  const currentYear = new Date().getFullYear();
  const organizationName = branding?.organization_name || 'HoloCheck Equilibria';
  
  // Official keys from Guia_i18n_Equilibria_Final.docx:
  // - lobby.footer_contact
  // - lobby.slogan
  // - lobby.powered_by
  const contactTitle = t('lobby.footer_contact', 'Contacto');
  const slogan = t('lobby.slogan', branding?.slogan || 'Biointeligencia para Empresas Conscientes');
  const poweredBy = t('lobby.powered_by', 'Impulsado por Prodeo & QIDIA');

  logger.debug('FooterSection', 'Translation keys used', {
    language: i18n.language,
    namespace: 'lobby',
    keys: ['lobby.footer_contact', 'lobby.slogan', 'lobby.powered_by'],
    values: { contactTitle, slogan, poweredBy }
  });
  
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">{contactTitle}</h3>
            
            {branding?.contact_email && (
              <a 
                href={`mailto:${branding.contact_email}`}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">{branding.contact_email}</span>
              </a>
            )}
            
            {branding?.contact_phone && (
              <a 
                href={`tel:${branding.contact_phone}`}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">{branding.contact_phone}</span>
              </a>
            )}
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            
            {branding?.custom_terms_url && (
              <a 
                href={branding.custom_terms_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <span className="text-sm">Términos y Condiciones</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            
            {branding?.custom_privacy_url && (
              <a 
                href={branding.custom_privacy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <span className="text-sm">Política de Privacidad</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Social Links */}
          {branding?.social_links && Object.keys(branding.social_links).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
              <div className="flex flex-col gap-2">
                {branding.social_links.twitter && (
                  <a 
                    href={branding.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="text-sm">Twitter</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {branding.social_links.facebook && (
                  <a 
                    href={branding.social_links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="text-sm">Facebook</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {branding.social_links.linkedin && (
                  <a 
                    href={branding.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="text-sm">LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {branding.social_links.instagram && (
                  <a 
                    href={branding.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="text-sm">Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Copyright and Powered By */}
        <div className="border-t border-gray-700 pt-8 text-center space-y-2">
          <p className="text-sm text-gray-400">
            © {currentYear} {organizationName}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-500 italic">
            {slogan}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {poweredBy}
          </p>
        </div>
      </div>
    </footer>
  );
}