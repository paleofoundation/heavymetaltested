import { CHATBOT_CONFIG, SYSTEM_PROMPT } from './config';
import { retrieveChunks, RetrievedChunk } from './retrieval';
import { TOOL_DEFINITIONS, executeTool } from './tools';
import { getSupabase } from './db';
import crypto from 'node:crypto';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamEvent {
  type: 'sources' | 'text' | 'citation' | 'done' | 'error';
  text?: string;
  citedText?: string;
  documentIndex?: number;
  url?: string;
  title?: string;
  sources?: Array<{ url: string; title: string; sectionTitle: string; sectionAnchor: string }>;
  conversationId?: string;
  messageId?: number;
  message?: string;
}

/* ---------------------------------------------------------------- */
/*  Lightweight Anthropic API helpers (no SDK dependency)            */
/* ---------------------------------------------------------------- */

interface DocumentBlock {
  type: 'document';
  source: { type: 'text'; media_type: 'text/plain'; data: string };
  title: string;
  context: string;
  citations: { enabled: true };
}

interface ToolDef {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{ role: string; content: unknown }>;
  tools?: ToolDef[];
  stream: boolean;
}

function buildDocumentBlocks(chunks: RetrievedChunk[]): DocumentBlock[] {
  return chunks.map((chunk) => ({
    type: 'document' as const,
    source: {
      type: 'text' as const,
      media_type: 'text/plain' as const,
      data: chunk.content,
    },
    title: `${chunk.title} — ${chunk.sectionTitle}`,
    context: `Source URL: ${chunk.url}${chunk.sectionAnchor ? '#' + chunk.sectionAnchor : ''}`,
    citations: { enabled: true as const },
  }));
}

/**
 * Parse SSE lines from a ReadableStream. Yields parsed event objects.
 */
async function* parseSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<{ event?: string; data: string }> {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n');
    buffer = parts.pop() || '';

    let currentEvent: string | undefined;
    let currentData = '';

    for (const line of parts) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        currentData = line.slice(6);
      } else if (line === '' && currentData) {
        yield { event: currentEvent, data: currentData };
        currentEvent = undefined;
        currentData = '';
      }
    }
  }
}

/**
 * Call the Anthropic Messages API with streaming.
 * Returns parsed content blocks and usage.
 */
async function* callClaudeStreaming(
  request: AnthropicRequest,
): AsyncGenerator<
  | { type: 'text_delta'; text: string }
  | { type: 'tool_use_start'; id: string; name: string }
  | { type: 'tool_input_delta'; json: string }
  | { type: 'block_stop' }
  | { type: 'message_complete'; content: unknown[]; usage: { input_tokens: number; output_tokens: number }; stopReason: string }
> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY environment variable');

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const contentBlocks: unknown[] = [];
  let inputTokens = 0;
  let outputTokens = 0;
  let stopReason = 'end_turn';

  for await (const { data } of parseSSE(reader)) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(data);
    } catch {
      continue;
    }

    const eventType = parsed.type as string;

    if (eventType === 'message_start') {
      const msg = parsed.message as Record<string, unknown>;
      const usage = msg?.usage as Record<string, number> | undefined;
      if (usage?.input_tokens) inputTokens += usage.input_tokens;
    } else if (eventType === 'content_block_start') {
      const block = parsed.content_block as Record<string, unknown>;
      contentBlocks.push(block);
      if (block?.type === 'tool_use') {
        yield { type: 'tool_use_start', id: block.id as string, name: block.name as string };
      }
    } else if (eventType === 'content_block_delta') {
      const delta = parsed.delta as Record<string, unknown>;
      if (delta?.type === 'text_delta') {
        yield { type: 'text_delta', text: delta.text as string };
        const lastBlock = contentBlocks[contentBlocks.length - 1] as Record<string, unknown>;
        if (lastBlock) lastBlock.text = ((lastBlock.text as string) || '') + (delta.text as string);
      } else if (delta?.type === 'input_json_delta') {
        yield { type: 'tool_input_delta', json: delta.partial_json as string };
      }
    } else if (eventType === 'content_block_stop') {
      yield { type: 'block_stop' };
    } else if (eventType === 'message_delta') {
      const delta = parsed.delta as Record<string, unknown>;
      if (delta?.stop_reason) stopReason = delta.stop_reason as string;
      const usage = parsed.usage as Record<string, number> | undefined;
      if (usage?.output_tokens) outputTokens += usage.output_tokens;
    }
  }

  yield {
    type: 'message_complete',
    content: contentBlocks,
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    stopReason,
  };
}

/* ---------------------------------------------------------------- */
/*  Database helpers                                                 */
/* ---------------------------------------------------------------- */

async function ensureConversation(conversationId?: string): Promise<string> {
  const supabase = getSupabase();
  if (conversationId) {
    const { data } = await supabase.from('chatbot_conversations').select('id').eq('id', conversationId).single();
    if (data) return data.id;
  }
  const { data, error } = await supabase.from('chatbot_conversations').insert({}).select('id').single();
  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return data.id;
}

async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  extra?: { citations?: unknown[]; tokenUsage?: { input: number; output: number }; latencyMs?: number; traceId?: string },
): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('chatbot_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      citations: extra?.citations || [],
      token_usage: extra?.tokenUsage || null,
      latency_ms: extra?.latencyMs || null,
      trace_id: extra?.traceId || null,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to save message: ${error.message}`);
  return data.id;
}

async function logQuery(params: {
  conversationId: string;
  query: string;
  chunksRetrieved: number;
  topChunkScore: number;
  hadAnswer: boolean;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  traceId: string;
}) {
  const supabase = getSupabase();
  await supabase.from('chatbot_query_log').insert({
    conversation_id: params.conversationId,
    query: params.query,
    chunks_retrieved: params.chunksRetrieved,
    top_chunk_score: params.topChunkScore,
    had_answer: params.hadAnswer,
    latency_ms: params.latencyMs,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    trace_id: params.traceId,
  });
}

/* ---------------------------------------------------------------- */
/*  Main streaming chat function                                     */
/* ---------------------------------------------------------------- */

export async function* streamChat(
  userMessage: string,
  history: ChatMessage[],
  conversationId?: string,
): AsyncGenerator<StreamEvent> {
  const traceId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const convId = await ensureConversation(conversationId);
    await saveMessage(convId, 'user', userMessage, { traceId });

    const chunks = await retrieveChunks(userMessage);

    yield {
      type: 'sources',
      sources: chunks.map((c) => ({
        url: c.url,
        title: c.title,
        sectionTitle: c.sectionTitle,
        sectionAnchor: c.sectionAnchor,
      })),
    };

    const documentBlocks = buildDocumentBlocks(chunks);

    const priorMessages = history
      .slice(-CHATBOT_CONFIG.claude.maxConversationTurns)
      .map((m) => ({ role: m.role, content: m.content }));

    const userContent = [...documentBlocks, { type: 'text' as const, text: userMessage }];
    let messages: Array<{ role: string; content: unknown }> = [
      ...priorMessages,
      { role: 'user', content: userContent },
    ];

    let fullText = '';
    const citationsList: unknown[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let done = false;

    while (!done) {
      const request: AnthropicRequest = {
        model: CHATBOT_CONFIG.claude.model,
        max_tokens: CHATBOT_CONFIG.claude.maxResponseTokens,
        system: SYSTEM_PROMPT,
        messages,
        tools: TOOL_DEFINITIONS as ToolDef[],
        stream: true,
      };

      let hasToolUse = false;
      const toolUseBlocks: Array<{ id: string; name: string; input: string }> = [];
      let currentToolId = '';
      let currentToolName = '';
      let currentToolInput = '';
      let messageContent: unknown[] = [];

      for await (const event of callClaudeStreaming(request)) {
        switch (event.type) {
          case 'text_delta':
            fullText += event.text;
            yield { type: 'text', text: event.text };
            break;

          case 'tool_use_start':
            hasToolUse = true;
            currentToolId = event.id;
            currentToolName = event.name;
            currentToolInput = '';
            break;

          case 'tool_input_delta':
            currentToolInput += event.json;
            break;

          case 'block_stop':
            if (currentToolId && currentToolName) {
              toolUseBlocks.push({ id: currentToolId, name: currentToolName, input: currentToolInput });
              currentToolId = '';
              currentToolName = '';
              currentToolInput = '';
            }
            break;

          case 'message_complete':
            totalInputTokens += event.usage.input_tokens;
            totalOutputTokens += event.usage.output_tokens;
            messageContent = event.content;

            for (const block of event.content) {
              const b = block as Record<string, unknown>;
              if (b.type === 'text' && Array.isArray(b.citations)) {
                for (const cite of b.citations) {
                  const c = cite as Record<string, unknown>;
                  citationsList.push(cite);
                  const docIdx = c.document_index as number;
                  if (docIdx !== undefined && chunks[docIdx]) {
                    yield {
                      type: 'citation',
                      citedText: c.cited_text as string,
                      documentIndex: docIdx,
                      url: chunks[docIdx].url,
                      title: chunks[docIdx].title,
                    };
                  }
                }
              }
            }
            break;
        }
      }

      if (hasToolUse && toolUseBlocks.length > 0) {
        const toolResults = [];
        for (const tool of toolUseBlocks) {
          let parsedInput = {};
          try { parsedInput = JSON.parse(tool.input); } catch { /* empty */ }
          const result = await executeTool(tool.name, parsedInput as Record<string, unknown>, { conversationId: convId });
          toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: result.content });
        }
        messages = [
          ...messages,
          { role: 'assistant', content: messageContent },
          { role: 'user', content: toolResults },
        ];
      } else {
        done = true;
      }
    }

    const latencyMs = Date.now() - startTime;
    const messageId = await saveMessage(convId, 'assistant', fullText, {
      citations: citationsList,
      tokenUsage: { input: totalInputTokens, output: totalOutputTokens },
      latencyMs,
      traceId,
    });

    await logQuery({
      conversationId: convId,
      query: userMessage,
      chunksRetrieved: chunks.length,
      topChunkScore: chunks[0]?.score || 0,
      hadAnswer: fullText.length > 0 && !fullText.includes('not supported by'),
      latencyMs,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      traceId,
    });

    yield { type: 'done', conversationId: convId, messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    yield { type: 'error', message };
  }
}
