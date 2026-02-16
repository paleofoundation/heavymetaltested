import Link from 'next/link';
import styles from './Footer.module.css';

const socialIcons = [
  {
    label: 'X',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h4.2l4.1 5.8L17.8 4H20l-6.7 7.6L20.4 20h-4.2l-4.5-6.3L6.4 20H4.2l7-8.1L4 4z" fill="currentColor" />
      </svg>
    )
  },
  {
    label: 'Facebook',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.7 20v-7h2.3l.3-2.7h-2.6V8.6c0-.8.2-1.3 1.4-1.3h1.4V4.8c-.2 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.8v1.9H8.9V13h2.3v7h2.5z" fill="currentColor" />
      </svg>
    )
  },
  {
    label: 'Instagram',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6.6a2.6 2.6 0 110-5.2 2.6 2.6 0 010 5.2z" fill="currentColor" />
        <path d="M16.5 3h-9A4.5 4.5 0 003 7.5v9A4.5 4.5 0 007.5 21h9a4.5 4.5 0 004.5-4.5v-9A4.5 4.5 0 0016.5 3zm3 13.5a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9a3 3 0 013-3h9a3 3 0 013 3v9z" fill="currentColor" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
      </svg>
    )
  },
  {
    label: 'YouTube',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.6 7.4a2.8 2.8 0 00-2-2C16.9 5 12 5 12 5s-4.9 0-6.6.4a2.8 2.8 0 00-2 2C3 9.1 3 12 3 12s0 2.9.4 4.6a2.8 2.8 0 002 2c1.7.4 6.6.4 6.6.4s4.9 0 6.6-.4a2.8 2.8 0 002-2c.4-1.7.4-4.6.4-4.6s0-2.9-.4-4.6zM10.5 15.2V8.8l5.2 3.2-5.2 3.2z" fill="currentColor" />
      </svg>
    )
  },
  {
    label: 'LinkedIn',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.3 8.5H3.6V20h2.7V8.5zM5 3a1.7 1.7 0 100 3.4A1.7 1.7 0 005 3zM20.4 13.1c0-3-1.6-4.7-4.1-4.7-1.9 0-2.8 1.1-3.2 1.8v-1.6h-2.7V20H13v-6.1c0-1.6.3-3.2 2.3-3.2s2 1.9 2 3.3V20H20v-6.9z" fill="currentColor" />
      </svg>
    )
  }
];

const groups = [
  {
    title: 'SERVICES',
    links: ['Data Briefings', 'Industry Outlook', 'Category Hubs', 'Testing Primers']
  },
  {
    title: 'FIND',
    links: ['Latest Reports', 'News Archive', 'Metal Profiles', 'Standards Notes']
  },
  {
    title: 'LIBRARY',
    links: ['Methods Glossary', 'Mechanisms', 'Playbooks', 'Reference Index']
  },
  {
    title: 'RESOURCES',
    links: ['For Consumers', 'For Brands', 'For Manufacturers', 'Interactive Tools']
  },
  {
    title: 'EMAIL',
    links: ['Newsletter Signup', 'Media Requests', 'General Contact']
  }
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topRegion}>
        <div className={styles.container}>
          <div className={styles.socialRow}>
            <div className={styles.socialButtons}>
              {socialIcons.map((icon) => (
                <a key={icon.label} href={icon.href} aria-label={icon.label} className={styles.socialButton}>
                  {icon.svg}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className={styles.linksGrid}>
            <section>
              <h2 className={styles.orgName}>HEAVY METAL<br />FACTS NETWORK</h2>
              <address className={styles.address}>
                100 Research Exchange
                <br />
                Suite 420
                <br />
                Chicago, IL 60601
                <br />
                United States
                <br />
                +1 (000) 555-0142
              </address>
            </section>

            {groups.map((group) => (
              <section key={group.title}>
                <h3 className={styles.groupHeading}>{group.title}</h3>
                <ul className={styles.groupList}>
                  {group.links.map((label) => (
                    <li key={label}>
                      <Link href="#" className={styles.groupLink}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      </div>

      <div className={styles.legalRegion}>
        <div className={styles.container}>
          <div className={styles.legalInner}>
            <Link href="/" className={styles.logoLockup} aria-label="Heavy Metal Facts home">
              <svg viewBox="0 0 56 56" aria-hidden="true">
                <rect x="4" y="4" width="48" height="48" rx="6" fill="#9e1210" />
                <path d="M16 40V16h6v9h12v-9h6v24h-6V31H22v9h-6z" fill="#fff" />
              </svg>
              <span>Heavy Metal Facts</span>
            </Link>

            <p className={styles.legalText}>
              <Link href="#">Accessibility</Link>
              {' | '}
              <Link href="#">Privacy Notice</Link>
              {' | '}
              <Link href="#">Copyright</Link>
              {' | '}
              <Link href="#">Non-Discrimination</Link>
              {' | '}
              © {new Date().getFullYear()} Heavy Metal Facts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
