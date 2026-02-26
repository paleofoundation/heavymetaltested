import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAll } from '@/lib/content';
import { contentSchemas } from '@/lib/content-schemas';

export const dynamic = 'force-dynamic';

export default function ContentListPage({ params }: { params: { type: string } }) {
  const schema = contentSchemas[params.type];
  if (!schema) notFound();

  const items = getAll<{ title: string; slug: string; description: string; updatedAt?: string; publishedAt?: string; references: string[] }>(params.type);

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--iu-space-xl)' }}>
        <div>
          <Link href="/admin" style={{ fontSize: 'var(--iu-ts-14)', marginBottom: 'var(--iu-space-xs)', display: 'inline-block' }}>
            &larr; Dashboard
          </Link>
          <h1 style={{ fontFamily: 'var(--iu-font-serif)', margin: 0 }}>{schema.labelPlural}</h1>
        </div>
        <Link href={`/admin/new/${params.type}`} className="ms-btn ms-btn-primary">
          New {schema.label}
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--iu-space-sm)' }}>
        {items.length === 0 && (
          <p style={{ color: 'var(--iu-text-muted)' }}>No entries yet.</p>
        )}
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/admin/edit/${params.type}/${item.slug}`}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--iu-space-md) var(--iu-space-lg)',
              background: 'var(--iu-white)', border: '1px solid var(--iu-border)',
              borderRadius: 'var(--iu-radius-md)', textDecoration: 'none', color: 'var(--iu-text)',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div>
              <strong>{item.title}</strong>
              <span style={{ display: 'block', fontSize: 'var(--iu-ts-14)', color: 'var(--iu-text-muted)' }}>
                {item.slug}
              </span>
            </div>
            <span style={{ fontSize: 'var(--iu-ts-14)', color: 'var(--iu-text-muted)', flexShrink: 0 }}>
              {item.updatedAt || item.publishedAt || ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
