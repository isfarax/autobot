# Data Model: Admin Portal Website with RAG Chatbot

## Core Entities

### Document
Represents an uploaded file that has been processed for use in the RAG system.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Auto-generated |
| filename | String | Original filename | Required, max 255 chars |
| fileSize | Integer | Size in bytes | Required, > 0 |
| mimeType | String | MIME type (e.g., application/pdf) | Required |
| uploadDate | Timestamp | When file was uploaded | Auto-set to NOW() |
| processingStatus | Enum | Status of processing pipeline | Values: pending, processing, completed, failed |
| extractedText | Text | Full text extracted from document | Nullable (until processing completes) |
| chunkCount | Integer | Number of text chunks created | Default 0 |
| metadata | JSONB | Additional file-specific metadata | Nullable |

### DocumentChunk
Represents a segment of text extracted from a Document for embedding and retrieval.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Auto-generated |
| documentId | UUID | Foreign key to Document | Required, cascade delete |
| chunkIndex | Integer | Sequential index within document | Required, >= 0 |
| content | Text | The actual text chunk | Required |
| tokenCount | Integer | Approximate number of tokens | Nullable |
| embeddingVector | Vector(384) | Embedding vector for similarity search | Nullable (until embedding generated) |
| createdAt | Timestamp | When chunk was created | Auto-set to NOW() |

### ChatSession
Represents a conversation session between a user and the chatbot.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Auto-generated |
| sessionId | String | Client-side session identifier | Required, unique |
| startTime | Timestamp | When session began | Auto-set to NOW() |
| endTime | Timestamp | When session ended (null if active) | Nullable |
| messageCount | Integer | Number of messages in session | Default 0 |
| userAgent | String | Browser/user agent string | Nullable |
| ipAddress | String | Client IP address | Nullable (for privacy) |

### ChatMessage
Represents a single message within a ChatSession.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Auto-generated |
| sessionId | UUID | Foreign key to ChatSession | Required, cascade delete |
| messageIndex | Integer | Sequential index within session | Required, >= 0 |
| role | Enum | Who sent the message | Values: user, assistant |
| content | Text | The message content | Required |
| timestamp | Timestamp | When message was sent | Auto-set to NOW() |
| queryEmbedding | Vector(384) | Embedding of user query (for user messages) | Nullable |
| retrievedChunkIds | UUID[] | IDs of chunks retrieved for this message | Nullable |
| responseTimeMs | Integer | Time to generate response in milliseconds | Nullable |

### QueryLog
Represents analytics data for chatbot queries (aggregated for performance).

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Auto-generated |
| queryText | Text | The user's query | Required |
| queryEmbedding | Vector(384) | Embedding of the query | Nullable |
| retrievedChunkCount | Integer | Number of chunks retrieved | Default 0 |
| responseText | Text | The chatbot's response | Nullable |
| responseTimeMs | Integer | Total response time in milliseconds | Nullable |
| tokensUsed | Integer | Approximate LLM tokens consumed | Nullable |
| timestamp | Timestamp | When query was made | Auto-set to NOW() |
| sessionId | UUID | Foreign key to ChatSession (nullable for analytics) | Nullable |

### AiProviderConfig
Stores configuration for different AI providers (encrypted where sensitive).

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Auto-generated |
| providerName | String | Name of AI provider (e.g., openai, anthropic) | Required |
| modelName | String | Specific model identifier | Required |
| apiKeyEncrypted | Text | Encrypted API key | Required for providers needing auth |
| endpointUrl | String | Custom endpoint URL (if applicable) | Nullable |
| isActive | Boolean | Whether this config is currently active | Default false |
| priority | Integer | Priority order when multiple configs exist | Default 0 |
| createdAt | Timestamp | When config was created | Auto-set to NOW() |
| updatedAt | Timestamp | When config was last updated | Auto-set to NOW() |

### DocumentProcessingLog
Tracks the processing pipeline for each document.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Auto-generated |
| documentId | UUID | Foreign key to Document | Required, cascade delete |
| stage | Enum | Processing stage | Values: upload, text_extraction, chunking, embedding, indexing |
| status | Enum | Stage status | Values: pending, processing, completed, failed |
| startedAt | Timestamp | When stage began | Auto-set to NOW() |
| completedAt | Timestamp | When stage ended | Nullable |
| errorMessage | Text | Error details if stage failed | Nullable |
| metadata | JSONB | Stage-specific metadata | Nullable |

## Relationships

1. **Document 1:N DocumentChunk**
   - One document can have many text chunks
   - When a document is deleted, all its chunks are deleted (cascade)

2. **ChatSession 1:N ChatMessage**
   - One session can have many messages
   - When a session is deleted, all its messages are deleted (cascade)

3. **ChatSession 1:N QueryLog** (optional)
   - Queries may or may not be associated with a session
   - When a session is deleted, associated query logs keep sessionId as null

4. **Document 1:N DocumentProcessingLog**
   - One document has many processing log entries (one per stage)
   - When a document is deleted, its processing logs are deleted (cascade)

## Indexes

### Performance Indexes
- `idx_document_processing_status` ON Document(processingStatus)
- `idx_document_upload_date` ON Document(uploadDate DESC)
- `idx_document_chunk_document` ON DocumentChunk(documentId, chunkIndex)
- `idx_chat_session_active` ON ChatSession(endTime IS NULL)
- `idx_chat_message_session` ON ChatMessage(sessionId, messageIndex)
- `idx_query_log_timestamp` ON QueryLog(timestamp DESC)
- `idx_ai_provider_active` ON AiProviderConfig(isActive, priority)
- `idx_document_processing_log` ON DocumentProcessingLog(documentId, stage)

### Specialized Indexes
- `idx_document_chunk_embedding` ON DocumentChunk USING ivfflat (embeddingVector vector_cosine_ops) WITH (lists = 100)
- `idx_query_log_embedding` ON QueryLog USING ivfflat (queryEmbedding vector_cosine_ops) WITH (lists = 100)

## Validation Rules

### Document Constraints
- filename must not be empty
- fileSize must be positive
- mimeType must be a valid MIME type
- processingStatus must be one of: pending, processing, completed, failed
- If processingStatus = completed, extractedText must not be null
- chunkCount must be >= 0 and match actual chunk count when processingStatus = completed

### DocumentChunk Constraints
- documentId must reference an existing Document
- chunkIndex must be >= 0
- content must not be empty
- For chunks belonging to the same document, chunkIndex values must be sequential starting from 0
- If embeddingVector is not null, it must be a 384-dimensional vector

### ChatSession Constraints
- sessionId must be unique across all sessions
- If endTime is not null, endTime must be >= startTime
- messageCount must be >= 0 and match actual message count

### ChatMessage Constraints
- sessionId must reference an existing ChatSession
- messageIndex must be >= 0
- role must be either 'user' or 'assistant'
- content must not be empty
- For messages belonging to the same session, messageIndex values must be sequential starting from 0
- If role = 'user', queryEmbedding may be null (if not yet processed) or a 384-dimensional vector
- If role = 'assistant', retrievedChunkIds must reference existing DocumentChunks
- If responseTimeMs is not null, it must be >= 0

### QueryLog Constraints
- queryText must not be empty
- If queryEmbedding is not null, it must be a 384-dimensional vector
- responseTimeMs must be >= 0 if not null
- tokensUsed must be >= 0 if not null

### AiProviderConfig Constraints
- providerName must not be empty
- modelName must not be empty
- If apiKeyEncrypted is not null, it must be valid encrypted data
- isActive must be boolean
- priority must be >= 0
- Only one config can be active per providerName (enforced at application level)

### DocumentProcessingLog Constraints
- documentId must reference an existing Document
- stage must be one of: upload, text_extraction, chunking, embedding, indexing
- status must be one of: pending, processing, completed, failed
- If completedAt is not null, completedAt must be >= startedAt
- If status = failed, errorMessage should not be empty
- If status = completed, errorMessage must be null