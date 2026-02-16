import Link from 'next/link';

const news = [
  ['Briefing', 'New surveillance cycle adds context for grain-based products', 'Method-aligned sampling improved comparability across lots and labs.', 'February 10, 2026'],
  ['Testing', 'Why speciation changed interpretation in a recent seafood review', 'Total concentration masked differences between forms with distinct implications.', 'February 7, 2026'],
  ['Standards', 'Limit-setting update highlights feasibility and measurement fit', 'Framework links decision limits to LOQ performance and supply constraints.', 'February 3, 2026']
] as const;

export default function Home() {
  return (
    <>
      <section className="ms-section ms-hero">
        <div className="ms-container ms-grid ms-grid-2" style={{ alignItems: 'center' }}>
          <div>
            <h1>Heavy Metal Facts</h1>
            <p>A standards-oriented newsroom focused on contaminant metals in foods, water, and products—designed for clarity, not alarm.</p>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <Link href="/news" className="ms-btn ms-btn-primary">Read latest briefing</Link>
              <Link href="/big-8" className="ms-btn ms-btn-outline">Explore the Big 8</Link>
            </div>
          </div>
          <img className="ms-hero-image" src="/images/hero.svg" alt="Editorial hero placeholder" />
        </div>
      </section>

      <section className="ms-section">
        <div className="ms-container ms-grid ms-grid-3">
          <article><h3><Link href="/big-8">Meet the Big 8</Link></h3><p>Understand each metal’s pathways, testing nuances, and mitigation context.</p></article>
          <article><h3><Link href="/categories">Where it hides</Link></h3><p>Explore concentration patterns across category-level exposure hubs.</p></article>
          <article><h3><Link href="/testing">Testing literacy</Link></h3><p>Learn LOD/LOQ, speciation, and sampling principles that shape interpretation.</p></article>
        </div>
      </section>

      <section className="ms-quote ms-section">
        <div className="ms-container">
          <blockquote>“Evidence-first contaminant literacy works best when methods, limits, and interpretation are explained in the same language.”</blockquote>
          <p>Dr. Elena Ward · Editorial Advisor, Heavy Metal Facts</p>
        </div>
      </section>

      <section className="ms-section">
        <div className="ms-container ms-grid" style={{ gap: '2rem' }}>
          {[['Understand exposure pathways', '/categories'], ['Learn testing fundamentals', '/testing'], ['Reduce contamination at the source', '/playbooks']].map(([title, href], idx) => (
            <article key={title} className="ms-grid ms-grid-2" style={{ alignItems: 'center' }}>
              {idx % 2 === 1 ? <><div><h2>{title}</h2><p>Follow contaminant signals with category-linked reporting and practical context for decision makers.</p><Link href={href as string}>Explore</Link></div><img src={`/images/billboard-${idx + 1}.svg`} alt="Feature placeholder" /></> : <><img src={`/images/billboard-${idx + 1}.svg`} alt="Feature placeholder" /><div><h2>{title}</h2><p>Follow contaminant signals with category-linked reporting and practical context for decision makers.</p><Link href={href as string}>Explore</Link></div></>}
            </article>
          ))}
        </div>
      </section>

      <section className="ms-section" style={{ background: '#eef2f5' }}>
        <div className="ms-container ms-grid ms-grid-4">
          <div className="ms-stat"><strong>8</strong><span>Certified metals tracked</span></div>
          <div className="ms-stat"><strong>10</strong><span>Exposure categories covered</span></div>
          <div className="ms-stat"><strong>Weekly</strong><span>Evidence briefings published</span></div>
          <div className="ms-stat"><strong>3</strong><span>Operational playbooks</span></div>
        </div>
      </section>

      <section className="ms-section">
        <div className="ms-container">
          <h2>Latest news</h2>
          <div className="ms-grid ms-grid-3">
            {news.map(([cat, title, excerpt, date], idx) => (
              <article className="ms-card" key={title}>
                <img src={`/images/news-${idx + 1}.svg`} alt="News visual placeholder" />
                <div className="ms-card-body">
                  <p style={{ color: '#800000', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: '.75rem', fontWeight: 700 }}>{cat}</p>
                  <h3><Link href="/news">{title}</Link></h3>
                  <p>{excerpt}</p>
                  <p style={{ color: '#64717d', marginBottom: 0 }}>{date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
