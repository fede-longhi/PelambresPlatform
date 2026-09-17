import { Order, OrdersSummary, OrderTable, PrintJobOrderOption } from "@/types/definitions";
import type { OrderStatus } from '@/types/order-definitions';
import sql from '@/lib/db';
import {
  DEFAULT_ORDER_LIST_FILTER,
  parseOrderListFilter,
  type OrderListFilter,
} from '@/lib/consts/order-list-consts';

export { parseOrderListFilter, DEFAULT_ORDER_LIST_FILTER };
export type { OrderListFilter };

const ITEMS_PER_PAGE = 12;
const CUSTOMER_ORDERS_LIMIT = 6;

function buildOrderFilterSql(filter: OrderListFilter) {
  switch (filter) {
    case 'open':
      return sql`AND orders.status IN ('pending', 'in progress')`;
    case 'all':
      return sql``;
    default:
      return sql`AND orders.status = ${filter}`;
  }
}

export async function fetchFilteredOrders(
  query: string,
  currentPage: number,
  filter: OrderListFilter = DEFAULT_ORDER_LIST_FILTER
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const search = `%${query}%`;
  const filterSql = buildOrderFilterSql(filter);

  try {
    const orders = await sql<OrderTable[]>`
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
        customers.type as customer_type
      FROM orders
      JOIN customers ON orders.customer_id = customers.id
      LEFT JOIN quotes ON quotes.id = orders.quote_id
      WHERE (
        orders.tracking_code ILIKE ${search} OR
        customers.first_name ILIKE ${search} OR
        customers.last_name ILIKE ${search} OR
        customers.name ILIKE ${search} OR
        customers.email ILIKE ${search} OR
        CAST(quotes.quote_number AS TEXT) ILIKE ${search}
      )
      ${filterSql}
      ORDER BY orders.created_date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return orders;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch orders.');
  }
}

export async function fetchOrdersPages(
  query: string,
  filter: OrderListFilter = DEFAULT_ORDER_LIST_FILTER
) {
  const search = `%${query}%`;
  const filterSql = buildOrderFilterSql(filter);

  try {
    const data = await sql`SELECT COUNT(*)
    FROM orders
    JOIN customers ON orders.customer_id = customers.id
    LEFT JOIN quotes ON quotes.id = orders.quote_id
    WHERE (
        orders.tracking_code ILIKE ${search} OR
        customers.first_name ILIKE ${search} OR
        customers.last_name ILIKE ${search} OR
        customers.name ILIKE ${search} OR
        customers.email ILIKE ${search} OR
        CAST(quotes.quote_number AS TEXT) ILIKE ${search}
    )
    ${filterSql}
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
            customers.type as customer_type
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
        const data = await sql`SELECT
            orders.id,
            orders.created_date,
            orders.estimated_date,
            orders.status,
            orders.tracking_code,
            orders.amount,
            customers.first_name,
            customers.last_name,
            customers.name,
            customers.type as customer_type
        FROM orders
        JOIN customers ON orders.customer_id = customers.id
        WHERE orders.status != 'delivered'
        ORDER BY orders.created_date DESC
        LIMIT 1
        `;

        return data[0];
    } catch (error) {
        console.error('Database Error: ', error);
        throw new Error('Failed to fetch order.');
    }
}

export async function fetchOrdersForPrintJobSelect() {
    try {
        return await sql<PrintJobOrderOption[]>`
            SELECT
                orders.id,
                orders.tracking_code AS "trackingCode",
                CASE
                    WHEN customers.type = 'person'
                        THEN TRIM(CONCAT(COALESCE(customers.last_name, ''), ', ', COALESCE(customers.first_name, '')))
                    ELSE customers.name
                END AS "customerName"
            FROM orders
            JOIN customers ON orders.customer_id = customers.id
            WHERE orders.status IN ('pending', 'in progress', 'finished')
            ORDER BY orders.created_date DESC
            LIMIT 40
        `;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch orders for print jobs.');
    }
}

export async function fetchNewestOrder() {
    try {
        const data = await sql<Order[]>`SELECT
            orders.id,
            orders.created_date,
            orders.estimated_date,
            orders.status,
            orders.tracking_code,
            orders.amount,
            customers.first_name,
            customers.last_name,
            customers.name,
            customers.type as customer_type
        FROM orders
        JOIN customers ON orders.customer_id = customers.id
        WHERE orders.status != 'delivered'
        ORDER BY orders.created_date ASC
        LIMIT 1
        `;

        return data[0];
    } catch (error) {
        console.error('Database Error: ', error);
        throw new Error('Failed to fetch order.');
    }
}

export async function fetchCustomerOrders(id: string) {
    try {
        const data = await sql<{
            id: string;
            created_date: string;
            estimated_date: string;
            status: OrderStatus;
            tracking_code: string;
            amount: number;
        }[]>`
            SELECT
                id,
                created_date,
                estimated_date,
                status,
                tracking_code,
                amount
            FROM orders
            WHERE customer_id = ${id}
            ORDER BY created_date DESC
            LIMIT ${CUSTOMER_ORDERS_LIMIT}
        `;
        return data;
    } catch (error) {
        console.error('Database Error: ', error);
        throw new Error('Failed to fetch orders for customer.');
    }
}

export async function fetchOrderById(id: string): Promise<OrderTable | undefined> {
    try {
        const data = await sql<OrderTable[]>`
          SELECT
            orders.id,
            orders.created_date,
            orders.estimated_date,
            orders.status,
            orders.tracking_code,
            orders.amount,
            orders.quote_id,
            quotes.quote_number,
            customers.id as customer_id,
            customers.first_name,
            customers.last_name,
            customers.name,
            customers.email,
            customers.phone,
            customers.type as customer_type
          FROM orders
          JOIN customers ON orders.customer_id = customers.id
          LEFT JOIN quotes ON quotes.id = orders.quote_id
          WHERE
            orders.id = ${id}
        `;

        return data[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch order with id: ' + id + '.');
    }
}

export async function getOrderSalesValueFromMonth(month:number, year:number) {
    const start = new Date(Date.UTC(year, month, 1)).toISOString();
    const end = new Date(Date.UTC(year, month+1, 1)).toISOString();
    
    try {
        const data = await sql<OrdersSummary[]>`
            SELECT
                SUM(amount) AS total_amount
            FROM orders
            WHERE
                estimated_date >= ${start}::timestamptz
                AND estimated_date < ${end}::timestamptz
                
                AND status = 'delivered'
        `;

        const orders = data.map((order) => ({
            ...order,
            total_amount: order.total_amount
        }));
    
        return orders[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch order sales amount');
    }
}

export async function getEstimatedOrderSalesValueFromMonth(month:number, year:number) {
    const start = new Date(Date.UTC(year, month, 1)).toISOString();
    const end = new Date(Date.UTC(year, month+1, 1)).toISOString(); 
    
    try {
        const data = await sql<OrdersSummary[]>`
            SELECT
                SUM(amount) AS total_amount
            FROM orders
            WHERE
                estimated_date >= ${start}::timestamptz
                AND estimated_date < ${end}::timestamptz
        `;

        const orders = data.map((order) => ({
            ...order,
            total_amount: order.total_amount
        }));

        return orders[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch order sales amount');
    }
}

export async function getEstimatedOrdersFromMonth(month:number, year:number) {
    const start = new Date(Date.UTC(year, month, 1)).toISOString();
    const end = new Date(Date.UTC(year, month+1, 1)).toISOString();
    
    try {
        const data = await sql`
            SELECT
                amount,
                tracking_code,
                estimated_date,
                delivered_date,
                status
            FROM orders
            WHERE
                estimated_date >= ${start}::timestamptz
                AND estimated_date < ${end}::timestamptz
        `;
    
        return data;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch order sales amount');
    }
}