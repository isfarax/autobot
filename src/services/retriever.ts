import { generateEmbedding } from './embeddings';
import { searchSimilar, isChromaAvailable } from './vector-store';

export interface RetrievedChunk {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
  score?: number;
}

export async function retrieveRelevantChunks(
  query: string,
  topK = 5,
  docFilter?: string[],
): Promise<RetrievedChunk[]> {
  const chromaOk = await isChromaAvailable();

  if (chromaOk) {
    try {
      const queryEmbedding = await generateEmbedding(query);
      const results = await searchSimilar(queryEmbedding, topK);

      if (results?.documents?.[0]) {
        let chunks = results.documents[0].map((text, i) => ({
          id: results.ids?.[0]?.[i] || '',
          text: text || '',
          metadata: results.metadatas?.[0]?.[i] || {},
          score: results.distances?.[0]?.[i] ?? undefined,
        }));

        if (docFilter && docFilter.length > 0) {
          chunks = chunks.filter((c) =>
            docFilter.includes((c.metadata as any).docId as string),
          );
        }

        if (chunks.length > 0) return chunks;
      }
    } catch {
      // ChromaDB failed, fall through to DB search
    }
  }

  return fallbackSearch(query, topK, docFilter);
}

async function fallbackSearch(
  query: string,
  topK: number,
  _docFilter?: string[],
): Promise<RetrievedChunk[]> {
  try {
    const { sql } = await import('drizzle-orm');
    const { db } = await import('@/db');
    const { ragDocuments: docsTable } = await import('@/db/schema');

    const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const likeClauses = terms.map((t) =>
      sql`(${docsTable.extractedText}::text ILIKE ${`%${t}%`})`,
    );

    const whereClause = likeClauses.length > 0
      ? sql`WHERE ${docsTable.includedInRag} = true AND (${sql.join(likeClauses, sql` OR `)})`
      : sql`WHERE ${docsTable.includedInRag} = true`;

    const query_sql = sql`SELECT * FROM ${docsTable} ${whereClause} LIMIT ${topK}`;
    const result = await db.execute(query_sql);
    const rows = result.rows as any[];

    return rows.map((doc: any) => ({
      id: String(doc.id),
      text: doc.extracted_text || '(No text extracted)',
      metadata: {
        docId: doc.filename,
        filename: doc.original_name,
        mimeType: doc.mime_type,
      },
      score: undefined,
    }));
  } catch {
    return [];
  }
}
