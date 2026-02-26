import type { Metadata } from 'next';
import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';
import { resolveAuthors } from '@/lib/authors';

type Metal = { title: string; slug: string; description: string; updatedAt: string; html: string; references: string[]; authors?: string[]; keywords?: string[] };

export function generateStaticParams() { return getSlugs('metals').map((metalSlug) => ({ metalSlug })); }

export async function generateMetadata({ params }: { params: { metalSlug: string } }): Promise<Metadata> {
  const metal = await getBySlug<Metal>('metals', params.metalSlug);
  return {
    title: metal.title,
    description: metal.description,
    keywords: metal.keywords?.join(', '),
    openGraph: { title: metal.title, description: metal.description, type: 'article' },
  };
}

export default async function MetalPage({ params }: { params: { metalSlug: string } }) {
  const metal = await getBySlug<Metal>('metals', params.metalSlug);
  const authors = resolveAuthors(metal.authors);
  return (
    <ArticleShell
      title={metal.title}
      description={metal.description}
      meta={<p className="muted">Updated {metal.updatedAt}</p>}
      html={metal.html}
      contentType="metals"
      slug={params.metalSlug}
      authors={authors}
      keywords={metal.keywords}
    />
  );
}
