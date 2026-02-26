'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function getEditLink(pathname: string): string | null {
  if (pathname === '/') return '/admin/edit/pages/home';

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
      <Link
        href="/admin/login"
        className="admin-login-fab"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" fill="currentColor"/>
        </svg>
        Log In
      </Link>
    );
  }

  const editLink = getEditLink(pathname);

  return (
    <div className="admin-toolbar">
      <Link href="/admin" className="admin-toolbar-link">
        Dashboard
      </Link>
      <span className="admin-toolbar-sep">|</span>
      {editLink ? (
        <Link href={editLink} className="admin-toolbar-link admin-toolbar-edit">
          Edit This Page
        </Link>
      ) : (
        <span className="admin-toolbar-muted">This page is not directly editable</span>
      )}
      <span className="admin-toolbar-sep">|</span>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="admin-toolbar-signout"
      >
        Sign Out
      </button>
    </div>
  );
}
