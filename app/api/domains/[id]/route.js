import { connectDB } from '@/lib/db';
import Domain from '@/lib/models/Domain';
import { json, handle } from '@/lib/http';
import { cleanBody, serialize } from '@/lib/domainUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req, { params }) => {
  const { id } = await params;
  await connectDB();
  const doc = await Domain.findById(id).lean();
  if (!doc) return json({ error: 'Domain not found' }, 404);
  return json({ domain: serialize(doc) });
});

export const PUT = handle(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { errors, data } = cleanBody(body);
  if (errors.length) return json({ error: errors.join('. ') }, 400);

  await connectDB();
  const doc = await Domain.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!doc) return json({ error: 'Domain not found' }, 404);
  return json({ domain: serialize(doc) });
});

export const DELETE = handle(async (_req, { params }) => {
  const { id } = await params;
  await connectDB();
  const doc = await Domain.findByIdAndDelete(id).lean();
  if (!doc) return json({ error: 'Domain not found' }, 404);
  return json({ ok: true });
});
