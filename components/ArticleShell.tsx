import EditButton from './EditButton';

export default function ArticleShell({
  title,
  description,
  meta,
  html,
  contentType,
  slug,
}: {
  title: string;
  description: string;
  meta?: React.ReactNode;
  html: string;
  contentType?: string;
  slug?: string;
}) {
  return (
    <article className="article">
      <header className="article-hero">
        <div className="article-hero-inner container">
          <div className="article-hero-content">
            <h1 className="article-title">{title}</h1>
            <p className="article-description">{description}</p>
            {meta && <div className="article-meta">{meta}</div>}
          </div>
          <div className="article-hero-accent" aria-hidden="true" />
        </div>
      </header>

      <div className="article-body container container-narrow">
        <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {contentType && slug && <EditButton contentType={contentType} slug={slug} />}
    </article>
  );
}
