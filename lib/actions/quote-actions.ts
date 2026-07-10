'use server';

import { z } from 'zod';
import sql from '@/lib/db';
import nodemailer from 'nodemailer';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canAccessAdmin, canAccessCustomer } from '@/lib/auth/permissions';
import { fetchCustomerIdForUser } from '@/lib/data/customer-portal-data';
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
      SET customer_id = ${customerId}
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
  revalidatePath('/customer');
  return { message: 'success', success: true };
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
