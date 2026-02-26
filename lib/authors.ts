import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const authorsDir = path.join(process.cwd(), 'content', 'authors');

export interface AuthorInfo {
  name: string;
  slug: string;
  role?: string;
  avatar?: string;
  orcid?: string;
}

export function getAuthorBySlug(slug: string): AuthorInfo | null {
  const filePath = path.join(authorsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);
  return {
    name: data.title || slug,
    slug,
    role: data.role,
    avatar: data.avatar,
    orcid: data.orcid,
  };
}

export function resolveAuthors(slugs: string[] | undefined): AuthorInfo[] {
  if (!slugs || !Array.isArray(slugs)) return [];
  return slugs
    .map((s) => getAuthorBySlug(s))
    .filter((a): a is AuthorInfo => a !== null);
}
