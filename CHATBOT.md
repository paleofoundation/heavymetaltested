# Heavy Metal Facts — Chatbot System

Evidence-first, citation-grounded Q&A chatbot powered by Claude with retrieval-augmented generation (RAG) over the heavymetalfacts.com knowledge base.

## Architecture

```
User ──► Chat Widget (React) ──► /api/chat (streaming) ──► Claude API
                                        │                      │
                                        ▼                      ▼
                                  Retrieval Service      Citations + Tools
                                   (hybrid search)      (search, units, tickets)
                                        │
                                        ▼
                                  Supabase pgvector
                                  (embeddings + FTS)
                                        ▲
                                        │
                              Ingestion Pipeline
                              (crawl → chunk → embed → store)
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Chat Widget | `components/chatbot/` | Floating UI with streaming, citations, feedback |
| Chat API | `app/api/chat/route.ts` | Streaming endpoint with rate limiting |
| Admin API | `app/api/chat/admin/` | Reindex, status, analytics endpoints |
| Core Library | `lib/chatbot/` | Config, embeddings, crawler, chunker, retrieval, chat, tools |
| DB Schema | `supabase/migrations/001_chatbot_schema.sql` | pgvector tables and RPC functions |
| Ingestion Script | `scripts/ingest.ts` | CLI tool for knowledge base population |
| Evaluation Suite | `scripts/evaluate.ts` | 30+ automated test cases |
| Admin Dashboard | `app/admin/chatbot/` | Index status, analytics, reindex controls |

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/001_chatbot_schema.sql
   ```
3. Note your project URL and service role key from **Settings → API**

### 2. Get API Keys

- **Anthropic API Key**: [console.anthropic.com](https://console.anthropic.com)
- **OpenAI API Key**: [platform.openai.com](https://platform.openai.com) (for embeddings)

### 3. Set Environment Variables

Add to `.env.local` (local dev) and your deployment platform (Vercel):

```env
# Supabase (pgvector)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# OpenAI (embeddings only)
OPENAI_API_KEY=sk-...

# Anthropic (Claude chat)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: ticket webhook
TICKET_WEBHOOK_URL=https://hooks.example.com/chatbot-tickets
```

### 4. Ingest the Knowledge Base

```bash
# Preview what will be indexed
npm run ingest:dry

# Full ingest (reads local MDX files, computes embeddings, stores in Supabase)
npm run ingest
```

### 5. Start the Dev Server

```bash
npm run dev
```

The chat widget appears as a floating button in the bottom-right corner of every page.

## Admin Dashboard

Navigate to `/admin/chatbot` (requires admin login) to:

- View index status (pages, chunks, messages)
- Trigger incremental or full reindex
- View analytics (top questions, no-answer rates, cost/latency)
- Review crawl job history

## Evaluation Suite

Run the automated test suite against a local or production API:

```bash
# Against local dev server
npm run evaluate

# Against production
npx tsx scripts/evaluate.ts --api https://www.heavymetalfacts.com/api/chat

# Verbose output (show full responses)
npx tsx scripts/evaluate.ts --verbose
```

The suite includes 30+ test cases covering:
- Factual Q&A with citation verification
- Hallucination detection (fake topics, made-up statistics)
- Medical advice guardrails
- Out-of-scope question handling
- Unit conversion
- Multi-topic comparisons

## Key Design Decisions

### Retrieval: Hybrid Search with RRF
Vector similarity (OpenAI embeddings) + PostgreSQL full-text search, merged using Reciprocal Rank Fusion. This catches both semantic matches and exact keyword matches.

### Citations: Claude's Document Citations
Retrieved chunks are passed as `document` content blocks with `citations.enabled`. Claude's response automatically includes citation markers that map back to source URLs.

### Embedding Provider: Swappable
The `lib/chatbot/embeddings.ts` module abstracts the embedding provider. To swap from OpenAI to Voyage or another provider, modify only that file.

### Graceful Degradation
If Supabase/embedding APIs are unavailable, the chat endpoint returns a 503 with a clear message. The widget checks this and shows a "temporarily unavailable" state.

### Security
- Rate limiting (20 requests/minute per IP)
- Input length validation (4000 char max)
- Domain-scoped crawling
- PII minimization in logs (no user IPs stored in DB)
- Admin endpoints require NextAuth session

## Production Deployment (Vercel)

1. Add all env vars to Vercel project settings
2. Run the ingestion script locally (or in CI) to populate the vector DB
3. Deploy — the chat widget is automatically included on all pages
4. For ongoing updates: after content changes, trigger reindex from the admin dashboard or run `npm run ingest` in CI

### Continuous Indexing (CI/CD)

Add to your GitHub Actions workflow:

```yaml
- name: Reindex chatbot knowledge base
  run: npx tsx scripts/ingest.ts
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```
