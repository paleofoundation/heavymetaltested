import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
        <Footer />
      </body>
    </html>
  );
}
