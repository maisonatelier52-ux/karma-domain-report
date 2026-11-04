// Helpers shared by the API, report generators and UI.
import { SITE_TYPES } from '@/lib/fields';

function canonicalSiteType(value) {
  const v = String(value || '').trim().toLowerCase();
  return SITE_TYPES.find((t) => t.toLowerCase() === v) || '';
}

export function getDomainName(url) {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return String(url || '').trim().toLowerCase();
  }
}

export function normalizeUrl(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Convert a mongoose lean doc to a plain JSON-safe object.
export function serialize(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    domainName: doc.domainName || getDomainName(doc.domainLink),
    domainLink: doc.domainLink,
    domainLive: !!doc.domainLive,
    doneBy: doc.doneBy,
    siteType: canonicalSiteType(doc.siteType),
    clientArticles: doc.clientArticles || [],
    vercelLink: doc.vercelLink || '',
    githubLink: doc.githubLink || '',
    searchConsoleLink: doc.searchConsoleLink || '',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

// Validate + clean the request body for create / update.
export function cleanBody(body) {
  const errors = [];
  const domainLink = normalizeUrl(body.domainLink);
  const doneBy = String(body.doneBy || '').trim();
  let domainLive = body.domainLive;
  if (domainLive === 'true') domainLive = true;
  if (domainLive === 'false') domainLive = false;

  if (!domainLink) errors.push('Domain link is required');
  if (typeof domainLive !== 'boolean') errors.push('Please choose whether the domain is live or not');
  if (!doneBy) errors.push('Done by is required');

  const rawType = String(body.siteType || '').trim();
  const siteType = canonicalSiteType(rawType);
  if (rawType && !siteType) errors.push('Invalid site type');

  let articles = body.clientArticles;
  if (typeof articles === 'string') articles = articles.split(/[\n,]+/);
  if (!Array.isArray(articles)) articles = [];
  articles = articles.map((a) => normalizeUrl(a)).filter(Boolean);

  return {
    errors,
    data: {
      domainName: getDomainName(domainLink),
      domainLink,
      domainLive,
      doneBy,
      siteType,
      clientArticles: articles,
      vercelLink: normalizeUrl(body.vercelLink),
      githubLink: normalizeUrl(body.githubLink),
      searchConsoleLink: normalizeUrl(body.searchConsoleLink),
    },
  };
}