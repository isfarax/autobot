ALTER TABLE "rag_documents" ADD COLUMN IF NOT EXISTS "file_data" bytea;

CREATE TABLE IF NOT EXISTS "chat_files" (
  "id" serial PRIMARY KEY NOT NULL,
  "filename" text NOT NULL,
  "original_name" text NOT NULL,
  "file_size" integer,
  "mime_type" text NOT NULL,
  "file_data" bytea NOT NULL,
  "created_at" timestamp DEFAULT now()
);
