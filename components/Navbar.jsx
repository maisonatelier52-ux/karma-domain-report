'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/apiClient';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/search?q=${encodeURIComponent(v)}` : '/search');
  };

  const logout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  const link = (href, label) => (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
        pathname === href ? 'bg-white/15 text-white' : 'text-maroon-100 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-maroon-800 shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-2 flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-maroon-800">
            DR
          </span>
          <span className="hidden text-base font-semibold sm:block">Domain Report Manager</span>
        </Link>

        <nav className="flex items-center gap-1">
          {link('/', 'Dashboard')}
          {link('/domains/new', 'Add domain')}
        </nav>

        <form onSubmit={submit} className="ml-auto flex w-full items-center gap-2 sm:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search domain or done by…"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder-maroon-200 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none sm:w-64"
          />
          <button className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-maroon-800 hover:bg-maroon-50">
            Search
          </button>
        </form>

        <button onClick={logout} className="rounded-md px-3 py-1.5 text-sm font-medium text-maroon-100 hover:bg-white/10 hover:text-white">
          Logout
        </button>
      </div>
    </header>
  );
}
