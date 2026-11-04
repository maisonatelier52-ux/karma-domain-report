import { connectDB } from '@/lib/db';
import Domain from '@/lib/models/Domain';
import { json, handle } from '@/lib/http';
import { cleanBody, serialize } from '@/lib/domainUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  await connectDB();
  const docs = await Domain.find().sort({ createdAt: -1 }).lean();
  return json({ domains: docs.map(serialize) });
});

export const POST = handle(async (req) => {
  const body = await req.json().catch(() => ({}));
  const { errors, data } = cleanBody(body);
  if (errors.length) return json({ error: errors.join('. ') }, 400);

  await connectDB();
  const doc = await Domain.create(data);
  return json({ domain: serialize(doc.toObject()) }, 201);
});
