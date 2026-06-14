'use client';

import { Bot } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {t('footer.poweredBy')} <Bot className="h-3.5 w-3.5" />
        </p>
      </div>
    </footer>
  );
}
