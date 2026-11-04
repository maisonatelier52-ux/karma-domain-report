import { NextResponse } from 'next/server';

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

// Wrap a route handler so errors always come back as JSON.
export function handle(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      console.error(err);
      const msg = err?.name === 'CastError' ? 'Invalid id' : err?.message || 'Server error';
      const status = err?.name === 'CastError' ? 400 : 500;
      return json({ error: msg }, status);
    }
  };
}
