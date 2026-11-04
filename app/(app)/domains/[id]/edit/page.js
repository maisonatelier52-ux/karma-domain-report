'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DomainForm from '@/components/DomainForm';
import { api } from '@/lib/apiClient';

export default function EditDomainPage() {
  const { id } = useParams();
  const router = useRouter();
  const [domain, setDomain] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/domains/${id}`)
      .then((d) => setDomain(d.domain))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  if (!domain) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-maroon-900">Edit domain</h1>
        <p className="text-sm text-gray-500">{domain.domainName}</p>
      </div>
      <DomainForm
        initial={domain}
        submitLabel="Save changes"
        onCancel={() => router.push(`/domains/${id}`)}
        onSubmit={async (values) => {
          await api(`/api/domains/${id}`, { method: 'PUT', body: values });
          router.push(`/domains/${id}`);
        }}
      />
    </div>
  );
}
