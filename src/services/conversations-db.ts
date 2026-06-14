import { db } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export interface ChatMessage {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: unknown;
  sources?: unknown;
  createdAt: Date;
}

export async function createSession(title = 'New Conversation'): Promise<string> {
  const sessionId = crypto.randomUUID();
  await db.insert(chatSessions).values({ sessionId, title });
  return sessionId;
}

export async function listSessions() {
  return await db
    .select({ id: chatSessions.id, sessionId: chatSessions.sessionId, title: chatSessions.title, createdAt: chatSessions.createdAt, updatedAt: chatSessions.updatedAt })
    .from(chatSessions)
    .where(eq(chatSessions.deleted, false))
    .orderBy(desc(chatSessions.updatedAt));
}

export async function getSession(sessionId: string) {
  const rows = await db.select().from(chatSessions).where(and(eq(chatSessions.sessionId, sessionId), eq(chatSessions.deleted, false))).limit(1);
  return rows[0] || null;
}

export async function deleteSession(sessionId: string) {
  await db.update(chatSessions).set({ deleted: true }).where(eq(chatSessions.sessionId, sessionId));
}

export async function updateSessionTitle(sessionId: string, title: string) {
  await db.update(chatSessions).set({ title, updatedAt: new Date() }).where(eq(chatSessions.sessionId, sessionId));
}

export async function addMessage(sessionId: string, role: ChatMessage['role'], content: string, attachments?: unknown, sources?: unknown) {
  await db.update(chatSessions).set({ updatedAt: new Date() }).where(eq(chatSessions.sessionId, sessionId));
  const rows = await db.insert(chatMessages).values({ sessionId, role, content, attachments, sources }).returning();
  return rows[0];
}

export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
}
