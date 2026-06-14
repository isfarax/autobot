type OpenAIInstance = import('openai').default;
let _openai: OpenAIInstance | null = null;

async function getClient(): Promise<OpenAIInstance> {
  if (!_openai) {
    const { default: OpenAI } = await import('openai');
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return _openai!;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = await getClient();
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = await getClient();
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}
