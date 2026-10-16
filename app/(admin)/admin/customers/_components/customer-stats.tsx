import type { CustomerStats } from '@/lib/data/customer-data';
import { formatCurrency } from '@/lib/utils';

export default function CustomerStatsCards({ stats }: { stats: CustomerStats }) {
  const items = [
    {
      label: 'Pedidos',
      value: String(stats.orderCount),
    },
    {
      label: 'Cobrado total',
      value: formatCurrency(stats.paidTotalCents),
    },
    {
      label: `Cobrado ${stats.monthLabel}`,
      value: formatCurrency(stats.paidMonthCents),
    },
    {
      label: 'Por cobrar',
      value: formatCurrency(stats.outstandingCents),
    },
    {
      label: 'Presupuestos',
      value: String(stats.quoteCount),
    },
    {
      label: 'Cancelados',
      value: String(stats.cancelledOrderCount),
    },
  ];

  return (
    <section aria-label="Resumen del cliente">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-card px-3 py-3 shadow-sm"
          >
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums sm:text-lg">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
