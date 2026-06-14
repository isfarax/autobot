'use client';

import { Bot, BrainCircuit, FileType, Layers, Sparkles, MessagesSquare } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const { t } = useLocale();

  const highlights = [
    { icon: Sparkles, valueKey: 'about.highlights.ragPowered', labelKey: 'about.highlights.ragLabel' },
    { icon: MessagesSquare, valueKey: 'about.highlights.multiFormat', labelKey: 'about.highlights.multiLabel' },
    { icon: Bot, valueKey: 'about.highlights.aiProviders', labelKey: 'about.highlights.aiLabel' },
  ];

  const sections = [
    { icon: Bot, titleKey: 'about.sections.whatIs.title', descriptionKey: 'about.sections.whatIs.description' },
    { icon: BrainCircuit, titleKey: 'about.sections.howItWorks.title', descriptionKey: 'about.sections.howItWorks.description' },
    { icon: FileType, titleKey: 'about.sections.supportedFormats.title', itemsKey: 'about.sections.supportedFormats.items' },
    { icon: Layers, titleKey: 'about.sections.techStack.title', itemsKey: 'about.sections.techStack.items' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">{t('about.title')}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t('about.subtitle')}
        </p>
      </section>

      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {highlights.map((h) => {
          const Icon = h.icon;
          return (
            <Card key={h.valueKey} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t(h.valueKey)}</CardTitle>
                <CardDescription>{t(h.labelKey)}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.titleKey}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <CardTitle>{t(s.titleKey)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {s.descriptionKey && (
                  <p className="text-muted-foreground">{t(s.descriptionKey)}</p>
                )}
                {s.itemsKey && (
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    {(t(s.itemsKey) as string).split(',').map((item: string) => (
                      <li key={item}>{item.trim()}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
