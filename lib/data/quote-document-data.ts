import sql from '@/lib/db';
import { centsToPesos } from '@/lib/quote-math';
import {
  DEFAULT_QUOTE_DOCUMENT_LIST_FILTER,
  parseQuoteDocumentListFilter,
  type QuoteDocumentListFilter,
} from '@/lib/consts/quote-document-consts';
import type { QuoteItem, QuoteItemCalculatorParams, TaxItem } from '@/types/quote';
import type {
  QuoteDocumentDetail,
  QuoteDocumentListItem,
  QuoteDocumentStatus,
} from '@/types/quote-document-definitions';
import type { CustomerType } from '@/types/definitions';

export { parseQuoteDocumentListFilter, DEFAULT_QUOTE_DOCUMENT_LIST_FILTER };
export type { QuoteDocumentListFilter };

const ITEMS_PER_PAGE = 6;

type QuoteDocumentRow = {
  id: string;
  quoteNumber: number;
  status: QuoteDocumentStatus;
  customerId: string;
  quoteRequestId: string | null;
  quoteDate: string;
  companyName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientType: CustomerType;
  notes: string;
  globalDiscountPercent: string | number;
  showQuoteNumber: boolean;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type QuoteItemRow = {
  id: string;
  description: string;
  quantity: string | number;
  unitPriceCents: number;
  discountPercent: string | number;
  calculatorParams: QuoteItemCalculatorParams | null;
};

type QuoteTaxRow = {
  id: string;
  name: string;
  percentage: string | number;
};

function asIsoString(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function mapQuoteItem(row: QuoteItemRow): QuoteItem {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    price: centsToPesos(row.unitPriceCents),
    discount: Number(row.discountPercent),
    calculatorParams: row.calculatorParams ?? undefined,
  };
}

function mapQuoteTax(row: QuoteTaxRow): TaxItem {
  return {
    id: row.id,
    name: row.name,
    percentage: Number(row.percentage),
  };
}

function buildQuoteDocumentFilterSql(filter: QuoteDocumentListFilter) {
  if (filter === 'all') {
    return sql``;
  }

  return sql`AND quotes.status = ${filter}`;
}

export async function fetchFilteredQuoteDocuments(
  query: string,
  currentPage: number,
  filter: QuoteDocumentListFilter = DEFAULT_QUOTE_DOCUMENT_LIST_FILTER
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const search = `%${query}%`;
  const filterSql = buildQuoteDocumentFilterSql(filter);
  const quoteNumberSearch = query.replace(/\D/g, '');

  try {
    return await sql<QuoteDocumentListItem[]>`
      SELECT
        quotes.id,
        quotes.quote_number as "quoteNumber",
        quotes.status,
        to_char(quotes.quote_date, 'YYYY-MM-DD') as "quoteDate",
        quotes.client_name as "clientName",
        quotes.client_email as "clientEmail",
        quotes.total_cents as "totalCents",
        quotes.customer_id as "customerId"
      FROM quotes
      WHERE quotes.deleted_at IS NULL
        AND (
          quotes.client_name ILIKE ${search} OR
          quotes.client_email ILIKE ${search} OR
          quotes.client_phone ILIKE ${search} OR
          CAST(quotes.quote_number AS TEXT) ILIKE ${search} OR
          (${quoteNumberSearch} <> '' AND CAST(quotes.quote_number AS TEXT) ILIKE ${'%' + quoteNumberSearch + '%'})
        )
        ${filterSql}
      ORDER BY quotes.quote_number DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quotes.');
  }
}

export async function fetchQuoteDocumentPages(
  query: string,
  filter: QuoteDocumentListFilter = DEFAULT_QUOTE_DOCUMENT_LIST_FILTER
) {
  const search = `%${query}%`;
  const filterSql = buildQuoteDocumentFilterSql(filter);
  const quoteNumberSearch = query.replace(/\D/g, '');

  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM quotes
      WHERE quotes.deleted_at IS NULL
        AND (
          quotes.client_name ILIKE ${search} OR
          quotes.client_email ILIKE ${search} OR
          quotes.client_phone ILIKE ${search} OR
          CAST(quotes.quote_number AS TEXT) ILIKE ${search} OR
          (${quoteNumberSearch} <> '' AND CAST(quotes.quote_number AS TEXT) ILIKE ${'%' + quoteNumberSearch + '%'})
        )
        ${filterSql}
    `;

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quote pages.');
  }
}

export async function fetchQuoteDocumentById(
  id: string
): Promise<QuoteDocumentDetail | undefined> {
  try {
    const rows = await sql<QuoteDocumentRow[]>`
      SELECT
        id,
        quote_number as "quoteNumber",
        status,
        customer_id as "customerId",
        quote_request_id as "quoteRequestId",
        to_char(quote_date, 'YYYY-MM-DD') as "quoteDate",
        company_name as "companyName",
        client_name as "clientName",
        client_email as "clientEmail",
        client_phone as "clientPhone",
        client_address as "clientAddress",
        client_type as "clientType",
        notes,
        global_discount_percent as "globalDiscountPercent",
        show_quote_number as "showQuoteNumber",
        subtotal_cents as "subtotalCents",
        tax_cents as "taxCents",
        total_cents as "totalCents",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM quotes
      WHERE id = ${id}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const quote = rows[0];
    if (!quote) {
      return undefined;
    }

    const [items, taxes] = await Promise.all([
      sql<QuoteItemRow[]>`
        SELECT
          id,
          description,
          quantity,
          unit_price_cents as "unitPriceCents",
          discount_percent as "discountPercent",
          calculator_params as "calculatorParams"
        FROM quote_items
        WHERE quote_id = ${id}
        ORDER BY sort_order ASC, created_at ASC
      `,
      sql<QuoteTaxRow[]>`
        SELECT
          id,
          name,
          percentage
        FROM quote_taxes
        WHERE quote_id = ${id}
        ORDER BY sort_order ASC, created_at ASC
      `,
    ]);

    const orderRows = await sql<{ id: string; trackingCode: string }[]>`
      SELECT id, tracking_code as "trackingCode"
      FROM orders
      WHERE quote_id = ${id}
      LIMIT 1
    `;

    return {
      id: quote.id,
      quoteNumber: Number(quote.quoteNumber),
      status: quote.status,
      customerId: quote.customerId,
      quoteRequestId: quote.quoteRequestId,
      quoteDate: quote.quoteDate,
      companyName: quote.companyName,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      clientPhone: quote.clientPhone,
      clientAddress: quote.clientAddress,
      clientType: quote.clientType,
      notes: quote.notes,
      globalDiscountPercent: Number(quote.globalDiscountPercent),
      showQuoteNumber: quote.showQuoteNumber,
      subtotalCents: quote.subtotalCents,
      taxCents: quote.taxCents,
      totalCents: quote.totalCents,
      createdAt: asIsoString(quote.createdAt),
      updatedAt: asIsoString(quote.updatedAt),
      items: items.map(mapQuoteItem),
      taxes: taxes.map(mapQuoteTax),
      orderId: orderRows[0]?.id ?? null,
      orderTrackingCode: orderRows[0]?.trackingCode ?? null,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quote.');
  }
}

export async function fetchCustomerQuoteDocuments(
  customerId: string
): Promise<QuoteDocumentListItem[]> {
  try {
    return await sql<QuoteDocumentListItem[]>`
      SELECT
        quotes.id,
        quotes.quote_number as "quoteNumber",
        quotes.status,
        to_char(quotes.quote_date, 'YYYY-MM-DD') as "quoteDate",
        quotes.client_name as "clientName",
        quotes.client_email as "clientEmail",
        quotes.total_cents as "totalCents",
        quotes.customer_id as "customerId"
      FROM quotes
      WHERE quotes.customer_id = ${customerId}
        AND quotes.deleted_at IS NULL
      ORDER BY quotes.quote_number DESC
      LIMIT 8
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer quotes.');
  }
}

export async function fetchQuoteDocumentsByRequestId(
  quoteRequestId: string
): Promise<QuoteDocumentListItem[]> {
  try {
    return await sql<QuoteDocumentListItem[]>`
      SELECT
        quotes.id,
        quotes.quote_number as "quoteNumber",
        quotes.status,
        to_char(quotes.quote_date, 'YYYY-MM-DD') as "quoteDate",
        quotes.client_name as "clientName",
        quotes.client_email as "clientEmail",
        quotes.total_cents as "totalCents",
        quotes.customer_id as "customerId",
        orders.id as "orderId",
        orders.tracking_code as "orderTrackingCode"
      FROM quotes
      LEFT JOIN orders ON orders.quote_id = quotes.id
      WHERE quotes.quote_request_id = ${quoteRequestId}
        AND quotes.deleted_at IS NULL
      ORDER BY quotes.quote_number DESC
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quotes for request.');
  }
}
