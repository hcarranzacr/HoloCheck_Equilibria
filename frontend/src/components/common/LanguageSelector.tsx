import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/lib/logger';
import { apiClient } from '@/lib/api-client';

interface LocaleOption {
  code: string;
  name: string;
  flag: string;
}

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [locales, setLocales] = useState<LocaleOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Load available locales from backend
  useEffect(() => {
    async function loadLocales() {
      try {
        logger.info('LanguageSelector', 'Loading available locales from backend');
        const response = await apiClient.i18n.getLocales('lobby');
        
        if (response.data) {
          setLocales(response.data);
          logger.info('LanguageSelector', `✓ Loaded ${response.data.length} locales`, response.data);
        }
      } catch (error) {
        logger.error('LanguageSelector', 'Failed to load locales', error);
        // Fallback to default locales
        setLocales([
          { code: 'es', name: 'Español', flag: '🇪🇸' },
          { code: 'en', name: 'English', flag: '🇺🇸' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    loadLocales();
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    const currentLang = i18n.language;
    logger.info('LanguageSelector', `User selected language: ${languageCode} (current: ${currentLang})`);
    
    try {
      await i18n.changeLanguage(languageCode);
      logger.info('LanguageSelector', `✓ Language changed to ${languageCode}`);
      
      // Force reload of current namespace
      const currentNS = i18n.options.defaultNS || 'ui';
      logger.debug('LanguageSelector', `Reloading namespace: ${currentNS}`);
      await i18n.reloadResources(languageCode, currentNS);
      
      logger.info('LanguageSelector', `✓ Translations reloaded for ${languageCode}`);
    } catch (error) {
      logger.error('LanguageSelector', `Failed to change language to ${languageCode}`, error);
    }
  };

  if (loading || locales.length === 0) {
    return null;
  }

  // Find current language (handle regional variants like es-CR -> es)
  const currentLanguage = locales.find(lang => lang.code === i18n.language) || 
                         locales.find(lang => i18n.language.startsWith(lang.code.split('-')[0])) ||
                         locales[0];
  
  logger.debug('LanguageSelector', `Current language: ${currentLanguage.code}`, {
    available: locales.map(l => l.code),
    i18nLanguage: i18n.language,
  });

  return (
    <Select value={currentLanguage.code} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[220px] bg-white/90 backdrop-blur-sm border-gray-200">
        <Globe className="w-4 h-4 mr-2" />
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{currentLanguage.flag}</span>
            <span>{currentLanguage.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <span className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}