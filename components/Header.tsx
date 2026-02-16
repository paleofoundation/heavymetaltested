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
      <div className="container topbar-inner">
        <Link href="/" className="brand">Heavy Metal Facts</Link>
        <nav className="nav desktop-nav" aria-label="Primary">
          {navItems.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <details className="mobile-menu">
          <summary>☰ Menu</summary>
          <nav className="nav" aria-label="Mobile primary">
            {navItems.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
          </nav>
        </details>
        <form action="/search">
          <input className="search-input" type="search" name="q" placeholder="Search metals, categories, stories" aria-label="Search" />
        </form>
      </div>
    </header>
  );
}
