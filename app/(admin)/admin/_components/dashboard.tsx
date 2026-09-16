import Link from 'next/link';
import { FileInput, FileBox, FileText, Hammer, ShoppingBag, Calculator, Plus } from 'lucide-react';
import { fetchAdminDashboard } from '@/lib/data/admin-dashboard-data';
import type {
  AdminDashboardData,
  AdminDashboardWorkItemKind,
} from '@/lib/data/admin-dashboard-data';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import PrintJobStatusField from '@/app/(admin)/admin/print-jobs/_components/status-field';

const KPI_ITEMS = [
  {
    key: 'unlinkedQuoteCount' as const,
    label: 'Solicitudes recientes sin cliente',
    href: '/admin/quote-requests',
  },
  {
    key: 'activeCustomOrderCount' as const,
    label: 'Pedidos en curso',
    href: '/admin/orders',
  },
  {
    key: 'paymentReviewCount' as const,
    label: 'Comprobantes a revisar',
    href: '/admin/store-orders',
  },
  {
    key: 'activePrintJobCount' as const,
    label: 'Trabajos activos',
    href: '/admin/print-jobs',
  },
] as const;

const WORK_ITEM_LABELS: Record<AdminDashboardWorkItemKind, string> = {
  quote_unlinked: 'Solicitud',
  store_payment_review: 'Tienda',
  order_overdue: 'Atraso',
};

function DashboardKpis({
  kpis,
}: {
  kpis: AdminDashboardData['kpis'];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {KPI_ITEMS.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="block rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {kpis[item.key]}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function WorkQueue({
  items,
  overdueCount,
}: {
  items: AdminDashboardData['workItems'];
  overdueCount: number;
}) {
  return (
    <section aria-labelledby="dashboard-queue-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="dashboard-queue-heading" className="text-lg font-semibold">
          Bandeja de hoy
        </h2>
        {overdueCount > 0 ? (
          <p className="text-sm text-destructive">
            {overdueCount} pedido{overdueCount === 1 ? '' : 's'} con fecha vencida
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay solicitudes sin cliente, comprobantes pendientes ni pedidos atrasados.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex flex-col gap-1 rounded-lg border bg-white p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {WORK_ITEM_LABELS[item.kind]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivePrintJobs({
  jobs,
}: {
  jobs: AdminDashboardData['activePrintJobs'];
}) {
  return (
    <section aria-labelledby="dashboard-jobs-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="dashboard-jobs-heading" className="text-lg font-semibold">
          Taller
        </h2>
        <Link
          href="/admin/print-jobs"
          className="text-sm text-primary hover:underline"
        >
          Ver trabajos
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay trabajos pendientes o en impresión.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/admin/print-jobs/${job.id}`}
                className="flex flex-col gap-2 rounded-lg border bg-white p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{job.name}</p>
                  {job.trackingCode ? (
                    <p className="text-sm text-muted-foreground">
                      Pedido {job.trackingCode}
                    </p>
                  ) : null}
                </div>
                <PrintJobStatusField status={job.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SalesSummary({ sales }: { sales: AdminDashboardData['sales'] }) {
  const collectedCents = sales.customDeliveredCents + sales.storePaidCents;
  const previousCollectedCents =
    sales.previousCustomDeliveredCents + sales.previousStorePaidCents;
  const inProgressCents = sales.customInProgressCents + sales.storePendingCents;

  return (
    <section
      aria-labelledby="dashboard-sales-heading"
      className="rounded-lg border bg-white p-5"
    >
      <h2 id="dashboard-sales-heading" className="text-lg font-semibold">
        Ingresos {sales.monthLabel}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cobrado en pedidos a medida entregados y compras de tienda pagadas (ARS).
      </p>

      <p className="mt-4 text-3xl font-semibold tabular-nums text-primary">
        {formatCurrency(collectedCents)}
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Pedidos a medida</dt>
          <dd className="tabular-nums">{formatCurrency(sales.customDeliveredCents)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Tienda</dt>
          <dd className="tabular-nums">{formatCurrency(sales.storePaidCents)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-2">
          <dt className="text-muted-foreground">{sales.previousMonthLabel}</dt>
          <dd className="tabular-nums">{formatCurrency(previousCollectedCents)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">En curso / pendiente</dt>
          <dd className="tabular-nums">{formatCurrency(inProgressCents)}</dd>
        </div>
      </dl>
    </section>
  );
}

function DashboardShortcuts() {
  return (
    <nav
      aria-label="Accesos rápidos"
      className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap sm:items-center"
    >
      <Button asChild variant="outline">
        <Link href="/admin/quotes/create">
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Crear presupuesto
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/admin/orders/create">
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Crear pedido
        </Link>
      </Button>
      <Link
        href="/admin/quote-requests"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <FileInput className="size-4 shrink-0" aria-hidden="true" />
        Solicitudes
      </Link>
      <Link
        href="/admin/quotes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <FileText className="size-4 shrink-0" aria-hidden="true" />
        Presupuestos
      </Link>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <FileBox className="size-4 shrink-0" aria-hidden="true" />
        Pedidos
      </Link>
      <Link
        href="/admin/store-orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ShoppingBag className="size-4 shrink-0" aria-hidden="true" />
        Pedidos de tienda
      </Link>
      <Link
        href="/admin/print-jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Hammer className="size-4 shrink-0" aria-hidden="true" />
        Trabajos
      </Link>
      <Link
        href="/admin/quote-calculator"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Calculator className="size-4 shrink-0" aria-hidden="true" />
        Cotizador
      </Link>
    </nav>
  );
}

export default async function Dashboard() {
  const dashboard = await fetchAdminDashboard();

  return (
    <div className="space-y-10">
      <DashboardKpis kpis={dashboard.kpis} />
      <WorkQueue
        items={dashboard.workItems}
        overdueCount={dashboard.kpis.overdueOrderCount}
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ActivePrintJobs jobs={dashboard.activePrintJobs} />
        <SalesSummary sales={dashboard.sales} />
      </div>
      <DashboardShortcuts />
    </div>
  );
}
