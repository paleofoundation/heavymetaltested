'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function EditButton({ contentType, slug }: { contentType: string; slug: string }) {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <Link
      href={`/admin/edit/${contentType}/${slug}`}
      style={{
        position: 'fixed',
        bottom: 'var(--iu-space-lg)',
        right: 'var(--iu-space-lg)',
        zIndex: 50,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--iu-space-xs)',
        padding: '0.6rem 1.25rem',
        background: 'var(--iu-crimson)',
        color: 'var(--iu-white)',
        borderRadius: 'var(--iu-radius-md)',
        fontWeight: 600,
        fontSize: 'var(--iu-ts-14)',
        textDecoration: 'none',
        boxShadow: 'var(--iu-shadow-md)',
        transition: 'background-color 0.15s ease',
      }}
    >
      Edit Page
    </Link>
  );
}
