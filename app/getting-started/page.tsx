'use client';

import Link from 'next/link';
import { FileText, Cpu, FileCode, Sliders } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    number: 1,
    icon: FileText,
    titleKey: 'gettingStarted.steps.uploadDocuments.title',
    descKey: 'gettingStarted.steps.uploadDocuments.description',
    detailsKey: 'gettingStarted.steps.uploadDocuments.details',
    href: '/admin/documents',
    actionKey: 'gettingStarted.steps.uploadDocuments.action',
  },
  {
    number: 2,
    icon: Cpu,
    titleKey: 'gettingStarted.steps.configureProviders.title',
    descKey: 'gettingStarted.steps.configureProviders.description',
    detailsKey: 'gettingStarted.steps.configureProviders.details',
    href: '/admin/settings',
    actionKey: 'gettingStarted.steps.configureProviders.action',
  },
  {
    number: 3,
    icon: FileCode,
    titleKey: 'gettingStarted.steps.createPrompts.title',
    descKey: 'gettingStarted.steps.createPrompts.description',
    detailsKey: 'gettingStarted.steps.createPrompts.details',
    href: '/admin/prompts',
    actionKey: 'gettingStarted.steps.createPrompts.action',
  },
  {
    number: 4,
    icon: Sliders,
    titleKey: 'gettingStarted.steps.configureChatbot.title',
    descKey: 'gettingStarted.steps.configureChatbot.description',
    detailsKey: 'gettingStarted.steps.configureChatbot.details',
    href: '/admin/chatbot',
    actionKey: 'gettingStarted.steps.configureChatbot.action',
  },
];

export default function GettingStartedPage() {
  const { t } = useLocale();

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
          {t('gettingStarted.title')}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t('gettingStarted.subtitle')}
        </p>
      </section>

      <div className="mx-auto max-w-3xl space-y-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.number} className="relative">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {step.number}. {t(step.titleKey)}
                    </CardTitle>
                    <CardDescription>{t(step.descKey)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {(t(step.detailsKey) as string).split(',').map((detail: string) => (
                    <li key={detail}>{detail.trim()}</li>
                  ))}
                </ul>
                <Link href={step.href}>
                  <Button variant="outline" size="sm">
                    {t(step.actionKey)} &rarr;
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section className="mt-12 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          {t('gettingStarted.readyToChat')}
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          {t('gettingStarted.readyToChatDesc')}
        </p>
        <Link href="/chat">
          <Button size="lg">{t('gettingStarted.openChatbot')}</Button>
        </Link>
      </section>
    </div>
  );
}
