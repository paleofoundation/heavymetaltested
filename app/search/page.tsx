'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type RecordItem = { title: string; description: string; body: string; href: string; metals: string[]; categories: string[] };

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('q') || '';
    setQ(param.toLowerCase());
    fetch('/search-index.json').then((r) => r.json()).then(setRecords);
  }, []);

  const results = useMemo(
    () =>
      records.filter((r) =>
        `${r.title} ${r.description} ${r.body} ${(r.metals || []).join(' ')} ${(r.categories || []).join(' ')}`
          .toLowerCase()
          .includes(q)
      ),
    [records, q]
  );

  return (
    <section className="container section">
      <h1>Search</h1>
      <p>{q ? `${results.length} results for “${q}”` : 'Enter a query in the header search box.'}</p>
      {results.map((r) => (
        <article key={r.href} className="card" style={{ marginBottom: '.7rem' }}>
          <h3>
            <Link href={r.href}>{r.title}</Link>
          </h3>
          <p>{r.description}</p>
        </article>
      ))}
    </section>
  );
}
