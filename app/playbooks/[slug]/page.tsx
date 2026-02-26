import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleShell from '@/components/ArticleShell';
import { getBySlug } from '@/lib/content';
import { resolveAuthors } from '@/lib/authors';

type Playbook = { title: string; slug: string; description: string; html: string; updatedAt: string; references: string[]; authors?: string[]; keywords?: string[] };

const allowed = ['consumers', 'brands', 'manufacturers'];
export function generateStaticParams() { return allowed.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (!allowed.includes(params.slug)) return {};
  const page = await getBySlug<Playbook>('playbooks', params.slug);
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords?.join(', '),
    openGraph: { title: page.title, description: page.description, type: 'article' },
  };
}

export default async function PlaybookPage({ params }: { params: { slug: string } }) {
  if (!allowed.includes(params.slug)) notFound();
  const page = await getBySlug<Playbook>('playbooks', params.slug);
  const authors = resolveAuthors(page.authors);
  return (
    <ArticleShell
      title={page.title}
      description={page.description}
      meta={<p className="muted">Updated {page.updatedAt}</p>}
      html={page.html}
      contentType="playbooks"
      slug={params.slug}
      authors={authors}
      keywords={page.keywords}
    />
  );
}
