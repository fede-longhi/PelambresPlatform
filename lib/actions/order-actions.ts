'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { requireAdminSessionUserId } from '@/lib/auth/require-admin';
import {
  ORDER_STATUS_VALUES,
  OrderStatus,
  OrderStatuses,
} from '@/types/order-definitions';
import { generateCode } from '@/lib/utils';
import { TRACKING_CODE_CHARACTERS, TRACKING_CODE_LENGTH } from '@/lib/consts';
import { pesosToCents } from '@/lib/quote-math';

const FormSchema = z.object({
  id: z.string(),
  code: z.string(),
  customerId: z.string().min(1, { message: 'Seleccione un cliente.' }),
  amount: z.coerce
    .number({ invalid_type_error: 'Ingrese un importe válido.' })
    .gt(0, { message: 'Ingrese un importe mayor a $0.' }),
  status: z.enum(ORDER_STATUS_VALUES, {
    errorMap: () => ({ message: 'Seleccione un estado válido.' }),
  }),
  estimatedDate: z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.coerce.date({
      errorMap: () => ({ message: 'La fecha estimada es inválida.' }),
    })
  ),
});

const CreateOrder = FormSchema.omit({ id: true });

export type OrderFormState = {
  errors?: {
    customerId?: string[];
    code?: string[];
    status?: string[];
    amount?: string[];
    estimatedDate?: string[];
  };
  message?: string | null;
  payload?: FormData;
};

export type CreateOrderFromQuoteState = {
  message?: string | null;
  success?: boolean;
};

export type OrderStatusFormState = {
  errors?: {
    status?: string[];
  };
  message?: string | null;
  success?: boolean;
  savedStatus?: OrderStatus;
};

function revalidateOrderPaths(options: {
  orderId?: string;
  customerId?: string;
  quoteId?: string | null;
}) {
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  if (options.orderId) {
    revalidatePath(`/admin/orders/${options.orderId}`);
    revalidatePath(`/admin/orders/${options.orderId}/edit`);
  }
  if (options.customerId) {
    revalidatePath(`/admin/customers/${options.customerId}`);
  }
  if (options.quoteId) {
    revalidatePath(`/admin/quotes/${options.quoteId}`);
    revalidatePath('/admin/quotes');
  }
}

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

async function assertTrackingCodeAvailable(
  tx: typeof sql,
  code: string,
  orderId?: string
) {
  const existing = orderId
    ? await tx<{ id: string }[]>`
        SELECT id
        FROM orders
        WHERE tracking_code = ${code}
          AND id <> ${orderId}
        LIMIT 1
      `
    : await tx<{ id: string }[]>`
        SELECT id
        FROM orders
        WHERE tracking_code = ${code}
        LIMIT 1
      `;

  if (existing[0]) {
    throw new Error('DUPLICATE_CODE');
  }
}

async function resolveTrackingCode(
  tx: typeof sql,
  rawCode: string,
  orderId?: string
) {
  const trackingCode = rawCode.trim().toUpperCase();

  if (!trackingCode) {
    return generateUniqueTrackingCode(tx);
  }

  await assertTrackingCodeAvailable(tx, trackingCode, orderId);
  return trackingCode;
}

function addDaysIsoDate(days: number) {
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + days);
  return estimatedDate.toISOString().split('T')[0];
}

function toIsoDate(date: Date) {
  return date.toISOString().split('T')[0];
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

      return { id: inserted[0].id, quoteRequestId: quote.quoteRequestId, customerId: quote.customerId };
    });

    orderId = result.id;

    revalidateOrderPaths({
      orderId,
      customerId: 'customerId' in result ? result.customerId : undefined,
      quoteId: parsedId.data,
    });
    revalidatePath('/admin/quote-requests');
    if ('quoteRequestId' in result && result.quoteRequestId) {
      revalidatePath(`/admin/quote-requests/${result.quoteRequestId}`);
    }
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
): Promise<OrderFormState> {
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
      message: 'Revise los campos. No se pudo crear el pedido.',
      payload: formData,
    };
  }

  const { customerId, code, status, amount, estimatedDate } =
    validatedFields.data;
  const amountInCents = pesosToCents(amount);
  const createdDate = new Date().toISOString().split('T')[0];

  let orderId: string;

  try {
    const trackingCode = await resolveTrackingCode(sql, code);
    const inserted = await sql<{ id: string }[]>`
      INSERT INTO orders (
        customer_id,
        amount,
        status,
        created_date,
        tracking_code,
        estimated_date
      )
      VALUES (
        ${customerId},
        ${amountInCents},
        ${status},
        ${createdDate},
        ${trackingCode},
        ${toIsoDate(estimatedDate)}
      )
      RETURNING id
    `;
    orderId = inserted[0].id;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'DUPLICATE_CODE') {
        return {
          errors: { code: ['Ese código de seguimiento ya está en uso.'] },
          message: 'Revise los campos. No se pudo crear el pedido.',
          payload: formData,
        };
      }
      if (error.message === 'TRACKING_CODE') {
        return {
          message: 'No se pudo generar un código de seguimiento. Probá de nuevo.',
          payload: formData,
        };
      }
    }

    console.error(error);
    return { message: 'No se pudo crear el pedido.', payload: formData };
  }

  revalidateOrderPaths({ orderId, customerId });
  redirect(`/admin/orders/${orderId}`);
}

export async function updateOrder(
  id: string,
  _prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
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
      message: 'Revise los campos. No se pudo guardar el pedido.',
      payload: formData,
    };
  }

  const { customerId, code, status, amount, estimatedDate } =
    validatedFields.data;
  const amountInCents = pesosToCents(amount);
  const deliveredDate = status === 'delivered' ? new Date() : null;

  try {
    const trackingCode = await resolveTrackingCode(sql, code, id);
    const updated = await sql<{ id: string }[]>`
      UPDATE orders
      SET
        customer_id = ${customerId},
        amount = ${amountInCents},
        status = ${status},
        tracking_code = ${trackingCode},
        estimated_date = ${toIsoDate(estimatedDate)},
        delivered_date = ${deliveredDate}
      WHERE id = ${id}
      RETURNING id
    `;

    if (!updated[0]) {
      return { message: 'No se encontró el pedido.', payload: formData };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'DUPLICATE_CODE') {
        return {
          errors: { code: ['Ese código de seguimiento ya está en uso.'] },
          message: 'Revise los campos. No se pudo guardar el pedido.',
          payload: formData,
        };
      }
      if (error.message === 'TRACKING_CODE') {
        return {
          message: 'No se pudo generar un código de seguimiento. Probá de nuevo.',
          payload: formData,
        };
      }
    }

    console.error(error);
    return { message: 'No se pudo guardar el pedido.', payload: formData };
  }

  revalidateOrderPaths({ orderId: id, customerId });
  redirect(`/admin/orders/${id}`);
}

export async function updateOrderStatus(
  orderId: string,
  _prevState: OrderStatusFormState,
  formData: FormData
): Promise<OrderStatusFormState> {
  await requireAdminSessionUserId();

  const parsed = z
    .enum(ORDER_STATUS_VALUES, {
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

  const deliveredDate = parsed.data === 'delivered' ? new Date() : null;

  try {
    const updated = await sql<{ id: string; customerId: string; quoteId: string | null }[]>`
      UPDATE orders
      SET
        status = ${parsed.data},
        delivered_date = ${deliveredDate}
      WHERE id = ${orderId}
      RETURNING id, customer_id as "customerId", quote_id as "quoteId"
    `;

    if (!updated[0]) {
      return {
        message: 'No se encontró el pedido.',
        success: false,
      };
    }

    revalidateOrderPaths({
      orderId,
      customerId: updated[0].customerId,
      quoteId: updated[0].quoteId,
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

async function setOrderStatus(id: string, status: OrderStatus) {
  const deliveredDate = status === 'delivered' ? new Date() : null;
  const updated = await sql<{ id: string; customerId: string; quoteId: string | null }[]>`
    UPDATE orders
    SET
      status = ${status},
      delivered_date = ${deliveredDate}
    WHERE id = ${id}
    RETURNING id, customer_id as "customerId", quote_id as "quoteId"
  `;

  if (!updated[0]) {
    return;
  }

  revalidateOrderPaths({
    orderId: id,
    customerId: updated[0].customerId,
    quoteId: updated[0].quoteId,
  });
}

export async function advanceStep(id: string, status: OrderStatus) {
  await requireAdminSessionUserId();
  const nextStep = OrderStatuses[status].next;
  if (nextStep) {
    await setOrderStatus(id, nextStep);
  }
}

export async function goBackStep(id: string, status: OrderStatus) {
  await requireAdminSessionUserId();
  const previousStep = OrderStatuses[status].previous;
  if (previousStep) {
    await setOrderStatus(id, previousStep);
  }
}

export async function deleteOrder(id: string) {
  await requireAdminSessionUserId();

  const printJobs = await sql<{ id: string }[]>`
    SELECT id
    FROM print_jobs
    WHERE order_id = ${id}
    LIMIT 1
  `;

  if (printJobs[0]) {
    return;
  }

  const deleted = await sql<{ customerId: string; quoteId: string | null }[]>`
    DELETE FROM orders
    WHERE id = ${id}
    RETURNING customer_id as "customerId", quote_id as "quoteId"
  `;

  revalidateOrderPaths({
    customerId: deleted[0]?.customerId,
    quoteId: deleted[0]?.quoteId,
  });
  redirect('/admin/orders');
}
