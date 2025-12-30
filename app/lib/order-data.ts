import { Order, OrdersSummary, OrderTable } from "../../types/definitions";
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredOrders(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

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

    return orders;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch orders.');
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
        const data = await sql`
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
            LIMIT ${ITEMS_PER_PAGE}
        `;
        return data;
    } catch (error) {
        console.error('Database Error: ', error);
        throw new Error('Failed to fetch orders for customer.');
    }
}

export async function fetchOrderById(id: string) {
    try {
        const data = await sql<OrderTable[]>`
          SELECT
            orders.id,
            orders.created_date,
            orders.estimated_date,
            orders.status,
            orders.tracking_code,
            orders.amount,
            customers.id as customer_id,
            customers.first_name,
            customers.last_name,
            customers.name,
            customers.email,
            customers.phone,
            customers.type as customer_type
          FROM orders
          JOIN customers ON orders.customer_id = customers.id
          WHERE
            orders.id = ${id}
        `;

        const orders = data.map((order) => ({
            ...order,
            amount: order.amount,
        }));
    
        return orders[0];
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