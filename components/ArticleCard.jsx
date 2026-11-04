'use client';

import { useEffect, useState } from 'react';

// Shows a client article link with its Open Graph image, title and description.
export default function ArticleCard({ url }) {
  const [og, setOg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d) => alive && setOg(d))
      .catch(() => alive && setOg(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [url]);

  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {}

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-maroon-300 hover:shadow-card"
    >
      <div className="relative aspect-[1.91/1] w-full bg-maroon-50">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-maroon-100" />
        ) : og?.image && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={og.image}
            alt={og.title || url}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-maroon-400">
            No preview image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-maroon-600">{og?.siteName || host}</span>
        <span className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-maroon-800">
          {og?.title || url}
        </span>
        {og?.description ? <span className="line-clamp-2 text-xs text-gray-500">{og.description}</span> : null}
        <span className="mt-auto break-all pt-2 text-xs text-blue-700">{url}</span>
      </div>
    </a>
  );
}
