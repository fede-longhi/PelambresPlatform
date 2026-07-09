'use server';

import { z } from 'zod';
import sql from '@/lib/db';
import { ROLE_SELECTION_LABELS } from '@/lib/auth/account-selection';
import {
  createPasswordResetRawToken,
  fetchPasswordResetByRawToken,
  insertPasswordResetToken,
  markPasswordResetTokenUsed,
} from '@/lib/data/password-reset-data';
import { fetchUserById, fetchActiveUsersByEmail, fetchActiveUsersWithPasswordByEmail } from '@/lib/data/user-data';
import { sendPasswordResetEmail } from '@/lib/mail/mailer';
import { hashPassword } from '@/lib/utils/password';
import type { UserRole } from '@/types/user-definitions';

const PASSWORD_MIN_LENGTH = 6;

const GENERIC_RESET_MESSAGE =
  'Si existe una cuenta con contraseña para ese email, te enviamos instrucciones para restablecerla.';

const EMAIL_NOT_FOUND_MESSAGE =
  'No existe una cuenta registrada con ese email.';

const NO_PASSWORD_ACCOUNT_MESSAGE =
  'Esa cuenta no tiene contraseña configurada. Creá tu cuenta o ingresá con Google si ya te inscribiste a un curso.';

const ResetPasswordSchema = z
  .object({
    newPassword: z.string().min(PASSWORD_MIN_LENGTH, {
      message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    }),
    confirmPassword: z.string().min(1, { message: 'Confirmá la nueva contraseña.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export type ForgotPasswordState =
  | {
      status: 'success';
      message: string;
    }
  | {
      status: 'role_selection';
      email: string;
      accounts: Array<{ userId: string; role: UserRole; name: string }>;
    }
  | {
      status: 'error';
      message: string;
    }
  | undefined;

export type ResetPasswordFormState = {
  errors?: {
    newPassword?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  success?: boolean;
};

async function sendResetEmailForUser(userId: string): Promise<boolean> {
  const user = await fetchUserById(userId);

  if (!user || !user.is_active || user.deleted_at) {
    return false;
  }

  const usersWithPassword = await fetchActiveUsersWithPasswordByEmail(user.email);

  if (!usersWithPassword.some((account) => account.id === userId)) {
    return false;
  }

  const rawToken = createPasswordResetRawToken();
  await insertPasswordResetToken(user.id, rawToken);

  await sendPasswordResetEmail(
    user.email,
    user.name,
    ROLE_SELECTION_LABELS[user.role],
    rawToken
  );

  return true;
}

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') ?? '').trim();
  const userId = String(formData.get('userId') ?? '').trim();

  if (!email) {
    return { status: 'error', message: 'Ingresá tu email.' };
  }

  try {
    if (userId) {
      const user = await fetchUserById(userId);

      if (
        !user ||
        user.deleted_at ||
        !user.is_active ||
        user.email.trim().toLowerCase() !== email.toLowerCase()
      ) {
        return { status: 'success', message: GENERIC_RESET_MESSAGE };
      }

      const usersWithPassword = await fetchActiveUsersWithPasswordByEmail(email);

      if (!usersWithPassword.some((account) => account.id === userId)) {
        return { status: 'success', message: GENERIC_RESET_MESSAGE };
      }

      await sendResetEmailForUser(user.id);
      return { status: 'success', message: GENERIC_RESET_MESSAGE };
    }

    const activeUsers = await fetchActiveUsersByEmail(email);
    const usersWithPassword = await fetchActiveUsersWithPasswordByEmail(email);

    if (activeUsers.length === 0) {
      return { status: 'error', message: EMAIL_NOT_FOUND_MESSAGE };
    }

    if (usersWithPassword.length === 0) {
      return { status: 'error', message: NO_PASSWORD_ACCOUNT_MESSAGE };
    }

    if (usersWithPassword.length === 1) {
      await sendResetEmailForUser(usersWithPassword[0].id);
      return { status: 'success', message: GENERIC_RESET_MESSAGE };
    }

    return {
      status: 'role_selection',
      email,
      accounts: usersWithPassword.map((user) => ({
        userId: user.id,
        role: user.role,
        name: user.name,
      })),
    };
  } catch (error) {
    console.error('Failed to request password reset:', error);
    return {
      status: 'error',
      message: 'No pudimos procesar la solicitud. Intentá de nuevo en unos minutos.',
    };
  }
}

export async function resetPasswordWithToken(
  rawToken: string,
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const resetUser = await fetchPasswordResetByRawToken(rawToken);

  if (!resetUser) {
    return {
      message: 'El enlace de restablecimiento es inválido o expiró.',
      success: false,
    };
  }

  const validatedFields = ResetPasswordSchema.safeParse({
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
      WHERE id = ${resetUser.userId}
        AND deleted_at IS NULL
    `;

    await markPasswordResetTokenUsed(rawToken);

    return {
      message: 'success',
      success: true,
    };
  } catch (error) {
    console.error('Failed to reset password:', error);
    return {
      message: 'Hubo un error al restablecer la contraseña.',
      success: false,
    };
  }
}
