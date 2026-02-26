import Link from 'next/link';
import { notFound } from 'next/navigation';
import { contentSchemas } from '@/lib/content-schemas';
import { getBySlug, getSlugs } from '@/lib/content';
import ContentEditor from '@/components/ContentEditor';

export const dynamic = 'force-dynamic';

export default async function EditPage({ params }: { params: { type: string; slug: string } }) {
  const schema = contentSchemas[params.type];
  if (!schema) notFound();
  if (!getSlugs(params.type).includes(params.slug)) notFound();

  const data = await getBySlug<{
    title: string; slug: string; description: string;
    updatedAt?: string; publishedAt?: string; references: string[];
    [key: string]: unknown;
  }>(params.type, params.slug);

  const { html: _html, content: body, ...frontmatter } = data;

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--iu-space-lg)' }}>
        <Link href={`/admin/${params.type}`} style={{ fontSize: 'var(--iu-ts-14)' }}>
          &larr; {schema.labelPlural}
        </Link>
      </div>
      <h1 style={{ fontFamily: 'var(--iu-font-serif)', marginBottom: 'var(--iu-space-lg)' }}>
        Edit: {frontmatter.title}
      </h1>
      <ContentEditor
        contentType={params.type}
        slug={params.slug}
        fields={schema.fields}
        initialFrontmatter={frontmatter}
        initialBody={body}
      />
    </div>
  );
}
