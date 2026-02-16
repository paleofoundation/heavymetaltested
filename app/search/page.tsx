'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type RecordItem = { title: string; description: string; body: string; href: string };

function SearchInner() {
  const params = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();
  const [records, setRecords] = useState<RecordItem[]>([]);
  useEffect(() => { fetch('/search-index.json').then((r) => r.json()).then(setRecords); }, []);
  const results = useMemo(() => records.filter((r) => `${r.title} ${r.description} ${r.body}`.toLowerCase().includes(q)), [records, q]);

  return (
    <section className="container section">
      <h1>Search</h1>
      <p>{q ? `${results.length} results for "${q}"` : 'Enter a query in the URL: ?q=term'}</p>
      {results.map((r)=><article key={r.href} className="card" style={{marginBottom:'.75rem'}}><h3><Link href={r.href}>{r.title}</Link></h3><p>{r.description}</p></article>)}
    </section>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<section className="container section"><h1>Search</h1><p>Loading...</p></section>}>
      <SearchInner />
    </Suspense>
  );
}
