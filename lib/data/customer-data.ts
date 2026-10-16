'use server';

import sql from '@/lib/db';
import { Customer } from '@/types/definitions';

const ITEMS_PER_PAGE = 10;

export type CustomerStats = {
  orderCount: number;
  cancelledOrderCount: number;
  quoteCount: number;
  paidTotalCents: number;
  paidMonthCents: number;
  outstandingCents: number;
  monthLabel: string;
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
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export async function fetchFilteredCustomers(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    try {
        const data = await sql<Customer[]>`
            SELECT
                id,
                name,
                first_name,
                last_name,
                email,
                phone,
                address,
                type
            FROM customers
            WHERE
                name ILIKE ${`%${query}%`} OR
                first_name ILIKE ${`%${query}%`} OR
                last_name ILIKE ${`%${query}%`}
            ORDER BY
                CASE
                    WHEN (type = 'person')
                        THEN last_name
                    WHEN (type = 'business')
                        THEN name
                    ELSE
                        name
                END
            LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;

        return data;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch customer table.');
    }
}

export async function fetchCustomersPages(query: string) {
    try {
        const data = await sql`
            SELECT
                COUNT(*)
            FROM customers
            WHERE
                name ILIKE ${`%${query}%`} OR
                first_name ILIKE ${`%${query}%`} OR
                last_name ILIKE ${`%${query}%`}
        `;

        const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch customer pages.');
    }  
} 

export async function fetchCustomerByEmail(email: string) {
    try {
        const data = await sql<Customer[]>`
            SELECT
                id,
                name,
                first_name,
                last_name,
                email,
                phone,
                address,
                type
            FROM customers
            WHERE lower(trim(email)) = lower(trim(${email}))
            LIMIT 1
        `;
        return data[0];
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch customer by email.');
    }
}

export async function fetchCustomerById(id: string) {
    try {
        const data = await sql<Customer[]>`
            SELECT
                id,
                name,
                first_name,
                last_name,
                email,
                phone,
                address,
                type
            FROM customers
            WHERE
                id = ${id}
            LIMIT 1;
        `;
        return data[0];
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch customer.');
    }
}

export async function fetchCustomerStats(customerId: string): Promise<CustomerStats> {
  const now = new Date();
  const year = now.getUTCFullYear();
  const monthIndex = now.getUTCMonth();
  const { start, end } = utcMonthRange(year, monthIndex);

  try {
    const [orderStats, paidMonthRows, quoteRows] = await Promise.all([
      sql<{
        orderCount: number | string;
        cancelledOrderCount: number | string;
        paidTotalCents: number | string | null;
        outstandingCents: number | string | null;
      }[]>`
        SELECT
          COUNT(*) FILTER (WHERE status <> 'cancelled') AS "orderCount",
          COUNT(*) FILTER (WHERE status = 'cancelled') AS "cancelledOrderCount",
          COALESCE(
            SUM(paid_amount_cents) FILTER (WHERE status <> 'cancelled'),
            0
          ) AS "paidTotalCents",
          COALESCE(
            SUM(amount - paid_amount_cents) FILTER (
              WHERE status <> 'cancelled'
                AND payment_status IN ('pending', 'deposit', 'partial')
            ),
            0
          ) AS "outstandingCents"
        FROM orders
        WHERE customer_id = ${customerId}
          AND deleted_at IS NULL
      `,
      sql<{ paidMonthCents: number | string | null }[]>`
        SELECT COALESCE(SUM(order_payments.amount_cents), 0) AS "paidMonthCents"
        FROM order_payments
        JOIN orders ON orders.id = order_payments.order_id
        WHERE orders.customer_id = ${customerId}
          AND order_payments.deleted_at IS NULL
          AND orders.deleted_at IS NULL
          AND orders.status <> 'cancelled'
          AND order_payments.paid_at >= ${start}::timestamptz
          AND order_payments.paid_at < ${end}::timestamptz
      `,
      sql<{ quoteCount: number | string }[]>`
        SELECT COUNT(*) AS "quoteCount"
        FROM quotes
        WHERE customer_id = ${customerId}
          AND deleted_at IS NULL
      `,
    ]);

    const orderRow = orderStats[0];
    return {
      orderCount: toNumber(orderRow?.orderCount),
      cancelledOrderCount: toNumber(orderRow?.cancelledOrderCount),
      quoteCount: toNumber(quoteRows[0]?.quoteCount),
      paidTotalCents: toNumber(orderRow?.paidTotalCents),
      paidMonthCents: toNumber(paidMonthRows[0]?.paidMonthCents),
      outstandingCents: toNumber(orderRow?.outstandingCents),
      monthLabel: monthLabel(year, monthIndex),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer stats.');
  }
}