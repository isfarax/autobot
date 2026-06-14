import { db } from '@/db';
import { agentPrompts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function listPrompts() {
  return await db.select().from(agentPrompts).orderBy(agentPrompts.name);
}

export async function getPrompt(id: number) {
  const rows = await db.select().from(agentPrompts).where(eq(agentPrompts.id, id)).limit(1);
  return rows[0] || null;
}

export async function getPromptByName(name: string) {
  const rows = await db.select().from(agentPrompts).where(eq(agentPrompts.name, name)).limit(1);
  return rows[0] || null;
}

export async function createPrompt(data: { name: string; content: string; description?: string }) {
  const rows = await db.insert(agentPrompts).values(data).returning();
  return rows[0];
}

export async function updatePrompt(id: number, data: { name?: string; content?: string; description?: string }) {
  const rows = await db.update(agentPrompts).set({ ...data, updatedAt: new Date() }).where(eq(agentPrompts.id, id)).returning();
  return rows[0];
}

export async function deletePrompt(id: number) {
  await db.delete(agentPrompts).where(eq(agentPrompts.id, id));
}
