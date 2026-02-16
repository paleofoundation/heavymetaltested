'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  ['Big 8', '/big-8'],
  ['Categories', '/categories'],
  ['Newsroom', '/news'],
  ['Standards', '/standards'],
  ['Testing', '/testing'],
  ['Mechanisms', '/mechanisms'],
  ['Playbooks', '/playbooks'],
  ['Tools', '/tools'],
  ['Editorial Standards', '/editorial-standards']
] as const;

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false);
    }
    if (searchOpen) document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [searchOpen]);

  return (
    <header className="ms-header">
      <div className="ms-container" ref={searchRef}>
        <div className="ms-header-top">
          <Link href="/" className="ms-brand">
            <span className="ms-brand-kicker">Heavy Metal Facts</span>
            <span className="ms-brand-title">Evidence-first newsroom</span>
          </Link>
          <div className="ms-header-controls">
            <button className="ms-icon-btn" aria-expanded={searchOpen} aria-controls="ms-search" onClick={() => setSearchOpen((s) => !s)}>
              <span className="ms-sr-only">Toggle search</span>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 4a6.5 6.5 0 105.1 10.5l4.4 4.4 1.4-1.4-4.4-4.4A6.5 6.5 0 0010.5 4zm0 2a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" fill="currentColor"/></svg>
            </button>
            <button className="ms-menu-btn" aria-expanded={menuOpen} aria-controls="ms-nav" onClick={() => setMenuOpen((m) => !m)}>Menu</button>
          </div>
        </div>
        {searchOpen && (
          <div className="ms-search-panel" id="ms-search">
            <form className="ms-search-form" role="search" action="/search" method="get">
              <label className="ms-sr-only" htmlFor="ms-q">Search</label>
              <input id="ms-q" className="ms-input" name="q" placeholder="Search HeavyMetalFacts.com" />
              <button className="ms-btn ms-btn-primary" type="submit">Search</button>
            </form>
          </div>
        )}
        <nav id="ms-nav" className="ms-nav" data-open={menuOpen} aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
