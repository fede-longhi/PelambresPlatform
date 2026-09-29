'use server';

import { z } from 'zod';
import sql from '@/lib/db';
import nodemailer from 'nodemailer';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canAccessAdmin, canAccessCustomer } from '@/lib/auth/permissions';
import { fetchCustomerIdForUser } from '@/lib/data/customer-portal-data';
import { QUOTE_REQUEST_STATUSES } from '@/lib/consts/quote-request-consts';
import { QuoteTable } from '@/types/definitions';

const FormSchema = z.object({
  id: z.string(),
  email: z
    .string({
      invalid_type_error: 'Ingresa un email de contacto.',
    })
    .email({ message: 'Tiene que ingresar un email valido.' }),
  name: z.string({
    invalid_type_error: 'Ingresa un nombre.',
  }),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s-]+$/,
      'Debe contener solo números, espacios, guiones y opcionalmente empezar con +'
    )
    .min(8, 'El número debe tener al menos 8 dígitos')
    .max(20, 'El número no puede tener más de 20 dígitos')
    .transform((val) => val.replace(/\D/g, '')),
  detail: z
    .string({
      invalid_type_error: 'Ingresa alguna descripción de tu proyecto.',
    })
    .min(10, { message: 'La descripción debe contener al menos 10 caracteres.' }),
  date: z.string(),
});

const CreateQuote = FormSchema.omit({ id: true, date: true });

export type QuoteFormState = {
  errors?: {
    email?: string[];
    name?: string[];
    phone?: string[];
    detail?: string[];
  };
  message?: string | null;
  status?: string | null;
  payload?: FormData;
};

export type LinkQuoteCustomerFormState = {
  errors?: {
    customerId?: string[];
  };
  message?: string | null;
  success?: boolean;
};

async function assertAdminAccess() {
  const session = await auth();
  const sessionUser = session?.user;

  if (
    !sessionUser?.id ||
    !canAccessAdmin({
      id: sessionUser.id,
      email: sessionUser.email ?? '',
      name: sessionUser.name ?? '',
      role: sessionUser.role,
      isActive: sessionUser.isActive,
      mustChangePassword: sessionUser.mustChangePassword,
    })
  ) {
    throw new Error('Unauthorized');
  }

  return sessionUser.id;
}

async function resolveCustomerIdForLoggedInCustomer(): Promise<string | null> {
  const session = await auth();
  const sessionUser = session?.user;

  if (
    !sessionUser?.id ||
    !sessionUser.email ||
    !canAccessCustomer({
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name ?? '',
      role: sessionUser.role,
      isActive: sessionUser.isActive,
      mustChangePassword: sessionUser.mustChangePassword,
    })
  ) {
    return null;
  }

  return fetchCustomerIdForUser(sessionUser.id);
}

export async function createQuote(
  _prevState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const validatedFields = CreateQuote.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    phone: formData.get('phone'),
    detail: formData.get('detail'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan completar algunos campos.',
      payload: formData,
    };
  }

  const { email, name, phone, detail } = validatedFields.data;
  const date = new Date().toISOString().split('T')[0];
  const customerId = await resolveCustomerIdForLoggedInCustomer();

  try {
    const result = await sql`
      INSERT INTO quote_requests (name, email, phone, detail, date, customer_id)
      VALUES (${name}, ${email}, ${phone}, ${detail}, ${date}, ${customerId})
      RETURNING id
    `;

    const fileUrlsRaw = formData.get('attachments') as string | null;
    let uploadedUrls: { pathname: string; downloadUrl: string }[] = [];

    if (fileUrlsRaw) {
      uploadedUrls = JSON.parse(fileUrlsRaw);

      const dbInserts = uploadedUrls.map(
        (url) => sql`
          INSERT INTO quote_request_attachments(quote_request_id, file_url)
          VALUES (${result[0].id}, ${url.downloadUrl})
        `
      );
      await Promise.all(dbInserts);
    }

    await sendQuoteEmail(
      {
        id: result[0].id,
        name: name,
        phone: phone,
        detail: detail,
        email: email,
        date: date,
        first_name: null,
        last_name: null,
        customer_id: customerId,
        status: 'new',
      } as QuoteTable,
      uploadedUrls
    );
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Error insertando la cotización.',
      payload: formData,
    };
  }

  if (customerId) {
    revalidatePath('/customer');
  }

  return { status: 'success', message: null, errors: {} };
}

export async function linkQuoteRequestToCustomer(
  quoteRequestId: string,
  _prevState: LinkQuoteCustomerFormState,
  formData: FormData
): Promise<LinkQuoteCustomerFormState> {
  await assertAdminAccess();

  const customerId = String(formData.get('customerId') ?? '').trim();

  if (!customerId) {
    return {
      errors: { customerId: ['Seleccioná o creá un cliente.'] },
      message: 'Seleccioná un cliente para asociar.',
      success: false,
    };
  }

  try {
    const customerRows = await sql<{ id: string }[]>`
      SELECT id
      FROM customers
      WHERE id = ${customerId}
      LIMIT 1
    `;

    if (!customerRows[0]) {
      return {
        errors: { customerId: ['El cliente seleccionado no existe.'] },
        message: 'El cliente seleccionado no existe.',
        success: false,
      };
    }

    const updated = await sql<{ id: string }[]>`
      UPDATE quote_requests
      SET
        customer_id = ${customerId},
        status = CASE
          WHEN status = 'new' THEN 'in_progress'
          ELSE status
        END
      WHERE id = ${quoteRequestId}
      RETURNING id
    `;

    if (!updated[0]) {
      return {
        message: 'No se encontró la solicitud de presupuesto.',
        success: false,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      message: 'No se pudo asociar el cliente a la solicitud.',
      success: false,
    };
  }

  revalidatePath(`/admin/quote-requests/${quoteRequestId}`);
  revalidatePath('/admin/quote-requests');
  revalidatePath('/admin');
  revalidatePath('/customer');
  return { message: 'success', success: true };
}

export type QuoteStatusFormState = {
  errors?: {
    status?: string[];
  };
  message?: string | null;
  success?: boolean;
  savedStatus?: string;
};

export async function updateQuoteRequestStatus(
  quoteRequestId: string,
  _prevState: QuoteStatusFormState,
  formData: FormData
): Promise<QuoteStatusFormState> {
  await assertAdminAccess();

  const parsed = z
    .enum(['new', 'in_progress', 'quoted', 'closed'], {
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
    const updated = await sql<{ id: string }[]>`
      UPDATE quote_requests
      SET status = ${parsed.data}
      WHERE id = ${quoteRequestId}
      RETURNING id
    `;

    if (!updated[0]) {
      return {
        message: 'No se encontró la solicitud de presupuesto.',
        success: false,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      message: 'No se pudo actualizar el estado.',
      success: false,
    };
  }

  revalidatePath(`/admin/quote-requests/${quoteRequestId}`);
  revalidatePath('/admin/quote-requests');
  revalidatePath('/admin');
  return {
    success: true,
    message: 'Estado actualizado.',
    savedStatus: parsed.data,
  };
}

export async function deleteQuoteRequest(quoteRequestId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const parsedId = z.string().uuid().safeParse(quoteRequestId);

  if (!parsedId.success) {
    return { success: false, message: 'La solicitud no es válida.' };
  }

  try {
    await assertAdminAccess();

    const deleted = await sql.begin(async (tx) => {
      await tx`
        DELETE FROM quote_request_attachments
        WHERE quote_request_id = ${parsedId.data}
      `;

      return tx<{ id: string }[]>`
        DELETE FROM quote_requests
        WHERE id = ${parsedId.data}
        RETURNING id
      `;
    });

    if (!deleted[0]) {
      return { success: false, message: 'No se encontró la solicitud.' };
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        success: false,
        message: 'No tenés permiso para borrar solicitudes.',
      };
    }

    console.error(error);
    return { success: false, message: 'No se pudo borrar la solicitud.' };
  }

  revalidatePath('/admin/quote-requests');
  revalidatePath(`/admin/quote-requests/${parsedId.data}`);
  revalidatePath('/admin/quotes');
  revalidatePath('/admin');
  revalidatePath('/customer');

  return { success: true, message: 'Solicitud borrada.' };
}

const quoteRequestIdListSchema = z
  .array(z.string().uuid())
  .min(1, { message: 'Seleccioná al menos una solicitud.' })
  .max(50, { message: 'Podés actualizar hasta 50 solicitudes a la vez.' });

function parseQuoteRequestIds(quoteRequestIds: string[]) {
  return quoteRequestIdListSchema.safeParse([...new Set(quoteRequestIds)]);
}

function unauthorizedBulkMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === 'Unauthorized') {
    return 'No tenés permiso para modificar solicitudes.';
  }

  console.error(error);
  return fallback;
}

export async function deleteQuoteRequests(quoteRequestIds: string[]): Promise<{
  success: boolean;
  message: string;
}> {
  const parsedIds = parseQuoteRequestIds(quoteRequestIds);

  if (!parsedIds.success) {
    return {
      success: false,
      message: parsedIds.error.issues[0]?.message ?? 'La selección no es válida.',
    };
  }

  try {
    await assertAdminAccess();

    const deleted = await sql.begin(async (tx) => {
      await tx`
        DELETE FROM quote_request_attachments
        WHERE quote_request_id IN ${sql(parsedIds.data)}
      `;

      return tx<{ id: string }[]>`
        DELETE FROM quote_requests
        WHERE id IN ${sql(parsedIds.data)}
        RETURNING id
      `;
    });

    if (deleted.length === 0) {
      return { success: false, message: 'No se encontraron las solicitudes.' };
    }

    revalidatePath('/admin/quote-requests');
    revalidatePath('/admin/quotes');
    revalidatePath('/admin');
    revalidatePath('/customer');

    for (const quoteRequest of deleted) {
      revalidatePath(`/admin/quote-requests/${quoteRequest.id}`);
    }

    return {
      success: true,
      message:
        deleted.length === 1
          ? 'Solicitud borrada.'
          : `${deleted.length} solicitudes borradas.`,
    };
  } catch (error) {
    return {
      success: false,
      message: unauthorizedBulkMessage(error, 'No se pudieron borrar las solicitudes.'),
    };
  }
}

export async function updateQuoteRequestsStatus(
  quoteRequestIds: string[],
  status: string
): Promise<{
  success: boolean;
  message: string;
}> {
  const parsedIds = parseQuoteRequestIds(quoteRequestIds);
  const parsedStatus = z.enum(QUOTE_REQUEST_STATUSES).safeParse(status);

  if (!parsedIds.success) {
    return {
      success: false,
      message: parsedIds.error.issues[0]?.message ?? 'La selección no es válida.',
    };
  }

  if (!parsedStatus.success) {
    return { success: false, message: 'Seleccioná un estado válido.' };
  }

  try {
    await assertAdminAccess();

    const updated = await sql<{ id: string }[]>`
      UPDATE quote_requests
      SET status = ${parsedStatus.data}
      WHERE id IN ${sql(parsedIds.data)}
      RETURNING id
    `;

    if (updated.length === 0) {
      return { success: false, message: 'No se encontraron las solicitudes.' };
    }

    revalidatePath('/admin/quote-requests');
    revalidatePath('/admin');

    for (const quoteRequest of updated) {
      revalidatePath(`/admin/quote-requests/${quoteRequest.id}`);
    }

    return {
      success: true,
      message:
        updated.length === 1
          ? 'Estado actualizado.'
          : `Estado actualizado en ${updated.length} solicitudes.`,
    };
  } catch (error) {
    return {
      success: false,
      message: unauthorizedBulkMessage(
        error,
        'No se pudo actualizar el estado de las solicitudes.'
      ),
    };
  }
}

async function sendQuoteEmail(
  quote: QuoteTable,
  attachments: { pathname: string; downloadUrl: string }[]
) {
  try {
    const to = 'contacto@pelambres.com.ar';
    const cc = 'pelambres3d@gmail.com';
    const subject = `NEW QUOTE REQUEST - ${quote.name}`;
    const body = `
            <div style="font-family: Arial, sans-serif; color: #222;">
            <h2 style="color: #2d7a7b;">Nuevo pedido de cotización</h2>
            <table style="border-collapse: collapse;">
                <tr>
                <td style="padding: 4px 8px;"><strong>Nombre:</strong></td>
                <td style="padding: 4px 8px;">${quote.name}</td>
                </tr>
                <tr>
                <td style="padding: 4px 8px;"><strong>Email:</strong></td>
                <td style="padding: 4px 8px;">${quote.email}</td>
                </tr>
                <tr>
                <td style="padding: 4px 8px;"><strong>Teléfono:</strong></td>
                <td style="padding: 4px 8px;">${quote.phone}</td>
                </tr>
                <tr>
                <td style="padding: 4px 8px;"><strong>Fecha:</strong></td>
                <td style="padding: 4px 8px;">${quote.date}</td>
                </tr>
            </table>
            <div style="margin-top: 16px;">
                <p style="margin-bottom: 4px;"><strong>Detalles del proyecto:</strong></p>
                <div style="background: #f6f6f6; padding: 12px; border-radius: 4px; border: 1px solid #e0e0e0;">
                ${quote.detail.replace(/\n/g, '<br>')}
                </div>
            </div>
            <div>
                <p><strong>Archivos adjuntos:</strong></p>
                <ul>
                ${attachments.map((attachment) => `<li><a href="${attachment.downloadUrl}">${attachment.pathname}</a></li>`).join('')}
                </ul>
            </div>
            <hr style="margin: 24px 0;">
            <p style="font-size: 0.95em; color: #888;">Este mensaje fue enviado desde la plataforma de Pelambres.</p>
            </div>
        `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_MAIL_USER,
        pass: process.env.GOOGLE_MAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Pelambres 3D" <${process.env.GOOGLE_MAIL_USER}>`,
      cc,
      to,
      subject,
      html: body,
    });
    console.log('Correo enviado con éxito:', info.response);
  } catch (error) {
    console.error('Error enviando el correo:', error);
  }
}
