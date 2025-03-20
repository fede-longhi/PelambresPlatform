'use server';

import postgres from 'postgres';
import { Customer } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });


export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<Customer[]>`
        SELECT
            id,
            name,
            first_name,
            last_name,
            email,
            phone,
            type
        FROM customers
        WHERE
            name ILIKE ${`%${query}%`} OR
            first_name ILIKE ${`%${query}%`} OR
            last_name ILIKE ${`%${query}%`}
        ORDER BY name ASC
    `;

    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}