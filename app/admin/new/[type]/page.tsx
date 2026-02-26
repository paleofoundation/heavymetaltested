import Link from 'next/link';
import { notFound } from 'next/navigation';
import { contentSchemas } from '@/lib/content-schemas';
import ContentEditor from '@/components/ContentEditor';

export const dynamic = 'force-dynamic';

export default function NewContentPage({ params }: { params: { type: string } }) {
  const schema = contentSchemas[params.type];
  if (!schema) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const defaults: Record<string, unknown> = {
    title: '',
    slug: '',
    description: '',
    references: [],
    updatedAt: today,
  };
  if (params.type === 'news') {
    defaults.publishedAt = today;
    defaults.metals = [];
    defaults.categories = [];
  }
  if (params.type === 'metals') {
    defaults.metalKey = '';
    defaults.synonyms = [];
  }
  if (params.type === 'categories') {
    defaults.categoryKey = '';
  }

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--iu-space-lg)' }}>
        <Link href={`/admin/${params.type}`} style={{ fontSize: 'var(--iu-ts-14)' }}>
          &larr; {schema.labelPlural}
        </Link>
      </div>
      <h1 style={{ fontFamily: 'var(--iu-font-serif)', marginBottom: 'var(--iu-space-lg)' }}>
        New {schema.label}
      </h1>
      <ContentEditor
        contentType={params.type}
        fields={schema.fields}
        initialFrontmatter={defaults}
        initialBody=""
        isNew
        sections={schema.sections}
      />
    </div>
  );
}
