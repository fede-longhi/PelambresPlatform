'use server';

import postgres from 'postgres';
import { Filament } from '../../types/definitions';
import { ITEMS_PER_PAGE } from '@/lib/consts';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchFilteredFilaments(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const data = await sql<Filament[]>`
        SELECT
            id,
            type,
            brand,
            price_per_kg
        FROM filaments
        WHERE
            type ILIKE ${`%${query}%`} OR
            brand ILIKE ${`%${query}%`}
        ORDER BY brand, type
        LIMIT ${ITEMS_PER_PAGE}
        OFFSET ${offset}
        `;

        return data;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch filament table.');
    }
}

export async function fetchFilamentsPages(query: string) {
    try {
        const data = await sql`
        SELECT COUNT(*)
        FROM filaments
        WHERE
            type ILIKE ${`%${query}%`} OR
            brand ILIKE ${`%${query}%`}
        `;

        const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch filament pages.');
    }
}

export async function fetchFilamentById(id: string) {
    try {
        const data = await sql<Filament[]>`
        SELECT
            id,
            type,
            brand, 
            price_per_kg
        FROM filaments
        WHERE id = ${id}
        LIMIT 1
        `;

        return data[0];
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch filament.');
    }
}