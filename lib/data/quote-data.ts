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

const ITEMS_PER_PAGE = 6;

function buildQuoteRequestFilterSql(filter: QuoteRequestListFilter) {
  switch (filter) {
    case 'open':
      return sql`AND status IN ('new', 'in_progress')`;
    case 'all':
      return sql``;
    default:
      return sql`AND status = ${filter}`;
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
      WHERE (
        COALESCE(first_name, '') ILIKE ${search} OR
        COALESCE(last_name, '') ILIKE ${search} OR
        COALESCE(name, '') ILIKE ${search} OR
        email ILIKE ${search} OR
        COALESCE(phone, '') ILIKE ${search}
      )
      ${filterSql}
      ORDER BY date DESC
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
