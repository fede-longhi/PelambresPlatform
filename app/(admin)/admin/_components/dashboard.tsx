import Link from 'next/link';
import { FileInput, FileBox, FileText, ShoppingBag, Calculator, Plus } from 'lucide-react';
import { fetchAdminDashboard } from '@/lib/data/admin-dashboard-data';
import type {
  AdminDashboardData,
  AdminDashboardWorkItemKind,
} from '@/lib/data/admin-dashboard-data';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const KPI_ITEMS = [
  {
    key: 'unlinkedQuoteCount' as const,
    label: 'Solicitudes sin cliente',
    href: '/admin/quote-requests',
  },
  {
    key: 'acceptedQuoteWithoutOrderCount' as const,
    label: 'Aceptados sin pedido',
    href: '/admin/quotes?filter=accepted_without_order',
  },
  {
    key: 'activeCustomOrderCount' as const,
    label: 'Pedidos activos',
    href: '/admin/orders',
  },
  {
    key: 'unpaidCustomOrderCount' as const,
    label: 'Pedidos sin pagar',
    href: '/admin/orders?filter=unpaid',
  },
  {
    key: 'paymentReviewCount' as const,
    label: 'Comprobantes a revisar',
    href: '/admin/store-orders',
  },
] as const;

const WORK_ITEM_LABELS: Record<AdminDashboardWorkItemKind, string> = {
  quote_unlinked: 'Solicitud',
  store_payment_review: 'Tienda',
  order_overdue: 'Atraso',
  quote_accepted_without_order: 'Presupuesto',
  order_unpaid: 'Cobro',
};

function DashboardKpis({
  kpis,
}: {
  kpis: AdminDashboardData['kpis'];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="dashboard-queue-heading" className="text-lg font-semibold">
            Bandeja de hoy
          </h2>
          {overdueCount > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Hay pedidos que ya pasaron la fecha estimada de entrega y todavía
              no están entregados.
            </p>
          ) : null}
        </div>
        {overdueCount > 0 ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Link href="/admin/orders?filter=overdue">
              {overdueCount === 1
                ? 'Ver 1 pedido vencido'
                : `Ver ${overdueCount} pedidos vencidos`}
            </Link>
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay cobros, presupuestos ni solicitudes pendientes de atender.
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

function SalesSummary({ sales }: { sales: AdminDashboardData['sales'] }) {
  const collectedCents = sales.customCollectedCents + sales.storePaidCents;
  const previousCollectedCents =
    sales.previousCustomCollectedCents + sales.previousStorePaidCents;
  const outstandingCents = sales.customOutstandingCents + sales.storePendingCents;

  return (
    <section
      aria-labelledby="dashboard-sales-heading"
      className="rounded-lg border bg-white p-5"
    >
      <h2 id="dashboard-sales-heading" className="text-lg font-semibold">
        Ingresos {sales.monthLabel}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pagos registrados este mes (señas, parciales y totales) y compras de
        tienda cobradas (ARS).
      </p>

      <p className="mt-4 text-3xl font-semibold tabular-nums text-primary">
        {formatCurrency(collectedCents)}
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Pedidos a medida</dt>
          <dd className="tabular-nums">{formatCurrency(sales.customCollectedCents)}</dd>
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
          <dt className="text-muted-foreground">Saldo por cobrar</dt>
          <dd className="tabular-nums">{formatCurrency(outstandingCents)}</dd>
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <WorkQueue
          items={dashboard.workItems}
          overdueCount={dashboard.kpis.overdueOrderCount}
        />
        <SalesSummary sales={dashboard.sales} />
      </div>
      <DashboardShortcuts />
    </div>
  );
}
