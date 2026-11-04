import { connectDB } from '@/lib/db';
import Domain from '@/lib/models/Domain';
import { json, handle } from '@/lib/http';
import { serialize } from '@/lib/domainUtils';
import { parseFields } from '@/lib/fields';
import { buildPdf } from '@/lib/reports/pdf';
import { buildDocx } from '@/lib/reports/docx';
import { buildXlsx } from '@/lib/reports/xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// GET /api/report?format=pdf|docx|xlsx&fields=domainLink,doneBy,...&id=<domainId>
// No id -> report for all domains. `fields` omitted -> all fields.
export const GET = handle(async (req) => {
  const sp = new URL(req.url).searchParams;
  const format = (sp.get('format') || 'pdf').toLowerCase();
  if (!TYPES[format]) return json({ error: 'format must be pdf, docx or xlsx' }, 400);

  const fields = parseFields(sp.get('fields'));
  const id = sp.get('id');

  await connectDB();
  let docs;
  if (id) {
    const one = await Domain.findById(id).lean();
    if (!one) return json({ error: 'Domain not found' }, 404);
    docs = [one];
  } else {
    docs = await Domain.find().sort({ domainName: 1 }).lean();
  }
  const domains = docs.map(serialize);

  const args = { domains, fields, title: 'DOMAIN REPORT' };
  let body;
  if (format === 'pdf') body = Buffer.from(await buildPdf(args));
  else if (format === 'docx') body = Buffer.from(await buildDocx(args));
  else body = await buildXlsx(args);

  const stamp = new Date().toISOString().slice(0, 10);
  const name = id ? `${domains[0].domainName}-report` : `domain-report-${stamp}`;

  return new Response(body, {
    headers: {
      'Content-Type': TYPES[format],
      'Content-Disposition': `attachment; filename="${name}.${format}"`,
      'Cache-Control': 'no-store',
    },
  });
});
