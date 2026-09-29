import {
  type CustomerPortalQuote,
  type QuoteRequestDetail,
  type QuoteTable,
} from '@/types/definitions';
import { fetchCustomerById } from '@/lib/data/customer-data';
import sql from '@/lib/db';
import {
  DEFAULT_QUOTE_REQUEST_LIST_FILTER,
  parseQuoteRequestListFilter,
  type QuoteRequestListFilter,
} from '@/lib/consts/quote-request-consts';

export { parseQuoteRequestListFilter, DEFAULT_QUOTE_REQUEST_LIST_FILTER };
export type { QuoteRequestListFilter };

const ITEMS_PER_PAGE = 10;

function buildQuoteRequestFilterSql(filter: QuoteRequestListFilter) {
  switch (filter) {
    case 'open':
      return sql`AND quote_requests.status IN ('new', 'in_progress')`;
    case 'all':
      return sql``;
    default:
      return sql`AND quote_requests.status = ${filter}`;
  }
}

export async function fetchFilteredQuotes(
  query: string,
  currentPage: number,
  filter: QuoteRequestListFilter = DEFAULT_QUOTE_REQUEST_LIST_FILTER
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const search = `%${query}%`;
  const filterSql = buildQuoteRequestFilterSql(filter);

  try {
    return await sql<QuoteTable[]>`
      SELECT
        quote_requests.id,
        quote_requests.date,
        quote_requests.first_name,
        quote_requests.last_name,
        quote_requests.name,
        quote_requests.email,
        quote_requests.phone,
        quote_requests.detail,
        quote_requests.customer_id,
        quote_requests.status,
        CASE
          WHEN customers.type = 'person'
            THEN TRIM(BOTH ' ,' FROM CONCAT(COALESCE(customers.last_name, ''), ', ', COALESCE(customers.first_name, '')))
          ELSE customers.name
        END AS customer_name
      FROM quote_requests
      LEFT JOIN customers ON customers.id = quote_requests.customer_id
      WHERE (
        COALESCE(quote_requests.first_name, '') ILIKE ${search} OR
        COALESCE(quote_requests.last_name, '') ILIKE ${search} OR
        COALESCE(quote_requests.name, '') ILIKE ${search} OR
        quote_requests.email ILIKE ${search} OR
        COALESCE(quote_requests.phone, '') ILIKE ${search}
      )
      ${filterSql}
      ORDER BY quote_requests.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quotes.');
  }
}

export async function fetchQuotesPages(
  query: string,
  filter: QuoteRequestListFilter = DEFAULT_QUOTE_REQUEST_LIST_FILTER
) {
  const search = `%${query}%`;
  const filterSql = buildQuoteRequestFilterSql(filter);

  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM quote_requests
      WHERE (
        COALESCE(first_name, '') ILIKE ${search} OR
        COALESCE(last_name, '') ILIKE ${search} OR
        COALESCE(name, '') ILIKE ${search} OR
        email ILIKE ${search} OR
        COALESCE(phone, '') ILIKE ${search}
      )
      ${filterSql}
    `;

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of quotes.');
  }
}

export async function fetchQuoteById(id: string): Promise<QuoteRequestDetail | undefined> {
  try {
    const rows = await sql<QuoteTable[]>`
      SELECT
        id,
        date,
        first_name,
        last_name,
        name,
        email,
        phone,
        detail,
        customer_id,
        status
      FROM quote_requests
      WHERE id = ${id}
      LIMIT 1
    `;

    const quote = rows[0];
    if (!quote) {
      return undefined;
    }

    const [attachments, customer] = await Promise.all([
      sql<{ fileUrl: string }[]>`
        SELECT file_url as "fileUrl"
        FROM quote_request_attachments
        WHERE quote_request_id = ${id}
        ORDER BY file_url ASC
      `,
      quote.customer_id ? fetchCustomerById(quote.customer_id) : Promise.resolve(undefined),
    ]);

    return {
      ...quote,
      attachments,
      customer: customer ?? null,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quote request.');
  }
}

export async function fetchCustomerPortalQuotes(
  customerId: string
): Promise<CustomerPortalQuote[]> {
  try {
    return await sql<CustomerPortalQuote[]>`
      SELECT
        id,
        name,
        detail,
        date
      FROM quote_requests
      WHERE customer_id = ${customerId}
      ORDER BY date DESC
      LIMIT 20
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer quote requests.');
  }
}
