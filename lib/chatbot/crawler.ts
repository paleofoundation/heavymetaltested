import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import crypto from 'node:crypto';
import { CHATBOT_CONFIG } from './config';

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
  contentHash: string;
  tags: string[];
  publishedDate?: string;
  lastModified?: string;
}

const TYPE_TO_PATH: Record<string, string> = {
  metals: '/metals',
  categories: '/categories',
  primers: '/primers',
  mechanisms: '/mechanisms',
  playbooks: '/playbooks',
  news: '/news',
  authors: '/authors',
  pages: '',
};

/**
 * Read all MDX content files from the local filesystem.
 * Used during full ingest (dev or CI).
 */
export function crawlLocalContent(rootDir?: string): CrawledPage[] {
  const contentDir = path.join(rootDir || process.cwd(), CHATBOT_CONFIG.site.contentDir);
  const pages: CrawledPage[] = [];

  if (!fs.existsSync(contentDir)) return pages;

  for (const typeDir of fs.readdirSync(contentDir)) {
    const typePath = path.join(contentDir, typeDir);
    if (!fs.statSync(typePath).isDirectory()) continue;

    const urlPrefix = TYPE_TO_PATH[typeDir] ?? `/${typeDir}`;

    for (const file of fs.readdirSync(typePath)) {
      if (!file.endsWith('.mdx')) continue;
      const slug = file.replace(/\.mdx$/, '');
      const filePath = path.join(typePath, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(raw);

      const pageUrl =
        typeDir === 'pages'
          ? slug === 'home'
            ? '/'
            : `/${slug}`
          : `${urlPrefix}/${slug}`;

      const fullContent = [
        data.title || '',
        data.description || '',
        content,
      ].join('\n\n');

      pages.push({
        url: `${CHATBOT_CONFIG.site.url}${pageUrl}`,
        title: (data.title as string) || slug,
        content: fullContent,
        contentHash: crypto.createHash('sha256').update(raw).digest('hex'),
        tags: [
          typeDir,
          ...(Array.isArray(data.keywords) ? data.keywords : []),
          ...(Array.isArray(data.tags) ? data.tags : []),
        ],
        publishedDate: data.publishedAt,
        lastModified: data.updatedAt,
      });
    }
  }

  return pages;
}

/**
 * Lightweight HTML-to-text extraction (no cheerio dependency).
 */
function extractTextFromHtml(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

  let body = html;
  // Remove scripts, styles, nav, header, footer
  body = body.replace(/<(script|style|nav|header|footer|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  // Try to extract just <main> content
  const mainMatch = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    || body.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (mainMatch) body = mainMatch[1];
  // Strip remaining tags
  body = body.replace(/<[^>]+>/g, ' ');
  // Normalize whitespace
  body = body.replace(/\s+/g, ' ').trim();

  return { title, text: body };
}

/**
 * Fetch a single live URL and extract main content.
 * Used for incremental reindex of production pages.
 */
export async function crawlUrl(url: string): Promise<CrawledPage | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HeavyMetalFacts-Chatbot-Indexer/1.0' },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const { title, text } = extractTextFromHtml(html);

    return {
      url,
      title,
      content: text,
      contentHash: crypto.createHash('sha256').update(text).digest('hex'),
      tags: [],
      lastModified: res.headers.get('last-modified') || undefined,
    };
  } catch {
    console.error(`Failed to crawl ${url}`);
    return null;
  }
}

/**
 * Fetch sitemap.xml and return all page URLs.
 */
export async function fetchSitemapUrls(siteUrl?: string): Promise<string[]> {
  const base = siteUrl || CHATBOT_CONFIG.site.url;
  try {
    const res = await fetch(`${base}/sitemap.xml`);
    if (!res.ok) return [];
    const xml = await res.text();
    const urls: string[] = [];
    const locRegex = /<loc>([^<]+)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(xml)) !== null) {
      urls.push(match[1]);
    }
    return urls;
  } catch {
    return [];
  }
}
