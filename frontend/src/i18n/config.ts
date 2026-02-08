import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

// Backend loader for i18next
const backendLoader = {
  type: 'backend' as const,
  
  async read(language: string, namespace: string) {
    logger.info('i18n', `Loading translations: ${namespace} (${language})`);
    
    try {
      // Call backend API to get translations
      const response = await apiClient.i18n.getTranslations(namespace, language);
      
      if (response.error) {
        logger.error('i18n', `Failed to load translations: ${response.error}`);
        return {};
      }
      
      const translations = response.data || {};
      const count = Object.keys(translations).length;
      
      logger.info('i18n', `✓ Loaded ${count} translations for ${namespace} (${language})`);
      logger.debug('i18n', `Translation keys loaded:`, Object.keys(translations));
      
      return translations;
    } catch (error) {
      logger.error('i18n', `Error loading translations for ${namespace} (${language})`, error);
      return {};
    }
  },
};

// Initialize i18next
i18n
  .use(backendLoader)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    lng: 'es',
    debug: true,
    
    // Use 'lobby' as namespace for lobby screen (matches screen_code in database)
    ns: ['lobby', 'dashboard', 'common'],
    defaultNS: 'lobby',
    
    interpolation: {
      escapeValue: false,
    },
    
    backend: {
      loadPath: '{{ns}}',
    },
    
    react: {
      useSuspense: false,
    },
  });

logger.i18nInit(i18n.language);

// Log language changes
i18n.on('languageChanged', (lng) => {
  logger.i18nChange(i18n.language, lng);
});

// Log when translations are loaded
i18n.on('loaded', (loaded) => {
  logger.debug('i18n', 'Translations loaded', loaded);
});

// Log initialization errors
i18n.on('failedLoading', (lng, ns, msg) => {
  logger.error('i18n', `Failed loading ${ns} for ${lng}: ${msg}`);
});

// Helper function to load translations for a specific screen
export async function loadTranslations(screenCode: string, locale?: string) {
  const targetLocale = locale || i18n.language;
  logger.i18nLoadTranslations(screenCode, targetLocale);
  
  try {
    await i18n.loadNamespaces(screenCode);
    await i18n.changeLanguage(targetLocale);
    logger.info('i18n', `✓ Translations loaded and language set to ${targetLocale}`);
  } catch (error) {
    logger.error('i18n', `Failed to load translations for ${screenCode}`, error);
  }
}

export default i18n;