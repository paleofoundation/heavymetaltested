import Link from 'next/link';
import { getAll } from '@/lib/content';
import { categories, metals } from '@/lib/taxonomy';

type Post = { title: string; slug: string; description: string; publishedAt: string; metals: string[]; categories: string[] };

export default function NewsPage({ searchParams }: { searchParams: { metal?: string; category?: string } }) {
  const all = getAll<Post>('news');
  const filtered = all.filter((p) => (!searchParams.metal || p.metals?.includes(searchParams.metal)) && (!searchParams.category || p.categories?.includes(searchParams.category)));
  return (
    <section className="container section">
      <h1>Newsroom</h1>
      <p><a href="/rss.xml">RSS feed</a></p>
      <form style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <select name="metal" defaultValue={searchParams.metal || ''}><option value="">All metals</option>{metals.map((m)=><option key={m.key} value={m.key}>{m.label}</option>)}</select>
        <select name="category" defaultValue={searchParams.category || ''}><option value="">All categories</option>{categories.map((c)=><option key={c.key} value={c.key}>{c.label}</option>)}</select>
        <button className="btn btn-primary" type="submit">Filter</button>
      </form>
      <div className="section">
        {filtered.map((p)=><article key={p.slug} className="card" style={{ marginBottom: '.75rem' }}><p className="muted">{p.publishedAt}</p><h3><Link href={`/news/${p.slug}`}>{p.title}</Link></h3><p>{p.description}</p><div>{p.metals?.map((m)=><span className="tag" key={m}>{m}</span>)}{p.categories?.map((c)=><span className="tag" key={c}>{c}</span>)}</div></article>)}
      </div>
    </section>
  );
}
