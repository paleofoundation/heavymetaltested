import { CHATBOT_CONFIG } from './config';
import { estimateTokens } from './embeddings';

export interface ContentChunk {
  content: string;
  sectionTitle: string;
  sectionAnchor: string;
  chunkIndex: number;
  tokenCount: number;
}

interface Section {
  title: string;
  anchor: string;
  body: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Split markdown into sections based on headings.
 */
function splitIntoSections(markdown: string): Section[] {
  const lines = markdown.split('\n');
  const sections: Section[] = [];
  let currentTitle = '';
  let currentAnchor = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      if (currentBody.length > 0) {
        sections.push({
          title: currentTitle,
          anchor: currentAnchor,
          body: currentBody.join('\n').trim(),
        });
      }
      currentTitle = headingMatch[1].trim();
      currentAnchor = slugify(currentTitle);
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentBody.length > 0 || currentTitle) {
    sections.push({
      title: currentTitle,
      anchor: currentAnchor,
      body: currentBody.join('\n').trim(),
    });
  }

  return sections.filter((s) => s.body.length > 0);
}

/**
 * Split a long text into paragraph-based sub-chunks with overlap.
 */
function splitByParagraphs(
  text: string,
  targetTokens: number,
  overlapTokens: number,
): string[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para);

    if (currentTokens + paraTokens > targetTokens && current.length > 0) {
      chunks.push(current.join('\n\n'));

      const overlapParts: string[] = [];
      let overlapCount = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        const t = estimateTokens(current[i]);
        if (overlapCount + t > overlapTokens) break;
        overlapParts.unshift(current[i]);
        overlapCount += t;
      }
      current = overlapParts;
      currentTokens = overlapCount;
    }

    current.push(para);
    currentTokens += paraTokens;
  }

  if (current.length > 0) {
    chunks.push(current.join('\n\n'));
  }

  return chunks;
}

/**
 * Chunk a full page's content into indexed chunks suitable for embedding.
 */
export function chunkContent(markdown: string, pageTitle: string): ContentChunk[] {
  const { targetTokens, overlapTokens } = CHATBOT_CONFIG.chunking;
  const sections = splitIntoSections(markdown);
  const chunks: ContentChunk[] = [];
  let chunkIndex = 0;

  for (const section of sections) {
    const sectionTokens = estimateTokens(section.body);

    if (sectionTokens <= targetTokens * 1.5) {
      const prefix = section.title ? `${pageTitle} — ${section.title}\n\n` : '';
      const content = prefix + section.body;
      chunks.push({
        content,
        sectionTitle: section.title || pageTitle,
        sectionAnchor: section.anchor,
        chunkIndex,
        tokenCount: estimateTokens(content),
      });
      chunkIndex++;
    } else {
      const subChunks = splitByParagraphs(section.body, targetTokens, overlapTokens);
      for (const sub of subChunks) {
        const prefix = section.title ? `${pageTitle} — ${section.title}\n\n` : '';
        const content = prefix + sub;
        chunks.push({
          content,
          sectionTitle: section.title || pageTitle,
          sectionAnchor: section.anchor,
          chunkIndex,
          tokenCount: estimateTokens(content),
        });
        chunkIndex++;
      }
    }
  }

  return chunks;
}
