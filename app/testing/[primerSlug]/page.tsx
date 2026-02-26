import type { Metadata } from 'next';
import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';
import { resolveAuthors } from '@/lib/authors';

type Primer = { title: string; slug: string; description: string; html: string; updatedAt: string; references: string[]; authors?: string[]; keywords?: string[] };

export function generateStaticParams() { return getSlugs('primers').map((primerSlug) => ({ primerSlug })); }

export async function generateMetadata({ params }: { params: { primerSlug: string } }): Promise<Metadata> {
  const page = await getBySlug<Primer>('primers', params.primerSlug);
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords?.join(', '),
    openGraph: { title: page.title, description: page.description, type: 'article' },
  };
}

export default async function PrimerPage({ params }: { params: { primerSlug: string } }) {
  const page = await getBySlug<Primer>('primers', params.primerSlug);
  const authors = resolveAuthors(page.authors);
  return (
    <ArticleShell
      title={page.title}
      description={page.description}
      meta={<p className="muted">Updated {page.updatedAt}</p>}
      html={page.html}
      contentType="primers"
      slug={params.primerSlug}
      authors={authors}
      keywords={page.keywords}
    />
  );
}
