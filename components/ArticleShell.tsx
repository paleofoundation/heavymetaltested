import EditButton from './EditButton';

export default function ArticleShell({ title, description, meta, html, contentType, slug }: { title: string; description: string; meta?: React.ReactNode; html: string; contentType?: string; slug?: string }) {
  return (
    <article className="container section">
      <h1 style={{ fontFamily: 'Georgia, serif' }}>{title}</h1>
      <p className="muted">{description}</p>
      {meta}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {contentType && slug && <EditButton contentType={contentType} slug={slug} />}
    </article>
  );
}
