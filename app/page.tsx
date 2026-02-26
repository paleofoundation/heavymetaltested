import Link from 'next/link';
import { getAll } from '@/lib/content';
import { categories, metals } from '@/lib/taxonomy';

type News = { title: string; slug: string; description: string; publishedAt: string };

export default function HomePage() {
  const latest = getAll<News>('news').slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1>Evidence-first reporting on contaminant heavy metals.</h1>
            <p>Heavy Metal Facts tracks the Big 8 metals across foods, water, supplements, and materials using standards-minded journalism.</p>
            <div className="btn-row">
              <Link className="btn btn-primary" href="/news">Read latest briefing</Link>
            </div>
          </div>
          <div className="hero-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero.png" alt="Heavy metal facts — reporting on heavy metals in food, water, supplements, and more" className="hero-image" />
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>The Big 8</h2>
        <div className="grid-3">
          {metals.slice(0, 6).map((m) => (
            <Link className="card" href={`/metals/${m.key}`} key={m.key}>
              <h3>{m.label}</h3>
              <p>Pathways, concerns, testing context, and practical reduction strategies.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <h2>Where it hides</h2>
        <div className="grid-3">
          {categories.slice(0, 6).map((c) => (
            <Link className="card" href={`/categories/${c.key}`} key={c.key}>
              <h3>{c.label}</h3>
              <p>How concentration, uptake, and processing shape risk patterns.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="quote">&ldquo;Limits only work when sampling, methods, and interpretation are specified clearly enough for labs to reproduce.&rdquo;</div>
      </section>

      <section className="section container">
        <h2>Latest stories</h2>
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
          <h3>How limits and testing work</h3>
          <p>Learn why feasibility, toxicology thresholds, and method LOQ must align before a limit is operational.</p>
          <Link href="/standards">Read standards explainer</Link>
        </div>
        <div className="card">
          <h3>Learn what HMTc is</h3>
          <p>Neutral orientation to how certification frameworks operationalize category-specific contaminant controls.</p>
          <Link href="/standards#hmtc">Read neutral explainer</Link>
        </div>
        <div className="card">
          <h3>Newsletter</h3>
          <p>Get weekly briefings and method notes.</p>
          <input aria-label="newsletter" className="search-input" placeholder="Email address" />
        </div>
      </section>

      <p style={{ fontSize: '0.75rem', textAlign: 'center', opacity: 0.5, margin: '2rem 0 0' }}>Build stamp: 2026-02-16T06:00:00Z</p>
    </>
  );
}
