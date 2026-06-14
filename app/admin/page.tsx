'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Cpu, FileCode, Sliders, Activity, MessageSquare, Terminal, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const iconMap = [FileText, Cpu, FileCode, Sliders];

const cardKeys = [
  { titleKey: 'admin.cards.documents.title', descKey: 'admin.cards.documents.description', href: '/admin/documents', badgeKey: 'docCount' as const, badgeLabelKey: 'admin.systemStatus.files', actionKey: 'admin.cards.documents.action' },
  { titleKey: 'admin.cards.aiProviders.title', descKey: 'admin.cards.aiProviders.description', href: '/admin/settings', badgeKey: 'providerCount' as const, badgeLabelKey: '', actionKey: 'admin.cards.aiProviders.action' },
  { titleKey: 'admin.cards.agentPrompts.title', descKey: 'admin.cards.agentPrompts.description', href: '/admin/prompts', badgeKey: 'promptCount' as const, badgeLabelKey: '', actionKey: 'admin.cards.agentPrompts.action' },
  { titleKey: 'admin.cards.chatbotConfig.title', descKey: 'admin.cards.chatbotConfig.description', href: '/admin/chatbot', badgeKey: undefined, badgeLabelKey: '', actionKey: 'admin.cards.chatbotConfig.action' },
];

const resetCategories = [
  { id: 'documents', labelKey: 'admin.reset.categories.documents.label', descKey: 'admin.reset.categories.documents.desc' },
  { id: 'providers', labelKey: 'admin.reset.categories.providers.label', descKey: 'admin.reset.categories.providers.desc' },
  { id: 'prompts', labelKey: 'admin.reset.categories.prompts.label', descKey: 'admin.reset.categories.prompts.desc' },
  { id: 'chatbot', labelKey: 'admin.reset.categories.chatbot.label', descKey: 'admin.reset.categories.chatbot.desc' },
] as const;

export default function AdminPage() {
  const { t } = useLocale();
  const [stats, setStats] = useState({ docCount: 0, promptCount: 0, providerCount: 0 });
  const [resetSelection, setResetSelection] = useState<string[]>([]);
  const [confirmText, setConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/documents').then((r) => r.json()).catch(() => ({ files: [] })),
      fetch('/api/admin/prompts').then((r) => r.json()).catch(() => []),
      fetch('/api/admin/settings').then((r) => r.json()).catch(() => ({ providers: [] })),
    ]).then(([docs, prompts, settings]) => {
      setStats({
        docCount: docs.files?.length || 0,
        promptCount: Array.isArray(prompts) ? prompts.length : 0,
        providerCount: settings.providers?.length || 0,
      });
    });
  }, []);

  function toggleResetCategory(id: string) {
    setResetSelection((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
    setResetResult(null);
  }

  function toggleSelectAll() {
    if (resetSelection.length === resetCategories.length) {
      setResetSelection([]);
    } else {
      setResetSelection(resetCategories.map((c) => c.id));
    }
    setResetResult(null);
  }

  async function handleReset() {
    if (confirmText !== 'reset') return;
    setResetting(true);
    setResetResult(null);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: resetSelection }),
      });
      const data = await res.json();
      if (data.success) {
        const summary = Object.values(data.results as Record<string, string>).join(', ');
        setResetResult(t('admin.reset.complete', { summary }));
        setResetSelection([]);
        setConfirmText('');
        const [docs, prompts, settings] = await Promise.all([
          fetch('/api/documents').then((r) => r.json()).catch(() => ({ files: [] })),
          fetch('/api/admin/prompts').then((r) => r.json()).catch(() => []),
          fetch('/api/admin/settings').then((r) => r.json()).catch(() => ({ providers: [] })),
        ]);
        setStats({
          docCount: docs.files?.length || 0,
          promptCount: Array.isArray(prompts) ? prompts.length : 0,
          providerCount: settings.providers?.length || 0,
        });
      } else {
        setResetResult(t('common.error') + ': ' + data.error);
      }
    } catch {
      setResetResult(t('admin.reset.failedToConnect'));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('admin.title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('admin.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cardKeys.map((card, i) => {
          const Icon = iconMap[i];
          const badgeVal = card.badgeKey ? stats[card.badgeKey] : undefined;
          return (
            <Link key={card.titleKey} href={card.href}>
              <Card className="transition-colors hover:bg-muted/50 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <CardTitle>{t(card.titleKey)}</CardTitle>
                    </div>
                    {badgeVal !== undefined && (
                      <Badge>{badgeVal}{card.badgeLabelKey ? ` ${t(card.badgeLabelKey)}` : ''}</Badge>
                    )}
                  </div>
                  <CardDescription>{t(card.descKey)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    {t(card.actionKey)} &rarr;
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </span>
              <CardTitle>{t('admin.systemStatus.title')}</CardTitle>
            </div>
            <CardDescription>{t('admin.systemStatus.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('admin.systemStatus.database')}</span>
              <Badge variant="outline">{t('admin.systemStatus.connected')}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('admin.systemStatus.documents')}</span>
              <Badge variant="outline">{stats.docCount} {t('admin.systemStatus.files')}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('admin.systemStatus.aiProviders')}</span>
              <Badge variant="outline">{stats.providerCount} {t('admin.systemStatus.configured')}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/chat"><Button><MessageSquare className="mr-2 h-4 w-4" />{t('admin.openChatbot')}</Button></Link>
        <Link href="/api/graphql-playground"><Button variant="outline"><Terminal className="mr-2 h-4 w-4" />{t('admin.graphQL')}</Button></Link>
      </div>

      <section className="mt-12">
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>{t('admin.reset.title')}</CardTitle>
            </div>
            <CardDescription>
              {t('admin.reset.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={resetSelection.length === resetCategories.length}
                  onCheckedChange={toggleSelectAll}
                />
                {t('admin.reset.selectAll')}
              </Label>
              {resetCategories.map((cat) => {
                const CatIcon = [FileText, Cpu, FileCode, Sliders][resetCategories.findIndex((c) => c.id === cat.id)];
                return (
                  <Label key={cat.id} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-destructive/50 has-[data-state=checked]:bg-destructive/5 cursor-pointer">
                    <Checkbox
                      checked={resetSelection.includes(cat.id)}
                      onCheckedChange={() => toggleResetCategory(cat.id)}
                    />
                    <CatIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="text-sm font-medium">{t(cat.labelKey)}</span>
                      <p className="text-xs text-muted-foreground">{t(cat.descKey)}</p>
                    </div>
                  </Label>
                );
              })}
            </div>

            {resetSelection.length > 0 && (
              <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  {t('admin.reset.typeToConfirm', { key: 'reset' })}
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={t('admin.reset.typeToConfirm', { key: 'reset' })}
                  className="border-destructive/30 focus-visible:ring-destructive"
                />
                <Button
                  variant="destructive"
                  disabled={confirmText !== 'reset' || resetting}
                  onClick={handleReset}
                  className="w-full"
                >
                  {resetting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('admin.reset.resetting')}</>
                  ) : (
                    <><Trash2 className="mr-2 h-4 w-4" /> {t('admin.reset.resetBtn', { count: resetSelection.length })}</>
                  )}
                </Button>
                {resetResult && (
                  <p className={`text-sm ${resetResult.startsWith(t('common.error')) ? 'text-destructive' : 'text-primary'}`}>
                    {resetResult}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
