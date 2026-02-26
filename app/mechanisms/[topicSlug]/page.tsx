import type { Metadata } from 'next';
import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';
import { resolveAuthors } from '@/lib/authors';

type Topic = { title: string; slug: string; description: string; html: string; updatedAt: string; references: string[]; authors?: string[]; keywords?: string[] };

export function generateStaticParams() { return getSlugs('mechanisms').map((topicSlug) => ({ topicSlug })); }

export async function generateMetadata({ params }: { params: { topicSlug: string } }): Promise<Metadata> {
  const page = await getBySlug<Topic>('mechanisms', params.topicSlug);
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords?.join(', '),
    openGraph: { title: page.title, description: page.description, type: 'article' },
  };
}

export default async function MechanismPage({ params }: { params: { topicSlug: string } }) {
  const page = await getBySlug<Topic>('mechanisms', params.topicSlug);
  const authors = resolveAuthors(page.authors);
  return (
    <ArticleShell
      title={page.title}
      description={page.description}
      meta={<p className="muted">Updated {page.updatedAt}</p>}
      html={page.html}
      contentType="mechanisms"
      slug={params.topicSlug}
      authors={authors}
      keywords={page.keywords}
    />
  );
}
