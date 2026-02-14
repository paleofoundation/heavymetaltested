import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL('https://heavymetalfacts.com'),
  title: { default: 'Heavy Metal Facts', template: '%s | Heavy Metal Facts' },
  description: 'Evidence-first reporting and explainers on contaminant metals in food, water, and consumer products.',
  openGraph: { title: 'Heavy Metal Facts', siteName: 'Heavy Metal Facts', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Heavy Metal Facts' },
  alternates: { canonical: '/' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        <main id="main-content">{children}</main>
        <footer className="footer">
          <div className="container footer-grid">
            <div>
              <h3>Newsletter</h3>
              <p>Weekly contaminant briefing with links to methods, policy updates, and category-specific analysis.</p>
              <input aria-label="Email" placeholder="Email address" className="search-input" />
            </div>
            <div>
              <h3>Site Links</h3>
              <p><Link href="/news">Newsroom</Link></p>
              <p><Link href="/big-8">Big 8 Metals</Link></p>
              <p><Link href="/testing">Testing Literacy</Link></p>
            </div>
            <div>
              <h3>Disclaimer</h3>
              <p className="muted">Educational content only. Not medical advice. Always consult qualified professionals for individual decisions.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
