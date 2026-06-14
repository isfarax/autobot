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