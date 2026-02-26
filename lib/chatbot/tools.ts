import { searchByKeyword, RetrievedChunk } from './retrieval';
import { convertUnit } from './units';
import { createTicket } from './tickets';

export type ToolName = 'search_knowledge_base' | 'convert_units' | 'create_ticket';

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'search_knowledge_base',
    description:
      'Search the Heavy Metal Facts knowledge base for specific information. ' +
      'Use this when the initially provided documents do not fully answer the question ' +
      'or when you need information about a different topic than what was retrieved.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The search query — a natural-language question or keyword phrase.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'convert_units',
    description:
      'Convert between measurement units commonly used in heavy metal testing. ' +
      'Supports ppb, ppm, mg/L, µg/L, µg/dL, mg/kg, µg/kg.',
    input_schema: {
      type: 'object' as const,
      properties: {
        value: { type: 'number', description: 'The numeric value to convert.' },
        from_unit: { type: 'string', description: 'Source unit (e.g., "ppb", "mg/L").' },
        to_unit: { type: 'string', description: 'Target unit (e.g., "µg/L", "ppm").' },
      },
      required: ['value', 'from_unit', 'to_unit'],
    },
  },
  {
    name: 'create_ticket',
    description:
      'Create a support ticket when a user reports an error in the chatbot response, ' +
      'wants to flag inaccurate information, or needs human follow-up. ' +
      'Include the original question, the bot answer, and the user comment.',
    input_schema: {
      type: 'object' as const,
      properties: {
        user_question: { type: 'string', description: 'The original user question.' },
        bot_answer: { type: 'string', description: 'The bot response being reported.' },
        user_comment: { type: 'string', description: 'The user explanation of the issue.' },
        cited_sources: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              title: { type: 'string' },
            },
          },
          description: 'Sources that were cited in the response.',
        },
      },
      required: ['user_question', 'bot_answer', 'user_comment'],
    },
  },
];

export interface ToolResult {
  content: string;
  chunks?: RetrievedChunk[];
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  context?: { conversationId?: string },
): Promise<ToolResult> {
  switch (name) {
    case 'search_knowledge_base': {
      const chunks = await searchByKeyword(input.query as string, 5);
      if (chunks.length === 0) {
        return { content: 'No results found in the knowledge base for that query.', chunks: [] };
      }
      const formatted = chunks
        .map(
          (c, i) =>
            `[Result ${i + 1}] ${c.title} — ${c.sectionTitle}\n` +
            `URL: ${c.url}${c.sectionAnchor ? '#' + c.sectionAnchor : ''}\n` +
            `${c.content.slice(0, 600)}${c.content.length > 600 ? '…' : ''}`,
        )
        .join('\n\n---\n\n');
      return { content: formatted, chunks };
    }

    case 'convert_units': {
      const result = convertUnit(
        input.value as number,
        input.from_unit as string,
        input.to_unit as string,
      );
      if (!result) {
        return {
          content: `Cannot convert from ${input.from_unit} to ${input.to_unit}. Supported units: ppb, ppm, mg/L, µg/L, µg/dL, mg/kg, µg/kg.`,
        };
      }
      return { content: JSON.stringify(result) };
    }

    case 'create_ticket': {
      const ticket = await createTicket({
        userQuestion: input.user_question as string,
        botAnswer: input.bot_answer as string,
        userComment: input.user_comment as string,
        citedSources: (input.cited_sources as Array<{ url: string; title: string }>) || [],
        conversationId: context?.conversationId,
      });
      return { content: `Ticket #${ticket.ticketId} created. A team member will review this.` };
    }

    default:
      return { content: `Unknown tool: ${name}` };
  }
}
