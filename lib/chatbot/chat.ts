import Anthropic from '@anthropic-ai/sdk';
import { CHATBOT_CONFIG, SYSTEM_PROMPT } from './config';
import { retrieveChunks, RetrievedChunk } from './retrieval';
import { TOOL_DEFINITIONS, executeTool } from './tools';
import { getSupabase } from './db';
import crypto from 'node:crypto';

let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (_anthropic) return _anthropic;
  _anthropic = new Anthropic();
  return _anthropic;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamEvent {
  type: 'sources' | 'text' | 'citation' | 'done' | 'error';
  // For 'text'
  text?: string;
  // For 'citation'
  citedText?: string;
  documentIndex?: number;
  url?: string;
  title?: string;
  // For 'sources'
  sources?: Array<{ url: string; title: string; sectionTitle: string; sectionAnchor: string }>;
  // For 'done'
  conversationId?: string;
  messageId?: number;
  // For 'error'
  message?: string;
}

/**
 * Build document content blocks for Claude with citations enabled.
 */
function buildDocumentBlocks(
  chunks: RetrievedChunk[],
): Array<Anthropic.DocumentBlockParam> {
  return chunks.map((chunk) => ({
    type: 'document' as const,
    source: {
      type: 'text' as const,
      media_type: 'text/plain' as const,
      data: chunk.content,
    },
    title: `${chunk.title} — ${chunk.sectionTitle}`,
    context: `Source URL: ${chunk.url}${chunk.sectionAnchor ? '#' + chunk.sectionAnchor : ''}`,
    citations: { enabled: true },
  }));
}

/**
 * Ensure a conversation exists and return its ID.
 */
async function ensureConversation(conversationId?: string): Promise<string> {
  const supabase = getSupabase();

  if (conversationId) {
    const { data } = await supabase
      .from('chatbot_conversations')
      .select('id')
      .eq('id', conversationId)
      .single();
    if (data) return data.id;
  }

  const { data, error } = await supabase
    .from('chatbot_conversations')
    .insert({})
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return data.id;
}

/**
 * Save a message to the database.
 */
async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  extra?: {
    citations?: unknown[];
    tokenUsage?: { input: number; output: number };
    latencyMs?: number;
    traceId?: string;
  },
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

/**
 * Log a query for analytics.
 */
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

/**
 * Stream a chat response. Yields StreamEvent objects.
 */
export async function* streamChat(
  userMessage: string,
  history: ChatMessage[],
  conversationId?: string,
): AsyncGenerator<StreamEvent> {
  const traceId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // 1. Ensure conversation
    const convId = await ensureConversation(conversationId);

    // 2. Save user message
    await saveMessage(convId, 'user', userMessage, { traceId });

    // 3. Retrieve relevant chunks
    const chunks = await retrieveChunks(userMessage);

    // Emit sources
    yield {
      type: 'sources',
      sources: chunks.map((c) => ({
        url: c.url,
        title: c.title,
        sectionTitle: c.sectionTitle,
        sectionAnchor: c.sectionAnchor,
      })),
    };

    // 4. Build messages array for Claude
    const documentBlocks = buildDocumentBlocks(chunks);

    const priorMessages: Anthropic.MessageParam[] = history
      .slice(-CHATBOT_CONFIG.claude.maxConversationTurns)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const userContent: Anthropic.ContentBlockParam[] = [
      ...documentBlocks,
      { type: 'text' as const, text: userMessage },
    ];

    const messages: Anthropic.MessageParam[] = [
      ...priorMessages,
      { role: 'user' as const, content: userContent },
    ];

    // 5. Call Claude with streaming
    const client = getAnthropic();
    let fullText = '';
    const citationsList: unknown[] = [];
    let inputTokens = 0;
    let outputTokens = 0;

    // Handle potential tool use in a loop
    let currentMessages = messages;
    let done = false;

    while (!done) {
      const stream = client.messages.stream({
        model: CHATBOT_CONFIG.claude.model,
        max_tokens: CHATBOT_CONFIG.claude.maxResponseTokens,
        system: SYSTEM_PROMPT,
        messages: currentMessages,
        tools: TOOL_DEFINITIONS,
      });

      let hasToolUse = false;
      const toolUseBlocks: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];
      let currentToolId = '';
      let currentToolName = '';
      let currentToolInput = '';

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          const block = event.content_block;
          if (block.type === 'text') {
            // Text block starting
          } else if (block.type === 'tool_use') {
            hasToolUse = true;
            currentToolId = block.id;
            currentToolName = block.name;
            currentToolInput = '';
          }
        } else if (event.type === 'content_block_delta') {
          const delta = event.delta;
          if ('text' in delta && delta.text) {
            fullText += delta.text;
            yield { type: 'text', text: delta.text };
          } else if ('partial_json' in delta && delta.partial_json) {
            currentToolInput += delta.partial_json;
          }
          // Handle citation deltas if present
          if ('type' in delta && delta.type === 'citations_delta') {
            // Citation info comes through on the final message
          }
        } else if (event.type === 'content_block_stop') {
          if (currentToolId && currentToolName) {
            let parsedInput = {};
            try {
              parsedInput = JSON.parse(currentToolInput);
            } catch {
              // Parsing failed; use empty input
            }
            toolUseBlocks.push({
              id: currentToolId,
              name: currentToolName,
              input: parsedInput as Record<string, unknown>,
            });
            currentToolId = '';
            currentToolName = '';
            currentToolInput = '';
          }
        } else if (event.type === 'message_delta') {
          if ('usage' in event) {
            outputTokens += (event.usage as { output_tokens?: number }).output_tokens || 0;
          }
        }
      }

      const finalMessage = await stream.finalMessage();
      inputTokens += finalMessage.usage?.input_tokens || 0;
      outputTokens += finalMessage.usage?.output_tokens || 0;

      // Extract citations from content blocks
      for (const block of finalMessage.content) {
        if (block.type === 'text' && 'citations' in block) {
          const blockCitations = (block as unknown as { citations: unknown[] }).citations;
          if (Array.isArray(blockCitations)) {
            for (const cite of blockCitations) {
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
      }

      if (hasToolUse && toolUseBlocks.length > 0) {
        // Execute tools and continue the conversation
        const assistantContent = finalMessage.content;
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const tool of toolUseBlocks) {
          const result = await executeTool(tool.name, tool.input, { conversationId: convId });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: tool.id,
            content: result.content,
          });
        }

        currentMessages = [
          ...currentMessages,
          { role: 'assistant' as const, content: assistantContent },
          { role: 'user' as const, content: toolResults },
        ];
      } else {
        done = true;
      }
    }

    // 6. Save assistant message
    const latencyMs = Date.now() - startTime;
    const messageId = await saveMessage(convId, 'assistant', fullText, {
      citations: citationsList,
      tokenUsage: { input: inputTokens, output: outputTokens },
      latencyMs,
      traceId,
    });

    // 7. Log query analytics
    await logQuery({
      conversationId: convId,
      query: userMessage,
      chunksRetrieved: chunks.length,
      topChunkScore: chunks[0]?.score || 0,
      hadAnswer: fullText.length > 0 && !fullText.includes('not supported by'),
      latencyMs,
      inputTokens,
      outputTokens,
      traceId,
    });

    yield {
      type: 'done',
      conversationId: convId,
      messageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    yield { type: 'error', message };
  }
}
