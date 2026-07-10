import {
  type CustomerPortalQuote,
  type QuoteRequestDetail,
  type QuoteTable,
} from '@/types/definitions';
import { fetchCustomerById } from '@/lib/data/customer-data';
import sql from '@/lib/db';

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredQuotes(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

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
        customer_id
      FROM quote_requests
      WHERE
        COALESCE(first_name, '') ILIKE ${`%${query}%`} OR
        COALESCE(last_name, '') ILIKE ${`%${query}%`} OR
        COALESCE(name, '') ILIKE ${`%${query}%`} OR
        email ILIKE ${`%${query}%`} OR
        COALESCE(phone, '') ILIKE ${`%${query}%`}
      ORDER BY date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quotes.');
  }
}

export async function fetchQuotesPages(query: string) {
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM quote_requests
      WHERE
        COALESCE(first_name, '') ILIKE ${`%${query}%`} OR
        COALESCE(last_name, '') ILIKE ${`%${query}%`} OR
        COALESCE(name, '') ILIKE ${`%${query}%`} OR
        email ILIKE ${`%${query}%`} OR
        COALESCE(phone, '') ILIKE ${`%${query}%`}
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
        customer_id
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
