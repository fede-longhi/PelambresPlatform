import type { Metadata } from 'next';
import SimpleCalculator from '@/components/quote-builder/simple-calculator';
import PageHeader from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Cotizador',
};

export default function Page() {
  return (
    <div>
      <PageHeader title="Cotizador" />
      <p className="mt-2 text-sm text-muted-foreground">
        Presupuesto rápido de material y tiempo de impresión.
      </p>
      <div className="mt-6">
        <SimpleCalculator />
      </div>
    </div>
  );
}
