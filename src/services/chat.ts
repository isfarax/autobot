import { db } from '@/db';
import { ragDocuments as documentsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { retrieveRelevantChunks } from './retriever';
import { generateChatCompletion } from './llm';
import { addMessage } from './conversations-db';
import { getConfig } from './chatbot-config';
import { listPrompts } from './agent-prompts';
import { chunkText } from './text-chunker';
import { generateEmbeddings } from './embeddings';
import { addDocuments } from './vector-store';
import { processDocument } from './document-processor';
import type { Metadata } from 'chromadb';

export async function indexDocument(buffer: Buffer, mimeType: string, docId: string, originalName: string, category: 'text' | 'audio' | 'video' | 'image' = 'text') {
  const config = await getConfig();
  const processed = await processDocument(buffer, mimeType, originalName, category);

  try {
    await db.insert(documentsTable).values({
      filename: docId,
      originalName,
      fileSize: 0,
      mimeType,
      chunkCount: 0,
      indexed: false,
      extractedText: processed.text.slice(0, 100000),
    });
    console.log(`Document saved to DB: ${originalName}`);
  } catch (err) {
    console.error('Failed to save document to DB:', err);
  }

  const chunks = chunkText(processed.text, docId, config.chunkSize, config.chunkOverlap);
  const texts = chunks.map((c) => c.text);

  let embeddings: number[][] = [];
  try {
    embeddings = await generateEmbeddings(texts);
  } catch {
    // embeddings failed, will use fallback search
  }

  try {
    if (embeddings.length > 0) {
      await addDocuments(
        chunks.map((c, i) => ({
          ...c,
          metadata: {
            ...c.metadata,
            filename: processed.metadata.filename,
            mimeType,
            docId,
          } as Metadata,
        })),
        embeddings,
      );
    }
  } catch {
    // ChromaDB failed, will use fallback search
  }

  // Update indexed status in DB
  try {
    await db.update(documentsTable)
      .set({ chunkCount: chunks.length, indexed: embeddings.length > 0 })
      .where(eq(documentsTable.filename, docId));
  } catch { /* ignore */ }

  return { chunkCount: chunks.length, totalChars: processed.text.length, indexed: embeddings.length > 0 };
}

export async function answerQuery(
  query: string,
  sessionId: string,
): Promise<{ reply: string; sources: string[] }> {
  const config = await getConfig();

  const allPrompts = await listPrompts();
  const promptSections = allPrompts
    .map((p) => `## ${p.name}\n${p.content}`)
    .join('\n\n---\n\n');

  const systemPrompt = promptSections
    ? `You are a helpful assistant. Follow these instructions:\n\n${promptSections}`
    : 'You are a helpful assistant that answers questions based on the provided document context.';

  const relevantChunks = await retrieveRelevantChunks(query, config.topK);

  const context = relevantChunks.map((c) => c.text).join('\n\n---\n\n');
  const sourceNames = [...new Set(relevantChunks.map((c) => (c.metadata as any).filename as string).filter(Boolean))];

  const userPrompt = context
    ? `Context from documents:\n${context}\n\nQuestion: ${query}`
    : `Question: ${query}`;

  let response = '';
  try {
    response = await generateChatCompletion(systemPrompt, [
      { role: 'user', content: userPrompt },
    ], { temperature: config.temperature, maxTokens: config.maxTokens });
  } catch (err) {
    response = relevantChunks.length > 0
      ? `Found ${relevantChunks.length} relevant document sections but couldn't generate an AI response. The relevant text:\n\n${context.slice(0, 2000)}...`
      : 'I could not find relevant information in the documents. Please upload documents first or check your AI provider configuration.';
  }

  try {
    await addMessage(sessionId, 'assistant', response, undefined, sourceNames);
  } catch { /* ignore DB errors */ }

  return { reply: response, sources: sourceNames };
}
