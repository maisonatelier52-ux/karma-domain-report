import { json } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

function isPrivateHost(hostname) {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h === '0.0.0.0' ||
    h === '[::1]'
  );
}

function decode(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function metaContent(html, names) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const name of names) {
    for (const tag of tags) {
      const keyMatch = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i);
      if (!keyMatch || keyMatch[1].toLowerCase() !== name) continue;
      const c = tag.match(/\bcontent\s*=\s*"([^"]*)"/i) || tag.match(/\bcontent\s*=\s*'([^']*)'/i);
      if (c && c[1]) return decode(c[1]).trim();
    }
  }
  return '';
}

// GET /api/og?url=<article url>  ->  { image, title, description, siteName }
export async function GET(req) {
  const target = new URL(req.url).searchParams.get('url') || '';
  let u;
  try {
    u = new URL(target);
  } catch {
    return json({ error: 'Invalid url' }, 400);
  }
  if (!/^https?:$/.test(u.protocol) || isPrivateHost(u.hostname)) {
    return json({ error: 'URL not allowed' }, 400);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(u.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DomainReportBot/1.0; +link-preview)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return json({ image: '', title: '', description: '', siteName: '' });

    // Only read the first ~300KB – OG tags live in <head>.
    const text = (await res.text()).slice(0, 300000);
    let image = metaContent(text, ['og:image', 'og:image:url', 'twitter:image', 'twitter:image:src']);
    if (image) {
      try {
        image = new URL(image, res.url || u.toString()).toString();
      } catch {
        image = '';
      }
    }
    const title =
      metaContent(text, ['og:title', 'twitter:title']) ||
      decode((text.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '').trim();
    const description = metaContent(text, ['og:description', 'twitter:description', 'description']);
    const siteName = metaContent(text, ['og:site_name']);

    const out = json({ image, title, description, siteName });
    out.headers.set('Cache-Control', 'private, max-age=3600');
    return out;
  } catch {
    return json({ image: '', title: '', description: '', siteName: '' });
  }
}
