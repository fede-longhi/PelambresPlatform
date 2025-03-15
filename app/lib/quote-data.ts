import { QuoteTable } from "./definitions";
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredQuotes(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const quotes = await sql<QuoteTable[]>`
      SELECT
        id,
        date,
        first_name,
        last_name,
        email,
        detail
      FROM quotes
      WHERE
        first_name ILIKE ${`%${query}%`} OR
        last_name ILIKE ${`%${query}%`} OR
        email ILIKE ${`%${query}%`}
      ORDER BY date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return quotes;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}