# Quick Start Guide: Admin Portal Website with RAG Chatbot

## Overview
This guide provides instructions for setting up and running the Admin Portal Website with RAG Chatbot feature locally for development and testing purposes.

## Prerequisites
- Node.js 20.x or higher
- PostgreSQL 15.x or higher
- Git
- npm or pnpm (as specified in user input)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd autobot
git checkout 001-admin-chatbot
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```
# Database Connection
POSTGRES_URL=postgresql://postgres:somalia@localhost:5432/autobot

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Payload CMS Configuration
PAYLOAD_SECRET=generate-a-strong-secret-key-here
PAYLOAD_CONFIG_PATH=./payload.config.ts

# AI Provider Configuration (Example - OpenAI)
OPENAI_API_KEY=your-openai-api-key-here
DEFAULT_AI_PROVIDER=openai
DEFAULT_AI_MODEL=gpt-4-turbo-preview

# Optional: Other AI Providers
# ANTHROPIC_API_KEY=your-anthropic-api-key
# GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### 4. Initialize Database
```bash
# Create the database
createdb -U postgres -W autobot

# Run migrations
pnpm prisma migrate dev --name init
```

### 5. Seed Initial Data (Optional)
```bash
pnpm prisma db seed
```

## Development Workflow

### 1. Start Development Server
```bash
pnpm dev
```
This will start:
- Next.js development server on http://localhost:3000
- Payload CMS admin interface on http://localhost:3000/admin

### 2. Access Admin Portal
1. Navigate to http://localhost:3000/admin
2. Create first admin user (follow on-screen prompts)
3. Login to access the admin dashboard

### 3. Upload Documents
1. In the admin portal, navigate to the "Documents" section
2. Click "Add New Document"
3. Upload PDF, DOCX, or TXT files (max 50MB per file)
4. Monitor processing status in the document list

### 4. Test Chatbot
1. Visit the public site at http://localhost:3000
2. Open the chatbot interface (typically bottom-right corner)
3. Ask questions related to your uploaded documents
4. Verify responses are accurate and cite sources

## Project Structure
```
autobot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Payload CMS admin (mounted at /admin)
│   │   ├── chat/               # Chatbot interface components
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utility functions and services
│   │   ├── ai/                 # AI provider abstractions
│   │   ├── database/           # Drizzle ORM configuration
│   │   ├── document/           # Document processing services
│   │   └── rag/                # RAG pipeline implementation
│   ├── payload/                # Payload CMS configuration
│   │   ├── collections/        # Document, ChatSession, etc. collections
│   │   ├── globals/            # Global configurations
│   │   └── payload.config.ts   # Main Payload config
│   ├── styles/                 # CSS and Tailwind configuration
│   └── types/                  # TypeScript type definitions
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Database schema definition
│   └── migrations/             # Migration history
├── public/                     # Static assets
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
├── .env.local                  # Environment variables (gitignored)
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # Lockfile
├── README.md                   # Project overview
└── tsconfig.json               # TypeScript configuration
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build production bundle |
| `pnpm start` | Start production server |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm lint` | Run ESLint for code quality |
| `pnpm format` | Format code with Prettier |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed database with initial data |

## Validation Checklist

### Infrastructure
- [ ] PostgreSQL database 'autobot' created and accessible
- [ ] Environment variables properly configured
- [ ] Dependencies installed successfully
- [ ] Database migrations applied without errors

### Admin Portal
- [ ] Payload admin interface loads at /admin
- [ ] First admin user can be created
- [ ] Document upload interface accessible
- [ ] Document processing pipeline functional
- [ ] Document metadata displayed correctly

### Public Interface
- [ ] Homepage loads successfully
- [ ] Chatbot interface visible and functional
- [ ] Document processing status reflected in UI

### AI Chatbot
- [ ] Document upload triggers processing pipeline
- [ ] Text extraction works for PDF, DOCX, TXT formats
- [ ] Embedding generation completes successfully
- [ ] Vector storage in ChromaDB functional
- [ ] Query processing returns relevant results
- [ ] Response generation uses retrieved context
- [ ] Conversation context maintained within session
- [ ] Response times meet performance targets (<5s)

### Configuration
- [ ] AI provider configuration functional
- [ ] Ability to switch between providers
- [ ] Model selection working
- [ ] API keys securely stored
- [ ] Fallback mechanisms operational

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Verify PostgreSQL service is running
   - Check POSTGRES_URL in .env.local
   - Ensure database 'autobot' exists
   - Validate username/password credentials

2. **Payload Admin Not Loading**
   - Check Next.js dev server is running
   - Verify PAYLOAD_SECRET is set
   - Ensure payload.config.ts is correctly configured
   - Look for TypeScript compilation errors

3. **Document Processing Stalls**
   - Check server logs for processing errors
   - Verify file upload limits (default 50MB)
   - Ensure text extraction libraries are available
   - Check ChromaDB connection if using remote instance

4. **Chatbot Not Responding**
   - Verify AI provider API key is valid
   - Check rate limits on AI provider
   - Ensure embedding generation succeeded
   - Check ChromaDB query performance

### Logs and Debugging
- **Next.js Logs**: Terminal output when running `pnpm dev`
- **Payload Logs**: Visible in admin console or terminal
- **Database Logs**: PostgreSQL log files (location varies by installation)
- **Application Logs**: Check console output for error stacks
- **Network Tab**: Browser dev tools for API request/response inspection

## Production Deployment Notes
When preparing for production:
1. Use environment-specific .env files (.env.production)
2. Enable HTTPS and configure proper SSL certificates
3. Set up process manager (PM2, Docker, or systemd)
4. Configure CDN for static assets
5. Set up monitoring and alerting (Sentry, LogRocket, etc.)
6. Implement backup strategy for PostgreSQL database
7. Configure proper caching layers (Redis, Vercel Edge Cache, etc.)
8. Set up custom domain and SSL certificates
9. Configure email service for notifications and password reset
10. Implement rate limiting and DDoS protection

## Support
For additional help:
- Refer to the technical documentation in the docs/ directory
- Check the research.md file for technology decisions
- Review the data-model.md for schema details
- Consult the plan.md for implementation approach
- Create issues in the project repository for bugs or feature requests