import type { Metadata } from 'chromadb';

export interface Chunk {
  id: string;
  text: string;
  metadata: Metadata;
}

export function chunkText(
  text: string,
  sourceId: string,
  chunkSize = 1000,
  overlap = 200,
): Chunk[] {
  const chunks: Chunk[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if ((currentChunk + '\n\n' + trimmed).length > chunkSize && currentChunk) {
      chunks.push({
        id: `${sourceId}_chunk_${chunkIndex}`,
        text: currentChunk.trim(),
        metadata: { sourceId, chunkIndex, chunkSize: currentChunk.length },
      });
      chunkIndex++;
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(' ') + '\n\n' + trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `${sourceId}_chunk_${chunkIndex}`,
      text: currentChunk.trim(),
      metadata: { sourceId, chunkIndex, chunkSize: currentChunk.length },
    });
  }

  return chunks;
}
