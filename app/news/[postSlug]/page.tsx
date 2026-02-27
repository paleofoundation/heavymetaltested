import type { Metadata } from 'next';
import NewsArticleShell from '@/components/NewsArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';
import { resolveAuthors } from '@/lib/authors';

type Post = {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  html: string;
  references: string[];
  authors?: string[];
  keywords?: string[];
  metals?: string[];
  categories?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  featuredImageCaption?: string;
};

export function generateStaticParams() {
  return getSlugs('news').map((postSlug) => ({ postSlug }));
}

export async function generateMetadata({ params }: { params: { postSlug: string } }): Promise<Metadata> {
  const page = await getBySlug<Post>('news', params.postSlug);
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords?.join(', '),
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'article',
      ...(page.featuredImage ? { images: [{ url: page.featuredImage }] } : {}),
    },
  };
}

export default async function NewsPostPage({ params }: { params: { postSlug: string } }) {
  const page = await getBySlug<Post>('news', params.postSlug);
  const authors = resolveAuthors(page.authors);

  return (
    <NewsArticleShell
      title={page.title}
      slug={page.slug}
      description={page.description}
      publishedAt={page.publishedAt}
      updatedAt={page.updatedAt}
      html={page.html}
      featuredImage={page.featuredImage}
      featuredImageAlt={page.featuredImageAlt}
      featuredImageCaption={page.featuredImageCaption}
      metals={page.metals}
      categories={page.categories}
      authors={authors}
      keywords={page.keywords}
    />
  );
}
