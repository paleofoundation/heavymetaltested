import Link from 'next/link';
import { getSlugs } from '@/lib/content';
import { contentSchemas } from '@/lib/content-schemas';

export const dynamic = 'force-dynamic';

const types = Object.keys(contentSchemas);

export default function AdminDashboard() {
  const counts = types.map((t) => ({ type: t, ...contentSchemas[t], count: getSlugs(t).length }));

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--iu-space-xl)' }}>
        <h1 style={{ fontFamily: 'var(--iu-font-serif)', margin: 0 }}>Content Dashboard</h1>
        <Link href="/" className="ms-btn ms-btn-outline" style={{ fontSize: 'var(--iu-ts-14)' }}>
          Back to site
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--iu-space-lg)' }}>
        {counts.map((c) => (
          <Link key={c.type} href={`/admin/${c.type}`} className="card" style={{ textDecoration: 'none' }}>
            <h3>{c.labelPlural}</h3>
            <p>{c.count} {c.count === 1 ? 'entry' : 'entries'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
