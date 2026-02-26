import Link from 'next/link';
import { getAll, getBySlug } from '@/lib/content';
import { categories, metals } from '@/lib/taxonomy';
import FramedImage from '@/components/FramedImage';

type News = { title: string; slug: string; description: string; publishedAt: string };

type HomeFields = {
  title: string;
  slug: string;
  description: string;
  heroHeadline: string;
  heroDescription: string;
  heroCtaText: string;
  heroCtaUrl: string;
  heroImageAlt: string;
  big8Heading: string;
  big8CardDescription: string;
  categoriesHeading: string;
  categoriesCardDescription: string;
  pullQuote: string;
  latestHeading: string;
  card1Title: string;
  card1Description: string;
  card1LinkText: string;
  card1LinkUrl: string;
  card2Title: string;
  card2Description: string;
  card2LinkText: string;
  card2LinkUrl: string;
  card3Title: string;
  card3Description: string;
  references: string[];
};

export default async function HomePage() {
  const latest = getAll<News>('news').slice(0, 3);
  const page = await getBySlug<HomeFields>('pages', 'home');

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1>{page.heroHeadline}</h1>
            <p>{page.heroDescription}</p>
            <div className="btn-row">
              <Link className="btn btn-primary" href={page.heroCtaUrl}>{page.heroCtaText}</Link>
            </div>
          </div>
          <div className="hero-media">
            <FramedImage src="/images/hero.png" alt={page.heroImageAlt} className="hero-image" />
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>{page.big8Heading}</h2>
        <div className="grid-3">
          {metals.slice(0, 6).map((m) => (
            <Link className="card" href={`/metals/${m.key}`} key={m.key}>
              <h3>{m.label}</h3>
              <p>{page.big8CardDescription}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <h2>{page.categoriesHeading}</h2>
        <div className="grid-3">
          {categories.slice(0, 6).map((c) => (
            <Link className="card" href={`/categories/${c.key}`} key={c.key}>
              <h3>{c.label}</h3>
              <p>{page.categoriesCardDescription}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="quote">&ldquo;{page.pullQuote}&rdquo;</div>
      </section>

      <section className="section container">
        <h2>{page.latestHeading}</h2>
        <div className="news-grid">
          {latest.map((post) => (
            <article key={post.slug} className="news-card">
              <div className="img" />
              <div className="body">
                <p className="muted">{post.publishedAt}</p>
                <h3><Link href={`/news/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section container grid-3">
        <div className="card">
          <h3>{page.card1Title}</h3>
          <p>{page.card1Description}</p>
          <Link href={page.card1LinkUrl}>{page.card1LinkText}</Link>
        </div>
        <div className="card">
          <h3>{page.card2Title}</h3>
          <p>{page.card2Description}</p>
          <Link href={page.card2LinkUrl}>{page.card2LinkText}</Link>
        </div>
        <div className="card">
          <h3>{page.card3Title}</h3>
          <p>{page.card3Description}</p>
          <input aria-label="newsletter" className="search-input" placeholder="Email address" />
        </div>
      </section>
    </>
  );
}
