'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function getEditLink(pathname: string): string | null {
  const contentPatterns = [
    { regex: /^\/metals\/([^/]+)$/, type: 'metals' },
    { regex: /^\/news\/([^/]+)$/, type: 'news' },
    { regex: /^\/categories\/([^/]+)$/, type: 'categories' },
    { regex: /^\/playbooks\/([^/]+)$/, type: 'playbooks' },
    { regex: /^\/testing\/([^/]+)$/, type: 'primers' },
    { regex: /^\/mechanisms\/([^/]+)$/, type: 'mechanisms' },
  ];
  for (const { regex, type } of contentPatterns) {
    const match = pathname.match(regex);
    if (match) return `/admin/edit/${type}/${match[1]}`;
  }
  return null;
}

export default function AdminToolbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  if (status === 'loading') return null;

  if (!session) {
    return (
      <div style={{
        position: 'fixed', bottom: 'var(--iu-space-md)', right: 'var(--iu-space-md)',
        zIndex: 50,
      }}>
        <Link
          href="/admin/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--iu-space-xs)',
            padding: '0.4rem 0.9rem',
            background: 'rgba(36,49,66,0.7)', color: 'rgba(255,255,255,0.7)',
            borderRadius: 'var(--iu-radius-md)', fontSize: 'var(--iu-ts-12)',
            textDecoration: 'none', backdropFilter: 'blur(4px)',
            transition: 'opacity 0.15s ease', opacity: 0.4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}
        >
          Admin
        </Link>
      </div>
    );
  }

  const editLink = getEditLink(pathname);

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'var(--iu-text)', color: 'var(--iu-white)',
      padding: 'var(--iu-space-xs) var(--iu-space-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--iu-space-md)',
      fontSize: 'var(--iu-ts-14)', boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
    }}>
      <Link href="/admin" style={{ color: 'var(--iu-white)', textDecoration: 'none', fontWeight: 600 }}>
        Dashboard
      </Link>
      <span style={{ opacity: 0.3 }}>|</span>
      {editLink ? (
        <Link href={editLink} style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: 600 }}>
          Edit This Page
        </Link>
      ) : (
        <span style={{ opacity: 0.5 }}>No editable content on this page</span>
      )}
      <span style={{ opacity: 0.3 }}>|</span>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer', fontSize: 'var(--iu-ts-14)', fontFamily: 'inherit',
          padding: 0, textDecoration: 'underline',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
