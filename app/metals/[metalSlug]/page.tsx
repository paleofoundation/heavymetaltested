import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';

type Metal = { title: string; slug: string; description: string; updatedAt: string; html: string; references: string[] };

export function generateStaticParams() { return getSlugs('metals').map((metalSlug) => ({ metalSlug })); }

export default async function MetalPage({ params }: { params: { metalSlug: string } }) {
  const metal = await getBySlug<Metal>('metals', params.metalSlug);
  return <ArticleShell title={metal.title} description={metal.description} meta={<p className="muted">Updated {metal.updatedAt}</p>} html={metal.html} />;
}
