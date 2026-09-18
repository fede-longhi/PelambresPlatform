import { Suspense } from 'react';
import type { Metadata } from 'next';
import Dashboard from '@/app/(admin)/admin/_components/dashboard';
import PageHeader from '@/components/ui/page-header';
import { CardsSkeleton } from '@/components/shared/skeletons';

export const metadata: Metadata = {
  title: 'Inicio',
};

export default function Page() {
  return (
    <div>
      <PageHeader title="Inicio" />
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Lo que hay que atender hoy: solicitudes, presupuestos, pedidos y cobros.
      </p>
      <Suspense fallback={<CardsSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
