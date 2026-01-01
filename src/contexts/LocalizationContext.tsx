import { createContext, useContext, useEffect, useState } from 'react';
import { Language, hispanicCountries } from '../lib/i18n';

interface LocalizationContextType {
  language: Language;
  country: string | null;
  loading: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const detectedCountry = data.country_code;

      setCountry(detectedCountry);

      if (hispanicCountries.includes(detectedCountry)) {
        setLanguage('es');
      } else {
        setLanguage('en');
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      setLanguage('en');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationContext.Provider value={{ language, country, loading }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
