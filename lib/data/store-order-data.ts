import sql from '@/lib/db';
import { ITEMS_PER_PAGE } from '@/lib/consts';
import type {
  StoreOrder,
  StoreOrderItem,
  StoreOrderTableRow,
} from '@/types/store-definitions';

export async function fetchStoreOrderById(
  id: string
): Promise<StoreOrder | null> {
  try {
    const rows = await sql<Omit<StoreOrder, 'items'>[]>`
      SELECT
        id,
        customer_id as "customerId",
        buyer_email as "buyerEmail",
        buyer_name as "buyerName",
        status,
        currency,
        total_cents as "totalCents",
        mp_preference_id as "mpPreferenceId",
        mp_payment_id as "mpPaymentId",
        paid_at as "paidAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM store_orders
      WHERE id = ${id}
      LIMIT 1
    `;

    const order = rows[0];
    if (!order) {
      return null;
    }

    const items = await sql<StoreOrderItem[]>`
      SELECT
        id,
        order_id as "orderId",
        product_id as "productId",
        product_type as "productType",
        name,
        unit_price_cents as "unitPriceCents",
        discount_percent as "discountPercent",
        quantity,
        line_total_cents as "lineTotalCents",
        created_at as "createdAt"
      FROM store_order_items
      WHERE order_id = ${order.id}
      ORDER BY created_at ASC
    `;

    return { ...order, items };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store order.');
  }
}

export async function fetchFilteredStoreOrders(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const search = `%${query}%`;

  try {
    return await sql<StoreOrderTableRow[]>`
      SELECT
        o.id,
        o.buyer_email as "buyerEmail",
        o.buyer_name as "buyerName",
        o.status,
        o.currency,
        o.total_cents as "totalCents",
        i.name as "itemName",
        i.product_type as "productType",
        o.mp_payment_id as "mpPaymentId",
        o.paid_at as "paidAt",
        o.created_at as "createdAt"
      FROM store_orders o
      LEFT JOIN LATERAL (
        SELECT name, product_type
        FROM store_order_items
        WHERE order_id = o.id
        ORDER BY created_at ASC
        LIMIT 1
      ) i ON true
      WHERE
        o.buyer_email ILIKE ${search}
        OR o.buyer_name ILIKE ${search}
        OR o.status ILIKE ${search}
        OR COALESCE(i.name, '') ILIKE ${search}
        OR COALESCE(o.mp_payment_id, '') ILIKE ${search}
        OR o.id::text ILIKE ${search}
      ORDER BY o.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store orders.');
  }
}

export async function fetchStoreOrderPages(query: string) {
  const search = `%${query}%`;

  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM store_orders o
      LEFT JOIN LATERAL (
        SELECT name
        FROM store_order_items
        WHERE order_id = o.id
        ORDER BY created_at ASC
        LIMIT 1
      ) i ON true
      WHERE
        o.buyer_email ILIKE ${search}
        OR o.buyer_name ILIKE ${search}
        OR o.status ILIKE ${search}
        OR COALESCE(i.name, '') ILIKE ${search}
        OR COALESCE(o.mp_payment_id, '') ILIKE ${search}
        OR o.id::text ILIKE ${search}
    `;

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch store order pages.');
  }
}
