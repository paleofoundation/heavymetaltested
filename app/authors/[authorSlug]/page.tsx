import Link from 'next/link';
import { getBySlug, getSlugs, getAll } from '@/lib/content';
import type { BaseFrontmatter } from '@/lib/content';
import { contentSchemas } from '@/lib/content-schemas';

type Author = {
  title: string;
  slug: string;
  description: string;
  role?: string;
  avatar?: string;
  orcid?: string;
  html: string;
  references: string[];
};

type ContentWithAuthors = BaseFrontmatter & {
  authors?: string[];
};

export function generateStaticParams() {
  return getSlugs('authors').map((authorSlug) => ({ authorSlug }));
}

function getAuthorArticles(authorSlug: string) {
  const articleTypes = Object.entries(contentSchemas)
    .filter(([key]) => key !== 'pages' && key !== 'authors');

  const articles: { title: string; href: string; type: string; date?: string }[] = [];

  for (const [type, schema] of articleTypes) {
    const items = getAll<ContentWithAuthors>(type);
    for (const item of items) {
      if (item.authors?.includes(authorSlug)) {
        articles.push({
          title: item.title,
          href: `${schema.slugPrefix}${item.slug}`,
          type: schema.label,
          date: item.publishedAt || item.updatedAt,
        });
      }
    }
  }

  return articles.sort((a, b) => {
    const ad = new Date(a.date || 0).valueOf();
    const bd = new Date(b.date || 0).valueOf();
    return bd - ad;
  });
}

export default async function AuthorPage({ params }: { params: { authorSlug: string } }) {
  const author = await getBySlug<Author>('authors', params.authorSlug);
  const articles = getAuthorArticles(params.authorSlug);

  return (
    <article className="article">
      <header className="article-hero">
        <div className="article-hero-inner container">
          <div className="article-hero-content">
            <div className="author-profile-header">
              <div className="author-profile-avatar">
                {author.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={author.avatar} alt="" />
                ) : (
                  <span className="author-avatar-initials author-avatar-initials--lg">
                    {author.title.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="article-title">{author.title}</h1>
                {author.role && <p className="author-profile-role">{author.role}</p>}
                {author.orcid && (
                  <a
                    href={`https://orcid.org/${author.orcid}`}
                    target="_blank"
                    rel="noopener"
                    className="author-orcid-link"
                  >
                    <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true">
                      <path fill="#a6ce39" d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"/>
                      <path fill="#fff" d="M86.3 186.2H70.9V79.1h15.4v107.1zm22.3-107.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.5-56.8 53.5h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7 0-21.5-13.7-39.8-43.7-39.8h-23.7v79.5zM88.7 56.8c0 5.5-4.5 10.1-10.1 10.1s-10.1-4.6-10.1-10.1c0-5.6 4.5-10.1 10.1-10.1s10.1 4.6 10.1 10.1z"/>
                    </svg>
                    {author.orcid}
                  </a>
                )}
              </div>
            </div>
            <p className="article-description">{author.description}</p>
          </div>
          <div className="article-hero-accent" aria-hidden="true" />
        </div>
      </header>

      <div className="article-body container container-narrow">
        {author.html && (
          <div className="article-content" dangerouslySetInnerHTML={{ __html: author.html }} />
        )}

        {articles.length > 0 && (
          <section className="author-articles">
            <h2>Articles by {author.title}</h2>
            <div className="author-articles-list">
              {articles.map((a) => (
                <Link key={a.href} href={a.href} className="author-article-item">
                  <span className="author-article-type">{a.type}</span>
                  <span className="author-article-title">{a.title}</span>
                  {a.date && <span className="author-article-date">{a.date}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
