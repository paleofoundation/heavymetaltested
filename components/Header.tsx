'use client';

import Link from 'next/link';

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
];

export default function Header() {
  return (
    <header className="topbar">
      <div className="container topbar-brand">
        <Link href="/" className="brand">
          <svg className="brand-logo" width="40" height="40" viewBox="0 0 56 56" aria-hidden="true">
            <circle cx="28" cy="28" r="26" fill="#990000" />
            <path d="M16 40V16h6v9h12v-9h6v24h-6V31H22v9h-6z" fill="#fff" />
          </svg>
          <span className="brand-text">Heavy Metal Facts</span>
        </Link>
        <Link href="/search" className="search-icon" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
      <div className="topbar-nav-wrap">
        <nav className="container nav desktop-nav" aria-label="Primary">
          {navItems.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <details className="container mobile-menu">
          <summary>Menu</summary>
          <nav className="nav" aria-label="Mobile primary">
            {navItems.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
