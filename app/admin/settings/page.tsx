'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, X, Brain, Cpu, Key, Link, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const PRESETS = [
  { id: 'openai', label: 'OpenAI', defaultBaseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o', docsUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', label: 'Anthropic', defaultBaseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-sonnet-4-20250514', docsUrl: 'https://console.anthropic.com/keys' },
  { id: 'openrouter', label: 'OpenRouter', defaultBaseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'openai/gpt-4o', docsUrl: 'https://openrouter.ai/keys' },
  { id: 'gemini', label: 'Google Gemini', defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta', defaultModel: 'gemini-2.0-flash', docsUrl: 'https://aistudio.google.com/apikey' },
  { id: 'nvidia', label: 'NVIDIA NIM', defaultBaseUrl: 'https://integrate.api.nvidia.com/v1', defaultModel: 'meta/llama-3.1-70b-instruct', docsUrl: 'https://build.nvidia.com/' },
  { id: 'custom', label: 'Custom (OpenAI-compatible)', defaultBaseUrl: 'http://localhost:11434/v1', defaultModel: 'llama3', docsUrl: '' },
];

type ProviderItem = {
  id: string;
  type: string;
  label: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  isActive: boolean;
};

export default function AdminSettingsPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const [formType, setFormType] = useState('custom');
  const [formLabel, setFormLabel] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formKey, setFormKey] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setProviders(data.providers || []);
      setActiveId(data.activeProviderId);
    } catch {
      console.error('Failed to load providers');
    } finally {
      setLoaded(true);
    }
  }

  async function api(action: string, payload: Record<string, unknown>) {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    await loadProviders();
  }

  function handlePresetSelect(id: string) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setFormType(id);
    setFormBaseUrl(preset.defaultBaseUrl);
    setFormModel(preset.defaultModel);
    setFormLabel(preset.label);
    setFormKey('');
  }

  async function handleAddProvider() {
    await api('upsert', {
      config: {
        type: formType,
        label: formLabel || PRESETS.find((p) => p.id === formType)?.label || formType,
        baseUrl: formBaseUrl,
        model: formModel,
        apiKey: formKey,
      },
    });
    setAdding(false);
  }

  async function handleSetActive(id: string) {
    await api('set-active', { id });
  }

  async function handleRemove(id: string) {
    await api('remove', { id });
  }

  if (!loaded) return (
    <div className="flex min-h-[400px] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading...
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">AI Providers</h1>
          </div>
          <p className="mt-2 text-muted-foreground">Configure multiple AI providers and models.</p>
        </div>
        <Button onClick={() => { setAdding(true); setFormType('custom'); setFormLabel(''); setFormBaseUrl(''); setFormModel(''); setFormKey(''); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Provider
        </Button>
      </div>

      <div className="mb-8 space-y-4">
        {providers.map((p) => (
          <Card key={p.id} className={p.isActive ? 'ring-2 ring-ring' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    {p.label}
                    {p.isActive && <Badge>Active</Badge>}
                  </CardTitle>
                  <CardDescription>{p.type} &middot; {p.model}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {!p.isActive && (
                    <Button variant="outline" size="sm" onClick={() => handleSetActive(p.id)}>
                      <Check className="mr-1.5 h-3.5 w-3.5" /> Set Active
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(p.id)}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Link className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Base URL:</span> {p.baseUrl}
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Model:</span> {p.model}
                </div>
                <div className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">API Key:</span> {p.apiKey ? '••••••••' : 'Not set'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {providers.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <Cpu className="h-12 w-12" />
            <p>No providers configured. Click &quot;Add Provider&quot; to get started.</p>
          </div>
        )}
      </div>

      {adding && (
        <Card>
          <CardHeader>
            <CardTitle>Add Provider</CardTitle>
            <CardDescription>Select a preset or configure manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Preset</Label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <Button
                    key={p.id}
                    variant={formType === p.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePresetSelect(p.id)}
                  >
                    {p.id === 'openai' || p.id === 'anthropic' || p.id === 'gemini' ? <Brain className="mr-1.5 h-3.5 w-3.5" /> : <Cpu className="mr-1.5 h-3.5 w-3.5" />}
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-label">Label</Label>
              <Input id="form-label" value={formLabel} onChange={(e) => setFormLabel(e.target.value)} placeholder="My OpenAI" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-base-url">Base URL</Label>
              <Input id="form-base-url" value={formBaseUrl} onChange={(e) => setFormBaseUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-model">Model</Label>
              <Input id="form-model" value={formModel} onChange={(e) => setFormModel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-key">API Key</Label>
              <Input id="form-key" type="password" value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder={formType === 'custom' ? 'optional' : 'sk-...'} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProvider}><Plus className="mr-1.5 h-4 w-4" /> Add</Button>
              <Button variant="outline" onClick={() => setAdding(false)}><X className="mr-1.5 h-4 w-4" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
