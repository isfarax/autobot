import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ragDocuments, aiProviders, agentPrompts, chatbotConfig } from '@/db/schema';
import { deleteDocumentChunks } from '@/src/services/vector-store';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const CHATBOT_DEFAULTS = { chunkSize: 1000, chunkOverlap: 200, topK: 5, temperature: 0.7, maxTokens: 2048 };

export async function POST(req: NextRequest) {
  try {
    const { categories } = await req.json();
    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: 'No categories provided' }, { status: 400 });
    }

    const results: Record<string, string> = {};

    if (categories.includes('documents')) {
      const docs = await db.select().from(ragDocuments);
      for (const doc of docs) {
        const storedPath = path.join(UPLOAD_DIR, doc.filename);
        try { await fs.unlink(storedPath); } catch { /* file may not exist */ }
      }
      const docIds = docs.map((d) => d.filename);
      if (docIds.length > 0) {
        try { await deleteDocumentChunks(docIds); } catch { /* ChromaDB may be unavailable */ }
      }
      await db.delete(ragDocuments);
      results.documents = `Deleted ${docs.length} document(s)`;
    }

    if (categories.includes('providers')) {
      const rows = await db.delete(aiProviders).returning();
      results.providers = `Deleted ${rows.length} provider(s)`;
    }

    if (categories.includes('prompts')) {
      const rows = await db.delete(agentPrompts).returning();
      results.prompts = `Deleted ${rows.length} prompt(s)`;
    }

    if (categories.includes('chatbot')) {
      await db.delete(chatbotConfig);
      await db.insert(chatbotConfig).values({ key: 'chatbot', value: CHATBOT_DEFAULTS });
      results.chatbot = 'Reset to defaults';
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Reset error:', error);
    const message = error instanceof Error ? error.message : 'Failed to reset';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
