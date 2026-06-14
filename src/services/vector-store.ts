import { ChromaClient, type Metadata } from 'chromadb';

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const COLLECTION_NAME = 'autobot_documents';

let client: ChromaClient | null = null;

function getClient(): ChromaClient {
  if (!client) {
    client = new ChromaClient({ path: CHROMA_URL });
  }
  return client;
}

let _chromaOk: boolean | null = null;

export async function isChromaAvailable(): Promise<boolean> {
  if (_chromaOk !== null) return _chromaOk;
  try {
    const c = getClient();
    await c.heartbeat();
    _chromaOk = true;
    return true;
  } catch {
    _chromaOk = false;
    return false;
  }
}

export async function ensureCollection() {
  const c = getClient();
  const collections = await c.listCollections();
  const exists = collections.some((col: any) => col.name === COLLECTION_NAME);
  if (!exists) {
    await c.createCollection({ name: COLLECTION_NAME });
  }
  return c.getCollection({ name: COLLECTION_NAME });
}

export async function addDocuments(
  chunks: { id: string; text: string; metadata: Metadata }[],
  embeddings: number[][],
) {
  if (!(await isChromaAvailable())) return;
  const collection = await ensureCollection();
  await collection.add({
    ids: chunks.map((c) => c.id),
    embeddings,
    metadatas: chunks.map((c) => c.metadata),
    documents: chunks.map((c) => c.text),
  });
}

export async function searchSimilar(queryEmbedding: number[], topK = 5) {
  if (!(await isChromaAvailable())) return null;
  const collection = await ensureCollection();
  return await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });
}

export async function deleteDocumentChunks(documentIds: string[]) {
  if (!(await isChromaAvailable())) return;
  const collection = await ensureCollection();
  await collection.delete({ ids: documentIds });
}
