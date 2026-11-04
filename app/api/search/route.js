import { connectDB } from '@/lib/db';
import Domain from '@/lib/models/Domain';
import { json, handle } from '@/lib/http';
import { escapeRegex, serialize } from '@/lib/domainUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Search by domain name (e.g. "os-intel.com") or by "done by" person name.
// Returns:
//   domains: domains whose name/link matches the query
//   people:  one entry per matching person, each with the domains they did
export const GET = handle(async (req) => {
  const q = (new URL(req.url).searchParams.get('q') || '').trim();
  if (!q) return json({ domains: [], people: [] });

  await connectDB();
  const re = new RegExp(escapeRegex(q.replace(/^https?:\/\//i, '').replace(/^www\./i, '')), 'i');
  const personRe = new RegExp(escapeRegex(q), 'i');

  const [domainDocs, personDocs] = await Promise.all([
    Domain.find({ $or: [{ domainName: re }, { domainLink: re }] }).sort({ domainName: 1 }).lean(),
    Domain.find({ doneBy: personRe }).sort({ domainName: 1 }).lean(),
  ]);

  const grouped = new Map();
  for (const d of personDocs) {
    const key = d.doneBy.trim().toLowerCase();
    if (!grouped.has(key)) grouped.set(key, { name: d.doneBy.trim(), domains: [] });
    grouped.get(key).domains.push(serialize(d));
  }

  return json({
    domains: domainDocs.map(serialize),
    people: Array.from(grouped.values()),
  });
});
