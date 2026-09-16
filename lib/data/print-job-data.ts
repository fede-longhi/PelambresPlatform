import sql from '@/lib/db';
import { ITEMS_PER_PAGE } from '@/lib/consts';
import {
  DEFAULT_PRINT_JOB_LIST_FILTER,
  parsePrintJobListFilter,
  type PrintJobListFilter,
} from '@/lib/consts/print-job-consts';
import {
  PrintJob,
  PrintJobTableRow,
  PrintJobWithGcode,
} from '@/types/definitions';

export { parsePrintJobListFilter, DEFAULT_PRINT_JOB_LIST_FILTER };
export type { PrintJobListFilter };

function buildPrintJobFilterSql(filter: PrintJobListFilter) {
  switch (filter) {
    case 'active':
      return sql`AND print_jobs.status IN ('pending', 'printing', 'postprocess')`;
    case 'all':
      return sql``;
    default:
      return sql`AND print_jobs.status = ${filter}`;
  }
}

export async function fetchPrintJob(id: string): Promise<PrintJobWithGcode | undefined> {
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

export async function fetchFilteredPrintJobs(
  query: string,
  currentPage: number,
  filter: PrintJobListFilter = DEFAULT_PRINT_JOB_LIST_FILTER
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const search = `%${query}%`;
  const filterSql = buildPrintJobFilterSql(filter);

  try {
    return await sql<PrintJobTableRow[]>`
      SELECT
        print_jobs.id,
        print_jobs.name,
        print_jobs.status,
        print_jobs.estimated_printing_time,
        print_jobs.order_id,
        orders.tracking_code,
        CASE
          WHEN customers.type = 'person'
            THEN TRIM(CONCAT(COALESCE(customers.last_name, ''), ', ', COALESCE(customers.first_name, '')))
          ELSE customers.name
        END AS customer_name
      FROM print_jobs
      LEFT JOIN orders ON orders.id = print_jobs.order_id
      LEFT JOIN customers ON customers.id = orders.customer_id
      WHERE (
        print_jobs.name ILIKE ${search}
        OR COALESCE(orders.tracking_code, '') ILIKE ${search}
        OR COALESCE(customers.first_name, '') ILIKE ${search}
        OR COALESCE(customers.last_name, '') ILIKE ${search}
        OR COALESCE(customers.name, '') ILIKE ${search}
      )
      ${filterSql}
      ORDER BY
        CASE print_jobs.status
          WHEN 'printing' THEN 1
          WHEN 'postprocess' THEN 2
          WHEN 'pending' THEN 3
          WHEN 'finished' THEN 4
          WHEN 'failed' THEN 5
          ELSE 6
        END,
        print_jobs.name
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch print jobs.');
  }
}

export async function fetchPrintJobsPages(
  query: string,
  filter: PrintJobListFilter = DEFAULT_PRINT_JOB_LIST_FILTER
) {
  const search = `%${query}%`;
  const filterSql = buildPrintJobFilterSql(filter);

  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM print_jobs
      LEFT JOIN orders ON orders.id = print_jobs.order_id
      LEFT JOIN customers ON customers.id = orders.customer_id
      WHERE (
        print_jobs.name ILIKE ${search}
        OR COALESCE(orders.tracking_code, '') ILIKE ${search}
        OR COALESCE(customers.first_name, '') ILIKE ${search}
        OR COALESCE(customers.last_name, '') ILIKE ${search}
        OR COALESCE(customers.name, '') ILIKE ${search}
      )
      ${filterSql}
    `;

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch print job pages.');
  }
}