export default function ArticleShell({ title, description, meta, html }: { title: string; description: string; meta?: React.ReactNode; html: string; }) {
  return (
    <article className="container section">
      <h1 style={{ fontFamily: 'Georgia, serif' }}>{title}</h1>
      <p className="muted">{description}</p>
      {meta}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
