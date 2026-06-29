'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { canAccessAdmin } from '@/lib/auth/permissions';
import {
  fetchUserByEmail,
  fetchUserById,
  requireAdminSessionUserId,
} from '@/lib/data/user-data';
import {
  generateTemporaryPassword,
  hashPassword,
  verifyPassword,
} from '@/lib/utils/password';
import type { UserListItem, UserRole } from '@/types/user-definitions';

const PASSWORD_MIN_LENGTH = 6;

const UserRoleSchema = z.enum(['admin', 'customer']);

const CreateUserSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'El nombre de usuario debe tener al menos 2 caracteres.' })
    .max(50, { message: 'El nombre de usuario no puede superar 50 caracteres.' })
    .regex(/^[a-zA-Z0-9._-]+$/, {
      message: 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.',
    }),
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Debe ser un email válido.' }),
  role: UserRoleSchema,
});

const UpdateUserSchema = CreateUserSchema.extend({
  isActive: z.enum(['true', 'false']),
});

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Ingresá tu contraseña actual.' }),
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

export type UserFormState = {
  errors?: {
    username?: string[];
    name?: string[];
    email?: string[];
    role?: string[];
    isActive?: string[];
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  success?: boolean;
  payload?: FormData;
  redirect?: boolean;
  user?: UserListItem;
  tempPassword?: string | null;
};

export type PasswordFormState = {
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  success?: boolean;
};

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === '23505'
  );
}

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

export async function createUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await assertAdminAccess();

  const validatedFields = CreateUserSchema.safeParse({
    username: formData.get('username'),
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisá los campos marcados.',
      payload: formData,
      success: false,
      redirect: prevState.redirect,
    };
  }

  const { username, name, email, role } = validatedFields.data;
  const tempPassword = generateTemporaryPassword();
  const hashedPassword = await hashPassword(tempPassword);

  try {
    const insertedUsers = await sql<UserListItem[]>`
      INSERT INTO users (username, name, email, password, role, must_change_password, is_active)
      VALUES (
        ${username},
        ${name},
        ${email},
        ${hashedPassword},
        ${role},
        true,
        true
      )
      RETURNING
        id,
        username,
        name,
        email,
        image_url,
        role,
        is_active,
        must_change_password,
        deleted_at
    `;

    revalidatePath('/admin/users');

    if (prevState.redirect) {
      redirect('/admin/users');
    }

    return {
      errors: {},
      message: 'success',
      success: true,
      user: insertedUsers[0],
      tempPassword,
      redirect: prevState.redirect,
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        message: 'Ya existe un usuario con ese email o nombre de usuario.',
        payload: formData,
        success: false,
        redirect: prevState.redirect,
      };
    }

    console.error(error);
    return {
      message: 'Hubo un error al crear el usuario.',
      payload: formData,
      success: false,
      redirect: prevState.redirect,
    };
  }
}

export async function updateUser(
  id: string,
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const currentAdminId = await assertAdminAccess();

  const validatedFields = UpdateUserSchema.safeParse({
    username: formData.get('username'),
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    isActive: formData.get('is-active'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisá los campos marcados.',
      payload: formData,
      success: false,
      redirect: prevState.redirect,
    };
  }

  const { username, name, email, role, isActive } = validatedFields.data;
  const isActiveBoolean = isActive === 'true';

  if (id === currentAdminId && !isActiveBoolean) {
    return {
      message: 'No podés desactivar tu propio usuario.',
      payload: formData,
      success: false,
      redirect: prevState.redirect,
    };
  }

  if (id === currentAdminId && role !== 'admin') {
    return {
      message: 'No podés cambiar tu propio rol de administrador.',
      payload: formData,
      success: false,
      redirect: prevState.redirect,
    };
  }

  try {
    const updatedUsers = await sql<UserListItem[]>`
      UPDATE users
      SET
        username = ${username},
        name = ${name},
        email = ${email},
        role = ${role},
        is_active = ${isActiveBoolean}
      WHERE id = ${id}
        AND deleted_at IS NULL
      RETURNING
        id,
        username,
        name,
        email,
        image_url,
        role,
        is_active,
        must_change_password,
        deleted_at
    `;

    if (!updatedUsers[0]) {
      return {
        message: 'Usuario no encontrado.',
        success: false,
        redirect: prevState.redirect,
      };
    }

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}/edit`);

    if (prevState.redirect) {
      redirect('/admin/users');
    }

    return {
      errors: {},
      message: 'success',
      success: true,
      user: updatedUsers[0],
      redirect: prevState.redirect,
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        message: 'Ya existe un usuario con ese email o nombre de usuario.',
        payload: formData,
        success: false,
        redirect: prevState.redirect,
      };
    }

    console.error(error);
    return {
      message: 'Hubo un error al actualizar el usuario.',
      payload: formData,
      success: false,
      redirect: prevState.redirect,
    };
  }
}

export async function adminResetPassword(userId: string): Promise<UserFormState> {
  const currentAdminId = await assertAdminAccess();

  if (userId === currentAdminId) {
    return {
      message: 'Usá tu perfil para cambiar tu propia contraseña.',
      success: false,
    };
  }

  const user = await fetchUserById(userId);
  if (!user) {
    return { message: 'Usuario no encontrado.', success: false };
  }

  const tempPassword = generateTemporaryPassword();
  const hashedPassword = await hashPassword(tempPassword);

  try {
    await sql`
      UPDATE users
      SET password = ${hashedPassword}, must_change_password = true
      WHERE id = ${userId}
        AND deleted_at IS NULL
    `;

    revalidatePath(`/admin/users/${userId}/edit`);

    return {
      message: 'success',
      success: true,
      tempPassword,
    };
  } catch (error) {
    console.error(error);
    return { message: 'Hubo un error al restablecer la contraseña.', success: false };
  }
}

export async function softDeleteUser(userId: string) {
  const currentAdminId = await requireAdminSessionUserId();

  if (userId === currentAdminId) {
    return { message: 'No podés eliminar tu propio usuario.', success: false };
  }

  try {
    await sql`
      UPDATE users
      SET deleted_at = NOW(), is_active = false
      WHERE id = ${userId}
        AND deleted_at IS NULL
    `;

    revalidatePath('/admin/users');
    redirect('/admin/users');
  } catch (error) {
    console.error(error);
    return { message: 'Hubo un error al eliminar el usuario.', success: false };
  }
}

export async function changeOwnPassword(
  prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.email) {
    return { message: 'No estás autenticado.', success: false };
  }

  const user = await fetchUserByEmail(sessionUser.email);
  if (!user) {
    return { message: 'Usuario no encontrado.', success: false };
  }

  const hasExistingPassword = !!user.password;

  if (hasExistingPassword) {
    const validatedFields = ChangePasswordSchema.safeParse({
      currentPassword: formData.get('current-password'),
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

    const currentPasswordMatches = await verifyPassword(
      validatedFields.data.currentPassword,
      user.password
    );

    if (!currentPasswordMatches) {
      return {
        errors: { currentPassword: ['La contraseña actual no es correcta.'] },
        message: 'Revisá los campos marcados.',
        success: false,
      };
    }

    const hashedPassword = await hashPassword(validatedFields.data.newPassword);

    try {
      await sql`
        UPDATE users
        SET password = ${hashedPassword}, must_change_password = false
        WHERE id = ${user.id}
      `;

      return { message: 'success', success: true };
    } catch (error) {
      console.error(error);
      return { message: 'Hubo un error al cambiar la contraseña.', success: false };
    }
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
      WHERE id = ${user.id}
    `;

    return { message: 'success', success: true };
  } catch (error) {
    console.error(error);
    return { message: 'Hubo un error al establecer la contraseña.', success: false };
  }
}

/** @deprecated Use fetchUserByEmail from lib/data/user-data.ts */
export async function getUser(email: string) {
  return fetchUserByEmail(email);
}
