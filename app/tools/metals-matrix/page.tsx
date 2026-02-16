'use client';

import { useState } from 'react';
import { categories, metals } from '@/lib/taxonomy';
import Link from 'next/link';

export default function MetalsMatrixPage() {
  const [active, setActive] = useState<string>('');
  return (
    <section className="container section">
      <h1>Metal-to-category matrix</h1>
      <p>Educational mapping tool only; not a risk score and not medical advice.</p>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead><tr><th>Category</th>{metals.map((m)=><th key={m.key}>{m.label}</th>)}</tr></thead>
          <tbody>
            {categories.map((c)=><tr key={c.key}><th>{c.label}</th>{metals.map((m)=><td key={m.key}><button onClick={() => setActive(`${c.key}:${m.key}`)}>{Math.random() > 0.55 ? 'Review' : 'Monitor'}</button></td>)}</tr>)}
          </tbody>
        </table>
      </div>
      {active && <div className="card"><h2>Explanation</h2><p>This intersection can vary by source geography, concentration effects, and process controls; use linked hubs for context.</p><p><Link href={`/categories/${active.split(':')[0]}`}>Category page</Link> · <Link href={`/metals/${active.split(':')[1]}`}>Metal page</Link></p></div>}
    </section>
  );
}
