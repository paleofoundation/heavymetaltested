import Link from 'next/link';
import { getAll } from '@/lib/content';

type Category = { title: string; slug: string; description: string };

export default function CategoriesPage() {
  const items = getAll<Category>('categories');
  return <section className="container section"><h1>Exposure Categories</h1><div className="grid-3">{items.map((c)=><Link key={c.slug} href={`/categories/${c.slug}`} className="card"><h3>{c.title}</h3><p>{c.description}</p></Link>)}</div></section>;
}
