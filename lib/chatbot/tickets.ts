import { getSupabase } from './db';

export interface TicketData {
  userQuestion: string;
  botAnswer: string;
  citedSources: Array<{ url: string; title: string }>;
  userComment?: string;
  conversationId?: string;
  messageId?: number;
}

/**
 * Create a feedback ticket stored in the database.
 * Can later be extended to send email or push to a CRM via webhook.
 */
export async function createTicket(data: TicketData): Promise<{ ticketId: number }> {
  const supabase = getSupabase();

  const { data: row, error } = await supabase
    .from('chatbot_feedback')
    .insert({
      feedback_type: 'report',
      user_question: data.userQuestion,
      bot_answer: data.botAnswer,
      cited_sources: data.citedSources,
      comment: data.userComment || 'User-reported issue via chatbot',
      conversation_id: data.conversationId || null,
      message_id: data.messageId || null,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create ticket: ${error.message}`);

  // Optionally send webhook notification
  if (process.env.TICKET_WEBHOOK_URL) {
    fetch(process.env.TICKET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: row.id,
        question: data.userQuestion,
        comment: data.userComment,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Fire and forget — don't block on webhook failures
    });
  }

  return { ticketId: row.id };
}
