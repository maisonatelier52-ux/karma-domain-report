'use client';

import { useEffect, useState } from 'react';
import { REPORT_FIELDS, ALL_FIELD_KEYS } from '@/lib/fields';

const FORMATS = [
  { key: 'pdf', label: 'PDF', hint: '.pdf' },
  { key: 'docx', label: 'Word', hint: '.docx' },
  { key: 'xlsx', label: 'Excel', hint: '.xlsx' },
];

// id = a single domain id; leave empty to download the report for all domains.
export default function DownloadModal({ open, onClose, id, title }) {
  const [selected, setSelected] = useState(ALL_FIELD_KEYS);
  const [format, setFormat] = useState('pdf');

  useEffect(() => {
    if (open) {
      setSelected(ALL_FIELD_KEYS); // all fields active initially
      setFormat('pdf');
    }
  }, [open]);

  if (!open) return null;

  const toggle = (key) =>
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  const allOn = selected.length === ALL_FIELD_KEYS.length;

  const download = () => {
    const qs = new URLSearchParams({ format, fields: selected.join(',') });
    if (id) qs.set('id', id);
    // Same-origin request: the login cookie is sent and the browser saves the file.
    window.location.href = `/api/report?${qs.toString()}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="rounded-t-xl bg-maroon-800 px-6 py-4 text-white">
          <h3 className="text-lg font-semibold">Download report</h3>
          <p className="text-sm text-maroon-100">{title}</p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Fields to include</span>
              <button
                type="button"
                className="text-xs font-semibold text-maroon-700 hover:underline"
                onClick={() => setSelected(allOn ? [] : ALL_FIELD_KEYS)}
              >
                {allOn ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REPORT_FIELDS.map((f) => (
                <label
                  key={f.key}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-maroon-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-maroon-700"
                    checked={selected.includes(f.key)}
                    onChange={() => toggle(f.key)}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-gray-800">Format</span>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFormat(f.key)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    format === f.key
                      ? 'border-maroon-700 bg-maroon-700 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-maroon-50'
                  }`}
                >
                  {f.label}
                  <span className="ml-1 text-xs font-normal opacity-80">{f.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={download} disabled={selected.length === 0}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
