import type { Metadata } from 'next';
import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';
import { resolveAuthors } from '@/lib/authors';

type Category = { title: string; slug: string; description: string; updatedAt: string; html: string; references: string[]; authors?: string[]; keywords?: string[] };

export function generateStaticParams() { return getSlugs('categories').map((categorySlug) => ({ categorySlug })); }

export async function generateMetadata({ params }: { params: { categorySlug: string } }): Promise<Metadata> {
  const page = await getBySlug<Category>('categories', params.categorySlug);
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords?.join(', '),
    openGraph: { title: page.title, description: page.description, type: 'article' },
  };
}

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const page = await getBySlug<Category>('categories', params.categorySlug);
  const authors = resolveAuthors(page.authors);
  return (
    <ArticleShell
      title={page.title}
      description={page.description}
      meta={<p className="muted">Updated {page.updatedAt}</p>}
      html={page.html}
      contentType="categories"
      slug={params.categorySlug}
      authors={authors}
      keywords={page.keywords}
    />
  );
}
