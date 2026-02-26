import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabase, isChatbotEnabled } from '@/lib/chatbot/db';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isChatbotEnabled()) {
    return Response.json({ error: 'Chatbot not configured' }, { status: 503 });
  }

  const supabase = getSupabase();

  const [pagesResult, chunksResult, crawlResult, messagesResult, feedbackResult] =
    await Promise.all([
      supabase.from('chatbot_pages').select('id', { count: 'exact', head: true }),
      supabase.from('chatbot_chunks').select('id', { count: 'exact', head: true }),
      supabase
        .from('chatbot_crawl_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10),
      supabase
        .from('chatbot_messages')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('chatbot_feedback')
        .select('id', { count: 'exact', head: true }),
    ]);

  return Response.json({
    index: {
      totalPages: pagesResult.count || 0,
      totalChunks: chunksResult.count || 0,
    },
    recentCrawls: crawlResult.data || [],
    stats: {
      totalMessages: messagesResult.count || 0,
      totalFeedback: feedbackResult.count || 0,
    },
  });
}
