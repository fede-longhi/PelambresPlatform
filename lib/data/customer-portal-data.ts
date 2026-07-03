import sql from '@/lib/db';
import type { Customer } from '@/types/definitions';
import type { OrderStatus } from '@/types/order-definitions';

export type CustomerPortalOrder = {
  id: string;
  created_date: string;
  estimated_date: string;
  status: OrderStatus;
  tracking_code: string;
  amount: number;
};

export async function fetchCustomerIdForUser(
  userId: string,
  email: string
): Promise<string | null> {
  try {
    const rows = await sql<{ customer_id: string | null }[]>`
      SELECT customer_id
      FROM users
      WHERE id = ${userId}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (rows[0]?.customer_id) {
      return rows[0].customer_id;
    }

    const customers = await sql<{ id: string }[]>`
      SELECT id
      FROM customers
      WHERE lower(trim(email)) = lower(trim(${email}))
      LIMIT 1
    `;

    return customers[0]?.id ?? null;
  } catch (error) {
    console.error('Failed to resolve customer for user:', error);
    throw new Error('Failed to resolve customer for user.');
  }
}

export async function fetchLinkedCustomerForUser(
  userId: string,
  email: string
): Promise<Customer | undefined> {
  const customerId = await fetchCustomerIdForUser(userId, email);

  if (!customerId) {
    return undefined;
  }

  try {
    const rows = await sql<Customer[]>`
      SELECT id, name, first_name, last_name, email, phone, type
      FROM customers
      WHERE id = ${customerId}
      LIMIT 1
    `;

    return rows[0];
  } catch (error) {
    console.error('Failed to fetch linked customer:', error);
    throw new Error('Failed to fetch linked customer.');
  }
}

export async function fetchCustomerPortalOrders(customerId: string) {
  try {
    return await sql<CustomerPortalOrder[]>`
      SELECT
        id,
        created_date,
        estimated_date,
        status,
        tracking_code,
        amount
      FROM orders
      WHERE customer_id = ${customerId}
      ORDER BY created_date DESC
    `;
  } catch (error) {
    console.error('Failed to fetch customer portal orders:', error);
    throw new Error('Failed to fetch orders.');
  }
}

export async function fetchCustomerPortalOrderById(customerId: string, orderId: string) {
  try {
    const rows = await sql<CustomerPortalOrder[]>`
      SELECT
        id,
        created_date,
        estimated_date,
        status,
        tracking_code,
        amount
      FROM orders
      WHERE id = ${orderId}
        AND customer_id = ${customerId}
      LIMIT 1
    `;

    return rows[0];
  } catch (error) {
    console.error('Failed to fetch customer portal order:', error);
    throw new Error('Failed to fetch order.');
  }
}
