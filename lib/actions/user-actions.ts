'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { canAccessAdmin, canAccessCustomer } from '@/lib/auth/permissions';
import {
  fetchUserById,
  fetchUserByEmail,
  fetchUserByEmailAndRole,
} from '@/lib/data/user-data';
import { requireAdminSessionUserId } from '@/lib/auth/require-admin';
import { createCustomerRecord } from '@/lib/actions/customer-actions';
import {
  generateTemporaryPassword,
  hashPassword,
  verifyPassword,
} from '@/lib/utils/password';
import type { UserListItem, UserRole } from '@/types/user-definitions';
import { composeUserFullName } from '@/lib/utils';

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
  firstName: z.string().trim().min(1, { message: 'El nombre es obligatorio.' }),
  lastName: z.string().trim().optional().default(''),
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

export type UserFormValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive?: 'true' | 'false';
};

export type UserFormState = {
  errors?: {
    username?: string[];
    name?: string[];
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    role?: string[];
    isActive?: string[];
    customerId?: string[];
    customerPhone?: string[];
    customerFirstName?: string[];
    customerLastName?: string[];
    customerName?: string[];
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  success?: boolean;
  payload?: FormData;
  formValues?: UserFormValues;
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

const OwnProfileSchema = z.object({
  firstName: z.string().trim().min(1, { message: 'El nombre es obligatorio.' }),
  lastName: z.string().trim().optional().default(''),
  phone: z.string().trim().max(40, { message: 'El teléfono es demasiado largo.' }).optional().default(''),
  address: z
    .string()
    .trim()
    .max(300, { message: 'La dirección es demasiado larga.' })
    .optional()
    .default(''),
});

export type OwnProfileFormState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    phone?: string[];
    address?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export type OwnProfileImageFormState = {
  message?: string | null;
  success?: boolean;
  imageUrl?: string | null;
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

function extractUserFormValues(formData: FormData): UserFormValues {
  const roleValue = String(formData.get('role') ?? 'admin');

  return {
    username: String(formData.get('username') ?? ''),
    firstName: String(formData.get('firstName') ?? ''),
    lastName: String(formData.get('lastName') ?? ''),
    email: String(formData.get('email') ?? ''),
    role: roleValue === 'customer' ? 'customer' : 'admin',
    isActive: formData.get('is-active') === 'false' ? 'false' : 'true',
  };
}

async function resolveCustomerIdForUser(
  role: UserRole,
  formData: FormData,
  existingCustomerId?: string | null
): Promise<{ customerId: string | null; errors?: UserFormState['errors']; message?: string }> {
  if (role !== 'customer') {
    return { customerId: null };
  }

  const email = String(formData.get('email') ?? '').trim();

  const linkMode = String(formData.get('customer-link-mode') ?? 'existing');
  const explicitCustomerId = String(formData.get('customerId') ?? '').trim();

  if (linkMode === 'existing') {
    if (explicitCustomerId) {
      const rows = await sql<{ id: string }[]>`
        SELECT id FROM customers WHERE id = ${explicitCustomerId} LIMIT 1
      `;

      if (!rows[0]) {
        return {
          customerId: null,
          message: 'El cliente seleccionado no existe.',
          errors: { customerId: ['Seleccioná un cliente válido.'] },
        };
      }

      return { customerId: explicitCustomerId };
    }

    if (existingCustomerId) {
      return { customerId: existingCustomerId };
    }

    return {
      customerId: null,
      message: 'Seleccioná un cliente existente o creá uno nuevo.',
      errors: { customerId: ['Debés vincular el usuario a un cliente.'] },
    };
  }

  const customerType = formData.get('customer-type') === 'business' ? 'business' : 'person';
  const phone = String(formData.get('customer-phone') ?? '').trim();
  const firstName = String(formData.get('customer-first-name') ?? '').trim();
  const lastName = String(formData.get('customer-last-name') ?? '').trim();
  const businessName = String(formData.get('customer-name') ?? '').trim();

  const fieldErrors: UserFormState['errors'] = {};

  if (customerType === 'person') {
    if (!firstName) {
      fieldErrors.customerFirstName = ['El nombre es obligatorio.'];
    }
    if (!lastName) {
      fieldErrors.customerLastName = ['El apellido es obligatorio.'];
    }
  } else if (!businessName) {
    fieldErrors.customerName = ['El nombre de la empresa es obligatorio.'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      customerId: null,
      message: 'Revisá los datos del nuevo cliente.',
      errors: fieldErrors,
    };
  }

  try {
    const customer = await createCustomerRecord({
      email,
      phone,
      type: customerType,
      firstName: customerType === 'person' ? firstName : undefined,
      lastName: customerType === 'person' ? lastName : undefined,
      name: customerType === 'business' ? businessName : undefined,
    });

    revalidatePath('/admin/customers');
    return { customerId: customer.id };
  } catch (error) {
    console.error(error);
    return {
      customerId: null,
      message: 'Hubo un error al crear el cliente.',
    };
  }
}

export async function createUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await assertAdminAccess();

  const validatedFields = CreateUserSchema.safeParse({
    username: formData.get('username'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisá los campos marcados.',
      formValues: extractUserFormValues(formData),
      success: false,
      redirect: prevState.redirect,
    };
  }

  const { username, firstName, lastName, email, role } = validatedFields.data;
  const fullName = composeUserFullName(firstName, lastName);
  const tempPassword = generateTemporaryPassword();
  const hashedPassword = await hashPassword(tempPassword);

  const customerResolution = await resolveCustomerIdForUser(role, formData);

  if (customerResolution.message || customerResolution.errors) {
    return {
      errors: customerResolution.errors,
      message: customerResolution.message ?? 'Revisá la vinculación con el cliente.',
      formValues: extractUserFormValues(formData),
      success: false,
      redirect: prevState.redirect,
    };
  }

  const customerId = customerResolution.customerId;

  const existingUserForRole = await fetchUserByEmailAndRole(email, role);

  if (existingUserForRole) {
    return {
      message: `Ya existe un usuario ${role === 'customer' ? 'cliente' : 'administrador'} con ese email.`,
      formValues: extractUserFormValues(formData),
      success: false,
      redirect: prevState.redirect,
    };
  }

  try {
    const insertedUsers = await sql<UserListItem[]>`
      INSERT INTO users (
        username,
        first_name,
        last_name,
        name,
        email,
        password,
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
        ${email},
        ${hashedPassword},
        ${role},
        ${customerId},
        true,
        true
      )
      RETURNING
        id,
        username,
        first_name,
        last_name,
        name,
        email,
        image_url,
        google_subject_id,
        role,
        customer_id,
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
        message: 'Ya existe un usuario con ese nombre de usuario.',
        formValues: extractUserFormValues(formData),
        success: false,
        redirect: prevState.redirect,
      };
    }

    console.error(error);
    return {
      message: 'Hubo un error al crear el usuario.',
      formValues: extractUserFormValues(formData),
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
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    role: formData.get('role'),
    isActive: formData.get('is-active'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisá los campos marcados.',
      formValues: extractUserFormValues(formData),
      success: false,
      redirect: prevState.redirect,
    };
  }

  const { username, firstName, lastName, email, role, isActive } = validatedFields.data;
  const fullName = composeUserFullName(firstName, lastName);
  const isActiveBoolean = isActive === 'true';
  const existingUser = await fetchUserById(id);

  const customerResolution = await resolveCustomerIdForUser(
    role,
    formData,
    existingUser?.customer_id
  );

  if (customerResolution.message || customerResolution.errors) {
    return {
      errors: customerResolution.errors,
      message: customerResolution.message ?? 'Revisá la vinculación con el cliente.',
      formValues: extractUserFormValues(formData),
      success: false,
      redirect: prevState.redirect,
    };
  }

  const customerId = customerResolution.customerId;

  if (id === currentAdminId && !isActiveBoolean) {
    return {
      message: 'No podés desactivar tu propio usuario.',
      formValues: extractUserFormValues(formData),
      success: false,
      redirect: prevState.redirect,
    };
  }

  if (id === currentAdminId && role !== 'admin') {
    return {
      message: 'No podés cambiar tu propio rol de administrador.',
      formValues: extractUserFormValues(formData),
      success: false,
      redirect: prevState.redirect,
    };
  }

  try {
    const updatedUsers = await sql<UserListItem[]>`
      UPDATE users
      SET
        username = ${username},
        first_name = ${firstName},
        last_name = ${lastName},
        name = ${fullName},
        email = ${email},
        role = ${role},
        customer_id = ${role === 'customer' ? customerId : null},
        is_active = ${isActiveBoolean}
      WHERE id = ${id}
        AND deleted_at IS NULL
      RETURNING
        id,
        username,
        first_name,
        last_name,
        name,
        email,
        image_url,
        google_subject_id,
        role,
        customer_id,
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
        message: 'Ya existe un usuario con ese nombre de usuario.',
        formValues: extractUserFormValues(formData),
        success: false,
        redirect: prevState.redirect,
      };
    }

    console.error(error);
    return {
      message: 'Hubo un error al actualizar el usuario.',
      formValues: extractUserFormValues(formData),
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

export async function softDeleteUser(
  userId: string
) {
  const currentAdminId = await requireAdminSessionUserId();

  if (userId === currentAdminId) {
    console.error('You cannot delete your own user.');
    return;
  }

  try {
    await sql`
      UPDATE users
      SET deleted_at = NOW(), is_active = false
      WHERE id = ${userId}
        AND deleted_at IS NULL
    `;

  } catch (error) {
    console.error(error);
  } finally {
    revalidatePath('/admin/users');
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

  const hasExistingPassword = user.password !== null && user.password.length > 0;

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

async function requireCustomerSessionUser() {
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

  return sessionUser;
}

export async function updateOwnProfile(
  prevState: OwnProfileFormState,
  formData: FormData
): Promise<OwnProfileFormState> {
  const sessionUser = await requireCustomerSessionUser();

  if (!sessionUser) {
    return { message: 'No estás autenticado.', success: false };
  }

  const validatedFields = OwnProfileSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    address: formData.get('address'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisá los campos marcados.',
      success: false,
    };
  }

  const { firstName, lastName, phone, address } = validatedFields.data;
  const fullName = composeUserFullName(firstName, lastName);
  const existingUser = await fetchUserById(sessionUser.id);

  if (!existingUser) {
    return { message: 'Usuario no encontrado.', success: false };
  }

  try {
    await sql`
      UPDATE users
      SET
        first_name = ${firstName},
        last_name = ${lastName},
        name = ${fullName}
      WHERE id = ${sessionUser.id}
        AND deleted_at IS NULL
    `;

    if (existingUser.customer_id) {
      await sql`
        UPDATE customers
        SET
          phone = ${phone},
          address = ${address || null}
        WHERE id = ${existingUser.customer_id}
      `;
    }
  } catch (error) {
    console.error(error);
    return { message: 'Hubo un error al guardar tu perfil.', success: false };
  }

  revalidatePath('/customer/profile');
  revalidatePath('/customer');
  return { message: 'success', success: true };
}

export async function updateOwnProfileImage(
  formData: FormData
): Promise<OwnProfileImageFormState> {
  const sessionUser = await requireCustomerSessionUser();

  if (!sessionUser) {
    return { message: 'No estás autenticado.', success: false };
  }

  const { put, del } = await import('@vercel/blob');
  const {
    PROFILE_AVATAR_ALLOWED_MIME_TYPES,
    PROFILE_AVATAR_FOLDER,
    PROFILE_AVATAR_MAX_BYTES,
  } = await import('@/lib/consts/profile-avatar-consts');

  const file = formData.get('avatar');

  if (!(file instanceof File) || file.size === 0) {
    return { message: 'Seleccioná una imagen.', success: false };
  }

  if (!PROFILE_AVATAR_ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      message: 'Usá una imagen JPG, PNG o WebP.',
      success: false,
    };
  }

  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    return {
      message: 'La imagen no puede superar los 2 MB.',
      success: false,
    };
  }

  const existingUser = await fetchUserById(sessionUser.id);

  if (!existingUser) {
    return { message: 'Usuario no encontrado.', success: false };
  }

  const extension =
    file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const blobPath = `${PROFILE_AVATAR_FOLDER}/${sessionUser.id}/${Date.now()}.${extension}`;

  let blob;
  try {
    blob = await put(blobPath, file, { access: 'public', contentType: file.type });
  } catch (error) {
    console.error('Failed to upload profile avatar:', error);
    return { message: 'No se pudo subir la imagen.', success: false };
  }

  try {
    await sql`
      UPDATE users
      SET image_url = ${blob.url}
      WHERE id = ${sessionUser.id}
        AND deleted_at IS NULL
    `;
  } catch (error) {
    console.error(error);
    try {
      await del(blob.url);
    } catch {
      // ignore cleanup failure
    }
    return { message: 'Hubo un error al guardar la foto.', success: false };
  }

  const previousImageUrl = existingUser.image_url;
  if (
    previousImageUrl &&
    previousImageUrl.includes('blob.vercel-storage.com') &&
    previousImageUrl.includes(`${PROFILE_AVATAR_FOLDER}/`)
  ) {
    try {
      await del(previousImageUrl);
    } catch (error) {
      console.error('Failed to delete previous profile avatar:', error);
    }
  }

  revalidatePath('/customer/profile');
  revalidatePath('/customer');
  return { message: 'success', success: true, imageUrl: blob.url };
}
/** @deprecated Use fetchUserByEmail from lib/data/user-data.ts */
export async function getUser(email: string) {
  return fetchUserByEmail(email);
}
