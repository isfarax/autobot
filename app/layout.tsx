import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/theme-provider';
import { JetBrains_Mono, Geist } from "next/font/google";
import { cn } from "@/src/lib/utils";

const geistHeading = Geist({subsets:['latin'],variable:'--font-heading'});

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: 'Autobot Admin Portal',
  description: 'Admin portal website with RAG chatbot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-mono", jetbrainsMono.variable, geistHeading.variable)} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
