'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Paperclip, Send, Trash2, Plus, Clock } from 'lucide-react';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { name: string; url: string }[];
  sources?: string[];
  createdAt: string;
};

type Conversation = {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
};

type TFunc = (key: string, values?: Record<string, string | number>) => string;

function timeAgo(dateStr: string, t: TFunc): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return t('chat.timeAgo.justNow');
  if (secs < 60) return t('chat.timeAgo.seconds', { s: secs });
  const mins = Math.floor(secs / 60);
  if (mins < 60) return t('chat.timeAgo.minutes', { m: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('chat.timeAgo.hours', { h: hrs });
  return t('chat.timeAgo.days', { d: Math.floor(hrs / 24) });
}

function ElapsedTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const diff = Date.now() - startTime;
      setElapsed(diff);
    }, 100);
    return () => clearInterval(id);
  }, [startTime]);

  const secs = Math.floor(elapsed / 1000);
  const ms = elapsed % 1000;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {secs > 0 ? (
        <span>{secs}.{String(ms).padStart(3, '0').slice(0, 1)}s</span>
      ) : (
        <span>{ms}ms</span>
      )}
    </div>
  );
}

export default function ChatPage() {
  const { t } = useLocale();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('chatActiveId');
    return null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadStart, setLoadStart] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { restoreOrLoadConversations(); }, []);
  useEffect(() => {
    if (activeId) {
      localStorage.setItem('chatActiveId', activeId);
    } else {
      localStorage.removeItem('chatActiveId');
    }
  }, [activeId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  async function loadConversations() {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch { /* ignore */ }
  }

  async function restoreOrLoadConversations() {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      const convos = data.conversations || [];
      setConversations(convos);

      if (convos.length > 0) {
        const storedId = localStorage.getItem('chatActiveId');
        const target = storedId && convos.some((c: Conversation) => c.sessionId === storedId)
          ? storedId
          : convos[0].sessionId;
        setActiveId(target);
        await loadMessages(target);
      }
    } catch { /* ignore */ }
  }

  async function loadMessages(sessionId: string) {
    try {
      const res = await fetch(`/api/chat?conversationId=${sessionId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch { /* ignore */ }
  }

  async function handleNew() {
    setActiveId(null);
    setMessages([]);
    setInput('');
    setAttachments([]);
  }

  async function handleSelect(id: string) {
    setActiveId(id);
    setAttachments([]);
    await loadMessages(id);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/chat?conversationId=${id}`, { method: 'DELETE' });
    if (activeId === id) { setActiveId(null); setMessages([]); }
    await loadConversations();
  }

  async function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/chat-files', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setAttachments((prev) => [...prev, { name: data.originalName, url: data.url }]);
      }
    } catch { /* ignore */ }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);
    setLoadStart(Date.now());

    const attachPayload = attachments.length > 0 ? attachments : undefined;
    setAttachments([]);

    const nowStr = new Date().toISOString();
    setMessages((prev) => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMsg,
      attachments: attachPayload,
      createdAt: nowStr,
    }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, conversationId: activeId, files: attachPayload }),
      });
      const data = await res.json();

      if (!activeId && data.conversationId) {
        setActiveId(data.conversationId);
        await loadConversations();
      }

      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply || t('chat.noResponse'),
        sources: data.sources,
        createdAt: new Date().toISOString(),
      }]);

      if (data.conversationId) await loadConversations();
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: t('chat.errorMessage'),
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] gap-4 px-4 py-4">
      <div className="hidden w-64 shrink-0 flex-col md:flex">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t('chat.conversations')}</h2>
          <Button variant="ghost" size="sm" onClick={handleNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {conversations.map((c) => (
            <div key={c.sessionId} className="group flex items-center gap-1">
              <button
                onClick={() => handleSelect(c.sessionId)}
                className={`flex-1 truncate rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeId === c.sessionId ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
              >
                <span className="block truncate">{c.title}</span>
                <span className="block text-xs text-muted-foreground">{timeAgo(c.updatedAt || c.createdAt, t)}</span>
              </button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleDelete(c.sessionId)}
                className="hidden text-muted-foreground hover:text-destructive group-hover:inline-flex"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="px-3 text-xs text-muted-foreground">{t('chat.noConversations')}</p>
          )}
        </div>
      </div>

      <Card className="flex flex-1 flex-col">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-foreground">{t('chat.askMeAnything')}</p>
                <p className="text-sm text-muted-foreground">{t('chat.poweredByDocs')}</p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] space-y-1 rounded-lg px-4 py-3 ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {msg.attachments.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded bg-primary-foreground/20 px-2 py-0.5 text-xs">
                        <Paperclip className="h-3 w-3" />
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-pre:bg-muted prose-code:text-foreground">
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {msg.sources.map((s, i) => (
                      <span key={i} className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className={`text-xs ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {timeAgo(msg.createdAt, t)}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] space-y-2 rounded-lg bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
                <ElapsedTimer startTime={loadStart} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>

        <div className="border-t border-border p-4">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  {a.name}
                  <button onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="ml-1 text-muted-foreground hover:text-destructive">&times;</button>
                </span>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileAttach} />
            <Button type="button" variant="ghost" size="icon" onClick={() => fileRef.current?.click()} disabled={loading}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? (
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                </span>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
