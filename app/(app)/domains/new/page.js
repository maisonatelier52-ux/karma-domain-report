'use client';

import { useRouter } from 'next/navigation';
import DomainForm from '@/components/DomainForm';
import { api } from '@/lib/apiClient';

export default function NewDomainPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-maroon-900">Add domain</h1>
        <p className="text-sm text-gray-500">Fields marked * are required.</p>
      </div>
      <DomainForm
        submitLabel="Add domain"
        onCancel={() => router.push('/')}
        onSubmit={async (values) => {
          const { domain } = await api('/api/domains', { method: 'POST', body: values });
          router.push(`/domains/${domain.id}`);
        }}
      />
    </div>
  );
}
