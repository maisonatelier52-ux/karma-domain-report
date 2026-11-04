// Fields that can be included in a report. The domain name is always the section heading.
export const REPORT_FIELDS = [
  { key: 'domainLink', label: 'Site link' },
  { key: 'doneBy', label: 'Done by' },
  { key: 'domainLive', label: 'Domain status' },
  { key: 'clientArticles', label: 'Client articles' },
  { key: 'vercelLink', label: 'Vercel link' },
  { key: 'githubLink', label: 'GitHub link' },
  { key: 'searchConsoleLink', label: 'Google Search Console link' },
];

export const ALL_FIELD_KEYS = REPORT_FIELDS.map((f) => f.key);

export function parseFields(str) {
  if (str === null || str === undefined) return ALL_FIELD_KEYS;
  const wanted = String(str)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ALL_FIELD_KEYS.filter((k) => wanted.includes(k));
}

// Turn a domain into the rows shown in the 2-column report table.
// kind: 'link' | 'text' | 'status' | 'links'
export function buildRows(domain, keys) {
  return REPORT_FIELDS.filter((f) => keys.includes(f.key)).map((f) => {
    const v = domain[f.key];
    if (f.key === 'domainLive') {
      return { key: f.key, label: f.label, kind: 'status', live: !!v, values: [v ? 'Live' : 'Not live'] };
    }
    if (f.key === 'clientArticles') {
      const list = Array.isArray(v) ? v : [];
      return { key: f.key, label: f.label, kind: 'links', values: list.length ? list : ['-'] };
    }
    if (f.key === 'doneBy') {
      return { key: f.key, label: f.label, kind: 'text', values: [v || '-'] };
    }
    return { key: f.key, label: f.label, kind: v ? 'links' : 'text', values: [v || '-'] };
  });
}

export function reportStats(domains) {
  const live = domains.filter((d) => d.domainLive).length;
  return {
    total: domains.length,
    live,
    notLive: domains.length - live,
    articles: domains.reduce((n, d) => n + (d.clientArticles?.length || 0), 0),
  };
}

export function formatReportDate(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value || '';
  return `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')}`;
}
