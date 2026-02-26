import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mammoth from 'mammoth';
import { matchHeadingToSection, metalSections } from '@/lib/metal-sections';

function htmlToMarkdown(html: string): string {
  let md = html;

  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');

  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_match, inner: string) => {
    const rows: string[][] = [];
    const rowMatches = inner.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    for (const row of rowMatches) {
      const cells: string[] = [];
      const cellMatches = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
      for (const cell of cellMatches) {
        const text = cell.replace(/<[^>]+>/g, '').trim();
        cells.push(text);
      }
      rows.push(cells);
    }
    if (rows.length === 0) return '';
    const colCount = Math.max(...rows.map((r) => r.length));
    const lines: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const padded = rows[i].concat(Array(colCount - rows[i].length).fill(''));
      lines.push('| ' + padded.join(' | ') + ' |');
      if (i === 0) {
        lines.push('|' + padded.map(() => '---').join('|') + '|');
      }
    }
    return '\n' + lines.join('\n') + '\n\n';
  });

  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');

  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');

  md = md.replace(/<[^>]+>/g, '');

  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&#(\d+);/g, (_m, code: string) => String.fromCharCode(parseInt(code)));
  md = md.replace(/&mu;/g, 'μ');

  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

interface ParsedImport {
  description: string;
  references: string[];
  sections: Record<string, string>;
  unmatched: { heading: string; content: string }[];
}

function parseMarkdownIntoSections(markdown: string): ParsedImport {
  const result: ParsedImport = {
    description: '',
    references: [],
    sections: {},
    unmatched: [],
  };
  for (const s of metalSections) result.sections[s.key] = '';

  const lines = markdown.split('\n');
  let currentHeading = '';
  let currentContent: string[] = [];
  let inPreamble = true;
  const preambleLines: string[] = [];
  const headingBlocks: { heading: string; content: string }[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      if (inPreamble) {
        inPreamble = false;
      } else if (currentHeading) {
        headingBlocks.push({ heading: currentHeading, content: currentContent.join('\n').trim() });
      }
      currentHeading = h2Match[1].trim();
      currentContent = [];
      continue;
    }

    if (inPreamble) {
      if (!line.match(/^# /)) {
        preambleLines.push(line);
      }
    } else {
      currentContent.push(line);
    }
  }
  if (currentHeading) {
    headingBlocks.push({ heading: currentHeading, content: currentContent.join('\n').trim() });
  }

  const preambleText = preambleLines.join('\n').trim();
  const abstractMatch = preambleText.match(/(?:^|\n)\*{0,2}Abstract\*{0,2}\s*\n([\s\S]*?)(?=\n\*{0,2}Keywords\*{0,2}|\n##|$)/i);
  if (abstractMatch) {
    result.description = abstractMatch[1].trim();
  } else if (preambleText) {
    const cleaned = preambleText
      .replace(/^\*{0,2}Keywords\*{0,2}\s*\n[\s\S]*$/im, '')
      .replace(/^\*{0,2}Abstract\*{0,2}\s*$/im, '')
      .trim();
    if (cleaned) result.description = cleaned;
  }

  for (const block of headingBlocks) {
    if (block.heading.toLowerCase() === 'references') {
      const refs = block.content
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*/, '').trim())
        .filter((l) => l.length > 0);
      result.references = refs;
      continue;
    }

    if (block.heading.toLowerCase() === 'discussion') {
      const conclusionContent = result.sections['conclusion'];
      result.sections['conclusion'] = conclusionContent
        ? block.content + '\n\n' + conclusionContent
        : block.content;
      continue;
    }

    const sectionKey = matchHeadingToSection(block.heading);
    if (sectionKey) {
      const existing = result.sections[sectionKey];
      result.sections[sectionKey] = existing
        ? existing + '\n\n' + block.content
        : block.content;
    } else {
      result.unmatched.push(block);
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const { value: html } = await mammoth.convertToHtml({ buffer });
  const markdown = htmlToMarkdown(html);
  const parsed = parseMarkdownIntoSections(markdown);

  return NextResponse.json(parsed);
}
