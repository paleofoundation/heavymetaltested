import Link from 'next/link';
import { getAll } from '@/lib/content';

type Author = {
  title: string;
  slug: string;
  description: string;
  role?: string;
  avatar?: string;
  orcid?: string;
};

export default function AuthorsPage() {
  const authors = getAll<Author & { references: string[] }>('authors');

  return (
    <div className="container section">
      <h1 style={{ fontFamily: 'var(--iu-font-serif)', marginBottom: 'var(--iu-space-xs)' }}>
        Authors &amp; Researchers
      </h1>
      <p style={{ color: 'var(--iu-text-secondary)', marginBottom: 'var(--iu-space-xl)', maxWidth: '38rem' }}>
        Meet the researchers behind Heavy Metal Facts.
      </p>
      <div className="author-grid">
        {authors.map((author) => (
          <Link key={author.slug} href={`/authors/${author.slug}`} className="author-card">
            <div className="author-card-avatar">
              {author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatar} alt="" />
              ) : (
                <span className="author-avatar-initials author-avatar-initials--lg">
                  {author.title.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
            </div>
            <h3>{author.title}</h3>
            {author.role && <p className="author-card-role">{author.role}</p>}
            <p className="author-card-bio">{author.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
