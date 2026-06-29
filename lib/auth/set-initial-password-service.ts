import { z } from 'zod';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { hashPassword } from '@/lib/utils/password';
import type { SetInitialPasswordResult } from '@/types/user-definitions';

const PASSWORD_MIN_LENGTH = 6;

const SetInitialPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
      }),
    confirmPassword: z.string().min(1, { message: 'Confirmá la nueva contraseña.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export async function setInitialPasswordForSession(
  formData: FormData
): Promise<SetInitialPasswordResult> {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.email) {
    return { message: 'No estás autenticado.', success: false };
  }

  if (!sessionUser.mustChangePassword) {
    return { message: 'success', success: true };
  }

  const validatedFields = SetInitialPasswordSchema.safeParse({
    newPassword: formData.get('new-password'),
    confirmPassword: formData.get('confirm-password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisá los campos marcados.',
      success: false,
    };
  }

  const hashedPassword = await hashPassword(validatedFields.data.newPassword);

  try {
    await sql`
      UPDATE users
      SET password = ${hashedPassword}, must_change_password = false
      WHERE id = ${sessionUser.id}
    `;

    return { message: 'success', success: true };
  } catch (error) {
    console.error(error);
    return { message: 'Hubo un error al establecer la contraseña.', success: false };
  }
}
