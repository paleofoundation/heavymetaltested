import Link from 'next/link';
import type { AuthorInfo } from '@/lib/authors';

function OrcidIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 256 256" aria-label="ORCID" role="img">
      <path fill="#a6ce39" d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"/>
      <path fill="#fff" d="M86.3 186.2H70.9V79.1h15.4v107.1zm22.3-107.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.5-56.8 53.5h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7 0-21.5-13.7-39.8-43.7-39.8h-23.7v79.5zM88.7 56.8c0 5.5-4.5 10.1-10.1 10.1s-10.1-4.6-10.1-10.1c0-5.6 4.5-10.1 10.1-10.1s10.1 4.6 10.1 10.1z"/>
    </svg>
  );
}

function AuthorInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className="author-avatar-initials" aria-hidden="true">
      {initials}
    </span>
  );
}

export default function AuthorAvatarStrip({ authors }: { authors: AuthorInfo[] }) {
  if (authors.length === 0) return null;

  return (
    <div className="author-strip">
      <span className="author-strip-label">Researched by</span>
      <div className="author-strip-list">
        {authors.map((author) => (
          <Link
            key={author.slug}
            href={`/authors/${author.slug}`}
            className="author-strip-item"
          >
            <span className="author-avatar">
              {author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatar} alt="" />
              ) : (
                <AuthorInitials name={author.name} />
              )}
            </span>
            <span className="author-strip-info">
              <span className="author-strip-name">{author.name}</span>
              {author.orcid && (
                <span className="author-strip-orcid">
                  <OrcidIcon />
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
