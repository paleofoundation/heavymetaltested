import ArticleShell from '@/components/ArticleShell';
import { getBySlug, getSlugs } from '@/lib/content';

type Topic = { title: string; description: string; html: string; updatedAt: string };
export function generateStaticParams() { return getSlugs('mechanisms').map((topicSlug) => ({ topicSlug })); }
export default async function MechanismPage({ params }: { params: { topicSlug: string } }) {
  const page = await getBySlug<Topic>('mechanisms', params.topicSlug);
  return <ArticleShell title={page.title} description={page.description} meta={<p className="muted">Updated {page.updatedAt}</p>} html={page.html} />;
}
