import { PrintJobModelFile } from "./definitions";
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchPrintJobModels(printJobId: string){
    try {
        const data = await sql<PrintJobModelFile[]>`
            SELECT
                files.id,
                files.filename,
                files.path,
                files.mime_type,
                files.size,
                files.uploaded_at,
                print_job_models.name
            FROM print_job_models
            JOIN files ON print_job_models.file_id = files.id
            WHERE print_job_models.print_job_id = ${printJobId}
        `;
        return data;
    } catch (error) {
        console.error('Error fetching print job models:', error);
        throw new Error('Failed to fetch print job models.');
    }
}