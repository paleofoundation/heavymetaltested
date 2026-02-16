import Link from 'next/link';

const groups = [
  ['SERVICES', ['Data Briefings', 'Industry Outlook', 'Testing Primers']],
  ['FIND', ['Latest Reports', 'News Archive', 'Metal Profiles']],
  ['LIBRARY', ['Methods Glossary', 'Mechanisms', 'Playbooks']],
  ['RESOURCES', ['For Consumers', 'For Brands', 'Interactive Tools']],
  ['EMAIL', ['Newsletter Signup', 'Media Requests', 'General Contact']]
] as const;

const icons = [
  'M6 5l12 14M18 5L6 19',
  'M13.6 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.3 1.4-1.3h1.4V4.7c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.4-3.7 3.8v1.9H8.8V13h2.3v7h2.5',
  'M12 8a4 4 0 100 8 4 4 0 000-8m4.5-5h-9A4.5 4.5 0 003 7.5v9A4.5 4.5 0 007.5 21h9a4.5 4.5 0 004.5-4.5v-9A4.5 4.5 0 0016.5 3',
  'M20.6 7.4a2.8 2.8 0 00-2-2C16.9 5 12 5 12 5s-4.9 0-6.6.4a2.8 2.8 0 00-2 2C3 9.1 3 12 3 12s0 2.9.4 4.6a2.8 2.8 0 002 2c1.7.4 6.6.4 6.6.4s4.9 0 6.6-.4a2.8 2.8 0 002-2c.4-1.7.4-4.6.4-4.6s0-2.9-.4-4.6M10.5 15.2V8.8l5.2 3.2-5.2 3.2',
  'M6.3 8.5H3.6V20h2.7V8.5M5 3a1.7 1.7 0 100 3.4A1.7 1.7 0 005 3M20.4 13.1c0-3-1.6-4.7-4.1-4.7-1.9 0-2.8 1.1-3.2 1.8v-1.6h-2.7V20H13v-6.1c0-1.6.3-3.2 2.3-3.2s2 1.9 2 3.3V20H20v-6.9'
] as const;

export default function Footer() {
  return (
    <footer className="ms-footer">
      <div className="ms-footer-top">
        <div className="ms-container">
          <div className="ms-footer-social">
            {icons.map((d, idx) => (
              <a href="#" aria-label={`social-${idx + 1}`} key={d}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            ))}
          </div>
          <nav className="ms-footer-grid" aria-label="Footer">
            <section>
              <h3 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>HEAVY METAL<br />FACTS NETWORK</h3>
              <address style={{ fontStyle: 'normal', fontSize: '1.125rem', lineHeight: '1.55' }}>
                100 Research Exchange<br />Suite 420<br />Chicago, IL 60601<br />United States<br />+1 (000) 555-0142
              </address>
            </section>
            {groups.map(([title, links]) => (
              <section key={title}>
                <h4>{title}</h4>
                <ul style={{ listStyle: 'none' }}>
                  {links.map((label) => (
                    <li key={label}><Link href="#">{label}</Link></li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      </div>
      <div className="ms-footer-bottom">
        <div className="ms-container ms-footer-legal">
          <Link href="/" style={{ textDecoration: 'none', color: '#1f2a34', fontWeight: 700, display: 'inline-flex', gap: '.65rem', alignItems: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 56 56" aria-hidden="true"><rect x="4" y="4" width="48" height="48" rx="6" fill="#9e1210" /><path d="M16 40V16h6v9h12v-9h6v24h-6V31H22v9h-6z" fill="#fff" /></svg>
            Heavy Metal Facts
          </Link>
          <p className="ms-footer-legal-links">
            <Link href="#">Accessibility</Link> | <Link href="#">Privacy Notice</Link> | <Link href="#">Copyright</Link> | <Link href="#">Non-Discrimination</Link> | © {new Date().getFullYear()} Heavy Metal Facts
          </p>
        </div>
      </div>
    </footer>
  );
}
