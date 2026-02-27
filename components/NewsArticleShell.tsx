import Link from 'next/link';
import type { AuthorInfo } from '@/lib/authors';

interface NewsArticleShellProps {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  html: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  featuredImageCaption?: string;
  metals?: string[];
  categories?: string[];
  authors?: AuthorInfo[];
  keywords?: string[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const METAL_LABELS: Record<string, string> = {
  lead: 'Lead', arsenic: 'Arsenic', cadmium: 'Cadmium', mercury: 'Mercury',
  nickel: 'Nickel', chromium: 'Chromium', tin: 'Tin', aluminum: 'Aluminum',
};

const CATEGORY_LABELS: Record<string, string> = {
  'infant-foods': 'Infant Foods', 'grains-cereals': 'Grains & Cereals',
  'root-vegetables': 'Root Vegetables', 'leafy-greens': 'Leafy Greens',
  'cocoa-chocolate': 'Cocoa & Chocolate', spices: 'Spices', seafood: 'Seafood',
  'drinking-water': 'Drinking Water', supplements: 'Supplements',
  'food-contact-materials-kitchenware': 'Kitchenware',
};

export default function NewsArticleShell({
  title,
  description,
  publishedAt,
  updatedAt,
  html,
  featuredImage,
  featuredImageAlt,
  featuredImageCaption,
  metals,
  categories,
  authors,
  keywords,
}: NewsArticleShellProps) {
  const hasFeaturedImage = !!featuredImage;
  const hasTopics = (metals && metals.length > 0) || (categories && categories.length > 0);
  const hasAuthors = authors && authors.length > 0;

  return (
    <article className="news-article">
      <header className={`news-hero${hasFeaturedImage ? ' has-image' : ''}`}>
        <div className="news-hero-inner container">
          <div className="news-hero-content">
            {hasTopics && (
              <div className="news-topic-tags">
                {metals?.map((m) => (
                  <Link key={m} href={`/news?metal=${m}`} className="news-topic-tag news-topic-metal">
                    {METAL_LABELS[m] || m}
                  </Link>
                ))}
                {categories?.map((c) => (
                  <Link key={c} href={`/news?category=${c}`} className="news-topic-tag news-topic-category">
                    {CATEGORY_LABELS[c] || c}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="news-title">{title}</h1>
            <p className="news-description">{description}</p>

            <div className="news-byline">
              <time className="news-date" dateTime={publishedAt}>
                {formatDate(publishedAt)}
              </time>
              {updatedAt && updatedAt !== publishedAt && (
                <span className="news-updated">Updated {formatDate(updatedAt)}</span>
              )}
              {hasAuthors && (
                <span className="news-authors">
                  {authors.map((a, i) => (
                    <span key={a.slug}>
                      {i > 0 && ', '}
                      <Link href={`/authors/${a.slug}`} className="news-author-link">
                        {a.name}
                      </Link>
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>

          {hasFeaturedImage && (
            <div className="news-hero-image">
              <div className="news-image-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImage} alt={featuredImageAlt || title} />
              </div>
              {featuredImageCaption && (
                <p className="news-image-caption">{featuredImageCaption}</p>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="news-body container container-narrow">
        <div className="news-body-byline">
          <span>By {hasAuthors ? authors.map((a, i) => (
            <span key={a.slug}>
              {i > 0 && ', '}
              <Link href={`/authors/${a.slug}`}>{a.name}</Link>
            </span>
          )) : 'the Heavy Metal Tested editorial desk'}</span>
          <span className="news-body-byline-separator">|</span>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        </div>

        {hasKeywords(keywords) && (
          <div className="article-keywords" style={{ marginBottom: 'var(--iu-space-lg)' }}>
            {keywords!.map((kw) => (
              <span key={kw} className="article-keyword">{kw}</span>
            ))}
          </div>
        )}
        <div className="news-content article-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}

function hasKeywords(keywords?: string[]): keywords is string[] {
  return !!keywords && keywords.length > 0;
}
