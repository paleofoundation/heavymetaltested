import AuthorAvatarStrip from './AuthorAvatarStrip';
import type { AuthorInfo } from '@/lib/authors';

export default function ArticleShell({
  title,
  description,
  meta,
  html,
  authors,
}: {
  title: string;
  description: string;
  meta?: React.ReactNode;
  html: string;
  contentType?: string;
  slug?: string;
  authors?: AuthorInfo[];
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
          <div className="article-hero-accent" aria-hidden="true">
            {authors && authors.length > 0 && (
              <div className="article-hero-authors">
                <AuthorAvatarStrip authors={authors} />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="article-body container container-narrow">
        <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}
