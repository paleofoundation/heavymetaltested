import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabase, isChatbotEnabled } from '@/lib/chatbot/db';
import { crawlUrl, crawlLocalContent } from '@/lib/chatbot/crawler';
import { chunkContent } from '@/lib/chatbot/chunker';
import { computeEmbeddings } from '@/lib/chatbot/embeddings';

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isChatbotEnabled()) {
    return Response.json({ error: 'Chatbot not configured' }, { status: 503 });
  }

  let body: { url?: string; fullRebuild?: boolean };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const supabase = getSupabase();

  // Create crawl log entry
  const jobType = body.fullRebuild ? 'full' : body.url ? 'single_url' : 'incremental';
  const { data: job } = await supabase
    .from('chatbot_crawl_log')
    .insert({
      job_type: jobType,
      status: 'running',
      target_url: body.url || null,
      triggered_by: token.email || 'admin',
    })
    .select('id')
    .single();

  const jobId = job?.id;

  try {
    let pages;

    if (body.url) {
      // Single URL reindex
      const page = await crawlUrl(body.url);
      pages = page ? [page] : [];
    } else {
      // Full rebuild from local content
      pages = crawlLocalContent();
    }

    let totalChunks = 0;

    for (const page of pages) {
      // Upsert page record
      const { data: pageRow } = await supabase
        .from('chatbot_pages')
        .upsert(
          {
            url: page.url,
            title: page.title,
            content_hash: page.contentHash,
            tags: page.tags,
            published_date: page.publishedDate || null,
            last_modified: page.lastModified || null,
            last_crawled: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'url' },
        )
        .select('id, content_hash')
        .single();

      if (!pageRow) continue;

      // Delete old chunks for this page
      await supabase.from('chatbot_chunks').delete().eq('page_id', pageRow.id);

      // Chunk the content
      const chunks = chunkContent(page.content, page.title);
      if (chunks.length === 0) continue;

      // Compute embeddings in batch
      const texts = chunks.map((c) => c.content);
      const embeddings = await computeEmbeddings(texts);

      // Insert chunks with embeddings
      const rows = chunks.map((chunk, i) => ({
        page_id: pageRow.id,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        section_title: chunk.sectionTitle,
        section_anchor: chunk.sectionAnchor,
        token_count: chunk.tokenCount,
        embedding: JSON.stringify(embeddings[i]),
      }));

      const { error: insertErr } = await supabase.from('chatbot_chunks').insert(rows);
      if (insertErr) {
        console.error(`Failed to insert chunks for ${page.url}:`, insertErr);
      } else {
        totalChunks += chunks.length;
      }
    }

    // Update crawl log
    if (jobId) {
      await supabase
        .from('chatbot_crawl_log')
        .update({
          status: 'completed',
          pages_processed: pages.length,
          chunks_created: totalChunks,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }

    return Response.json({
      status: 'completed',
      pagesProcessed: pages.length,
      chunksCreated: totalChunks,
      jobId,
    });
  } catch (error) {
    if (jobId) {
      await supabase
        .from('chatbot_crawl_log')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }

    return Response.json(
      { error: error instanceof Error ? error.message : 'Reindex failed' },
      { status: 500 },
    );
  }
}
