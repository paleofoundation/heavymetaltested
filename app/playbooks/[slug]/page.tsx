import { notFound } from 'next/navigation';
import ArticleShell from '@/components/ArticleShell';
import { getBySlug } from '@/lib/content';

const allowed = ['consumers', 'brands', 'manufacturers'];
export function generateStaticParams() { return allowed.map((slug) => ({ slug })); }

export default async function PlaybookPage({ params }: { params: { slug: string } }) {
  if (!allowed.includes(params.slug)) notFound();
  const page = await getBySlug<{ title: string; description: string; html: string; updatedAt: string }>('playbooks', params.slug);
  return <ArticleShell title={page.title} description={page.description} meta={<p className="muted">Updated {page.updatedAt}</p>} html={page.html} />;
}
