import Link from 'next/link';
import { getAll } from '@/lib/content';
import { categories, metals } from '@/lib/taxonomy';

type Post = { title: string; slug: string; description: string; publishedAt: string; metals?: string[]; categories?: string[] };

export const dynamic = 'force-dynamic';

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ metal?: string; category?: string }> }) {
  const params = await searchParams;
  const all = getAll<Post>('news');
  const filtered = all.filter((p) => (!params.metal || p.metals?.includes(params.metal)) && (!params.category || p.categories?.includes(params.category)));
  return (
    <section className="container section">
      <h1>Newsroom</h1>
      <p><a href="/rss.xml">RSS feed</a></p>
      <form style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <select name="metal" defaultValue={params.metal || ''}><option value="">All metals</option>{metals.map((m)=><option key={m.key} value={m.key}>{m.label}</option>)}</select>
        <select name="category" defaultValue={params.category || ''}><option value="">All categories</option>{categories.map((c)=><option key={c.key} value={c.key}>{c.label}</option>)}</select>
        <button className="btn btn-primary" type="submit">Filter</button>
      </form>
      <div className="section">
        {filtered.map((p)=><article key={p.slug} className="card" style={{marginBottom:'.75rem'}}><p className="muted">{p.publishedAt}</p><h3><Link href={`/news/${p.slug}`}>{p.title}</Link></h3><p>{p.description}</p><div>{p.metals?.map((m)=><span className="tag" key={m}>{m}</span>)}</div></article>)}
      </div>
    </section>
  );
}
