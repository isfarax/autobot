import { Bot } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Autobot Admin Portal. All rights reserved.
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Powered by <Bot className="h-3.5 w-3.5" /> Next.js, Payload CMS &amp; AI
        </p>
      </div>
    </footer>
  );
}
