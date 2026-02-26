import { NextRequest } from 'next/server';
import { getSupabase, isChatbotEnabled } from '@/lib/chatbot/db';

export async function POST(request: NextRequest) {
  if (!isChatbotEnabled()) {
    return Response.json({ error: 'Chatbot not configured' }, { status: 503 });
  }

  let body: {
    messageId?: number;
    conversationId?: string;
    feedbackType?: string;
    comment?: string;
    userQuestion?: string;
    botAnswer?: string;
    citedSources?: unknown[];
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { messageId, conversationId, feedbackType, comment, userQuestion, botAnswer, citedSources } = body;

  if (!feedbackType || !['thumbs_up', 'thumbs_down', 'report'].includes(feedbackType)) {
    return Response.json(
      { error: 'feedbackType must be one of: thumbs_up, thumbs_down, report' },
      { status: 400 },
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('chatbot_feedback')
    .insert({
      message_id: messageId || null,
      conversation_id: conversationId || null,
      feedback_type: feedbackType,
      comment: comment || null,
      user_question: userQuestion || null,
      bot_answer: botAnswer || null,
      cited_sources: citedSources || null,
    })
    .select('id')
    .single();

  if (error) {
    return Response.json({ error: 'Failed to save feedback' }, { status: 500 });
  }

  return Response.json({ id: data.id, status: 'saved' });
}
