import { retrieveRelevantChunks } from './retriever';
import { generateChatCompletion, getActiveProvider } from './llm';
import { getConfig } from './chatbot-config';
import { listPrompts } from './agent-prompts';

export async function agenticAnswer(query: string): Promise<{ answer: string; sources?: string[] }> {
  const config = await getConfig();
  const activeProvider = await getActiveProvider();

  // Fetch all agent prompts and combine them into the system prompt
  const allPrompts = await listPrompts();
  const promptSections = allPrompts
    .map((p) => `## ${p.name}\n${p.content}`)
    .join('\n\n---\n\n');

  const systemPrompt = promptSections
    ? `You are a helpful assistant. Follow these instructions:\n\n${promptSections}`
    : 'You are a helpful assistant that answers questions based on the provided document context.';

  // Only retrieve chunks for documents marked as includedInRag
  const chunks = await retrieveRelevantChunks(query, config.topK);
  const sources = [...new Set(chunks.map((c) => (c.metadata as any).filename as string).filter(Boolean))];
  const context = chunks.map((c) => c.text).join('\n\n---\n\n');

  if (!activeProvider || !activeProvider.apiKey) {
    if (chunks.length > 0) {
      return {
        answer: `Found relevant information in your documents:\n\n${context.slice(0, 3000)}\n\nConfigure an AI provider in Admin > AI Settings for better responses.`,
        sources,
      };
    }
    return { answer: 'No relevant documents found. Upload documents first or configure an AI provider.' };
  }

  if (chunks.length === 0) {
    const answer = await generateChatCompletion(
      systemPrompt,
      [{ role: 'user', content: query }],
      { temperature: config.temperature, maxTokens: config.maxTokens },
    );
    return { answer };
  }

  const userPrompt = `Document context:\n${context}\n\nQuestion: ${query}`;
  const answer = await generateChatCompletion(systemPrompt, [
    { role: 'user', content: userPrompt },
  ], { temperature: config.temperature, maxTokens: config.maxTokens });

  return { answer, sources };
}
