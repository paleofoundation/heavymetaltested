import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';
import { resolveAuthors } from '@/lib/authors';

type Post = { title: string; slug: string; description: string; publishedAt: string; updatedAt?: string; html: string; references: string[]; authors?: string[] };

export function generateStaticParams() { return getSlugs('news').map((postSlug) => ({ postSlug })); }

export default async function NewsPostPage({ params }: { params: { postSlug: string } }) {
  const page = await getBySlug<Post>('news', params.postSlug);
  const authors = resolveAuthors(page.authors);
  return (
    <ArticleShell
      title={page.title}
      description={page.description}
      meta={<p className="muted">Published {page.publishedAt}{page.updatedAt ? ` · Updated ${page.updatedAt}` : ''}</p>}
      html={page.html}
      contentType="news"
      slug={params.postSlug}
      authors={authors}
    />
  );
}
