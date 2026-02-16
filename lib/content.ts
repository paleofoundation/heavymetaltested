import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import gfm from 'remark-gfm';
import html from 'remark-html';

const contentRoot = path.join(process.cwd(), 'content');

export type BaseFrontmatter = {
  title: string;
  slug: string;
  description: string;
  updatedAt?: string;
  publishedAt?: string;
  references: string[];
};

export async function markdownToHtml(markdown: string) {
  const processedContent = await remark().use(gfm).use(html).process(markdown);
  return processedContent.toString();
}

export function getSlugs(type: string) {
  const dir = path.join(contentRoot, type);
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''));
}

export async function getBySlug<T extends BaseFrontmatter>(type: string, slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(contentRoot, type, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    ...(data as T),
    content,
    html: await markdownToHtml(content)
  };
}

export function getAll<T extends BaseFrontmatter>(type: string): T[] {
  const slugs = getSlugs(type);
  const items = slugs.map((slug) => {
    const fullPath = path.join(contentRoot, type, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    return {
      ...(data as T),
      body: content
    };
  });

  return items.sort((a, b) => {
    const ad = new Date((a as { publishedAt?: string; updatedAt?: string }).publishedAt || a.updatedAt || 0).valueOf();
    const bd = new Date((b as { publishedAt?: string; updatedAt?: string }).publishedAt || b.updatedAt || 0).valueOf();
    return bd - ad;
  });
}
