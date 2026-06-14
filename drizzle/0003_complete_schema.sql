DROP TABLE IF EXISTS "documents" CASCADE;
-- >>
CREATE TABLE IF NOT EXISTS "ai_providers" (
  "id" serial PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "label" text NOT NULL,
  "api_key" text NOT NULL,
  "model" text NOT NULL,
  "base_url" text NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
-- >>
CREATE TABLE IF NOT EXISTS "agent_prompts" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "content" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "agent_prompts_name_unique" UNIQUE("name")
);
-- >>
CREATE TABLE IF NOT EXISTS "chatbot_config" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" text NOT NULL,
  "value" jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "chatbot_config_key_unique" UNIQUE("key")
);
-- >>
CREATE TABLE IF NOT EXISTS "chat_sessions" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL,
  "title" text DEFAULT 'New Conversation',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted" boolean DEFAULT false NOT NULL,
  CONSTRAINT "chat_sessions_session_id_unique" UNIQUE("session_id")
);
-- >>
CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "attachments" jsonb,
  "sources" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);
-- >>
CREATE TABLE IF NOT EXISTS "rag_documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "filename" text NOT NULL,
  "original_name" text NOT NULL,
  "mime_type" text NOT NULL,
  "file_size" integer,
  "file_data" bytea,
  "extracted_text" text,
  "chunk_count" integer DEFAULT 0,
  "indexed" boolean DEFAULT false,
  "included_in_rag" boolean DEFAULT true NOT NULL,
  "uploaded_at" timestamp DEFAULT now()
);
-- >>
CREATE TABLE IF NOT EXISTS "chat_files" (
  "id" serial PRIMARY KEY NOT NULL,
  "filename" text NOT NULL,
  "original_name" text NOT NULL,
  "file_size" integer,
  "mime_type" text NOT NULL,
  "file_data" bytea NOT NULL,
  "created_at" timestamp DEFAULT now()
);
-- >>
CREATE TABLE IF NOT EXISTS "query_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "chat_session_id" integer NOT NULL,
  "query_text" text NOT NULL,
  "response_text" text,
  "retrieved_document_ids" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
-- >>
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_session_id_chat_sessions_session_id_fk'
  ) THEN
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_session_id_fk"
      FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("session_id") ON DELETE no action ON UPDATE no action;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'query_logs_chat_session_id_chat_sessions_id_fk'
  ) THEN
    ALTER TABLE "query_logs" ADD CONSTRAINT "query_logs_chat_session_id_chat_sessions_id_fk"
      FOREIGN KEY ("chat_session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;
