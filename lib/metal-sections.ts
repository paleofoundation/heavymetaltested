export interface SectionDef {
  key: string;
  heading: string;
  keywords: string[];
}

export const metalSections: SectionDef[] = [
  {
    key: 'whatItIs',
    heading: 'What it is',
    keywords: ['introduction', 'overview', 'priority', 'contaminant', 'what it is', 'what is', 'sources, properties', 'properties and environmental'],
  },
  {
    key: 'whereItShowsUp',
    heading: 'Where it shows up',
    keywords: ['exposure pathway', 'environmental source', 'population', 'where it shows up'],
  },
  {
    key: 'healthConcerns',
    heading: 'Major health concerns',
    keywords: ['health effect', 'dose-response', 'lifespan', 'toxicity', 'health concerns', 'major health'],
  },
  {
    key: 'highRiskProducts',
    heading: 'Highest-risk foods or products',
    keywords: ['key data', 'evidence summary', 'food categories', 'highest-risk', 'high risk', 'contamination in food', 'food system', 'dietary exposure'],
  },
  {
    key: 'testingNotes',
    heading: 'Testing and speciation notes',
    keywords: ['analytical method', 'detection', 'speciation', 'testing'],
  },
  {
    key: 'reductionStrategies',
    heading: 'Practical reduction strategies',
    keywords: ['bioaccumulation', 'mitigation', 'remediation', 'transfer mechanism', 'monitoring', 'reduction strategies', 'practical reduction'],
  },
  {
    key: 'standards',
    heading: 'How standards approach this',
    keywords: ['regulatory standard', 'guideline', 'risk assessment framework', 'standards'],
  },
  {
    key: 'conclusion',
    heading: 'Conclusion',
    keywords: ['conclusion', 'outlook', 'research gaps', 'future directions', 'summary and'],
  },
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'in', 'on', 'to', 'for', 'is', 'it', 'its', 'this', 'that', 'with', 'as', 'by', 'at', 'from',
]);

function significantWords(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function matchHeadingToSection(heading: string): string | null {
  const lower = heading.toLowerCase().trim();

  for (const section of metalSections) {
    if (lower === section.heading.toLowerCase()) return section.key;
  }

  for (const section of metalSections) {
    for (const kw of section.keywords) {
      if (lower.includes(kw.toLowerCase())) return section.key;
    }
  }

  const headingWords = significantWords(heading);
  if (headingWords.length === 0) return null;

  let bestKey: string | null = null;
  let bestScore = 0;
  for (const section of metalSections) {
    const pool = significantWords(section.heading + ' ' + section.keywords.join(' '));
    const overlap = headingWords.filter((w) => pool.includes(w)).length;
    const score = overlap / headingWords.length;
    if (overlap >= 2 && score > bestScore) {
      bestScore = score;
      bestKey = section.key;
    }
  }
  return bestKey;
}

export function splitBodyIntoSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  for (const s of metalSections) sections[s.key] = '';

  const parts = body.split(/^## /m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) continue;
    const heading = part.slice(0, newlineIdx).trim();
    const content = part.slice(newlineIdx + 1).trim();

    if (heading.toLowerCase() === 'references') continue;

    const key = matchHeadingToSection(heading);
    if (key) {
      sections[key] = content;
    }
  }

  return sections;
}

export function assembleSectionsToBody(
  sections: Record<string, string>,
  references?: string[],
): string {
  const parts: string[] = [];
  for (const s of metalSections) {
    const content = sections[s.key]?.trim();
    if (content) {
      parts.push(`## ${s.heading}\n${content}`);
    }
  }
  if (references && references.length > 0) {
    const refLines = references.map((r, i) => `${i + 1}. ${r}`).join('\n');
    parts.push(`## References\n${refLines}`);
  }
  return parts.join('\n\n') + '\n';
}
