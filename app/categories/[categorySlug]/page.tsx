import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';

type Category = { title: string; description: string; updatedAt: string; html: string };
export function generateStaticParams() { return getSlugs('categories').map((categorySlug) => ({ categorySlug })); }
export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const page = await getBySlug<Category>('categories', params.categorySlug);
  return <ArticleShell title={page.title} description={page.description} meta={<p className="muted">Updated {page.updatedAt}</p>} html={page.html} />;
}
