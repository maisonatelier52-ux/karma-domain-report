'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/apiClient';
import StatusBadge from '@/components/StatusBadge';

function DomainCard({ d }) {
  return (
    <Link href={`/domains/${d.id}`} className="card block p-4 transition hover:border-maroon-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-maroon-800">{d.domainName}</span>
        <StatusBadge live={d.domainLive} />
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Done by <b className="text-gray-700">{d.doneBy}</b> · {d.clientArticles.length} article
        {d.clientArticles.length === 1 ? '' : 's'}
      </div>
    </Link>
  );
}

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const [result, setResult] = useState({ domains: [], people: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep the box in sync when the navbar search changes the URL.
  useEffect(() => {
    setQ(initial);
  }, [initial]);

  // Live search (debounced).
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResult({ domains: [], people: [] });
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await api(`/api/search?q=${encodeURIComponent(term)}`);
        setResult(data);
        setError('');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const term = q.trim();
  const none = term && !loading && !result.domains.length && !result.people.length && !error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-maroon-900">Search</h1>
        <p className="text-sm text-gray-500">Find a domain by name, or see everything a person has done.</p>
      </div>

      <input
        className="input py-3 text-base"
        autoFocus
        placeholder="e.g. os-intel.com or Dinu"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          router.replace(e.target.value ? `/search?q=${encodeURIComponent(e.target.value)}` : '/search');
        }}
      />

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {!term ? <p className="text-sm text-gray-500">Start typing to search.</p> : null}
      {loading ? <p className="text-sm text-gray-500">Searching…</p> : null}
      {none ? <p className="text-sm text-gray-500">No results for “{term}”.</p> : null}

      {result.domains.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-maroon-700">
            Domains ({result.domains.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.domains.map((d) => (
              <DomainCard key={d.id} d={d} />
            ))}
          </div>
        </section>
      )}

      {result.people.map((p) => (
        <section key={p.name}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-maroon-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-maroon-700 text-xs text-white">
              {p.name.charAt(0).toUpperCase()}
            </span>
            {p.name} · {p.domains.length} domain{p.domains.length === 1 ? '' : 's'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {p.domains.map((d) => (
              <DomainCard key={d.id} d={d} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <SearchInner />
    </Suspense>
  );
}
