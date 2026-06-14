'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import en from '@/i18n/en.json';
import so from '@/i18n/so.json';
import { t as translate, type TranslationMap } from '@/src/lib/i18n';

type Locale = 'so' | 'en';

type InterpolationValues = Record<string, string | number>;

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: InterpolationValues) => string;
};

const translations: Record<Locale, Record<string, unknown>> = { en, so };

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  defaultLocale = 'so',
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && (stored === 'so' || stored === 'en')) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    localStorage.setItem('locale', locale);
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string, values?: InterpolationValues): string => {
      const data = translations[locale] as TranslationMap;
      return translate(data, key, values);
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
