import { pgTable, serial, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const aiProviders = pgTable('ai_providers', {
  id: serial('id').primaryKey(),
  type: text('type', { enum: ['openai', 'anthropic', 'openrouter', 'gemini', 'nvidia', 'custom'] }).notNull(),
  label: text('label').notNull(),
  apiKey: text('api_key').notNull(),
  model: text('model').notNull(),
  baseUrl: text('base_url').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agentPrompts = pgTable('agent_prompts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  content: text('content').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatbotConfig = pgTable('chatbot_config', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull().unique(),
  title: text('title').default('New Conversation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deleted: boolean('deleted').default(false).notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id')
    .references(() => chatSessions.sessionId)
    .notNull(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  attachments: jsonb('attachments'),
  sources: jsonb('sources'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ragDocuments = pgTable('rag_documents', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size'),
  extractedText: text('extracted_text'),
  chunkCount: integer('chunk_count').default(0),
  indexed: boolean('indexed').default(false),
  includedInRag: boolean('included_in_rag').default(true).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const queryLogs = pgTable('query_logs', {
  id: serial('id').primaryKey(),
  chatSessionId: integer('chat_session_id')
    .references(() => chatSessions.id)
    .notNull(),
  queryText: text('query_text').notNull(),
  responseText: text('response_text'),
  retrievedDocumentIds: text('retrieved_document_ids'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});