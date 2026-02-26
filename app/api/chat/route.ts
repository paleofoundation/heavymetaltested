import { NextRequest } from 'next/server';
import { streamChat, ChatMessage } from '@/lib/chatbot/chat';
import { isChatbotEnabled } from '@/lib/chatbot/db';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= 20;
}

export async function POST(request: NextRequest) {
  if (!isChatbotEnabled()) {
    return Response.json(
      { error: 'Chatbot is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.' },
      { status: 503 },
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
  }

  let body: { message?: string; history?: ChatMessage[]; conversationId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, history = [], conversationId } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  if (message.length > 4000) {
    return Response.json({ error: 'Message too long (max 4000 characters)' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamChat(message.trim(), history, conversationId)) {
          const line = JSON.stringify(event) + '\n';
          controller.enqueue(encoder.encode(line));
        }
      } catch (err) {
        const errorEvent = JSON.stringify({
          type: 'error',
          message: err instanceof Error ? err.message : 'Stream failed',
        });
        controller.enqueue(encoder.encode(errorEvent + '\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
