import OpenAI from 'openai';
import { CHATBOT_CONFIG } from './config';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY environment variable');
  _openai = new OpenAI({ apiKey });
  return _openai;
}

/**
 * Compute embeddings for a batch of texts.
 * Automatically splits into sub-batches to stay within API limits.
 */
export async function computeEmbeddings(texts: string[]): Promise<number[][]> {
  const { model, dimensions, batchSize } = CHATBOT_CONFIG.embedding;
  const client = getOpenAI();
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await client.embeddings.create({
      model,
      input: batch,
      dimensions,
    });
    for (const item of response.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}

export async function computeEmbedding(text: string): Promise<number[]> {
  const [embedding] = await computeEmbeddings([text]);
  return embedding;
}

/**
 * Rough token count approximation (4 chars ≈ 1 token for English).
 * Good enough for chunking decisions; actual billing uses the real tokenizer.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
