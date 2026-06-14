'use client';

import Link from 'next/link';
import { Bot, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';

const navigation = [
  { key: 'home', href: '/' },
  { key: 'gettingStarted', href: '/getting-started' },
  { key: 'chatbot', href: '/chat' },
  { key: 'about', href: '/about' },
  { key: 'admin', href: '/admin' },
];

const LANGUAGES = [
  { code: 'so' as const, label: 'Soomaali' },
  { code: 'en' as const, label: 'English' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">{t('header.brand')}</span>
        </Link>
        <nav className="flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(`header.nav.${item.key}`)}
            </Link>
          ))}
          <div className="flex items-center gap-1">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={locale === lang.code ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocale(lang.code)}
                className={`px-2 text-xs ${locale === lang.code ? '' : 'text-muted-foreground'}`}
                aria-label={t('header.language')}
              >
                {lang.label === 'Soomaali' ? 'So' : 'En'}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark' ? t('header.themeToggle.dark') : t('header.themeToggle.light')
            }
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
