'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Edit } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Prompt = { id: number; name: string; content: string; description: string | null; createdAt: string };

export default function AgentPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newContent, setNewContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [editPreview, setEditPreview] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/admin/prompts');
    const data = await res.json();
    setPrompts(Array.isArray(data) ? data : []);
  }

  async function handleCreate() {
    if (!newName || !newContent) return;
    await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', data: { name: newName, content: newContent, description: newDesc } }),
    });
    setNewName(''); setNewDesc(''); setNewContent(''); setPreview(false);
    await load();
  }

  async function handleUpdate() {
    if (!editing) return;
    await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: editing.id, data: { name: editing.name, content: editing.content, description: editing.description } }),
    });
    setEditing(null); setEditPreview(false);
    await load();
  }

  async function handleDelete(id: number) {
    await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await load();
  }

  const renderMarkdown = (content: string) => (
    <div className="prose prose-sm max-w-none prose-pre:bg-muted prose-code:text-foreground">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Agent Prompts</h1>
        <p className="mt-2 text-muted-foreground">Manage system prompts / agent.md files for the chatbot.</p>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Create New Prompt</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. customer-support-agent" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <Button onClick={handleCreate} disabled={!newName}>Create</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prompt Content</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
                {preview ? <Edit className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
                {preview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            <CardDescription>Markdown content for the agent prompt.</CardDescription>
          </CardHeader>
          <CardContent>
            {preview ? (
              <div className="min-h-[300px] rounded-md border border-border bg-background p-4">
                {newContent ? renderMarkdown(newContent) : <p className="text-muted-foreground">Nothing to preview</p>}
              </div>
            ) : (
              <div className="h-[300px] rounded-md border border-border">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="markdown"
                  theme="vs-light"
                  value={newContent}
                  onChange={(val) => setNewContent(val || '')}
                  options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {prompts.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{p.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing({ ...p }); setEditPreview(false); }}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
                </div>
              </div>
              {p.description && <CardDescription>{p.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none rounded bg-muted/50 p-3">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
                  {p.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ))}
        {prompts.length === 0 && <p className="text-center text-muted-foreground">No prompts yet.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50" onClick={() => setEditing(null)}>
          <Card className="flex max-h-[90vh] w-full max-w-3xl flex-col" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit: {editing.name}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setEditPreview(!editPreview)}>
                  {editPreview ? <Edit className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
                  {editPreview ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                {editPreview ? (
                  <div className="min-h-[400px] rounded-md border border-border bg-background p-4">
                    {renderMarkdown(editing.content)}
                  </div>
                ) : (
                  <div className="h-[400px] rounded-md border border-border">
                    <MonacoEditor
                      height="100%"
                      defaultLanguage="markdown"
                      theme="vs-light"
                      value={editing.content}
                      onChange={(val) => setEditing({ ...editing, content: val || '' })}
                      options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="outline" onClick={() => { setEditing(null); setEditPreview(false); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
