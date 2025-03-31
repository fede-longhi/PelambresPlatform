'use server';

import postgres from 'postgres';
import { Customer } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const ITEMS_PER_PAGE = 6;

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