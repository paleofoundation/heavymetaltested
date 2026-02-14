'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { categories } from '@/lib/taxonomy';

const mapping: Record<string, string[]> = {
  'infant-foods': ['arsenic', 'lead', 'cadmium'],
  'seafood': ['mercury', 'arsenic'],
  'drinking-water': ['lead', 'aluminum', 'chromium']
};

export default function RiskOrientationPage() {
  const [life, setLife] = useState('general adult');
  const [category, setCategory] = useState('infant-foods');
  const metals = useMemo(() => mapping[category] || ['lead', 'arsenic'], [category]);
  return (
    <section className="container section">
      <h1>Risk orientation tool</h1>
      <p>Educational orientation only; not medical advice.</p>
      <label>Life stage <select value={life} onChange={(e)=>setLife(e.target.value)}><option>infant/young child</option><option>pregnancy</option><option>general adult</option></select></label>
      <label style={{ marginLeft: '1rem' }}>Product category <select value={category} onChange={(e)=>setCategory(e.target.value)}>{categories.map((c)=><option key={c.key} value={c.key}>{c.label}</option>)}</select></label>
      <div className="card" style={{ marginTop: '1rem' }}>
        <p>For {life}, focus first on {metals.join(', ')} signals in {category.replace(/-/g,' ')} and read method context before making comparisons across reports.</p>
        <p><Link href={`/categories/${category}`}>Category explainer</Link></p>
        <p>{metals.map((m)=><Link key={m} href={`/metals/${m}`} style={{ marginRight: '.5rem' }}>{m}</Link>)}</p>
        <p><Link href="/testing/loq-vs-lod">LOQ vs LOD</Link> · <Link href="/testing/interpreting-a-coa">Interpreting a COA</Link> · <Link href="/testing/why-labs-differ">Why labs differ</Link></p>
      </div>
    </section>
  );
}
