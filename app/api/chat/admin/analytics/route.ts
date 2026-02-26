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

  // Top questions (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString();

  const [queryLogResult, noAnswerResult, feedbackResult, costResult] = await Promise.all([
    supabase
      .from('chatbot_query_log')
      .select('query, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(100),

    supabase
      .from('chatbot_query_log')
      .select('id', { count: 'exact', head: true })
      .eq('had_answer', false)
      .gte('created_at', thirtyDaysAgo),

    supabase
      .from('chatbot_feedback')
      .select('feedback_type, created_at')
      .gte('created_at', thirtyDaysAgo),

    supabase
      .from('chatbot_query_log')
      .select('input_tokens, output_tokens, latency_ms')
      .gte('created_at', thirtyDaysAgo),
  ]);

  const totalQueries = queryLogResult.data?.length || 0;
  const noAnswerCount = noAnswerResult.count || 0;
  const noAnswerRate = totalQueries > 0 ? noAnswerCount / totalQueries : 0;

  // Aggregate top questions by frequency
  const queryFreq = new Map<string, number>();
  for (const row of queryLogResult.data || []) {
    const q = (row.query as string).toLowerCase().trim().slice(0, 100);
    queryFreq.set(q, (queryFreq.get(q) || 0) + 1);
  }
  const topQuestions = Array.from(queryFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([query, count]) => ({ query, count }));

  // Feedback breakdown
  const feedbackBreakdown = { thumbs_up: 0, thumbs_down: 0, report: 0 };
  for (const row of feedbackResult.data || []) {
    const t = row.feedback_type as keyof typeof feedbackBreakdown;
    if (t in feedbackBreakdown) feedbackBreakdown[t]++;
  }

  // Cost and latency
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalLatency = 0;
  let latencyCount = 0;
  for (const row of costResult.data || []) {
    totalInputTokens += (row.input_tokens as number) || 0;
    totalOutputTokens += (row.output_tokens as number) || 0;
    if (row.latency_ms) {
      totalLatency += row.latency_ms as number;
      latencyCount++;
    }
  }

  return Response.json({
    period: '30d',
    totalQueries,
    noAnswerRate: Math.round(noAnswerRate * 1000) / 10,
    topQuestions,
    feedback: feedbackBreakdown,
    cost: {
      totalInputTokens,
      totalOutputTokens,
      estimatedCostUsd:
        Math.round((totalInputTokens * 0.003 + totalOutputTokens * 0.015) / 10) / 100,
      avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0,
    },
  });
}
