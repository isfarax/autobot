import { db } from '@/db';
import { chatbotConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type ChatbotConfigValue = {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  temperature: number;
  maxTokens: number;
};

const DEFAULTS: ChatbotConfigValue = {
  chunkSize: 1000,
  chunkOverlap: 200,
  topK: 5,
  temperature: 0.7,
  maxTokens: 2048,
};

export async function getConfig(): Promise<ChatbotConfigValue> {
  const rows = await db.select().from(chatbotConfig).where(eq(chatbotConfig.key, 'chatbot'));
  if (!rows[0]) return { ...DEFAULTS };
  return { ...DEFAULTS, ...(rows[0].value as Partial<ChatbotConfigValue>) };
}

export async function updateConfig(updates: Partial<ChatbotConfigValue>) {
  const existing = await db.select().from(chatbotConfig).where(eq(chatbotConfig.key, 'chatbot'));
  const current = existing[0]?.value || {};
  const merged = { ...DEFAULTS, ...current, ...updates };

  if (existing[0]) {
    await db.update(chatbotConfig).set({ value: merged, updatedAt: new Date() }).where(eq(chatbotConfig.key, 'chatbot'));
  } else {
    await db.insert(chatbotConfig).values({ key: 'chatbot', value: merged });
  }
  return merged as ChatbotConfigValue;
}
