#!/usr/bin/env npx tsx
/**
 * Knowledge-base ingestion script.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts              # Full rebuild from local content
 *   npx tsx scripts/ingest.ts --url <url>  # Reindex a single live URL
 *   npx tsx scripts/ingest.ts --dry-run    # Preview what would be indexed
 *
 * Required environment variables (set in .env.local):
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY
 */

import 'dotenv/config';
import { crawlLocalContent, crawlUrl } from '../lib/chatbot/crawler';
import { chunkContent } from '../lib/chatbot/chunker';
import { computeEmbeddings } from '../lib/chatbot/embeddings';
import { getSupabase } from '../lib/chatbot/db';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const urlIdx = args.indexOf('--url');
  const singleUrl = urlIdx !== -1 ? args[urlIdx + 1] : null;

  console.log('🔧 Heavy Metal Facts — Knowledge Base Ingestion');
  console.log('================================================\n');

  if (dryRun) console.log('  (DRY RUN — no data will be written)\n');

  // 1. Crawl content
  let pages;
  if (singleUrl) {
    console.log(`Fetching single URL: ${singleUrl}`);
    const page = await crawlUrl(singleUrl);
    pages = page ? [page] : [];
  } else {
    console.log('Reading local MDX content files...');
    pages = crawlLocalContent();
  }

  console.log(`  Found ${pages.length} pages\n`);

  if (pages.length === 0) {
    console.log('No pages found. Exiting.');
    process.exit(0);
  }

  // 2. Chunk all pages
  console.log('Chunking content...');
  const allChunks: Array<{
    pageUrl: string;
    pageTitle: string;
    pageTags: string[];
    pageHash: string;
    publishedDate?: string;
    lastModified?: string;
    chunks: ReturnType<typeof chunkContent>;
  }> = [];

  let totalChunks = 0;
  for (const page of pages) {
    const chunks = chunkContent(page.content, page.title);
    totalChunks += chunks.length;
    allChunks.push({
      pageUrl: page.url,
      pageTitle: page.title,
      pageTags: page.tags,
      pageHash: page.contentHash,
      publishedDate: page.publishedDate,
      lastModified: page.lastModified,
      chunks,
    });
  }
  console.log(`  Created ${totalChunks} chunks from ${pages.length} pages\n`);

  if (dryRun) {
    console.log('Dry run results:');
    for (const entry of allChunks) {
      console.log(`  ${entry.pageUrl} → ${entry.chunks.length} chunks`);
      for (const c of entry.chunks) {
        console.log(`    [${c.chunkIndex}] ${c.sectionTitle} (${c.tokenCount} tokens)`);
      }
    }
    process.exit(0);
  }

  // 3. Compute embeddings
  console.log('Computing embeddings...');
  const allTexts = allChunks.flatMap((e) => e.chunks.map((c) => c.content));
  const allEmbeddings = await computeEmbeddings(allTexts);
  console.log(`  Computed ${allEmbeddings.length} embeddings\n`);

  // 4. Write to Supabase
  console.log('Writing to database...');
  const supabase = getSupabase();

  let embeddingIdx = 0;
  let pagesWritten = 0;
  let chunksWritten = 0;

  for (const entry of allChunks) {
    // Upsert page
    const { data: pageRow, error: pageErr } = await supabase
      .from('chatbot_pages')
      .upsert(
        {
          url: entry.pageUrl,
          title: entry.pageTitle,
          content_hash: entry.pageHash,
          tags: entry.pageTags,
          published_date: entry.publishedDate || null,
          last_modified: entry.lastModified || null,
          last_crawled: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'url' },
      )
      .select('id')
      .single();

    if (pageErr || !pageRow) {
      console.error(`  ✗ Failed to upsert page ${entry.pageUrl}: ${pageErr?.message}`);
      embeddingIdx += entry.chunks.length;
      continue;
    }

    // Delete old chunks
    await supabase.from('chatbot_chunks').delete().eq('page_id', pageRow.id);

    // Insert new chunks
    const rows = entry.chunks.map((chunk) => {
      const row = {
        page_id: pageRow.id,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        section_title: chunk.sectionTitle,
        section_anchor: chunk.sectionAnchor,
        token_count: chunk.tokenCount,
        embedding: JSON.stringify(allEmbeddings[embeddingIdx]),
      };
      embeddingIdx++;
      return row;
    });

    const { error: chunkErr } = await supabase.from('chatbot_chunks').insert(rows);
    if (chunkErr) {
      console.error(`  ✗ Failed to insert chunks for ${entry.pageUrl}: ${chunkErr.message}`);
    } else {
      pagesWritten++;
      chunksWritten += rows.length;
      console.log(`  ✓ ${entry.pageUrl} → ${rows.length} chunks`);
    }
  }

  // 5. Log the crawl
  await supabase.from('chatbot_crawl_log').insert({
    job_type: singleUrl ? 'single_url' : 'full',
    status: 'completed',
    target_url: singleUrl || null,
    pages_processed: pagesWritten,
    chunks_created: chunksWritten,
    completed_at: new Date().toISOString(),
    triggered_by: 'cli',
  });

  console.log(`\n✅ Done! ${pagesWritten} pages, ${chunksWritten} chunks indexed.`);
}

main().catch((err) => {
  console.error('\n❌ Ingestion failed:', err);
  process.exit(1);
});
