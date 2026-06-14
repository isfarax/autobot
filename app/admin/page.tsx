'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Cpu, FileCode, Sliders, Activity, MessageSquare, Terminal, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const iconMap = [FileText, Cpu, FileCode, Sliders];

const cards = [
  { title: 'Documents', description: 'Upload, view, and manage documents for RAG', href: '/admin/documents', badgeKey: 'docCount' as const, badgeLabel: 'files', action: 'Manage documents' },
  { title: 'AI Providers', description: 'Configure AI providers and models', href: '/admin/settings', badgeKey: 'providerCount' as const, badgeLabel: '', action: 'Configure' },
  { title: 'Agent Prompts', description: 'Create and manage agent.md prompt files', href: '/admin/prompts', badgeKey: 'promptCount' as const, badgeLabel: '', action: 'Manage prompts' },
  { title: 'Chatbot Config', description: 'Configure RAG settings, select documents, agent prompts', href: '/admin/chatbot', badgeKey: undefined, badgeLabel: '', action: 'Configure' },
];

const resetCategories = [
  { id: 'documents', label: 'Documents', description: 'Deletes all documents and their uploaded files from disk' },
  { id: 'providers', label: 'AI Providers', description: 'Removes all configured AI providers' },
  { id: 'prompts', label: 'Agent Prompts', description: 'Deletes all agent.md prompt files' },
  { id: 'chatbot', label: 'Chatbot Config', description: 'Resets RAG settings to defaults' },
] as const;

export default function AdminPage() {
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
        setResetResult(`Reset complete: ${summary}`);
        setResetSelection([]);
        setConfirmText('');
        // Refresh stats
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
        setResetResult(`Error: ${data.error}`);
      }
    } catch {
      setResetResult('Failed to connect to server');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your documents, AI providers, agent prompts, and chatbot settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = iconMap[i];
          const badgeVal = card.badgeKey ? stats[card.badgeKey] : undefined;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="transition-colors hover:bg-muted/50 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <CardTitle>{card.title}</CardTitle>
                    </div>
                    {badgeVal !== undefined && (
                      <Badge>{badgeVal}{card.badgeLabel ? ` ${card.badgeLabel}` : ''}</Badge>
                    )}
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    {card.action} &rarr;
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
              <CardTitle>System Status</CardTitle>
            </div>
            <CardDescription>Overview of your system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <Badge variant="outline">Connected</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Documents</span>
              <Badge variant="outline">{stats.docCount} files</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">AI Providers</span>
              <Badge variant="outline">{stats.providerCount} configured</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/chat"><Button><MessageSquare className="mr-2 h-4 w-4" />Open Chatbot</Button></Link>
        <Link href="/api/graphql-playground"><Button variant="outline"><Terminal className="mr-2 h-4 w-4" />GraphQL Playground</Button></Link>
      </div>

      <section className="mt-12">
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Reset</CardTitle>
            </div>
            <CardDescription>
              Select categories to reset. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={resetSelection.length === resetCategories.length}
                  onCheckedChange={toggleSelectAll}
                />
                Select All
              </Label>
              {resetCategories.map((cat) => {
                const Icon = [FileText, Cpu, FileCode, Sliders][resetCategories.findIndex((c) => c.id === cat.id)];
                return (
                  <Label key={cat.id} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-destructive/50 has-[data-state=checked]:bg-destructive/5 cursor-pointer">
                    <Checkbox
                      checked={resetSelection.includes(cat.id)}
                      onCheckedChange={() => toggleResetCategory(cat.id)}
                    />
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="text-sm font-medium">{cat.label}</span>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </Label>
                );
              })}
            </div>

            {resetSelection.length > 0 && (
              <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  Type <kbd className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-xs font-mono">reset</kbd> to confirm
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type 'reset' to confirm"
                  className="border-destructive/30 focus-visible:ring-destructive"
                />
                <Button
                  variant="destructive"
                  disabled={confirmText !== 'reset' || resetting}
                  onClick={handleReset}
                  className="w-full"
                >
                  {resetting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
                  ) : (
                    <><Trash2 className="mr-2 h-4 w-4" /> Reset Selected ({resetSelection.length})</>
                  )}
                </Button>
                {resetResult && (
                  <p className={`text-sm ${resetResult.startsWith('Error') ? 'text-destructive' : 'text-primary'}`}>
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
