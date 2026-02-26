import { CHATBOT_CONFIG } from './config';

interface EmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>;
  usage: { prompt_tokens: number; total_tokens: number };
}

/**
 * Compute embeddings via direct OpenAI API fetch (no SDK needed).
 * Automatically splits into sub-batches to stay within API limits.
 */
export async function computeEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY environment variable');

  const { model, dimensions, batchSize } = CHATBOT_CONFIG.embedding;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input: batch, dimensions }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI embeddings API error ${res.status}: ${err}`);
    }

    const json: EmbeddingResponse = await res.json();
    for (const item of json.data) {
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
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
