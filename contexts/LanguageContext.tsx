import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../locales/en.json';
import ha from '../locales/ha.json';

type Language = 'ha' | 'en';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LANGUAGE_KEY = 'hama_language';

const translations: Record<Language, Record<string, unknown>> = {
  ha,
  en
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const readByPath = (source: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== 'object' || !(part in acc)) return undefined;
    return (acc as Record<string, unknown>)[part];
  }, source);
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ha');

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'ha' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    localStorage.setItem(LANGUAGE_KEY, next);
  };

  const t = (key: string): string => {
    const active = readByPath(translations[language], key);
    if (typeof active === 'string') return active;

    const fallback = readByPath(translations.ha, key);
    if (typeof fallback === 'string') return fallback;

    return key;
  };

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
