'use client';

import { useLocale } from '@/components/locale-provider';

export default function Loading() {
  const { t } = useLocale();

  return (
    <div className="container mx-auto flex min-h-[400px] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
}
