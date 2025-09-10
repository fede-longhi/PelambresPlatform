'use server';

import postgres from 'postgres';
import { ConfigurationVariable } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function getAllConfiguration() {
    try {
        const data = await sql`
            SELECT id, key, value, data_type, created_at, last_modified, category, description
            FROM configuration
            ORDER BY category, key ASC
        `
        return data;
    }catch (error) {
        console.error(error);
        throw new Error('Failed to fetch confiugurations.');
    }
}

export async function getConfigurationGroupedByCategory() {
    try {
        const data = await sql<ConfigurationVariable[]>`
            SELECT id, key, value, data_type, created_at, last_modified, category, description
            FROM configuration
            ORDER BY category, key ASC
        `

        const grouped: Record<string, ConfigurationVariable[]> = {};

        
        data.forEach(row => {
            const category = row.category || 'Uncategorized'
            if (!grouped[category]) {
                grouped[category] = []
            }

            grouped[category].push(row);

        })
        return grouped; 
    }catch (error) {
        console.error(error);
        throw new Error('Failed to fetch confiugurations.');
    }
}

export async function getConfiguration(key: string) {
    try {
        const configuration = await sql<ConfigurationVariable[]>`
        SELECT id, key, value, data_type, created_at, last_modified, category, description
        FROM configuration
        WHERE key = ${key}
        LIMIT 1
        `
        return configuration[0];
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch confiugurations.');
    }
}