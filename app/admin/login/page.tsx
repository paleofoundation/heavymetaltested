'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: form.get('email') as string,
      password: form.get('password') as string,
      redirect: false,
    });
    if (res?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 'var(--iu-space-xl)' }}>
        <h1 style={{ fontFamily: 'var(--iu-font-serif)', fontSize: 'var(--iu-ts-32)', marginBottom: 'var(--iu-space-xs)' }}>
          Admin Login
        </h1>
        <p style={{ color: 'var(--iu-text-secondary)', marginBottom: 'var(--iu-space-xl)' }}>
          Sign in to manage content on Heavy Metal Facts.
        </p>
        {error && (
          <p style={{ color: '#b91c1c', background: '#fef2f2', padding: 'var(--iu-space-sm) var(--iu-space-md)', borderRadius: 'var(--iu-radius-md)', marginBottom: 'var(--iu-space-md)', fontSize: 'var(--iu-ts-14)' }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 'var(--iu-space-md)' }}>
            <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--iu-ts-14)', marginBottom: 'var(--iu-space-xxs)' }}>Email</span>
            <input name="email" type="email" required className="ms-input" autoComplete="email" />
          </label>
          <label style={{ display: 'block', marginBottom: 'var(--iu-space-lg)' }}>
            <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--iu-ts-14)', marginBottom: 'var(--iu-space-xxs)' }}>Password</span>
            <input name="password" type="password" required className="ms-input" autoComplete="current-password" />
          </label>
          <button type="submit" className="ms-btn ms-btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
