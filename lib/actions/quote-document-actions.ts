'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { requireAdminSessionUserId } from '@/lib/auth/require-admin';
import { computeQuoteMath, getItemTotal, pesosToCents } from '@/lib/quote-math';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import { formatQuoteNumber } from '@/lib/consts/quote-document-consts';
import { fetchQuoteDocumentById } from '@/lib/data/quote-document-data';
import { sendQuoteDocumentEmail } from '@/lib/mail/mailer';
import type { CustomerType } from '@/types/definitions';
import type { QuoteItem, QuoteItemCalculatorParams, TaxItem } from '@/types/quote';
import {
  QUOTE_DOCUMENT_STATUSES,
  type QuoteDocumentSaveInput,
  type QuoteDocumentSaveResult,
  type QuoteDocumentStatus,
} from '@/types/quote-document-definitions';

const CalculatorParamsSchema = z.object({
  materialCostPerKg: z.number(),
  partWeightGrams: z.number(),
  machineCostPerHour: z.number(),
  printTimeH: z.number(),
  printTimeM: z.number(),
  laborCostPerHour: z.number(),
  laborTimeH: z.number(),
  laborTimeM: z.number(),
  extraMaterialsCost: z.number(),
  markupPercentage: z.number(),
  discountPercentage: z.number(),
});

const QuoteDocumentSaveSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid({ message: 'Seleccioná un cliente.' }),
  quoteRequestId: z.string().uuid().nullable().optional(),
  date: z.string().min(1, { message: 'La fecha es obligatoria.' }),
  companyName: z.string().min(1, { message: 'El nombre de la empresa es obligatorio.' }),
  clientName: z.string().min(1, { message: 'El nombre del cliente es obligatorio.' }),
  clientEmail: z.string(),
  clientPhone: z.string(),
  clientAddress: z.string(),
  clientType: z.enum(['person', 'business']),
  notes: z.string(),
  globalDiscount: z.number().min(0).max(100),
  showQuoteNumber: z.boolean(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      price: z.number().min(0),
      discount: z.number().min(0).max(100),
      calculatorParams: CalculatorParamsSchema.optional(),
    })
  ),
  taxes: z.array(
    z.object({
      name: z.string(),
      percentage: z.number().min(0),
    })
  ),
});

export type QuoteDocumentStatusFormState = {
  errors?: {
    status?: string[];
  };
  message?: string | null;
  success?: boolean;
  savedStatus?: QuoteDocumentStatus;
};

function revalidateQuotePaths(options: {
  quoteId?: string;
  customerId?: string;
  quoteRequestId?: string | null;
}) {
  revalidatePath('/admin/quotes');
  revalidatePath('/admin');
  if (options.quoteId) {
    revalidatePath(`/admin/quotes/${options.quoteId}`);
    revalidatePath(`/admin/quotes/${options.quoteId}/edit`);
  }
  if (options.customerId) {
    revalidatePath(`/admin/customers/${options.customerId}`);
  }
  if (options.quoteRequestId) {
    revalidatePath(`/admin/quote-requests/${options.quoteRequestId}`);
    revalidatePath('/admin/quote-requests');
  }
}

async function insertQuoteLines(
  tx: typeof sql,
  quoteId: string,
  items: QuoteDocumentSaveInput['items'],
  taxes: QuoteDocumentSaveInput['taxes']
) {
  for (const [index, item] of items.entries()) {
    const quantity = item.quantity > 0 ? item.quantity : 1;
    const calculatorParams = item.calculatorParams ?? null;

    await tx`
      INSERT INTO quote_items (
        quote_id,
        sort_order,
        description,
        quantity,
        unit_price_cents,
        discount_percent,
        calculator_params
      )
      VALUES (
        ${quoteId},
        ${index},
        ${item.description},
        ${quantity},
        ${pesosToCents(item.price)},
        ${item.discount},
        ${calculatorParams ? sql.json(calculatorParams) : null}
      )
    `;
  }

  for (const [index, tax] of taxes.entries()) {
    await tx`
      INSERT INTO quote_taxes (
        quote_id,
        sort_order,
        name,
        percentage
      )
      VALUES (
        ${quoteId},
        ${index},
        ${tax.name},
        ${tax.percentage}
      )
    `;
  }
}

async function markQuoteRequestQuoted(tx: typeof sql, quoteRequestId: string) {
  await tx`
    UPDATE quote_requests
    SET status = 'quoted'
    WHERE id = ${quoteRequestId}
      AND status IN ('new', 'in_progress', 'quoted')
  `;
}

export async function saveQuoteDocument(
  payload: QuoteDocumentSaveInput
): Promise<QuoteDocumentSaveResult> {
  await requireAdminSessionUserId();

  const validated = QuoteDocumentSaveSchema.safeParse(payload);
  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    return {
      success: false,
      message: 'Revisá los datos del presupuesto.',
      errors: {
        customerId: fieldErrors.customerId,
        clientName: fieldErrors.clientName,
        items: fieldErrors.items as string[] | undefined,
      },
    };
  }

  const data = validated.data;

  const customerRows = await sql<{ id: string; type: CustomerType }[]>`
    SELECT id, type
    FROM customers
    WHERE id = ${data.customerId}
    LIMIT 1
  `;

  if (!customerRows[0]) {
    return {
      success: false,
      message: 'El cliente seleccionado no existe.',
      errors: { customerId: ['El cliente seleccionado no existe.'] },
    };
  }

  let quoteRequestId = data.quoteRequestId ?? null;
  if (quoteRequestId) {
    const requestRows = await sql<{ id: string }[]>`
      SELECT id
      FROM quote_requests
      WHERE id = ${quoteRequestId}
      LIMIT 1
    `;

    if (!requestRows[0]) {
      quoteRequestId = null;
    }
  }

  const items: QuoteItem[] = data.items.map((item, index) => ({
    id: String(index),
    description: item.description,
    quantity: item.quantity > 0 ? item.quantity : 1,
    price: item.price,
    discount: item.discount,
    calculatorParams: item.calculatorParams as QuoteItemCalculatorParams | undefined,
  }));
  const taxes: TaxItem[] = data.taxes.map((tax, index) => ({
    id: String(index),
    name: tax.name,
    percentage: tax.percentage,
  }));
  const math = computeQuoteMath(items, taxes, data.globalDiscount);
  const subtotalCents = Math.max(0, pesosToCents(math.taxableSubtotal));
  const taxCents = Math.max(0, pesosToCents(math.totalTaxes));
  const totalCents = Math.max(0, pesosToCents(math.total));

  try {
    const saved = await sql.begin(async (tx) => {
      if (data.id) {
        const updated = await tx<{ id: string; quoteNumber: number }[]>`
          UPDATE quotes
          SET
            customer_id = ${data.customerId},
            quote_request_id = ${quoteRequestId},
            quote_date = ${data.date},
            company_name = ${data.companyName},
            client_name = ${data.clientName},
            client_email = ${data.clientEmail},
            client_phone = ${data.clientPhone},
            client_address = ${data.clientAddress},
            client_type = ${data.clientType},
            notes = ${data.notes},
            global_discount_percent = ${data.globalDiscount},
            show_quote_number = ${data.showQuoteNumber},
            subtotal_cents = ${subtotalCents},
            tax_cents = ${taxCents},
            total_cents = ${totalCents},
            updated_at = NOW()
          WHERE id = ${data.id}
            AND deleted_at IS NULL
          RETURNING id, quote_number as "quoteNumber"
        `;

        if (!updated[0]) {
          throw new Error('NOT_FOUND');
        }

        await tx`DELETE FROM quote_items WHERE quote_id = ${data.id}`;
        await tx`DELETE FROM quote_taxes WHERE quote_id = ${data.id}`;
        await insertQuoteLines(tx, data.id, data.items, data.taxes);

        if (quoteRequestId) {
          await markQuoteRequestQuoted(tx, quoteRequestId);
        }

        return updated[0];
      }

      const inserted = await tx<{ id: string; quoteNumber: number }[]>`
        INSERT INTO quotes (
          quote_number,
          status,
          customer_id,
          quote_request_id,
          quote_date,
          company_name,
          client_name,
          client_email,
          client_phone,
          client_address,
          client_type,
          notes,
          global_discount_percent,
          show_quote_number,
          subtotal_cents,
          tax_cents,
          total_cents
        )
        VALUES (
          nextval('quote_number_seq'),
          'draft',
          ${data.customerId},
          ${quoteRequestId},
          ${data.date},
          ${data.companyName},
          ${data.clientName},
          ${data.clientEmail},
          ${data.clientPhone},
          ${data.clientAddress},
          ${data.clientType},
          ${data.notes},
          ${data.globalDiscount},
          ${data.showQuoteNumber},
          ${subtotalCents},
          ${taxCents},
          ${totalCents}
        )
        RETURNING id, quote_number as "quoteNumber"
      `;

      const created = inserted[0];
      await insertQuoteLines(tx, created.id, data.items, data.taxes);

      if (quoteRequestId) {
        await markQuoteRequestQuoted(tx, quoteRequestId);
      }

      return created;
    });

    revalidateQuotePaths({
      quoteId: saved.id,
      customerId: data.customerId,
      quoteRequestId,
    });

    return {
      success: true,
      id: saved.id,
      quoteNumber: Number(saved.quoteNumber),
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return { success: false, message: 'No se encontró el presupuesto.' };
    }

    console.error(error);
    return { success: false, message: 'No se pudo guardar el presupuesto.' };
  }
}

export async function updateQuoteDocumentStatus(
  quoteId: string,
  _prevState: QuoteDocumentStatusFormState,
  formData: FormData
): Promise<QuoteDocumentStatusFormState> {
  await requireAdminSessionUserId();

  const parsed = z
    .enum(QUOTE_DOCUMENT_STATUSES, {
      errorMap: () => ({ message: 'Seleccione un estado válido.' }),
    })
    .safeParse(formData.get('status'));

  if (!parsed.success) {
    return {
      errors: { status: ['Seleccione un estado válido.'] },
      message: 'No se pudo actualizar el estado.',
      success: false,
    };
  }

  try {
    const updated = await sql<{ id: string; customerId: string; quoteRequestId: string | null }[]>`
      UPDATE quotes
      SET
        status = ${parsed.data satisfies QuoteDocumentStatus},
        updated_at = NOW()
      WHERE id = ${quoteId}
        AND deleted_at IS NULL
      RETURNING id, customer_id as "customerId", quote_request_id as "quoteRequestId"
    `;

    if (!updated[0]) {
      return {
        message: 'No se encontró el presupuesto.',
        success: false,
      };
    }

    revalidateQuotePaths({
      quoteId,
      customerId: updated[0].customerId,
      quoteRequestId: updated[0].quoteRequestId,
    });

    return {
      success: true,
      message: 'Estado actualizado.',
      savedStatus: parsed.data,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'No se pudo actualizar el estado.',
      success: false,
    };
  }
}

export type SendQuoteDocumentFormState = {
  message?: string | null;
  success?: boolean;
};

export async function sendQuoteDocumentToCustomer(
  quoteId: string,
  _prevState: SendQuoteDocumentFormState,
  _formData: FormData
): Promise<SendQuoteDocumentFormState> {
  await requireAdminSessionUserId();

  const parsedId = z.string().uuid().safeParse(quoteId);
  if (!parsedId.success) {
    return { success: false, message: 'Presupuesto inválido.' };
  }

  const quote = await fetchQuoteDocumentById(parsedId.data);
  if (!quote) {
    return { success: false, message: 'No se encontró el presupuesto.' };
  }

  const clientEmail = quote.clientEmail.trim();
  if (!clientEmail) {
    return {
      success: false,
      message: 'El presupuesto no tiene un email de cliente para enviar.',
    };
  }

  try {
    await sendQuoteDocumentEmail({
      to: clientEmail,
      clientName: quote.clientName || 'cliente',
      quoteNumber: formatQuoteNumber(quote.quoteNumber),
      quoteDate: formatDateToLocal(quote.quoteDate, 'es-AR'),
      items: quote.items.map((item) => ({
        description: item.description,
        quantity: String(item.quantity),
        lineTotal: formatCurrency(Math.round(getItemTotal(item) * 100)),
      })),
      subtotal: formatCurrency(quote.subtotalCents),
      taxes: formatCurrency(quote.taxCents),
      total: formatCurrency(quote.totalCents),
      notes: quote.notes || undefined,
    });

    if (quote.status === 'draft') {
      await sql`
        UPDATE quotes
        SET
          status = 'sent',
          updated_at = NOW()
        WHERE id = ${quote.id}
          AND deleted_at IS NULL
          AND status = 'draft'
      `;
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'No se pudo enviar el presupuesto por email.',
    };
  }

  revalidateQuotePaths({
    quoteId: quote.id,
    customerId: quote.customerId,
    quoteRequestId: quote.quoteRequestId,
  });

  return {
    success: true,
    message: `Presupuesto enviado a ${clientEmail}.`,
  };
}

export async function deleteQuoteDocument(id: string) {
  await requireAdminSessionUserId();

  try {
    const deleted = await sql<{ customerId: string; quoteRequestId: string | null }[]>`
      UPDATE quotes
      SET
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
        AND deleted_at IS NULL
      RETURNING customer_id as "customerId", quote_request_id as "quoteRequestId"
    `;

    if (deleted[0]) {
      revalidateQuotePaths({
        quoteId: id,
        customerId: deleted[0].customerId,
        quoteRequestId: deleted[0].quoteRequestId,
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete quote.');
  }

  redirect('/admin/quotes');
}
