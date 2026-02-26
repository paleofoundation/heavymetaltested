import { getSupabase } from './db';
import { computeEmbedding } from './embeddings';
import { CHATBOT_CONFIG } from './config';

export interface RetrievedChunk {
  id: number;
  content: string;
  url: string;
  title: string;
  sectionTitle: string;
  sectionAnchor: string;
  score: number;
}

/**
 * Hybrid retrieval: combines vector similarity and full-text search
 * using reciprocal rank fusion (RRF).
 */
export async function retrieveChunks(query: string): Promise<RetrievedChunk[]> {
  const { topK, vectorLimit, ftsLimit } = CHATBOT_CONFIG.retrieval;
  const supabase = getSupabase();

  const embedding = await computeEmbedding(query);

  const [vectorResults, ftsResults] = await Promise.all([
    supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_count: vectorLimit,
      match_threshold: CHATBOT_CONFIG.retrieval.minScore,
    }),
    supabase.rpc('search_chunks_fts', {
      search_query: query,
      match_count: ftsLimit,
    }),
  ]);

  const vectorHits: RetrievedChunk[] = (vectorResults.data || []).map(
    (row: Record<string, unknown>, i: number) => ({
      id: row.id as number,
      content: row.content as string,
      url: row.url as string,
      title: row.title as string,
      sectionTitle: row.section_title as string,
      sectionAnchor: row.section_anchor as string,
      score: 1 / (i + 1 + 60), // RRF score with k=60
    }),
  );

  const ftsHits: RetrievedChunk[] = (ftsResults.data || []).map(
    (row: Record<string, unknown>, i: number) => ({
      id: row.id as number,
      content: row.content as string,
      url: row.url as string,
      title: row.title as string,
      sectionTitle: row.section_title as string,
      sectionAnchor: row.section_anchor as string,
      score: 1 / (i + 1 + 60),
    }),
  );

  // Merge with RRF: sum scores for chunks appearing in both result sets
  const scoreMap = new Map<number, RetrievedChunk>();

  for (const hit of vectorHits) {
    const existing = scoreMap.get(hit.id);
    if (existing) {
      existing.score += hit.score;
    } else {
      scoreMap.set(hit.id, { ...hit });
    }
  }

  for (const hit of ftsHits) {
    const existing = scoreMap.get(hit.id);
    if (existing) {
      existing.score += hit.score;
    } else {
      scoreMap.set(hit.id, { ...hit });
    }
  }

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Search by keyword only (used by Claude's search tool for follow-up queries).
 */
export async function searchByKeyword(query: string, limit = 5): Promise<RetrievedChunk[]> {
  const supabase = getSupabase();
  const results = await supabase.rpc('search_chunks_fts', {
    search_query: query,
    match_count: limit,
  });

  return (results.data || []).map((row: Record<string, unknown>, i: number) => ({
    id: row.id as number,
    content: row.content as string,
    url: row.url as string,
    title: row.title as string,
    sectionTitle: row.section_title as string,
    sectionAnchor: row.section_anchor as string,
    score: (row.rank as number) || 1 / (i + 1),
  }));
}
