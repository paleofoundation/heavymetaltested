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
] as const;

const SearchIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 10.5L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const CloseIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default function Header() {
  return (
    <header className="hmtf-header-wrap">
      <div className="rvt-header-global hmtf-header-global">
        <div className="rvt-container-xl hmtf-header-stack">
          <div className="hmtf-search-row" data-rvt-disclosure="search" data-rvt-close-click-outside>
            <button className="rvt-global-toggle hmtf-search-toggle" data-rvt-disclosure-toggle="search" aria-expanded="false">
              <span className="rvt-sr-only">Search</span>
              <span className="hmtf-search-open-icon"><SearchIcon /></span>
              <span className="hmtf-search-close-icon"><CloseIcon /></span>
            </button>
            <form
              className="rvt-header-global__search hmtf-search-form"
              data-rvt-disclosure-target="search"
              role="search"
              method="get"
              action="/search"
              hidden
            >
              <label className="rvt-sr-only" htmlFor="search">Search</label>
              <div className="rvt-input-group">
                <input id="search" className="rvt-input-group__input rvt-text-input" type="text" name="q" placeholder="Search HeavyMetalFacts.com" />
                <div className="rvt-input-group__append">
                  <button className="rvt-button" type="submit">Search</button>
                </div>
              </div>
            </form>
          </div>

          <div className="hmtf-brand-row">
            <Link href="/" className="rvt-lockup__tab hmtf-brand" aria-label="Heavy Metal Facts home">
              <span className="hmtf-brand-kicker">Heavy Metal Facts</span>
              <span className="hmtf-brand-title">Evidence-first newsroom on the Big 8</span>
            </Link>

            <nav className="hmtf-main-nav" aria-label="Primary">
              {navItems.map(([label, href]) => (
                <Link href={href} key={href} className="hmtf-main-nav-link">{label}</Link>
              ))}
            </nav>

            </div>

          <div data-rvt-disclosure="mobile-nav" data-rvt-close-click-outside>
            <button className="rvt-global-toggle hmtf-menu-toggle" aria-expanded="false" data-rvt-disclosure-toggle="mobile-nav">
              <span className="rvt-sr-only">Menu</span>
              Menu
            </button>
            <nav className="hmtf-mobile-nav" data-rvt-disclosure-target="mobile-nav" aria-label="Mobile" hidden>
              {navItems.map(([label, href]) => (
                <Link href={href} key={`${href}-mobile`} className="hmtf-mobile-nav-link">{label}</Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
