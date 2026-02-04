import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';

const resources = {
  'en-US': { translation: enUS },
  'es-ES': { translation: esES }
};

const detectUserLocale = (): string => {
  // Check localStorage
  const savedLocale = localStorage.getItem('user_locale');
  if (savedLocale && ['en-US', 'es-ES'].includes(savedLocale)) {
    return savedLocale;
  }
  
  // Check browser language
  const browserLang = navigator.language;
  if (['en-US', 'es-ES'].includes(browserLang)) {
    return browserLang;
  }
  
  // Check language without region
  const langWithoutRegion = browserLang.split('-')[0];
  if (langWithoutRegion === 'es') return 'es-ES';
  if (langWithoutRegion === 'en') return 'en-US';
  
  // Default to Spanish
  return 'es-ES';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectUserLocale(),
    fallbackLng: 'es-ES',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;