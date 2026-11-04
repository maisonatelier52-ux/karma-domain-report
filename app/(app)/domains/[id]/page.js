'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import StatusBadge from '@/components/StatusBadge';
import ArticleCard from '@/components/ArticleCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import DownloadModal from '@/components/DownloadModal';

function LinkRow({ label, url }) {
  return (
    <div className="grid gap-1 border-b border-gray-100 px-5 py-3 last:border-0 sm:grid-cols-[200px_1fr]">
      <dt className="text-sm font-semibold text-gray-700">{label}</dt>
      <dd className="break-all text-sm">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
            {url}
          </a>
        ) : (
          <span className="text-gray-400">Not added</span>
        )}
      </dd>
    </div>
  );
}

export default function DomainDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    api(`/api/domains/${id}`)
      .then((r) => setD(r.domain))
      .catch((e) => setError(e.message));
  }, [id]);

  const remove = async () => {
    setDeleting(true);
    try {
      await api(`/api/domains/${id}`, { method: 'DELETE' });
      router.push('/');
    } catch (e) {
      setError(e.message);
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  if (!d) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-maroon-700 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-maroon-900">{d.domainName}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge live={d.domainLive} />
            <span className="text-sm text-gray-500">
              Done by <b className="text-gray-800">{d.doneBy}</b>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-outline" onClick={() => setShowDownload(true)}>
            ⬇ Download
          </button>
          <Link href={`/domains/${d.id}/edit`} className="btn-outline">
            Edit
          </Link>
          <button className="btn-danger" onClick={() => setShowDelete(true)}>
            Delete
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-maroon-800 px-5 py-3 text-sm font-semibold text-white">Domain details</div>
        <dl>
          <LinkRow label="Site link" url={d.domainLink} />
          <div className="grid gap-1 border-b border-gray-100 px-5 py-3 sm:grid-cols-[200px_1fr]">
            <dt className="text-sm font-semibold text-gray-700">Done by</dt>
            <dd className="text-sm">{d.doneBy}</dd>
          </div>
          <div className="grid gap-1 border-b border-gray-100 px-5 py-3 sm:grid-cols-[200px_1fr]">
            <dt className="text-sm font-semibold text-gray-700">Domain status</dt>
            <dd className={`text-sm font-bold ${d.domainLive ? 'text-green-700' : 'text-red-700'}`}>
              {d.domainLive ? 'Live' : 'Not live'}
            </dd>
          </div>
          <LinkRow label="Vercel link" url={d.vercelLink} />
          <LinkRow label="GitHub link" url={d.githubLink} />
          <LinkRow label="Google Search Console" url={d.searchConsoleLink} />
        </dl>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-maroon-900">
          Client articles <span className="text-sm font-normal text-gray-500">({d.clientArticles.length})</span>
        </h2>
        {d.clientArticles.length === 0 ? (
          <div className="card p-6 text-sm text-gray-500">No client articles added yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {d.clientArticles.map((a) => (
              <ArticleCard key={a} url={a} />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={showDelete}
        title="Delete domain?"
        message={`“${d.domainName}” will be permanently removed. This cannot be undone.`}
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setShowDelete(false)}
      />
      <DownloadModal open={showDownload} onClose={() => setShowDownload(false)} id={d.id} title={d.domainName} />
    </div>
  );
}
