import Link from 'next/link';

const newsCards = [
  { image: '/images/news-1.svg', category: 'Briefing', title: 'New surveillance cycle adds context for grain-based products', excerpt: 'Method-aligned sampling improved comparability across lots and labs in this week’s summary.', date: 'February 10, 2026' },
  { image: '/images/news-2.svg', category: 'Testing', title: 'Why speciation changed interpretation in a recent seafood review', excerpt: 'Total concentration alone masked differences between forms with distinct toxicological relevance.', date: 'February 7, 2026' },
  { image: '/images/news-3.svg', category: 'Standards', title: 'Limit-setting update highlights feasibility and measurement fit', excerpt: 'A practical framework links decision limits to LOQ performance and real supply constraints.', date: 'February 3, 2026' }
];

export default function HomePage() {
  return (
    <>
      <section className="hmtf-hero">
        <div className="rvt-container-xl">
          <div className="hmtf-hero-grid">
            <div>
              <h1>Heavy Metal Facts</h1>
              <p className="hmtf-lead">A standards-oriented newsroom focused on contaminant metals in foods, water, and products—designed for clear interpretation, not alarm.</p>
            </div>
            <img src="/images/hero.svg" alt="Abstract editorial banner illustration" className="hmtf-hero-image" />
          </div>
        </div>
      </section>

      <section className="hmtf-cta-row">
        <div className="rvt-container-xl hmtf-cta-grid">
          <article><h2><Link href="/big-8">Meet the Big 8</Link></h2><p>Understand each metal’s pathways, testing nuances, and practical mitigation context.</p></article>
          <article><h2><Link href="/categories">Where it hides</Link></h2><p>Explore contaminant concentration patterns across category-level exposure hubs.</p></article>
          <article><h2><Link href="/testing">Testing literacy</Link></h2><p>Learn LOD/LOQ, speciation, and sampling principles that shape what results actually mean.</p></article>
        </div>
      </section>

      <section className="hmtf-quote-section">
        <div className="rvt-container-xl">
          <blockquote>
            “Evidence-first contaminant literacy works best when methods, limits, and interpretation are explained in the same language.”
          </blockquote>
          <p>Dr. Elena Ward · Editorial Advisor, Heavy Metal Facts</p>
        </div>
      </section>

      <section className="hmtf-billboards">
        <div className="rvt-container-xl">
          <div className="hmtf-billboard"><img src="/images/billboard-1.svg" alt="Exposure pathways visual placeholder" /><div><h2>Understand exposure pathways</h2><p>Follow contaminant signals from source environment to finished product with category-by-category context and linked reporting.</p><Link href="/categories">Explore categories</Link></div></div>
          <div className="hmtf-billboard reverse"><img src="/images/billboard-2.svg" alt="Testing fundamentals visual placeholder" /><div><h2>Learn testing fundamentals</h2><p>Interpret laboratory outputs with confidence by understanding method constraints, variance, and reporting conventions.</p><Link href="/testing">Read primers</Link></div></div>
          <div className="hmtf-billboard"><img src="/images/billboard-3.svg" alt="Prevention workflow visual placeholder" /><div><h2>Reduce contamination at the source</h2><p>Review practical playbooks for consumers, brands, and manufacturers without fear-based framing.</p><Link href="/playbooks">Open playbooks</Link></div></div>
        </div>
      </section>

      <section className="hmtf-stats-band">
        <div className="rvt-container-xl hmtf-stats-grid">
          <div><strong>8</strong><span>Certified metals tracked</span></div>
          <div><strong>10</strong><span>Exposure categories covered</span></div>
          <div><strong>Weekly</strong><span>Evidence briefings published</span></div>
          <div><strong>3</strong><span>Operational playbooks</span></div>
        </div>
      </section>

      <section className="hmtf-latest-news">
        <div className="rvt-container-xl">
          <h2>Latest news</h2>
          <div className="hmtf-news-grid">
            {newsCards.map((card) => (
              <article className="hmtf-news-card" key={card.title}>
                <img src={card.image} alt="News story visual placeholder" />
                <div className="hmtf-news-card-body">
                  <p className="hmtf-news-category">{card.category}</p>
                  <h3><Link href="/news">{card.title}</Link></h3>
                  <p>{card.excerpt}</p>
                  <p className="hmtf-news-date">{card.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hmtf-explore">
        <div className="rvt-container-xl">
          <h2>Explore resources</h2>
          <div className="hmtf-explore-grid">
            <article><img src="/images/explore-1.svg" alt="Research methods placeholder" /><h3><Link href="/standards">How contaminant limits are set</Link></h3><p>Neutral framework for feasibility-based and threshold-informed limit design.</p></article>
            <article><img src="/images/explore-2.svg" alt="Interactive tools placeholder" /><h3><Link href="/tools">Interactive tools</Link></h3><p>Use the matrix and orientation tool to map categories, metals, and useful next reading.</p></article>
          </div>
        </div>
      </section>
    </>
  );
}
