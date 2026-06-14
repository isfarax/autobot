'use client';

import Link from 'next/link';
import { Shield, MessageSquare, FileText, ArrowRight, Bot } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const iconMap = [Shield, MessageSquare, FileText];

const featureKeys = [
  { titleKey: 'home.features.adminPortal.title', descKey: 'home.features.adminPortal.description', href: '/admin' },
  { titleKey: 'home.features.ragChatbot.title', descKey: 'home.features.ragChatbot.description', href: '/chat' },
  { titleKey: 'home.features.documentManagement.title', descKey: 'home.features.documentManagement.description', href: '/admin/documents' },
];

export default function Home() {
  const { t } = useLocale();

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {t('home.welcome')}{' '}
          <span className="text-primary">Autobot</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          {t('home.description')}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/chat">
            <Button size="lg">
              <MessageSquare className="mr-2 h-5 w-5" />
              {t('home.tryChatbot')}
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="lg">
              <Shield className="mr-2 h-5 w-5" />
              {t('home.goToAdmin')}
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">{t('home.keyFeatures')}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featureKeys.map((feature, i) => {
            const Icon = iconMap[i];
            return (
              <Link key={feature.titleKey} href={feature.href}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{t(feature.titleKey)}</CardTitle>
                    <CardDescription>{t(feature.descKey)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                      {t('home.learnMore')} <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="text-center">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">{t('home.getStarted')}</h2>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          {t('home.getStartedDesc')}
        </p>
        <Link href="/admin">
          <Button>
            <ArrowRight className="mr-2 h-5 w-5 rotate-45" />
            {t('home.uploadDocuments')}
          </Button>
        </Link>
      </section>
    </div>
  );
}
