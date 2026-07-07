'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import {
  generateUniqueUsername,
  resolveOrCreateCustomerId,
} from '@/lib/actions/oauth-customer-actions';
import { fetchUserByEmailAndRole } from '@/lib/data/user-data';
import { hashPassword } from '@/lib/utils/password';
import { composeUserFullName } from '@/lib/utils';
import { userHasAuthCredentials } from '@/lib/auth/platform-access';
import {
  EXISTING_PLATFORM_ACCOUNT_REGISTER_MESSAGE,
} from '@/lib/auth/enrollment-messages';
import { resolveSafeRedirectPath } from '@/lib/auth/safe-redirect';
import type { User } from '@/types/user-definitions';

const RegisterSchema = z
  .object({
    firstName: z.string().trim().min(1, { message: 'El nombre es obligatorio.' }),
    lastName: z.string().trim().optional().default(''),
    email: z.string().trim().email({ message: 'Ingresá un correo electrónico válido.' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
    confirmPassword: z.string().min(1, { message: 'Confirmá la contraseña.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export type RegisterFormState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  success?: boolean;
};

async function signInRegisteredCustomer(
  email: string,
  password: string,
  redirectTo: string
) {
  const signInResult = await signIn('credentials', {
    email,
    password,
    role: 'customer',
    redirectTo,
    redirect: false,
  });

  if (signInResult?.error) {
    return {
      success: false as const,
      message:
        'La cuenta se activó, pero no pudimos iniciar sesión automáticamente. Probá ingresar manualmente.',
    };
  }

  return { success: true as const };
}

export async function registerCustomer(
  _previousState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const redirectTo = resolveSafeRedirectPath(formData.get('redirectTo'));

  const validatedFields = RegisterSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisá los datos ingresados.',
    };
  }

  const { firstName, lastName, email, password } = validatedFields.data;
  const normalizedEmail = email.trim().toLowerCase();
  const fullName = composeUserFullName(firstName, lastName);
  const hashedPassword = await hashPassword(password);

  const existingCustomerUser = await fetchUserByEmailAndRole(normalizedEmail, 'customer');

  if (existingCustomerUser) {
    if (userHasAuthCredentials(existingCustomerUser)) {
      return {
        success: false,
        message: EXISTING_PLATFORM_ACCOUNT_REGISTER_MESSAGE,
      };
    }

    try {
      const customerId =
        existingCustomerUser.customer_id ??
        (await resolveOrCreateCustomerId(normalizedEmail, fullName));

      await sql`
        UPDATE users
        SET
          first_name = ${firstName},
          last_name = ${lastName},
          name = ${fullName},
          password = ${hashedPassword},
          customer_id = ${customerId},
          must_change_password = false
        WHERE id = ${existingCustomerUser.id}
          AND deleted_at IS NULL
      `;

      const signInResult = await signInRegisteredCustomer(
        normalizedEmail,
        password,
        redirectTo
      );

      if (!signInResult.success) {
        return signInResult;
      }
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          success: false,
          message:
            'La cuenta se activó, pero no pudimos iniciar sesión automáticamente. Probá ingresar manualmente.',
        };
      }

      console.error('Failed to activate provisional customer account:', error);
      return {
        success: false,
        message: 'No se pudo activar la cuenta. Intentá nuevamente.',
      };
    }

    redirect(redirectTo);
  }

  try {
    const customerId = await resolveOrCreateCustomerId(normalizedEmail, fullName);
    const username = await generateUniqueUsername(normalizedEmail);

    const insertedUsers = await sql<User[]>`
      INSERT INTO users (
        username,
        first_name,
        last_name,
        name,
        email,
        password,
        image_url,
        role,
        customer_id,
        must_change_password,
        is_active
      )
      VALUES (
        ${username},
        ${firstName},
        ${lastName},
        ${fullName},
        ${normalizedEmail},
        ${hashedPassword},
        NULL,
        'customer',
        ${customerId},
        false,
        true
      )
      RETURNING *
    `;

    const insertedUser = insertedUsers[0];

    const signInResult = await signInRegisteredCustomer(
      normalizedEmail,
      password,
      redirectTo
    );

    if (!signInResult.success) {
      return signInResult;
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message:
          'La cuenta se creó, pero no pudimos iniciar sesión automáticamente. Probá ingresar manualmente.',
      };
    }

    console.error('Failed to register customer:', error);
    return {
      success: false,
      message: 'No se pudo crear la cuenta. Intentá nuevamente.',
    };
  }

  redirect(redirectTo);
}
