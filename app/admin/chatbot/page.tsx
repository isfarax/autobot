'use client';

import { useState, useEffect } from 'react';
import { Save, Sliders, Scissors, Layers, List, Thermometer, FileStack, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fields = [
  { key: 'chunkSize', label: 'Chunk Size', icon: Scissors },
  { key: 'chunkOverlap', label: 'Chunk Overlap', icon: Layers },
  { key: 'topK', label: 'Top K', icon: List },
  { key: 'temperature', label: 'Temperature', icon: Thermometer },
  { key: 'maxTokens', label: 'Max Tokens', icon: FileStack },
] as const;

type Config = {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  temperature: number;
  maxTokens: number;
};

export default function ChatbotConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/chatbot')
      .then((r) => r.json())
      .then((data) => { setConfig(data); setLoading(false); })
      .catch(() => { setError('Failed to load config'); setLoading(false); });
  }, []);

  async function handleSave() {
    if (!config) return;
    await fetch('/api/admin/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center gap-2 text-muted-foreground">
      <RefreshCw className="h-5 w-5 animate-spin" /> Loading...
    </div>
  );
  if (error) return (
    <div className="flex min-h-[400px] items-center justify-center gap-2 text-destructive">
      {error}
    </div>
  );
  if (!config) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">RAG Settings</h1>
          <p className="mt-2 text-muted-foreground">Configure chunking and retrieval parameters.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
          {saved && <span className="text-sm text-primary">Saved!</span>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <CardTitle>Chunking & Retrieval</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {fields.map(({ key, label, icon: Icon }) => (
              <div key={key} className="space-y-1">
                <Label className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {label}
                </Label>
                <Input
                  type="number"
                  value={config[key as keyof Config]}
                  onChange={(e) => setConfig({ ...config, [key]: Number(e.target.value) })}
                  step={key === 'temperature' ? 0.1 : undefined}
                  min={key === 'temperature' ? 0 : undefined}
                  max={key === 'temperature' ? 2 : undefined}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
