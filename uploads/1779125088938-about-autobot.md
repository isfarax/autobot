# Autobot - Admin Portal with RAG Chatbot

## Overview

Autobot is an intelligent web application that combines an admin portal with a Retrieval-Augmented Generation (RAG) chatbot. It allows administrators to upload documents and users to query them using natural language, powered by AI.

## Technology Stack

- **Frontend**: Next.js 16 with App Router, React 19, Tailwind CSS v4
- **CMS**: Payload CMS 3 for admin interface
- **Database**: PostgreSQL with Drizzle ORM
- **AI Providers**: OpenAI GPT-4o, Anthropic Claude, OpenRouter, Google Gemini, NVIDIA NIM, Custom OpenAI-compatible endpoints
- **Vector Store**: ChromaDB for document embeddings and similarity search
- **UI Components**: shadcn/ui design system with custom theme

## Key Features

### Admin Portal
The admin portal provides a centralized dashboard for managing the entire system. Administrators can:
- Upload and manage documents in PDF, DOCX, and TXT formats
- Configure multiple AI providers simultaneously
- Create and manage agent.md prompt files
- Configure chatbot RAG settings including chunk size, overlap, and retrieval count
- View system status and analytics

### RAG Chatbot
The RAG (Retrieval-Augmented Generation) chatbot is the core feature. It:
- Accepts user questions in natural language
- Retrieves relevant document chunks using vector similarity search
- Falls back to keyword search when vector store is unavailable
- Generates contextual answers using the configured AI provider
- Maintains conversation history across sessions
- Supports file attachments in chat messages
- Renders responses with full Markdown support including code blocks, tables, and links

### Agent Prompts
Agent prompts (agent.md files) are stored in the database and allow:
- Custom system prompts for different use cases
- Multiple prompts can be created and managed
- Monaco editor with live Markdown preview for editing
- Each prompt can be selected from the chatbot configuration page

### AI Provider Configuration
The system supports multiple AI providers:
- **OpenAI**: GPT-4o, GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **OpenRouter**: Access to 200+ models through a single API
- **Google Gemini**: Gemini 2.0 Flash, Gemini 1.5 Pro
- **NVIDIA NIM**: Self-hosted and cloud NVIDIA models
- **Custom**: Any OpenAI-compatible endpoint (Ollama, vLLM, LocalAI, etc.)

### Conversation Management
- Conversations are stored in PostgreSQL database
- Users can create new conversations, switch between them, and delete old ones
- Each message shows a relative timestamp (e.g., "2m ago")
- Loading indicator shows elapsed time while waiting for responses

### Document Processing
Documents uploaded to Autobot go through a processing pipeline:
1. File is saved to the uploads directory
2. Text is extracted based on file type (PDF, DOCX, or TXT)
3. Text is split into chunks with configurable size and overlap
4. Each chunk is converted to a vector embedding
5. Embeddings are stored in ChromaDB for similarity search
6. Raw text is also stored in PostgreSQL as a fallback

## Configuration Options

### Chatbot Settings
- **System Prompt**: Base instruction for the AI
- **Agent Prompt**: Optional override using a saved agent.md prompt
- **Selected Documents**: Choose which documents the chatbot can query
- **Chunk Size**: Size of text chunks (default: 1000 characters)
- **Chunk Overlap**: Overlap between chunks (default: 200 characters)
- **Top K Results**: Number of relevant chunks to retrieve (default: 5)
- **Temperature**: AI creativity level (0.0 to 2.0, default: 0.7)
- **Max Tokens**: Maximum response length (default: 2048)

### RAG Pipeline
The RAG pipeline works in two modes:
1. **Vector Search (Primary)**: Uses ChromaDB to find semantically similar document chunks
2. **Keyword Search (Fallback)**: Uses PostgreSQL ILIKE queries when ChromaDB is unavailable

Both modes respect the document filter selected in the chatbot configuration.

## API Endpoints

- `/api/chat` - POST: Send a message, GET: List conversations or get conversation history, DELETE: Delete a conversation
- `/api/documents` - POST: Upload a document, GET: List uploaded documents
- `/api/admin/settings` - GET/POST: Manage AI provider settings
- `/api/admin/prompts` - GET/POST: Manage agent prompts
- `/api/admin/chatbot` - GET/POST: Manage chatbot configuration
- `/api/chat-files` - POST: Upload files for chat attachments
- `/api/health` - GET: Health check endpoint
- `/api/analytics` - GET: Query statistics

## Admin Pages

- `/admin` - Dashboard with system status and quick links
- `/admin/documents` - Upload and manage documents
- `/admin/settings` - Configure AI providers
- `/admin/prompts` - Create and manage agent prompts with Monaco editor
- `/admin/chatbot` - Configure RAG settings

## Usage Instructions

1. **Upload Documents**: Go to Admin > Documents, upload PDF, DOCX, or TXT files
2. **Configure AI**: Go to Admin > AI Settings, add and activate a provider
3. **Select Documents**: Go to Admin > Chatbot Config, choose which documents to query
4. **Chat**: Go to the Chat page and ask questions about your documents
5. **Create Prompts**: Go to Admin > Agent Prompts to create custom system prompts

## Example Questions

Here are some questions you can ask after uploading this document:

- What is Autobot?
- What technology stack does Autobot use?
- Which AI providers does Autobot support?
- How does the RAG pipeline work in Autobot?
- What file formats are supported for document upload?
- How do I configure the chatbot in Autobot?
- What is the default chunk size for document processing?
- Does Autobot support OpenRouter?
- How are conversations stored in Autobot?
- What is the fallback search mechanism when ChromaDB is unavailable?
- Can I create custom agent prompts in Autobot?
- What API endpoints does Autobot provide?
