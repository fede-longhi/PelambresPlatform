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
import { formatDateToLocal, generateCode } from '@/lib/utils';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_ATTACHMENT_SIZE_BYTES,
  ORDER_ATTACHMENTS_FOLDER,
  TRACKING_CODE_CHARACTERS,
  TRACKING_CODE_LENGTH,
} from '@/lib/consts';
import { pesosToCents } from '@/lib/quote-math';
import { insertFormFiles } from '@/lib/actions/file-storage';
import { sendOrderStatusEmail } from '@/lib/mail/mailer';
import type { CustomerType } from '@/types/definitions';

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
  emailStatus?: 'sent' | 'failed' | 'skipped';
};

export type OrderNotesFormState = {
  errors?: {
    notes?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export type OrderAttachmentsFormState = {
  message?: string | null;
  success?: boolean;
};

export type SendOrderStatusEmailFormState = {
  message?: string | null;
  success?: boolean;
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

async function insertOrderStatusEvent(
  tx: typeof sql,
  orderId: string,
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus,
  userId: string
) {
  await tx`
    INSERT INTO order_status_events (order_id, from_status, to_status, created_by)
    VALUES (${orderId}, ${fromStatus}, ${toStatus}, ${userId})
  `;
}

function getOrderStatusEmailCopy(status: OrderStatus, trackingCode: string) {
  if (status === 'finished') {
    return {
      statusLabel: OrderStatuses.finished.label,
      body: `Tu pedido ${trackingCode} ya está terminado. Te vamos a contactar para coordinar la entrega.`,
    };
  }

  if (status === 'delivered') {
    return {
      statusLabel: OrderStatuses.delivered.label,
      body: `Tu pedido ${trackingCode} fue entregado. ¡Gracias por elegir Pelambres 3D!`,
    };
  }

  return null;
}

async function notifyCustomerOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<'sent' | 'failed' | 'no-email' | 'not-found' | 'unsupported'> {
  if (status !== 'finished' && status !== 'delivered') {
    return 'unsupported';
  }

  const orders = await sql<{
    trackingCode: string;
    estimatedDate: string | null;
    email: string | null;
    first_name: string;
    last_name: string;
    name: string;
    customer_type: CustomerType;
  }[]>`
    SELECT
      orders.tracking_code as "trackingCode",
      orders.estimated_date as "estimatedDate",
      customers.email,
      customers.first_name,
      customers.last_name,
      customers.name,
      customers.type as customer_type
    FROM orders
    JOIN customers ON customers.id = orders.customer_id
    WHERE orders.id = ${orderId}
      AND orders.deleted_at IS NULL
    LIMIT 1
  `;

  const order = orders[0];
  if (!order) {
    return 'not-found';
  }

  const recipient = order.email?.trim();
  if (!recipient) {
    return 'no-email';
  }

  const copy = getOrderStatusEmailCopy(status, order.trackingCode);
  if (!copy) {
    return 'unsupported';
  }

  try {
    await sendOrderStatusEmail({
      to: recipient,
      clientName:
        order.customer_type === 'person'
          ? (order.first_name ?? '').trim() || order.last_name || 'cliente'
          : order.name,
      trackingCode: order.trackingCode,
      statusLabel: copy.statusLabel,
      estimatedDate: order.estimatedDate
        ? formatDateToLocal(order.estimatedDate, 'es-AR')
        : undefined,
      body: copy.body,
    });
    return 'sent';
  } catch (error) {
    console.error(error);
    return 'failed';
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
  const userId = await requireAdminSessionUserId();

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
          AND deleted_at IS NULL
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

      await insertOrderStatusEvent(tx, inserted[0].id, null, 'pending', userId);

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
  const userId = await requireAdminSessionUserId();
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
    await insertOrderStatusEvent(sql, orderId, null, status, userId);
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
  const userId = await requireAdminSessionUserId();
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
    const current = await sql<{ status: OrderStatus }[]>`
      SELECT status
      FROM orders
      WHERE id = ${id}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (!current[0]) {
      return { message: 'No se encontró el pedido.', payload: formData };
    }

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
        AND deleted_at IS NULL
      RETURNING id
    `;

    if (!updated[0]) {
      return { message: 'No se encontró el pedido.', payload: formData };
    }

    if (current[0].status !== status) {
      await insertOrderStatusEvent(sql, id, current[0].status, status, userId);
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
  const userId = await requireAdminSessionUserId();

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

  try {
    const current = await sql<{
      status: OrderStatus;
      customerId: string;
      quoteId: string | null;
    }[]>`
      SELECT
        status,
        customer_id as "customerId",
        quote_id as "quoteId"
      FROM orders
      WHERE id = ${orderId}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (!current[0]) {
      return {
        message: 'No se encontró el pedido.',
        success: false,
      };
    }

    if (current[0].status === parsed.data) {
      return {
        success: true,
        message: 'Estado actualizado.',
        savedStatus: parsed.data,
        emailStatus: 'skipped',
      };
    }

    const deliveredDate = parsed.data === 'delivered' ? new Date() : null;
    await sql`
      UPDATE orders
      SET
        status = ${parsed.data},
        delivered_date = ${deliveredDate}
      WHERE id = ${orderId}
        AND deleted_at IS NULL
    `;

    await insertOrderStatusEvent(
      sql,
      orderId,
      current[0].status,
      parsed.data,
      userId
    );

    const shouldSendEmail = formData.get('sendEmail') === 'true';
    let emailStatus: OrderStatusFormState['emailStatus'] = 'skipped';

    if (shouldSendEmail) {
      const notifyResult = await notifyCustomerOrderStatus(orderId, parsed.data);
      if (notifyResult === 'sent') {
        emailStatus = 'sent';
      } else if (notifyResult === 'failed') {
        emailStatus = 'failed';
      }
    }

    revalidateOrderPaths({
      orderId,
      customerId: current[0].customerId,
      quoteId: current[0].quoteId,
    });

    return {
      success: true,
      message:
        emailStatus === 'failed'
          ? 'Estado actualizado. No se pudo enviar el email al cliente.'
          : emailStatus === 'sent'
            ? 'Estado actualizado. Se avisó al cliente por email.'
            : shouldSendEmail
              ? 'Estado actualizado. El cliente no tiene email.'
              : 'Estado actualizado.',
      savedStatus: parsed.data,
      emailStatus,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'No se pudo actualizar el estado.',
      success: false,
    };
  }
}

async function setOrderStatus(
  id: string,
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  userId: string
) {
  const deliveredDate = toStatus === 'delivered' ? new Date() : null;
  const updated = await sql<{ id: string; customerId: string; quoteId: string | null }[]>`
    UPDATE orders
    SET
      status = ${toStatus},
      delivered_date = ${deliveredDate}
    WHERE id = ${id}
      AND deleted_at IS NULL
    RETURNING id, customer_id as "customerId", quote_id as "quoteId"
  `;

  if (!updated[0]) {
    return;
  }

  await insertOrderStatusEvent(sql, id, fromStatus, toStatus, userId);

  revalidateOrderPaths({
    orderId: id,
    customerId: updated[0].customerId,
    quoteId: updated[0].quoteId,
  });
}

export async function advanceStep(id: string, status: OrderStatus) {
  const userId = await requireAdminSessionUserId();
  const nextStep = OrderStatuses[status].next;
  if (nextStep) {
    await setOrderStatus(id, status, nextStep, userId);
  }
}

export async function goBackStep(id: string, status: OrderStatus) {
  const userId = await requireAdminSessionUserId();
  const previousStep = OrderStatuses[status].previous;
  if (previousStep) {
    await setOrderStatus(id, status, previousStep, userId);
  }
}

export async function sendOrderStatusEmailToCustomer(
  orderId: string,
  _prevState: SendOrderStatusEmailFormState,
  formData: FormData
): Promise<SendOrderStatusEmailFormState> {
  await requireAdminSessionUserId();

  const parsedStatus = z
    .enum(['finished', 'delivered'], {
      errorMap: () => ({ message: 'Seleccione un aviso válido.' }),
    })
    .safeParse(formData.get('status'));

  if (!parsedStatus.success) {
    return { success: false, message: 'Seleccione un aviso válido.' };
  }

  const result = await notifyCustomerOrderStatus(orderId, parsedStatus.data);

  if (result === 'sent') {
    return {
      success: true,
      message:
        parsedStatus.data === 'finished'
          ? 'Se envió el aviso de pedido terminado.'
          : 'Se envió el aviso de pedido entregado.',
    };
  }

  if (result === 'no-email') {
    return {
      success: false,
      message: 'El cliente no tiene un email para enviar el aviso.',
    };
  }

  if (result === 'not-found') {
    return { success: false, message: 'No se encontró el pedido.' };
  }

  return { success: false, message: 'No se pudo enviar el email al cliente.' };
}

export async function updateOrderNotes(
  orderId: string,
  _prevState: OrderNotesFormState,
  formData: FormData
): Promise<OrderNotesFormState> {
  await requireAdminSessionUserId();

  const notes = String(formData.get('notes') ?? '');
  if (notes.length > 4000) {
    return {
      errors: { notes: ['Las notas no pueden superar los 4000 caracteres.'] },
      message: 'No se pudieron guardar las notas.',
      success: false,
    };
  }

  const updated = await sql<{ id: string; customerId: string }[]>`
    UPDATE orders
    SET notes = ${notes}
    WHERE id = ${orderId}
      AND deleted_at IS NULL
    RETURNING id, customer_id as "customerId"
  `;

  if (!updated[0]) {
    return { message: 'No se encontró el pedido.', success: false };
  }

  revalidateOrderPaths({
    orderId,
    customerId: updated[0].customerId,
  });

  return { success: true, message: 'Notas guardadas.' };
}

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex < 0) {
    return '';
  }
  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

export async function addOrderAttachments(
  orderId: string,
  _prevState: OrderAttachmentsFormState,
  formData: FormData
): Promise<OrderAttachmentsFormState> {
  await requireAdminSessionUserId();

  const filesCount = Number(formData.get('filesCount') ?? 0);
  if (!filesCount) {
    return { success: false, message: 'Seleccione al menos un archivo.' };
  }

  for (let index = 0; index < filesCount; index += 1) {
    const file = formData.get(`file-${index}`);
    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    if (file.size > MAX_FILE_ATTACHMENT_SIZE_BYTES) {
      return {
        success: false,
        message: `El archivo ${file.name} supera el tamaño máximo permitido.`,
      };
    }

    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return {
        success: false,
        message: `El archivo ${file.name} no tiene un formato permitido.`,
      };
    }
  }

  const order = await sql<{ id: string; customerId: string }[]>`
    SELECT id, customer_id as "customerId"
    FROM orders
    WHERE id = ${orderId}
      AND deleted_at IS NULL
    LIMIT 1
  `;

  if (!order[0]) {
    return { success: false, message: 'No se encontró el pedido.' };
  }

  const uploaded = await insertFormFiles(ORDER_ATTACHMENTS_FOLDER, formData);
  if (!uploaded.success) {
    return {
      success: false,
      message: uploaded.message ?? 'No se pudieron subir los archivos.',
    };
  }

  const files = [
    ...(uploaded.insertedFiles ?? []),
    ...(uploaded.existingFiles ?? []),
  ].filter((file) => file.id);

  if (files.length === 0) {
    return { success: false, message: 'No se pudieron adjuntar los archivos.' };
  }

  try {
    for (const file of files) {
      const fileId = file.id;
      if (!fileId) {
        continue;
      }

      await sql`
        INSERT INTO order_attachments (order_id, file_id)
        VALUES (${orderId}, ${fileId})
        ON CONFLICT (order_id, file_id) DO NOTHING
      `;
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: 'No se pudieron adjuntar los archivos.' };
  }

  revalidateOrderPaths({
    orderId,
    customerId: order[0].customerId,
  });

  return { success: true, message: 'Archivos adjuntos.' };
}

export async function deleteOrderAttachment(attachmentId: string, orderId: string) {
  await requireAdminSessionUserId();

  const order = await sql<{ id: string }[]>`
    SELECT id
    FROM orders
    WHERE id = ${orderId}
      AND deleted_at IS NULL
    LIMIT 1
  `;

  if (!order[0]) {
    return;
  }

  const deleted = await sql<{ id: string }[]>`
    DELETE FROM order_attachments
    WHERE id = ${attachmentId}
      AND order_id = ${orderId}
    RETURNING id
  `;

  if (deleted[0]) {
    revalidateOrderPaths({ orderId });
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
    UPDATE orders
    SET deleted_at = NOW()
    WHERE id = ${id}
      AND deleted_at IS NULL
    RETURNING customer_id as "customerId", quote_id as "quoteId"
  `;

  revalidateOrderPaths({
    customerId: deleted[0]?.customerId,
    quoteId: deleted[0]?.quoteId,
  });
  redirect('/admin/orders');
}
