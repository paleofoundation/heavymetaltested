'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Post = { title: string; slug: string; description: string; publishedAt: string; metals?: string[]; categories?: string[] };
type TaxItem = { key: string; label: string };

function NewsInner({ posts, metals, categories }: { posts: Post[]; metals: TaxItem[]; categories: TaxItem[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const metal = searchParams.get('metal') || '';
  const category = searchParams.get('category') || '';

  const filtered = useMemo(
    () => posts.filter((p) => (!metal || p.metals?.includes(metal)) && (!category || p.categories?.includes(category))),
    [posts, metal, category]
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const m = fd.get('metal') as string;
    const c = fd.get('category') as string;
    if (m) params.set('metal', m);
    if (c) params.set('category', c);
    router.push(`/news${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <section className="container section">
      <h1>Newsroom</h1>
      <p><a href="/rss.xml">RSS feed</a></p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <select name="metal" defaultValue={metal}>
          <option value="">All metals</option>
          {metals.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <select name="category" defaultValue={category}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <button className="btn btn-primary" type="submit">Filter</button>
      </form>
      <div className="section">
        {filtered.map((p) => (
          <article key={p.slug} className="card" style={{ marginBottom: '.75rem' }}>
            <p className="muted">{p.publishedAt}</p>
            <h3><Link href={`/news/${p.slug}`}>{p.title}</Link></h3>
            <p>{p.description}</p>
            <div>{p.metals?.map((m) => <span className="tag" key={m}>{m}</span>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function NewsContent({ posts, metals, categories }: { posts: Post[]; metals: TaxItem[]; categories: TaxItem[] }) {
  return (
    <Suspense fallback={<section className="container section"><h1>Newsroom</h1><p>Loading...</p></section>}>
      <NewsInner posts={posts} metals={metals} categories={categories} />
    </Suspense>
  );
}
