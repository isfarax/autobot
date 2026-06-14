import Link from 'next/link';
import { Shield, MessageSquare, FileText, Upload, ArrowRight, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const iconMap = [Shield, MessageSquare, FileText];

const features = [
  {
    title: 'Admin Portal',
    description: 'Manage documents, users, and AI provider settings from a centralized dashboard.',
    href: '/admin',
  },
  {
    title: 'RAG Chatbot',
    description: 'Ask questions and get answers powered by your uploaded documents with AI-driven retrieval.',
    href: '/chat',
  },
  {
    title: 'Document Management',
    description: 'Upload, organize, and process documents in PDF, DOCX, and TXT formats.',
    href: '/admin/documents',
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Welcome to{' '}
          <span className="text-primary">Autobot</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          An intelligent admin portal with a RAG-powered chatbot that answers questions
          based on your documents.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/chat">
            <Button size="lg">
              <MessageSquare className="mr-2 h-5 w-5" />
              Try the Chatbot
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="lg">
              <Shield className="mr-2 h-5 w-5" />
              Go to Admin
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = iconMap[i];
            return (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="text-center">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Get Started</h2>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          Upload your documents through the admin portal, then ask questions via the chatbot
          to get AI-powered answers based on your content.
        </p>
        <Link href="/admin">
          <Button>
            <Upload className="mr-2 h-5 w-5" />
            Upload Documents
          </Button>
        </Link>
      </section>
    </div>
  );
}
