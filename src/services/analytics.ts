import { db } from '@/db';
import { queryLogs } from '@/db/schema';

export interface AnalyticsEvent {
  eventType: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export async function logQuery(
  chatSessionId: number,
  queryText: string,
  responseText: string | null,
  retrievedDocumentIds: string[],
) {
  await db.insert(queryLogs).values({
    chatSessionId,
    queryText,
    responseText,
    retrievedDocumentIds: JSON.stringify(retrievedDocumentIds),
  });
}

export async function getQueryStats() {
  const logs = await db.select().from(queryLogs);
  return {
    totalQueries: logs.length,
    uniqueSessions: new Set(logs.map((l) => l.chatSessionId)).size,
  };
}
