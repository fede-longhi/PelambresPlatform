import { OrderTable } from "./definitions";
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredOrders(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const quotes = await sql<OrderTable[]>`
      SELECT
        orders.id,
        orders.created_date,
        orders.estimated_date,
        orders.status,
        orders.tracking_code,
        orders.amount,
        customers.first_name,
        customers.last_name,
        customers.name,
        customers.type
      FROM orders
      JOIN customers ON orders.customer_id = customers.id
      WHERE
        orders.status ILIKE ${`%${query}%`} OR
        orders.tracking_code ILIKE ${`%${query}%`} OR
        customers.first_name ILIKE ${`%${query}%`} OR
        customers.last_name ILIKE ${`%${query}%`} OR
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      ORDER BY orders.created_date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return quotes;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quotes.');
  }
}

export async function fetchOrdersPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM orders
    JOIN customers ON orders.customer_id = customers.id
    WHERE
        orders.status ILIKE ${`%${query}%`} OR
        orders.tracking_code ILIKE ${`%${query}%`} OR
        customers.first_name ILIKE ${`%${query}%`} OR
        customers.last_name ILIKE ${`%${query}%`} OR
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of quotes.');
  }
}

export async function fetchOrderDetailByTrackingCode(code: string) {
    try {
        const order = await sql`SELECT
            orders.id,
            orders.created_date,
            orders.estimated_date,
            orders.status,
            orders.tracking_code,
            orders.amount,
            customers.first_name,
            customers.last_name,
            customers.name,
            customers.type
        FROM orders
        JOIN customers ON orders.customer_id = customers.id
        WHERE
            orders.tracking_code = ${code}
        `;
        return order;
    } catch (error) {
        console.error('Database Error: ', error);
        throw new Error('Failed to fetch order.');
    }
}

export async function fetchLastOrderDetail() {
    try {
        const order = await sql`SELECT
            orders.id,
            orders.created_date,
            orders.estimated_date,
            orders.status,
            orders.tracking_code,
            orders.amount,
            customers.first_name,
            customers.last_name,
            customers.name,
            customers.type
        FROM orders
        JOIN customers ON orders.customer_id = customers.id
        WHERE orders.status != 'delivered'
        ORDER BY orders.created_date DESC
        LIMIT 1
        `;
        return order;
    } catch (error) {
        console.error('Database Error: ', error);
        throw new Error('Failed to fetch order.');
    }
}