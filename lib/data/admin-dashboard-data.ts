import sql from '@/lib/db';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import { formatQuoteNumber } from '@/lib/consts/quote-document-consts';
import { getOrderStatusLabel } from '@/lib/consts/order-list-consts';
import { getOrderPaymentStatusLabel } from '@/lib/consts/order-payment-consts';
import {
  QUOTE_REQUEST_STATUS_LABELS,
  type QuoteRequestStatus,
} from '@/lib/consts/quote-request-consts';

export type AdminDashboardWorkItemKind =
  | 'quote_open'
  | 'store_payment_review'
  | 'order_overdue'
  | 'quote_accepted_without_order'
  | 'order_unpaid'
  | 'order_open';

export type AdminDashboardWorkItem = {
  id: string;
  kind: AdminDashboardWorkItemKind;
  title: string;
  subtitle: string;
  href: string;
};

export type AdminDashboardData = {
  kpis: {
    unlinkedQuoteCount: number;
    activeCustomOrderCount: number;
    unpaidCustomOrderCount: number;
    acceptedQuoteWithoutOrderCount: number;
    paymentReviewCount: number;
    overdueOrderCount: number;
  };
  sales: {
    monthLabel: string;
    previousMonthLabel: string;
    customCollectedCents: number;
    storePaidCents: number;
    previousCustomCollectedCents: number;
    previousStorePaidCents: number;
    customOutstandingCents: number;
    storePendingCents: number;
  };
  workItems: AdminDashboardWorkItem[];
};

type CountRow = { count: number | string };
type SumRow = { total: number | string | null };

type QuoteRow = {
  id: string;
  date: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  email: string;
  status: string;
};

type StoreReviewRow = {
  id: string;
  buyerName: string;
  itemName: string | null;
};

type OpenOrderRow = {
  id: string;
  tracking_code: string;
  status: string;
  paymentStatus: string;
  estimated_date: string;
  isOverdue: boolean;
  remainingCents: number;
  customer_name: string | null;
};

type AcceptedQuoteRow = {
  id: string;
  quoteNumber: number;
  revision: number;
  clientName: string;
  totalCents: number;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function utcMonthRange(year: number, monthIndex: number) {
  const start = new Date(Date.UTC(year, monthIndex, 1)).toISOString();
  const end = new Date(Date.UTC(year, monthIndex + 1, 1)).toISOString();
  return { start, end };
}

function monthLabel(year: number, monthIndex: number) {
  const label = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, monthIndex, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function quoteDisplayName(quote: QuoteRow) {
  if (quote.first_name || quote.last_name) {
    return [quote.last_name, quote.first_name].filter(Boolean).join(', ');
  }

  return quote.name || quote.email || 'Sin nombre';
}

function openOrderKind(order: OpenOrderRow): AdminDashboardWorkItemKind {
  if (order.isOverdue) {
    return 'order_overdue';
  }

  if (
    (order.status === 'finished' || order.status === 'delivered') &&
    order.paymentStatus !== 'paid'
  ) {
    return 'order_unpaid';
  }

  return 'order_open';
}

function openOrderSubtitle(order: OpenOrderRow) {
  const parts = [
    order.isOverdue
      ? `Estimada ${formatDateToLocal(order.estimated_date, 'es-AR')}`
      : null,
    getOrderStatusLabel(order.status),
    order.customer_name,
    order.paymentStatus !== 'paid'
      ? getOrderPaymentStatusLabel(order.paymentStatus)
      : null,
    order.paymentStatus !== 'paid' && order.remainingCents > 0
      ? formatCurrency(toNumber(order.remainingCents))
      : null,
  ];

  return parts.filter(Boolean).join(' · ');
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const now = new Date();
  const year = now.getUTCFullYear();
  const monthIndex = now.getUTCMonth();
  const previous = new Date(Date.UTC(year, monthIndex - 1, 1));
  const previousYear = previous.getUTCFullYear();
  const previousMonthIndex = previous.getUTCMonth();

  const currentRange = utcMonthRange(year, monthIndex);
  const previousRange = utcMonthRange(previousYear, previousMonthIndex);

  try {
    const [
      unlinkedQuotesCount,
      activeCustomOrdersCount,
      unpaidCustomOrdersCount,
      acceptedQuoteWithoutOrderCount,
      paymentReviewCount,
      overdueOrdersCount,
      customCollected,
      storePaid,
      previousCustomCollected,
      previousStorePaid,
      customOutstanding,
      storePending,
      unlinkedQuotes,
      paymentReviews,
      openOrders,
      acceptedQuotes,
    ] = await Promise.all([
      sql<CountRow[]>`
        SELECT COUNT(*) AS count
        FROM quote_requests
        WHERE customer_id IS NULL
          AND date >= NOW() - INTERVAL '14 days'
          AND status IN ('new', 'in_progress')
      `,
      sql<CountRow[]>`
        SELECT COUNT(*) AS count
        FROM orders
        WHERE status IN ('pending', 'in progress')
          AND deleted_at IS NULL
      `,
      sql<CountRow[]>`
        SELECT COUNT(*) AS count
        FROM orders
        WHERE payment_status IN ('pending', 'deposit', 'partial')
          AND status <> 'cancelled'
          AND deleted_at IS NULL
      `,
      sql<CountRow[]>`
        SELECT COUNT(*) AS count
        FROM quotes
        LEFT JOIN orders
          ON orders.quote_id = quotes.id
          AND orders.deleted_at IS NULL
        WHERE quotes.status = 'accepted'
          AND quotes.deleted_at IS NULL
          AND orders.id IS NULL
      `,
      sql<CountRow[]>`
        SELECT COUNT(*) AS count
        FROM store_orders
        WHERE status = 'payment_review'
      `,
      sql<CountRow[]>`
        SELECT COUNT(*) AS count
        FROM orders
        WHERE status NOT IN ('delivered', 'cancelled')
          AND estimated_date < CURRENT_DATE
          AND deleted_at IS NULL
      `,
      sql<SumRow[]>`
        SELECT COALESCE(SUM(order_payments.amount_cents), 0) AS total
        FROM order_payments
        JOIN orders ON orders.id = order_payments.order_id
        WHERE order_payments.deleted_at IS NULL
          AND orders.deleted_at IS NULL
          AND order_payments.paid_at >= ${currentRange.start}::timestamptz
          AND order_payments.paid_at < ${currentRange.end}::timestamptz
      `,
      sql<SumRow[]>`
        SELECT COALESCE(SUM(total_cents), 0) AS total
        FROM store_orders
        WHERE status = 'paid'
          AND currency = 'ARS'
          AND COALESCE(paid_at, created_at) >= ${currentRange.start}::timestamptz
          AND COALESCE(paid_at, created_at) < ${currentRange.end}::timestamptz
      `,
      sql<SumRow[]>`
        SELECT COALESCE(SUM(order_payments.amount_cents), 0) AS total
        FROM order_payments
        JOIN orders ON orders.id = order_payments.order_id
        WHERE order_payments.deleted_at IS NULL
          AND orders.deleted_at IS NULL
          AND order_payments.paid_at >= ${previousRange.start}::timestamptz
          AND order_payments.paid_at < ${previousRange.end}::timestamptz
      `,
      sql<SumRow[]>`
        SELECT COALESCE(SUM(total_cents), 0) AS total
        FROM store_orders
        WHERE status = 'paid'
          AND currency = 'ARS'
          AND COALESCE(paid_at, created_at) >= ${previousRange.start}::timestamptz
          AND COALESCE(paid_at, created_at) < ${previousRange.end}::timestamptz
      `,
      sql<SumRow[]>`
        SELECT COALESCE(SUM(amount - paid_amount_cents), 0) AS total
        FROM orders
        WHERE payment_status IN ('pending', 'deposit', 'partial')
          AND status <> 'cancelled'
          AND deleted_at IS NULL
      `,
      sql<SumRow[]>`
        SELECT COALESCE(SUM(total_cents), 0) AS total
        FROM store_orders
        WHERE status IN ('pending', 'payment_review')
          AND currency = 'ARS'
      `,
      sql<QuoteRow[]>`
        SELECT
          id,
          date,
          first_name,
          last_name,
          name,
          email,
          status
        FROM quote_requests
        WHERE status IN ('new', 'in_progress')
        ORDER BY date DESC
      `,
      sql<StoreReviewRow[]>`
        SELECT
          o.id,
          o.buyer_name AS "buyerName",
          i.name AS "itemName"
        FROM store_orders o
        LEFT JOIN LATERAL (
          SELECT name
          FROM store_order_items
          WHERE order_id = o.id
          ORDER BY created_at ASC
          LIMIT 1
        ) i ON true
        WHERE o.status = 'payment_review'
        ORDER BY o.created_at DESC
      `,
      sql<OpenOrderRow[]>`
        SELECT
          orders.id,
          orders.tracking_code,
          orders.status,
          orders.payment_status AS "paymentStatus",
          orders.estimated_date,
          (
            orders.status NOT IN ('delivered', 'cancelled')
            AND orders.estimated_date < CURRENT_DATE
          ) AS "isOverdue",
          (orders.amount - orders.paid_amount_cents) AS "remainingCents",
          CASE
            WHEN customers.type = 'person'
              THEN TRIM(CONCAT(COALESCE(customers.last_name, ''), ', ', COALESCE(customers.first_name, '')))
            ELSE customers.name
          END AS customer_name
        FROM orders
        LEFT JOIN customers ON orders.customer_id = customers.id
        WHERE orders.deleted_at IS NULL
          AND orders.status <> 'cancelled'
          AND NOT (
            orders.status = 'delivered'
            AND orders.payment_status = 'paid'
          )
        ORDER BY
          CASE
            WHEN orders.status NOT IN ('delivered', 'cancelled')
              AND orders.estimated_date < CURRENT_DATE THEN 0
            ELSE 1
          END,
          orders.estimated_date ASC NULLS LAST,
          orders.created_date DESC
      `,
      sql<AcceptedQuoteRow[]>`
        SELECT
          quotes.id,
          quotes.quote_number as "quoteNumber",
          quotes.revision,
          quotes.client_name as "clientName",
          quotes.total_cents as "totalCents"
        FROM quotes
        LEFT JOIN orders
          ON orders.quote_id = quotes.id
          AND orders.deleted_at IS NULL
        WHERE quotes.status = 'accepted'
          AND quotes.deleted_at IS NULL
          AND orders.id IS NULL
        ORDER BY quotes.updated_at DESC
      `,
    ]);

    const workItems: AdminDashboardWorkItem[] = [
      ...paymentReviews.map((order) => ({
        id: `store-${order.id}`,
        kind: 'store_payment_review' as const,
        title: order.buyerName,
        subtitle: order.itemName
          ? `Comprobante en revisión · ${order.itemName}`
          : 'Comprobante de transferencia en revisión',
        href: `/admin/store-orders/${order.id}`,
      })),
      ...openOrders.map((order) => ({
        id: `order-${order.id}`,
        kind: openOrderKind(order),
        title: order.tracking_code,
        subtitle: openOrderSubtitle(order),
        href: `/admin/orders/${order.id}`,
      })),
      ...acceptedQuotes.map((quote) => ({
        id: `accepted-quote-${quote.id}`,
        kind: 'quote_accepted_without_order' as const,
        title: quote.clientName || 'Sin cliente',
        subtitle: `Presupuesto Nº ${formatQuoteNumber(quote.quoteNumber, Number(quote.revision))} · ${formatCurrency(toNumber(quote.totalCents))}`,
        href: `/admin/quotes/${quote.id}`,
      })),
      ...unlinkedQuotes.map((quote) => ({
        id: `quote-${quote.id}`,
        kind: 'quote_open' as const,
        title: quoteDisplayName(quote),
        subtitle:
          QUOTE_REQUEST_STATUS_LABELS[quote.status as QuoteRequestStatus] ??
          quote.status,
        href: `/admin/quote-requests/${quote.id}`,
      })),
    ];

    return {
      kpis: {
        unlinkedQuoteCount: toNumber(unlinkedQuotesCount[0]?.count),
        activeCustomOrderCount: toNumber(activeCustomOrdersCount[0]?.count),
        unpaidCustomOrderCount: toNumber(unpaidCustomOrdersCount[0]?.count),
        acceptedQuoteWithoutOrderCount: toNumber(
          acceptedQuoteWithoutOrderCount[0]?.count
        ),
        paymentReviewCount: toNumber(paymentReviewCount[0]?.count),
        overdueOrderCount: toNumber(overdueOrdersCount[0]?.count),
      },
      sales: {
        monthLabel: monthLabel(year, monthIndex),
        previousMonthLabel: monthLabel(previousYear, previousMonthIndex),
        customCollectedCents: toNumber(customCollected[0]?.total),
        storePaidCents: toNumber(storePaid[0]?.total),
        previousCustomCollectedCents: toNumber(previousCustomCollected[0]?.total),
        previousStorePaidCents: toNumber(previousStorePaid[0]?.total),
        customOutstandingCents: toNumber(customOutstanding[0]?.total),
        storePendingCents: toNumber(storePending[0]?.total),
      },
      workItems,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch admin dashboard.');
  }
}

export type AdminNavBadgeCounts = {
  '/admin/quote-requests': number;
  '/admin/quotes': number;
  '/admin/store-orders': number;
  '/admin/print-jobs': number;
  '/admin/orders': number;
};

export async function fetchAdminNavBadges(): Promise<AdminNavBadgeCounts> {
  try {
    const [openQuotes, acceptedWithoutOrder, paymentReviews, activePrintJobs, unpaidOrders] =
      await Promise.all([
        sql<CountRow[]>`
          SELECT COUNT(*) AS count
          FROM quote_requests
          WHERE status IN ('new', 'in_progress')
        `,
        sql<CountRow[]>`
          SELECT COUNT(*) AS count
          FROM quotes
          LEFT JOIN orders
            ON orders.quote_id = quotes.id
            AND orders.deleted_at IS NULL
          WHERE quotes.status = 'accepted'
            AND quotes.deleted_at IS NULL
            AND orders.id IS NULL
        `,
        sql<CountRow[]>`
          SELECT COUNT(*) AS count
          FROM store_orders
          WHERE status = 'payment_review'
        `,
        sql<CountRow[]>`
          SELECT COUNT(*) AS count
          FROM print_jobs
          WHERE status IN ('pending', 'printing', 'postprocess')
        `,
        sql<CountRow[]>`
          SELECT COUNT(*) AS count
          FROM orders
          WHERE payment_status IN ('pending', 'deposit', 'partial')
            AND status <> 'cancelled'
            AND deleted_at IS NULL
        `,
      ]);

    return {
      '/admin/quote-requests': toNumber(openQuotes[0]?.count),
      '/admin/quotes': toNumber(acceptedWithoutOrder[0]?.count),
      '/admin/store-orders': toNumber(paymentReviews[0]?.count),
      '/admin/print-jobs': toNumber(activePrintJobs[0]?.count),
      '/admin/orders': toNumber(unpaidOrders[0]?.count),
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      '/admin/quote-requests': 0,
      '/admin/quotes': 0,
      '/admin/store-orders': 0,
      '/admin/print-jobs': 0,
      '/admin/orders': 0,
    };
  }
}
