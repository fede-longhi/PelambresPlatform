import postgres from 'postgres';
import { PrintJob, PrintJobWithGcode } from '../../types/definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchPrintJob(id: string) {
    try {
        const data = await sql<PrintJobWithGcode[]>`
        SELECT
            print_jobs.id,
            print_jobs.name,
            print_jobs.status,
            print_jobs.order_id,
            print_jobs.estimated_printing_time,
            print_jobs.started_at,
            print_jobs.finished_at,
            files.filename AS gcode_filename,
            files.path AS gcode_path,
            files.mime_type AS gcode_mime_type,
            files.size AS gcode_size,
            files.uploaded_at AS gcode_uploaded_at
        FROM print_jobs
        LEFT JOIN files ON print_jobs.gcode_id = files.id
        WHERE print_jobs.id = ${id}`
        return data[0];
    } catch(error) {
        console.error(error);
        throw new Error('Failed to fetch print job data.');
    }
}

export async function fetchOrderPrintJobs(orderId: string) {
    try {
        const data = await sql<PrintJob[]>`
        SELECT
            id, name, status, order_id
        FROM print_jobs
        WHERE order_id=${orderId}
        ORDER BY 
            CASE status
                WHEN 'postprocess' THEN 1
                WHEN 'printing' THEN 2
                WHEN 'pending' THEN 3
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