import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';

type Primer = { title: string; description: string; html: string; updatedAt: string };
export function generateStaticParams() { return getSlugs('primers').map((primerSlug) => ({ primerSlug })); }
export default async function PrimerPage({ params }: { params: { primerSlug: string } }) {
  const page = await getBySlug<Primer>('primers', params.primerSlug);
  return <ArticleShell title={page.title} description={page.description} meta={<p className="muted">Updated {page.updatedAt}</p>} html={page.html} contentType="primers" slug={params.primerSlug} />;
}
