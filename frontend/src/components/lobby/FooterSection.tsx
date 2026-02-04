import { OrganizationBranding } from '@/types/branding';
import { Mail, Phone, Globe, Facebook, Linkedin, Instagram, Twitter, Youtube } from 'lucide-react';

interface FooterSectionProps {
  branding: OrganizationBranding | null;
}

export default function FooterSection({ branding }: FooterSectionProps) {
  const socialLinks = branding?.social_links;
  const hasContact = branding?.contact_email || branding?.contact_phone || branding?.website_url;
  const hasSocial = socialLinks && Object.keys(socialLinks).length > 0;

  // Don't render if no contact info or social links
  if (!hasContact && !hasSocial) {
    return null;
  }

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, React.ReactNode> = {
      facebook: <Facebook className="w-5 h-5" />,
      linkedin: <Linkedin className="w-5 h-5" />,
      instagram: <Instagram className="w-5 h-5" />,
      twitter: <Twitter className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />
    };
    return icons[platform.toLowerCase()] || null;
  };

  return (
    <footer className="py-12 px-4 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Contact Information */}
        {hasContact && (
          <div className="flex flex-wrap justify-center gap-6 text-gray-300">
            {branding?.contact_email && (
              <a 
                href={`mailto:${branding.contact_email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>{branding.contact_email}</span>
              </a>
            )}
            
            {branding?.contact_phone && (
              <a 
                href={`tel:${branding.contact_phone}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{branding.contact_phone}</span>
              </a>
            )}
            
            {branding?.website_url && (
              <a 
                href={branding.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span>Sitio Web</span>
              </a>
            )}
          </div>
        )}

        {/* Social Media Links */}
        {hasSocial && (
          <div className="flex justify-center gap-4">
            {Object.entries(socialLinks || {}).map(([platform, url]) => {
              if (!url) return null;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                  aria-label={platform}
                >
                  {getSocialIcon(platform)}
                </a>
              );
            })}
          </div>
        )}

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm pt-8 border-t border-gray-800">
          <p>© {new Date().getFullYear()} HoloCheck Equilibria - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}