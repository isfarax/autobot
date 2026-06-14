CREATE TABLE "ai_providers" (
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

CREATE TABLE "agent_prompts" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "content" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "agent_prompts_name_unique" UNIQUE("name")
);

CREATE TABLE "chatbot_config" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" text NOT NULL,
  "value" jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "chatbot_config_key_unique" UNIQUE("key")
);

CREATE TABLE "chat_sessions" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL,
  "title" text DEFAULT 'New Conversation',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted" boolean DEFAULT false NOT NULL,
  CONSTRAINT "chat_sessions_session_id_unique" UNIQUE("session_id")
);

CREATE TABLE "chat_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "attachments" jsonb,
  "sources" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "filename" text NOT NULL,
  "original_name" text NOT NULL,
  "file_size" integer NOT NULL,
  "mime_type" text NOT NULL,
  "upload_date" timestamp DEFAULT now() NOT NULL,
  "processed" boolean DEFAULT false NOT NULL,
  "extracted_text" text
);

CREATE TABLE "query_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "chat_session_id" integer NOT NULL,
  "query_text" text NOT NULL,
  "response_text" text,
  "retrieved_document_ids" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);