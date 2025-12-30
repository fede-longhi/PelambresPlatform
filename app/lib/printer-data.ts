'use server';

import postgres from 'postgres';
import { Printer } from '../../types/definitions';
import { ITEMS_PER_PAGE } from '@/lib/consts';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchFilteredPrinters(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    try {
        const data = await sql<Printer[]>`
        SELECT
            id,
            name,
            brand,
            model,
            power_consumption,
            size_x,
            size_y,
            size_z,
            status
        FROM printers
        WHERE
            name ILIKE ${`%${query}%`} OR
            brand ILIKE ${`%${query}%`} OR
            model ILIKE ${`%${query}%`}
        ORDER BY name
        LIMIT ${ITEMS_PER_PAGE}
        OFFSET ${offset}
        `;

        return data;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch printer table.');
    }
}

export async function fetchPrintersPages(query: string) {
    try {
        const data = await sql`
        SELECT
            COUNT(*)
        FROM printers
        WHERE
            name ILIKE ${`%${query}%`} OR
            brand ILIKE ${`%${query}%`} OR
            model ILIKE ${`%${query}%`}
        `;

        const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch printer pages.');
    }
    }

    export async function fetchPrinterById(id: string) {
    try {
        const data = await sql<Printer[]>`
        SELECT
            id,
            name,
            brand,
            model,
            power_consumption,
            size_x,
            size_y,
            size_z,
            status
        FROM printers
        WHERE id = ${id}
        LIMIT 1
        `;
        return data[0];
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch printer.');
    }
}
