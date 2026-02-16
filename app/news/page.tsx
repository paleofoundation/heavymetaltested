'use client';

import Link from 'next/link';
import { categories, metals } from '@/lib/taxonomy';
import { useEffect, useMemo, useState } from 'react';

type Post = { title: string; href: string; description: string; publishedAt?: string; metals: string[]; categories: string[] };

export default function NewsPage() {
  const [all, setAll] = useState<Post[]>([]);
  const [metalFilter, setMetalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMetalFilter(params.get('metal') || '');
    setCategoryFilter(params.get('category') || '');

    fetch('/search-index.json')
      .then((r) => r.json())
      .then((records) => {
        const items = (records as Post[]).filter((r) => r.href?.startsWith('/news/'));
        setAll(items);
      });
  }, []);

  const filtered = useMemo(
    () => all.filter((p) => (!metalFilter || p.metals?.includes(metalFilter)) && (!categoryFilter || p.categories?.includes(categoryFilter))),
    [all, metalFilter, categoryFilter]
  );

  return (
    <section className="container section">
      <h1>Newsroom</h1>
      <p>
        <a href="/rss.xml">RSS feed</a>
      </p>
      <form style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <select name="metal" defaultValue={metalFilter}>
          <option value="">All metals</option>
          {metals.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <select name="category" defaultValue={categoryFilter}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <button className="ms-btn ms-btn-primary" type="submit">
          Filter
        </button>
      </form>
      <div className="section">
        {filtered.map((p) => (
          <article key={p.href} className="card" style={{ marginBottom: '.75rem' }}>
            <h3>
              <Link href={p.href}>{p.title}</Link>
            </h3>
            <p>{p.description}</p>
            <div>
              {p.metals?.map((m) => (
                <span className="tag" key={m}>
                  {m}
                </span>
              ))}
              {p.categories?.map((c) => (
                <span className="tag" key={c}>
                  {c}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
