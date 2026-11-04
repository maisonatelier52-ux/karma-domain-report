'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/apiClient';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import DownloadModal from '@/components/DownloadModal';

export default function Dashboard() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  // Filters (empty string = "All")
  const [doneByFilter, setDoneByFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'live' | 'notlive'

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/domains');
      setDomains(data.domains);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api(`/api/domains/${toDelete.id}`, { method: 'DELETE' });
      setDomains((d) => d.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // Dropdown options built from the data
  const doneByOptions = useMemo(() => {
    const map = new Map();
    domains.forEach((d) => {
      const key = d.doneBy.trim().toLowerCase();
      if (!map.has(key)) map.set(key, d.doneBy.trim());
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [domains]);

  const domainOptions = useMemo(
    () => domains.map((d) => d.domainName).sort((a, b) => a.localeCompare(b)),
    [domains]
  );

  const filtered = useMemo(
    () =>
      domains.filter((d) => {
        if (doneByFilter && d.doneBy.trim().toLowerCase() !== doneByFilter.toLowerCase()) return false;
        if (domainFilter && d.domainName !== domainFilter) return false;
        if (statusFilter === 'live' && !d.domainLive) return false;
        if (statusFilter === 'notlive' && d.domainLive) return false;
        return true;
      }),
    [domains, doneByFilter, domainFilter, statusFilter]
  );

  const hasFilter = doneByFilter || domainFilter || statusFilter;
  const clearFilters = () => {
    setDoneByFilter('');
    setDomainFilter('');
    setStatusFilter('');
  };

  const live = domains.filter((d) => d.domainLive).length;
  const articles = domains.reduce((n, d) => n + d.clientArticles.length, 0);

  const stats = [
    { label: 'Total domains', value: domains.length, color: 'text-maroon-800' },
    { label: 'Live', value: live, color: 'text-green-700' },
    { label: 'Not live', value: domains.length - live, color: 'text-red-700' },
    { label: 'Client articles', value: articles, color: 'text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-maroon-900">Dashboard</h1>
          <p className="text-sm text-gray-500">All domains in one place.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setShowDownload(true)} disabled={!domains.length}>
            ⬇ Download report
          </button>
          <Link href="/domains/new" className="btn-primary">
            + Add domain
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`text-3xl font-bold ${s.color}`}>{loading ? '–' : s.value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <div>
            <label className="label">Done by</label>
            <select className="input" value={doneByFilter} onChange={(e) => setDoneByFilter(e.target.value)}>
              <option value="">All people</option>
              {doneByOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Domain name</label>
            <select className="input" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
              <option value="">All domains</option>
              {domainOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All (Live &amp; Not live)</option>
              <option value="live">Live</option>
              <option value="notlive">Not live</option>
            </select>
          </div>

          <button className="btn-outline" onClick={clearFilters} disabled={!hasFilter}>
            Clear filters
          </button>
        </div>
        {!loading && (
          <p className="mt-3 text-xs text-gray-500">
            Showing <b className="text-gray-700">{filtered.length}</b> of {domains.length} domain
            {domains.length === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-maroon-800 text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Done by</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : domains.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No domains yet. Click <b>Add domain</b> to create the first one.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No domains match these filters.{' '}
                    <button className="font-semibold text-maroon-700 hover:underline" onClick={clearFilters}>
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-maroon-50/60">
                    <td className="px-4 py-3">
                      <Link href={`/domains/${d.id}`} className="font-semibold text-maroon-800 hover:underline">
                        {d.domainName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge live={d.domainLive} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{d.doneBy}</td>
                    <td className="px-4 py-3 text-gray-700">{d.clientArticles.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/domains/${d.id}`} className="btn-outline btn-sm">
                          View
                        </Link>
                        <Link href={`/domains/${d.id}/edit`} className="btn-outline btn-sm">
                          Edit
                        </Link>
                        <button className="btn-danger btn-sm" onClick={() => setToDelete(d)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete domain?"
        message={`“${toDelete?.domainName}” will be permanently removed. This cannot be undone.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      <DownloadModal open={showDownload} onClose={() => setShowDownload(false)} title={`All domains (${domains.length})`} />
    </div>
  );
}