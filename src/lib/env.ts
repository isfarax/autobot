export const env = {
  get databaseUrl() {
    return process.env.DATABASE_URL || 'postgres://postgres:somalia@localhost:5432/autobot';
  },
  get chromaUrl() {
    return process.env.CHROMA_URL || 'http://localhost:8000';
  },
  get openaiApiKey() {
    return process.env.OPENAI_API_KEY || '';
  },
  get anthropicApiKey() {
    return process.env.ANTHROPIC_API_KEY || '';
  },
  get payloadSecret() {
    return process.env.PAYLOAD_SECRET || 'super-secret-key-change-in-production';
  },
  get serverUrl() {
    return process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000';
  },
  get isDev() {
    return process.env.NODE_ENV !== 'production';
  },
  get isTest() {
    return process.env.NODE_ENV === 'test';
  },
};
