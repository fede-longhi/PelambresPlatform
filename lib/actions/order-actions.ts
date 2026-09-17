'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { requireAdminSessionUserId } from '@/lib/auth/require-admin';
import { OrderStatus, OrderStatuses } from '@/types/order-definitions';
import { generateCode } from '@/lib/utils';
import { TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH } from '@/lib/consts';

const FormSchema = z.object({
    id: z.string(),
    code: z.string(),
    customerId: z.string(),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'in progress', 'finished', 'delivered']),
    estimatedDate: z.coerce.date().optional()
});

const CreateOrder = FormSchema.omit({ id: true });

export type OrderFormState = {
    errors?: {
        customerId?: string[],
        code?: string[],
        status?: string[],
        amount?: string[],
        estimatedDate?: string[],
    };
    message?: string | null;
    payload?: FormData 
};

export type CreateOrderFromQuoteState = {
  message?: string | null;
  success?: boolean;
};

async function generateUniqueTrackingCode(tx: typeof sql) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateCode(TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH);
    const existing = await tx<{ id: string }[]>`
      SELECT id
      FROM orders
      WHERE tracking_code = ${code}
      LIMIT 1
    `;

    if (!existing[0]) {
      return code;
    }
  }

  throw new Error('TRACKING_CODE');
}

function addDaysIsoDate(days: number) {
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + days);
  return estimatedDate.toISOString().split('T')[0];
}

export async function createOrderFromQuote(
  quoteId: string,
  _prevState: CreateOrderFromQuoteState,
  _formData: FormData
): Promise<CreateOrderFromQuoteState> {
  await requireAdminSessionUserId();

  const parsedId = z.string().uuid().safeParse(quoteId);
  if (!parsedId.success) {
    return { success: false, message: 'Presupuesto inválido.' };
  }

  let orderId: string;

  try {
    const result = await sql.begin(async (tx) => {
      const existing = await tx<{ id: string }[]>`
        SELECT id
        FROM orders
        WHERE quote_id = ${parsedId.data}
        LIMIT 1
      `;

      if (existing[0]) {
        return { id: existing[0].id, alreadyExisted: true };
      }

      const quotes = await tx<{
        id: string;
        status: string;
        customerId: string;
        quoteRequestId: string | null;
        totalCents: number;
      }[]>`
        SELECT
          id,
          status,
          customer_id as "customerId",
          quote_request_id as "quoteRequestId",
          total_cents as "totalCents"
        FROM quotes
        WHERE id = ${parsedId.data}
          AND deleted_at IS NULL
        LIMIT 1
      `;

      const quote = quotes[0];
      if (!quote) {
        throw new Error('NOT_FOUND');
      }

      if (quote.status !== 'accepted') {
        throw new Error('NOT_ACCEPTED');
      }

      if (quote.totalCents <= 0) {
        throw new Error('INVALID_AMOUNT');
      }

      const trackingCode = await generateUniqueTrackingCode(tx);
      const createdDate = new Date().toISOString().split('T')[0];
      const estimatedDate = addDaysIsoDate(14);

      const inserted = await tx<{ id: string }[]>`
        INSERT INTO orders (
          customer_id,
          amount,
          status,
          created_date,
          tracking_code,
          estimated_date,
          quote_id
        )
        VALUES (
          ${quote.customerId},
          ${quote.totalCents},
          'pending',
          ${createdDate},
          ${trackingCode},
          ${estimatedDate},
          ${quote.id}
        )
        RETURNING id
      `;

      if (quote.quoteRequestId) {
        await tx`
          UPDATE quote_requests
          SET status = 'closed'
          WHERE id = ${quote.quoteRequestId}
            AND status <> 'closed'
        `;
      }

      return { id: inserted[0].id, quoteRequestId: quote.quoteRequestId };
    });

    orderId = result.id;

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/quotes/${parsedId.data}`);
    revalidatePath('/admin/quotes');
    revalidatePath('/admin/quote-requests');
    if ('quoteRequestId' in result && result.quoteRequestId) {
      revalidatePath(`/admin/quote-requests/${result.quoteRequestId}`);
    }
    revalidatePath('/admin');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return { success: false, message: 'No se encontró el presupuesto.' };
      }
      if (error.message === 'NOT_ACCEPTED') {
        return {
          success: false,
          message: 'El presupuesto tiene que estar aceptado para crear el pedido.',
        };
      }
      if (error.message === 'INVALID_AMOUNT') {
        return {
          success: false,
          message: 'El presupuesto no tiene un total válido para crear el pedido.',
        };
      }
      if (error.message === 'TRACKING_CODE') {
        return {
          success: false,
          message: 'No se pudo generar un código de seguimiento. Probá de nuevo.',
        };
      }
    }

    console.error(error);
    return { success: false, message: 'No se pudo crear el pedido.' };
  }

  redirect(`/admin/orders/${orderId}`);
}

export async function createOrder(
    _prevState: OrderFormState,
    formData: FormData
) {
    await requireAdminSessionUserId();
    const validatedFields = CreateOrder.safeParse({
        customerId: formData.get('customerId'),
        code: formData.get('code'),
        status: formData.get('status'),
        amount: formData.get('amount'),
        estimatedDate: formData.get('estimatedDate'),
    });
  
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
            payload: formData
        };
    }

    const { customerId, code, status, amount, estimatedDate } = validatedFields.data;
    const amountInCents = amount * 100;
    const createdDate = new Date().toISOString().split('T')[0];

    try {
        await sql`
            INSERT INTO orders (customer_id, amount, status, created_date, tracking_code, estimated_date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${createdDate}, ${code}, ${estimatedDate ?? null})
        `;
    } catch (error) {
        console.log(error);
        return { message: 'Database Error: Failed to Insert Invoice.' };
    }

    revalidatePath('/admin/orders');
    redirect('/admin/orders');
}

export async function updateOrder(
    id: string,
    _prevState: OrderFormState,
    formData: FormData) {
    await requireAdminSessionUserId();
    const validatedFields = CreateOrder.safeParse({
        customerId: formData.get('customerId'),
        code: formData.get('code'),
        status: formData.get('status'),
        amount: formData.get('amount'),
        estimatedDate: formData.get('estimatedDate'),
    });
  
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
            payload: formData
        };
    }

    const { customerId, code, status, amount, estimatedDate } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE orders
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status},
                tracking_code = ${code}, estimated_date = ${estimatedDate ?? null}
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error(error);
        return { message: 'Database Error: Failed to Update Order.' };
    }

    revalidatePath('/admin/orders');
    redirect('/admin/orders');
}

export async function advanceStep(id: string, status: OrderStatus) {
    await requireAdminSessionUserId();
    const nextStep = OrderStatuses[status].next;
    if (nextStep != null) {
        await sql`UPDATE orders
                SET status = ${nextStep}
                WHERE id = ${id}`;
        revalidatePath('/admin/orders');
    }
}

export async function goBackStep(id: string, status: OrderStatus) {
    await requireAdminSessionUserId();
    const previousStep = OrderStatuses[status].previous;
    if (previousStep != null) {
        await sql`UPDATE orders
                SET status = ${previousStep}
                WHERE id = ${id}`;
        revalidatePath('/admin/orders');
    }
}

export async function deleteOrder(id: string) {
    await requireAdminSessionUserId();
    await sql`DELETE FROM orders WHERE id = ${id}`;
    revalidatePath('/admin/orders');
}