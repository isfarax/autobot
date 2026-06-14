import { Bot, BrainCircuit, FileType, Layers, Sparkles, MessagesSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    icon: Bot,
    title: 'What is Autobot?',
    description:
      'Autobot is an intelligent admin portal with a Retrieval-Augmented Generation (RAG) chatbot. It empowers administrators to upload documents and lets users query them using natural language, powered by AI.',
  },
  {
    icon: BrainCircuit,
    title: 'How it Works',
    description:
      'Documents are processed, chunked, and embedded into a vector database. When you ask a question, the system retrieves the most relevant document chunks and generates a contextual answer using an AI model.',
  },
  {
    icon: FileType,
    title: 'Supported Formats',
    items: ['PDF documents', 'DOCX (Word) files', 'TXT text files'],
  },
  {
    icon: Layers,
    title: 'Technology Stack',
    items: ['Next.js 16 & React 19', 'Payload CMS 3', 'PostgreSQL & Drizzle ORM', 'ChromaDB Vector Store', 'OpenAI / Anthropic AI'],
  },
];

const highlights = [
  {
    icon: Sparkles,
    value: 'RAG-Powered',
    label: 'Context-aware answers from your documents',
  },
  {
    icon: MessagesSquare,
    value: 'Multi-Format',
    label: 'Supports PDF, DOCX, and TXT files',
  },
  {
    icon: Bot,
    value: 'AI Providers',
    label: 'OpenAI, Anthropic, and more',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">About Autobot</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Learn more about the platform, how it works, and the technology behind it.
        </p>
      </section>

      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {highlights.map((h) => {
          const Icon = h.icon;
          return (
            <Card key={h.value} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{h.value}</CardTitle>
                <CardDescription>{h.label}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <CardTitle>{s.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {s.description && (
                  <p className="text-muted-foreground">{s.description}</p>
                )}
                {s.items && (
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    {s.items.map((item) => (
                      <li key={item}>{item}</li>
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
