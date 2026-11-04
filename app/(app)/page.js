'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/apiClient';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import DownloadModal from '@/components/DownloadModal';
import CopyButton from '@/components/CopyButton';
import { SITE_TYPES } from '@/lib/fields';

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const ICONS = {
  layers: 'm12 2 10 5-10 5L2 7l10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
  news: 'M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Z M19 8h1a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2 M8 8h7 M8 12h7 M8 16h4',
  shirt: 'M16 3l5 4-3 3-2-1v12H8V9l-2 1-3-3 5-4a4 4 0 0 0 8 0Z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  pen: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  eye: 'M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6 M10 11v6 M14 11v6',
  download: 'M12 3v12 M7 10l5 5 5-5 M5 21h14',
  plus: 'M12 5v14 M5 12h14',
  filter: 'M3 4h18l-7 8v6l-4 2v-8L3 4Z',
  checkCircle: 'M22 11.1V12a10 10 0 1 1-5.9-9.1 M22 4 12 14l-3-3',
  xCircle: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M15 9l-6 6 M9 9l6 6',
  fileX: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6 M9.5 12.5l5 5 M14.5 12.5l-5 5',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
};

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

// Colour + icon for every site type (full class names so Tailwind keeps them).
const TYPE_STYLE = {
  'News Site': { icon: 'news', tint: 'bg-maroon-50', text: 'text-maroon-700', bar: 'bg-maroon-600', chip: 'bg-maroon-50 text-maroon-800 ring-maroon-200' },
  'Fashion Site': { icon: 'shirt', tint: 'bg-pink-50', text: 'text-pink-600', bar: 'bg-pink-500', chip: 'bg-pink-50 text-pink-700 ring-pink-200' },
  'Attacking Site': { icon: 'target', tint: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500', chip: 'bg-red-50 text-red-700 ring-red-200' },
  Blog: { icon: 'pen', tint: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  'Single Person Site': { icon: 'user', tint: 'bg-violet-50', text: 'text-violet-600', bar: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700 ring-violet-200' },
  Other: { icon: 'grid', tint: 'bg-slate-100', text: 'text-slate-600', bar: 'bg-slate-500', chip: 'bg-slate-100 text-slate-700 ring-slate-200' },
};

function TypeChip({ type }) {
  if (!type) return <span className="text-xs text-gray-300">Not set</span>;
  const s = TYPE_STYLE[type] || TYPE_STYLE.Other;
  return <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${s.chip}`}>{type}</span>;
}

function Avatar({ name, size = 'h-8 w-8 text-sm' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-maroon-100 font-bold text-maroon-800 ${size}`}>
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
}

function SectionTitle({ children, hint }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded-full bg-maroon-700" />
        <h2 className="text-lg font-bold text-maroon-900">{children}</h2>
      </div>
      {hint ? <p className="hidden text-xs text-gray-400 sm:block">{hint}</p> : null}
    </div>
  );
}

function StatCard({ label, value, total, type, solid, loading }) {
  const s = TYPE_STYLE[type] || { icon: 'layers', tint: 'bg-white/15', text: 'text-white', bar: 'bg-white' };
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
        solid ? 'bg-maroon-800 text-white shadow-card' : 'card'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-4xl font-bold tracking-tight ${solid ? 'text-white' : 'text-gray-900'}`}>{loading ? '–' : value}</div>
          <div className={`mt-1 text-xs font-semibold uppercase tracking-wider ${solid ? 'text-maroon-200' : 'text-gray-500'}`}>{label}</div>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.tint} ${s.text}`}>
          <Icon name={s.icon} className="h-6 w-6" />
        </span>
      </div>
      {solid ? (
        <p className="mt-5 text-xs text-maroon-200">Across every site type</p>
      ) : (
        <>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full transition-all duration-500 ${s.bar}`} style={{ width: `${loading ? 0 : pct}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">{loading ? '' : `${pct}% of all domains`}</p>
        </>
      )}
    </div>
  );
}

// Green dot = live, red dot = not live.
function LiveDot({ live }) {
  return (
    <span title={live ? 'Live' : 'Not live'} className={`inline-block h-3 w-3 shrink-0 rounded-full ring-4 ${live ? 'bg-green-500 ring-green-100' : 'bg-red-500 ring-red-100'}`}>
      <span className="sr-only">{live ? 'Live' : 'Not live'}</span>
    </span>
  );
}

const TONES = {
  red: { box: 'bg-red-50 text-red-600', count: 'bg-red-50 text-red-700' },
  green: { box: 'bg-green-50 text-green-600', count: 'bg-green-50 text-green-700' },
  amber: { box: 'bg-amber-50 text-amber-600', count: 'bg-amber-50 text-amber-700' },
};

// A card listing domains. The copy icon (top right) copies every domain name in the card.
function ListCard({ title, subtitle, icon, tone = 'amber', items, emptyText, loading }) {
  const t = TONES[tone];
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.box}`}>
          <Icon name={icon} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-maroon-900">{title}</h3>
          {subtitle ? <p className="truncate text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${t.count}`}>{loading ? '–' : items.length}</span>
        <CopyButton text={items.map((d) => d.domainName).join('\n')} disabled={loading || items.length === 0} />
      </div>
      <ul className="max-h-72 flex-1 divide-y divide-gray-50 overflow-y-auto px-2 py-1">
        {loading ? (
          <li className="py-8 text-center text-sm text-gray-400">Loading…</li>
        ) : items.length === 0 ? (
          <li className="py-8 text-center text-sm text-gray-400">{emptyText}</li>
        ) : (
          items.map((d) => (
            <li key={d.id}>
              <Link href={`/domains/${d.id}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-maroon-50/70">
                <span className="truncate font-medium text-gray-800">{d.domainName}</span>
                <span className="shrink-0 text-xs text-gray-400">{d.doneBy}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

const ARTICLE_SITE_TYPES = ['News Site', 'Fashion Site', 'Attacking Site'];
const BLOG_SITE_TYPES = ['Blog', 'Single Person Site'];
const byName = (a, b) => a.domainName.localeCompare(b.domainName);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showFilteredDownload, setShowFilteredDownload] = useState(false);

  // Filters (empty string = "All")
  const [doneByFilter, setDoneByFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'live' | 'notlive'
  const [siteTypeFilter, setSiteTypeFilter] = useState(''); // '' | one of SITE_TYPES | '__none__'

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

  const domainOptions = useMemo(() => domains.map((d) => d.domainName).sort((a, b) => a.localeCompare(b)), [domains]);

  const filtered = useMemo(
    () =>
      domains.filter((d) => {
        if (doneByFilter && d.doneBy.trim().toLowerCase() !== doneByFilter.toLowerCase()) return false;
        if (domainFilter && d.domainName !== domainFilter) return false;
        if (siteTypeFilter === '__none__' && d.siteType) return false;
        if (siteTypeFilter && siteTypeFilter !== '__none__' && d.siteType !== siteTypeFilter) return false;
        if (statusFilter === 'live' && !d.domainLive) return false;
        if (statusFilter === 'notlive' && d.domainLive) return false;
        return true;
      }),
    [domains, doneByFilter, domainFilter, statusFilter, siteTypeFilter]
  );

  const hasFilter = doneByFilter || domainFilter || statusFilter || siteTypeFilter;
  const clearFilters = () => {
    setDoneByFilter('');
    setDomainFilter('');
    setStatusFilter('');
    setSiteTypeFilter('');
  };

  // ---- Summary data (always based on ALL domains, not the filters) ----
  const total = domains.length;
  const liveCount = domains.filter((d) => d.domainLive).length;
  const livePct = total ? Math.round((liveCount / total) * 100) : 0;
  const countType = (t) => domains.filter((d) => d.siteType === t).length;

  const isBlogGroup = (d) => BLOG_SITE_TYPES.includes(d.siteType);
  const mainDomains = domains.filter((d) => !isBlogGroup(d));
  const blogDomains = domains.filter(isBlogGroup);

  const noArticles = domains.filter((d) => ARTICLE_SITE_TYPES.includes(d.siteType) && d.clientArticles.length === 0).sort(byName);
  const mainActive = mainDomains.filter((d) => d.domainLive).sort(byName);
  const mainInactive = mainDomains.filter((d) => !d.domainLive).sort(byName);
  const blogActive = blogDomains.filter((d) => d.domainLive).sort(byName);
  const blogInactive = blogDomains.filter((d) => !d.domainLive).sort(byName);

  const people = (() => {
    const map = new Map();
    domains.forEach((d) => {
      const key = d.doneBy.trim().toLowerCase();
      if (!map.has(key)) map.set(key, { name: d.doneBy.trim(), domains: [] });
      map.get(key).domains.push(d);
    });
    return Array.from(map.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({ ...p, domains: p.domains.sort(byName) }));
  })();

  return (
    <div className="space-y-10">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-600 p-6 text-white shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-200">Overview</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-sm text-maroon-100">Every domain, owner and client article in one place.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/domains/new" className="btn bg-white text-maroon-800 shadow hover:bg-maroon-50">
                <Icon name="plus" className="h-4 w-4" /> Add domain
              </Link>
              <button className="btn border border-white/30 text-white hover:bg-white/10" onClick={() => setShowDownload(true)} disabled={!domains.length}>
                <Icon name="download" className="h-4 w-4" /> Download report
              </button>
            </div>
          </div>

          <div className="w-full rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:w-80">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-maroon-100">Live status</span>
              <span className="text-2xl font-bold">{loading ? '–' : `${livePct}%`}</span>
            </div>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-red-400/70">
              <div className="h-full rounded-full bg-green-400 transition-all duration-700" style={{ width: `${loading ? 0 : livePct}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-xs text-maroon-100">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400" /> {loading ? '–' : liveCount} live
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" /> {loading ? '–' : total - liveCount} not live
              </span>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* ---------------- Site type stats ---------------- */}
      <section className="space-y-4">
        <SectionTitle hint="Counts include every domain">Sites by type</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard solid label="Total domains" value={total} loading={loading} />
          <StatCard type="News Site" label="News sites" value={countType('News Site')} total={total} loading={loading} />
          <StatCard type="Fashion Site" label="Fashion sites" value={countType('Fashion Site')} total={total} loading={loading} />
          <StatCard type="Attacking Site" label="Attacking sites" value={countType('Attacking Site')} total={total} loading={loading} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Blog details</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard type="Blog" label="Blogs" value={countType('Blog')} total={total} loading={loading} />
          <StatCard type="Single Person Site" label="Single person sites" value={countType('Single Person Site')} total={total} loading={loading} />
          <StatCard type="Other" label="Other sites" value={countType('Other')} total={total} loading={loading} />
        </div>
      </section>

      {/* ---------------- Domains table + filters ---------------- */}
      <section className="space-y-4">
        <SectionTitle hint={!loading ? `Showing ${filtered.length} of ${total}` : ''}>All domains</SectionTitle>

        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-maroon-800">
            <Icon name="filter" className="h-4 w-4" /> Filters
            {hasFilter ? <span className="rounded-full bg-maroon-700 px-2 py-0.5 text-[11px] font-bold text-white">active</span> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              <label className="label">Site type</label>
              <select className="input" value={siteTypeFilter} onChange={(e) => setSiteTypeFilter(e.target.value)}>
                <option value="">All site types</option>
                {SITE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="__none__">Not set</option>
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
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500">
              {loading ? 'Loading…' : (
                <>
                  <b className="text-gray-800">{filtered.length}</b> of {total} domain{total === 1 ? '' : 's'} match
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-outline" onClick={clearFilters} disabled={!hasFilter}>
                Clear filters
              </button>
              <button className="btn-primary" onClick={() => setShowFilteredDownload(true)} disabled={loading || filtered.length === 0}>
                <Icon name="download" className="h-4 w-4" /> Download report
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-maroon-800 text-xs uppercase tracking-wider text-maroon-100">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Domain</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Done by</th>
                  <th className="px-5 py-3.5 font-semibold">Site type</th>
                  <th className="px-5 py-3.5 font-semibold">Articles</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : domains.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                      No domains yet. Click <b>Add domain</b> to create the first one.
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                      No domains match these filters.{' '}
                      <button className="font-semibold text-maroon-700 hover:underline" onClick={clearFilters}>
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="transition odd:bg-white even:bg-maroon-50/30 hover:bg-maroon-50">
                      <td className="px-5 py-3.5">
                        <Link href={`/domains/${d.id}`} className="font-semibold text-maroon-800 hover:underline">
                          {d.domainName}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge live={d.domainLive} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-2.5 text-gray-700">
                          <Avatar name={d.doneBy} /> {d.doneBy}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <TypeChip type={d.siteType} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex min-w-[1.75rem] justify-center rounded-md px-2 py-0.5 text-xs font-bold ${d.clientArticles.length ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-600'}`}>
                          {d.clientArticles.length}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/domains/${d.id}`} title="View" aria-label="View" className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-maroon-300 hover:bg-white hover:text-maroon-700">
                            <Icon name="eye" className="h-4 w-4" />
                          </Link>
                          <Link href={`/domains/${d.id}/edit`} title="Edit" aria-label="Edit" className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-maroon-300 hover:bg-white hover:text-maroon-700">
                            <Icon name="pen" className="h-4 w-4" />
                          </Link>
                          <button onClick={() => setToDelete(d)} title="Delete" aria-label="Delete" className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white">
                            <Icon name="trash" className="h-4 w-4" />
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
      </section>

      {/* ---------------- News / fashion / attacking lists ---------------- */}
      <section className="space-y-4">
        <SectionTitle hint="Includes sites with type “Other” or not set yet">News, fashion &amp; attacking sites</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-3">
          <ListCard
            title="No client article"
            subtitle="News, fashion & attacking sites without an article"
            icon="fileX"
            tone="red"
            items={noArticles}
            emptyText="Every news, fashion and attacking site has an article."
            loading={loading}
          />
          <ListCard title="Active domains" subtitle="Currently live" icon="checkCircle" tone="green" items={mainActive} emptyText="No live domains." loading={loading} />
          <ListCard title="Not active domains" subtitle="Currently not live" icon="xCircle" tone="red" items={mainInactive} emptyText="All domains are live." loading={loading} />
        </div>
      </section>

      {/* ---------------- Blog / single person lists ---------------- */}
      <section className="space-y-4">
        <SectionTitle>Blogs &amp; single person sites</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-3">
          <ListCard title="Active blog / single person" subtitle="Currently live" icon="checkCircle" tone="green" items={blogActive} emptyText="No live blogs or single person sites." loading={loading} />
          <ListCard title="Not active blog / single person" subtitle="Currently not live" icon="xCircle" tone="red" items={blogInactive} emptyText="All blogs and single person sites are live." loading={loading} />
        </div>
      </section>

      {/* ---------------- People ---------------- */}
      <section className="space-y-4">
        <SectionTitle hint="Green dot = live · Red dot = not live">People and their sites</SectionTitle>
        {loading ? (
          <div className="card px-4 py-10 text-center text-sm text-gray-400">Loading…</div>
        ) : people.length === 0 ? (
          <div className="card px-4 py-10 text-center text-sm text-gray-400">No domains yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => {
              const live = p.domains.filter((d) => d.domainLive).length;
              const pct = Math.round((live / p.domains.length) * 100);
              return (
                <div key={p.name} className="card overflow-hidden">
                  <div className="border-b border-gray-100 bg-gradient-to-r from-maroon-50 to-white px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size="h-10 w-10 text-base" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-maroon-900">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {p.domains.length} site{p.domains.length === 1 ? '' : 's'} · {live} live
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-red-200">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <ul className="max-h-64 divide-y divide-gray-50 overflow-y-auto px-2 py-1">
                    {p.domains.map((d) => (
                      <li key={d.id}>
                        <Link href={`/domains/${d.id}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-maroon-50/70">
                          <span className="truncate text-gray-800">{d.domainName}</span>
                          <span className="flex shrink-0 items-center gap-2.5">
                            {d.siteType ? <span className="text-xs text-gray-400">{d.siteType}</span> : null}
                            <LiveDot live={d.domainLive} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete domain?"
        message={`“${toDelete?.domainName}” will be permanently removed. This cannot be undone.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      <DownloadModal open={showDownload} onClose={() => setShowDownload(false)} title={`All domains (${domains.length})`} />
      <DownloadModal
        open={showFilteredDownload}
        onClose={() => setShowFilteredDownload(false)}
        title={`${hasFilter ? 'Filtered' : 'All'} domains (${filtered.length})`}
        filters={{ doneBy: doneByFilter, domainName: domainFilter, status: statusFilter, siteType: siteTypeFilter }}
      />
    </div>
  );
}