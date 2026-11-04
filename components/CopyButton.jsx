'use client';

import { useState } from 'react';

// Small copy icon button. Copies `text` to the clipboard and shows a tick for a moment.
export default function CopyButton({ text, disabled, label = 'Copy all' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers / contexts where the Clipboard API is not available.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      title={copied ? 'Copied!' : label}
      aria-label={label}
      className="shrink-0 rounded-md p-1.5 text-maroon-700 transition hover:bg-maroon-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
        </svg>
      )}
    </button>
  );
}