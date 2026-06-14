import Link from 'next/link';
import { FileText, Cpu, FileCode, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    number: 1,
    icon: FileText,
    title: 'Upload Documents',
    description: 'Upload PDF, DOCX, or TXT files that the chatbot will use as its knowledge base.',
    details: [
      'Supported formats: PDF, DOCX, TXT',
      'Documents are automatically processed and embedded',
      'Manage uploaded files from the document dashboard',
    ],
    href: '/admin/documents',
    action: 'Go to Documents',
  },
  {
    number: 2,
    icon: Cpu,
    title: 'Configure AI Providers',
    description: 'Connect your AI provider (OpenAI, Anthropic, etc.) and select models.',
    details: [
      'Add API keys for OpenAI, Anthropic, or other providers',
      'Select default models for chat and embeddings',
      'Test your provider connection',
    ],
    href: '/admin/settings',
    action: 'Configure Providers',
  },
  {
    number: 3,
    icon: FileCode,
    title: 'Create Agent Prompts',
    description: 'Write custom agent.md prompt files to control chatbot behavior.',
    details: [
      'Define the chatbot personality and instructions',
      'Set response guidelines and constraints',
      'Manage multiple prompt templates for different use cases',
    ],
    href: '/admin/prompts',
    action: 'Manage Prompts',
  },
  {
    number: 4,
    icon: Sliders,
    title: 'Configure Chatbot',
    description: 'Select which documents to use, choose an agent prompt, and fine-tune RAG settings.',
    details: [
      'Pick the documents the chatbot can reference',
      'Select an agent prompt template',
      'Adjust chunk size, retrieval count, and similarity thresholds',
    ],
    href: '/admin/chatbot',
    action: 'Configure Chatbot',
  },
];

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
          Getting Started
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Follow these steps to set up Autobot and start using the RAG-powered chatbot
          with your own documents.
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
                      {step.title}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {step.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <Link href={step.href}>
                  <Button variant="outline" size="sm">
                    {step.action} &rarr;
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section className="mt-12 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Ready to Chat?
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          Once your documents are uploaded and providers are configured, start asking
          questions in the chatbot.
        </p>
        <Link href="/chat">
          <Button size="lg">Open Chatbot</Button>
        </Link>
      </section>
    </div>
  );
}
