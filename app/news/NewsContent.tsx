'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Post = {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  metals?: string[];
  categories?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
};
type TaxItem = { key: string; label: string };

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TopicTags({ metals, categories }: { metals?: string[]; categories?: string[] }) {
  const hasTags = (metals && metals.length > 0) || (categories && categories.length > 0);
  if (!hasTags) return null;
  return (
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
  );
}

function HeroCard({ post }: { post: Post }) {
  return (
    <div className="newsroom-hero-card">
      {post.featuredImage ? (
        <div className="newsroom-hero-card-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} />
        </div>
      ) : (
        <div className="newsroom-hero-card-image" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #243142 0%, #3a4a5c 100%)',
          color: 'rgba(255,255,255,0.08)', fontSize: '5rem', fontWeight: 700, fontFamily: 'var(--iu-font-serif)',
        }}>
          HMF
        </div>
      )}
      <div className="newsroom-hero-card-body">
        <TopicTags metals={post.metals} categories={post.categories} />
        <h2><Link href={`/news/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.description}</p>
        <span className="muted">{formatDate(post.publishedAt)}</span>
      </div>
    </div>
  );
}

function NewsCard({ post }: { post: Post }) {
  return (
    <div className="newsroom-card">
      {post.featuredImage ? (
        <div className="newsroom-card-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} />
        </div>
      ) : (
        <div className="newsroom-card-image no-image">HMF</div>
      )}
      <div className="newsroom-card-body">
        <TopicTags metals={post.metals} categories={post.categories} />
        <h3><Link href={`/news/${post.slug}`}>{post.title}</Link></h3>
        <p>{post.description}</p>
        <span className="muted">{formatDate(post.publishedAt)}</span>
      </div>
    </div>
  );
}

function NewsInner({ posts, metals, categories }: { posts: Post[]; metals: TaxItem[]; categories: TaxItem[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const metal = searchParams.get('metal') || '';
  const category = searchParams.get('category') || '';

  const filtered = useMemo(
    () => posts.filter((p) => (!metal || p.metals?.includes(metal)) && (!category || p.categories?.includes(category))),
    [posts, metal, category],
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const m = fd.get('metal') as string;
    const c = fd.get('category') as string;
    if (m) params.set('metal', m);
    if (c) params.set('category', c);
    router.push(`/news${params.toString() ? `?${params}` : ''}`);
  }

  const [hero, ...rest] = filtered;

  return (
    <section className="container section">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--iu-space-md)', marginBottom: 'var(--iu-space-lg)' }}>
        <h1>Newsroom</h1>
        <a href="/rss.xml" style={{ fontSize: 'var(--iu-ts-14)' }}>RSS Feed</a>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: 'var(--iu-space-xl)' }}>
        <select name="metal" defaultValue={metal} className="ms-input" style={{ minWidth: 140 }}>
          <option value="">All metals</option>
          {metals.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <select name="category" defaultValue={category} className="ms-input" style={{ minWidth: 140 }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <button className="btn btn-primary" type="submit">Filter</button>
      </form>

      {filtered.length === 0 ? (
        <p className="muted">No stories match the current filters.</p>
      ) : (
        <>
          {hero && <HeroCard post={hero} />}
          {rest.length > 0 && (
            <div className="newsroom-grid">
              {rest.map((p) => (
                <NewsCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function NewsContent({ posts, metals, categories }: { posts: Post[]; metals: TaxItem[]; categories: TaxItem[] }) {
  return (
    <Suspense fallback={<section className="container section"><h1>Newsroom</h1><p>Loading...</p></section>}>
      <NewsInner posts={posts} metals={metals} categories={categories} />
    </Suspense>
  );
}
