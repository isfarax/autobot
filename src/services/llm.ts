import { db } from '@/db';
import { aiProviders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type AIProvider = 'openai' | 'anthropic' | 'openrouter' | 'gemini' | 'nvidia' | 'custom';

export interface ProviderConfig {
  id: string;
  type: AIProvider;
  label: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  isActive: boolean;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
}

let openaiClients = new Map<string, any>();

async function getOpenAIClient(baseUrl: string, apiKey: string) {
  const key = `${baseUrl}::${apiKey}`;
  if (!openaiClients.has(key)) {
    const { default: OpenAI } = await import('openai');
    openaiClients.set(key, new OpenAI({ apiKey, baseURL: baseUrl }));
  }
  return openaiClients.get(key);
}

function toConfig(row: typeof aiProviders.$inferSelect): ProviderConfig {
  return {
    id: String(row.id),
    type: row.type as AIProvider,
    label: row.label,
    apiKey: row.apiKey,
    model: row.model,
    baseUrl: row.baseUrl,
    isActive: row.isActive,
  };
}

export async function getAllProviders(): Promise<ProviderConfig[]> {
  const rows = await db.select().from(aiProviders).orderBy(aiProviders.createdAt);
  return rows.map(toConfig);
}

export async function getActiveProvider(): Promise<ProviderConfig | undefined> {
  const rows = await db.select().from(aiProviders).where(eq(aiProviders.isActive, true)).limit(1);
  return rows[0] ? toConfig(rows[0]) : undefined;
}

export async function getProviderById(id: string): Promise<ProviderConfig | undefined> {
  const rows = await db.select().from(aiProviders).where(eq(aiProviders.id, parseInt(id, 10))).limit(1);
  return rows[0] ? toConfig(rows[0]) : undefined;
}

export async function setActiveProvider(id: string) {
  const numId = parseInt(id, 10);
  await db.update(aiProviders).set({ isActive: false });
  await db.update(aiProviders).set({ isActive: true, updatedAt: new Date() }).where(eq(aiProviders.id, numId));
}

export async function upsertProvider(config: Omit<ProviderConfig, 'id'> & { id?: string }) {
  if (config.id && !isNaN(parseInt(config.id, 10))) {
    await db.update(aiProviders)
      .set({
        type: config.type,
        label: config.label,
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
        isActive: config.isActive ?? false,
        updatedAt: new Date(),
      })
      .where(eq(aiProviders.id, parseInt(config.id, 10)));
  } else {
    await db.insert(aiProviders).values({
      type: config.type,
      label: config.label,
      apiKey: config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl,
      isActive: config.isActive ?? false,
    });
  }
  openaiClients.delete(`${config.baseUrl}::${config.apiKey}`);
}

export async function removeProvider(id: string) {
  await db.delete(aiProviders).where(eq(aiProviders.id, parseInt(id, 10)));
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options: CompletionOptions = {},
  providerId?: string,
): Promise<string> {
  const pc = providerId ? await getProviderById(providerId) : await getActiveProvider();
  if (!pc) throw new Error('No provider configured');

  const openaiCompatible: AIProvider[] = ['openai', 'openrouter', 'nvidia', 'custom'];

  if (openaiCompatible.includes(pc.type)) {
    const client = await getOpenAIClient(pc.baseUrl, pc.apiKey);
    const response = await client.chat.completions.create({
      model: pc.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    });
    return response.choices[0]?.message?.content || '';
  }

  if (pc.type === 'anthropic') {
    const response = await fetch(`${pc.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': pc.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: pc.model,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: options.maxTokens ?? 2048,
        temperature: options.temperature ?? 0.7,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${err}`);
    }
    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  if (pc.type === 'gemini') {
    const url = `${pc.baseUrl}/models/${pc.model}:generateContent?key=${pc.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2048,
        },
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${err}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  throw new Error(`Unsupported provider: ${pc.type}`);
}

export async function generateChatCompletion(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  options: CompletionOptions = {},
  providerId?: string,
): Promise<string> {
  const pc = providerId ? await getProviderById(providerId) : await getActiveProvider();
  if (!pc) throw new Error('No provider configured');

  const openaiCompatible: AIProvider[] = ['openai', 'openrouter', 'nvidia', 'custom'];

  if (openaiCompatible.includes(pc.type)) {
    const client = await getOpenAIClient(pc.baseUrl, pc.apiKey);
    const response = await client.chat.completions.create({
      model: pc.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    });
    return response.choices[0]?.message?.content || '';
  }

  const history = messages.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
  return generateCompletion(systemPrompt, history, options, providerId);
}
