-- Heavy Metal Facts Chatbot — pgvector schema
-- Run against a Supabase project (or any PostgreSQL 15+ with pgvector)

CREATE EXTENSION IF NOT EXISTS vector;

-- ----------------------------------------------------------------
-- Crawled pages
-- ----------------------------------------------------------------
CREATE TABLE chatbot_pages (
  id          BIGSERIAL PRIMARY KEY,
  url         TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL DEFAULT '',
  content_hash TEXT NOT NULL DEFAULT '',
  tags        TEXT[] DEFAULT '{}',
  published_date TIMESTAMPTZ,
  last_modified  TIMESTAMPTZ,
  etag        TEXT,
  last_crawled TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pages_url ON chatbot_pages(url);

-- ----------------------------------------------------------------
-- Content chunks with embeddings
-- ----------------------------------------------------------------
CREATE TABLE chatbot_chunks (
  id            BIGSERIAL PRIMARY KEY,
  page_id       BIGINT NOT NULL REFERENCES chatbot_pages(id) ON DELETE CASCADE,
  chunk_index   INTEGER NOT NULL,
  content       TEXT NOT NULL,
  section_title TEXT DEFAULT '',
  section_anchor TEXT DEFAULT '',
  token_count   INTEGER DEFAULT 0,
  embedding     vector(1536),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, chunk_index)
);

CREATE INDEX idx_chunks_embedding ON chatbot_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE INDEX idx_chunks_fts ON chatbot_chunks
  USING GIN (to_tsvector('english', content));

-- ----------------------------------------------------------------
-- Conversations & messages
-- ----------------------------------------------------------------
CREATE TABLE chatbot_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chatbot_messages (
  id              BIGSERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  citations       JSONB DEFAULT '[]',
  token_usage     JSONB,
  latency_ms      INTEGER,
  trace_id        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- User feedback / error reports
-- ----------------------------------------------------------------
CREATE TABLE chatbot_feedback (
  id              BIGSERIAL PRIMARY KEY,
  message_id      BIGINT REFERENCES chatbot_messages(id),
  conversation_id UUID REFERENCES chatbot_conversations(id),
  feedback_type   TEXT NOT NULL CHECK (feedback_type IN ('thumbs_up', 'thumbs_down', 'report')),
  comment         TEXT,
  user_question   TEXT,
  bot_answer      TEXT,
  cited_sources   JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- Crawl / index job log
-- ----------------------------------------------------------------
CREATE TABLE chatbot_crawl_log (
  id              BIGSERIAL PRIMARY KEY,
  job_type        TEXT NOT NULL CHECK (job_type IN ('full', 'incremental', 'single_url')),
  status          TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  target_url      TEXT,
  error           TEXT,
  pages_processed INTEGER DEFAULT 0,
  chunks_created  INTEGER DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  triggered_by    TEXT DEFAULT 'manual'
);

-- ----------------------------------------------------------------
-- Query analytics log
-- ----------------------------------------------------------------
CREATE TABLE chatbot_query_log (
  id               BIGSERIAL PRIMARY KEY,
  conversation_id  UUID,
  query            TEXT NOT NULL,
  chunks_retrieved INTEGER DEFAULT 0,
  top_chunk_score  REAL,
  had_answer       BOOLEAN DEFAULT TRUE,
  latency_ms       INTEGER,
  input_tokens     INTEGER,
  output_tokens    INTEGER,
  trace_id         TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- RPC: vector similarity search
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_count     INTEGER DEFAULT 20,
  match_threshold REAL    DEFAULT 0.25
)
RETURNS TABLE (
  id             BIGINT,
  page_id        BIGINT,
  content        TEXT,
  section_title  TEXT,
  section_anchor TEXT,
  url            TEXT,
  title          TEXT,
  similarity     REAL
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.page_id,
    c.content,
    c.section_title,
    c.section_anchor,
    p.url,
    p.title,
    (1 - (c.embedding <=> query_embedding))::REAL AS similarity
  FROM chatbot_chunks c
  JOIN chatbot_pages p ON c.page_id = p.id
  WHERE (1 - (c.embedding <=> query_embedding)) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ----------------------------------------------------------------
-- RPC: full-text search
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_chunks_fts(
  search_query TEXT,
  match_count  INTEGER DEFAULT 20
)
RETURNS TABLE (
  id             BIGINT,
  page_id        BIGINT,
  content        TEXT,
  section_title  TEXT,
  section_anchor TEXT,
  url            TEXT,
  title          TEXT,
  rank           REAL
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.page_id,
    c.content,
    c.section_title,
    c.section_anchor,
    p.url,
    p.title,
    ts_rank_cd(
      to_tsvector('english', c.content),
      plainto_tsquery('english', search_query)
    )::REAL AS rank
  FROM chatbot_chunks c
  JOIN chatbot_pages p ON c.page_id = p.id
  WHERE to_tsvector('english', c.content) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
