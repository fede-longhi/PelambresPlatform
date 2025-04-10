import postgres from 'postgres';
import { PrintJob } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchOrderPrintJobs(orderId: string) {
    try {
        const data = await sql<PrintJob[]>`
        SELECT
            id, name, status, order_id
        FROM print_jobs
        WHERE order_id=${orderId}
        ORDER BY 
            CASE status
                WHEN 'pending' THEN 1
                WHEN 'printing' THEN 2
                WHEN 'postprocess' THEN 3
                WHEN 'finished' THEN 4
                WHEN 'failed' THEN 5
                ELSE 6
            END,
            name`
        return data;
    } catch(error) {
        console.error(error);
        throw new Error('Failed to fetch print job data.');
    }
}