'use client';

import { useState } from 'react';

const emptyForm = {
  domainLink: '',
  domainLive: null,
  doneBy: '',
  clientArticles: [''],
  vercelLink: '',
  githubLink: '',
  searchConsoleLink: '',
};

export default function DomainForm({ initial, submitLabel = 'Save', onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initial || {}),
    clientArticles: initial?.clientArticles?.length ? initial.clientArticles : [''],
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setArticle = (i, v) => set('clientArticles', form.clientArticles.map((a, idx) => (idx === i ? v : a)));
  const addArticle = () => set('clientArticles', [...form.clientArticles, '']);
  const removeArticle = (i) => {
    const next = form.clientArticles.filter((_, idx) => idx !== i);
    set('clientArticles', next.length ? next : ['']);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.domainLink.trim()) return setError('Domain link is required');
    if (typeof form.domainLive !== 'boolean') return setError('Please choose whether the domain is live or not');
    if (!form.doneBy.trim()) return setError('Done by is required');

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        clientArticles: form.clientArticles.map((a) => a.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setSaving(false);
    }
  };

  const req = <span className="text-maroon-600"> *</span>;

  return (
    <form onSubmit={submit} className="card space-y-6 p-6">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-maroon-700">Required details</h2>

        <div>
          <label className="label">Domain link{req}</label>
          <input
            className="input"
            placeholder="https://www.example.com/"
            value={form.domainLink}
            onChange={(e) => set('domainLink', e.target.value)}
          />
        </div>

        <div>
          <span className="label">Domain live or not{req}</span>
          <div className="flex gap-3">
            {[
              { v: true, label: 'Live', on: 'border-green-600 bg-green-50 text-green-700' },
              { v: false, label: 'Not live', on: 'border-red-600 bg-red-50 text-red-700' },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => set('domainLive', o.v)}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  form.domainLive === o.v ? o.on : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Done by{req}</label>
          <input className="input" placeholder="e.g. Dinu" value={form.doneBy} onChange={(e) => set('doneBy', e.target.value)} />
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-maroon-700">Optional details</h2>

        <div>
          <label className="label">Client article links</label>
          <div className="space-y-2">
            {form.clientArticles.map((a, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input"
                  placeholder="https://www.example.com/article-url"
                  value={a}
                  onChange={(e) => setArticle(i, e.target.value)}
                />
                <button type="button" className="btn-outline btn-sm" onClick={() => removeArticle(i)} aria-label="Remove article">
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="mt-2 text-sm font-semibold text-maroon-700 hover:underline" onClick={addArticle}>
            + Add another article
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Vercel link</label>
            <input className="input" placeholder="https://vercel.com/…" value={form.vercelLink} onChange={(e) => set('vercelLink', e.target.value)} />
          </div>
          <div>
            <label className="label">GitHub link</label>
            <input className="input" placeholder="https://github.com/…" value={form.githubLink} onChange={(e) => set('githubLink', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Google Search Console link</label>
          <input
            className="input"
            placeholder="https://search.google.com/search-console/…"
            value={form.searchConsoleLink}
            onChange={(e) => set('searchConsoleLink', e.target.value)}
          />
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        {onCancel ? (
          <button type="button" className="btn-outline" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
