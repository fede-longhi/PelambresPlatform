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
import { linkCourseRegistrationsToUser } from '@/lib/data/course-data';
import { fetchUserByEmailAndRole } from '@/lib/data/user-data';
import { hashPassword } from '@/lib/utils/password';
import type { User } from '@/types/user-definitions';

const RegisterSchema = z
  .object({
    name: z.string().trim().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
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
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function registerCustomer(
  _previousState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
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

  const { name, email, password } = validatedFields.data;
  const normalizedEmail = email.trim().toLowerCase();

  const existingCustomerUser = await fetchUserByEmailAndRole(normalizedEmail, 'customer');

  if (existingCustomerUser) {
    return {
      success: false,
      message: 'Ya existe una cuenta de cliente con ese email.',
    };
  }

  try {
    const customerId = await resolveOrCreateCustomerId(normalizedEmail, name);
    const username = await generateUniqueUsername(normalizedEmail);
    const hashedPassword = await hashPassword(password);

    const insertedUsers = await sql<User[]>`
      INSERT INTO users (
        username,
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
        ${name},
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

    if (insertedUser) {
      await linkCourseRegistrationsToUser(insertedUser.id, normalizedEmail);
    }

    const signInResult = await signIn('credentials', {
      email: normalizedEmail,
      password,
      role: 'customer',
      redirectTo: '/customer',
      redirect: false,
    });

    if (signInResult?.error) {
      return {
        success: false,
        message: 'La cuenta se creó, pero no pudimos iniciar sesión automáticamente. Probá ingresar manualmente.',
      };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: 'La cuenta se creó, pero no pudimos iniciar sesión automáticamente. Probá ingresar manualmente.',
      };
    }

    console.error('Failed to register customer:', error);
    return {
      success: false,
      message: 'No se pudo crear la cuenta. Intentá nuevamente.',
    };
  }

  redirect('/customer');
}
