import { getAll } from '@/lib/content';
import { categories, metals } from '@/lib/taxonomy';
import NewsContent from './NewsContent';

type Post = { title: string; slug: string; description: string; publishedAt: string; metals?: string[]; categories?: string[] };

export default function NewsPage() {
  const all = getAll<Post>('news');
  return <NewsContent posts={all} metals={metals} categories={categories} />;
}
