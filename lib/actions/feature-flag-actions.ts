'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { isFeatureKey } from '@/lib/consts/feature-flag-consts';
import { fetchActiveUsersByEmail } from '@/lib/data/user-data';
import { fetchFeatureFlagByKey } from '@/lib/data/feature-flag-data';

async function requireAdminSession() {
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
    throw new Error('No autorizado.');
  }

  return sessionUser;
}

function revalidateFeaturePaths(featureKey: string) {
  revalidatePath('/admin/features');
  revalidatePath(`/admin/features/${featureKey}`);
  if (featureKey === 'store') {
    revalidatePath('/store');
    revalidatePath('/');
  }
}

export type FeatureVisibilityFormState = {
  message?: string | null;
  success?: boolean;
};

export async function updateFeatureVisibility(
  featureKey: string,
  _prev: FeatureVisibilityFormState,
  formData: FormData
): Promise<FeatureVisibilityFormState> {
  await requireAdminSession();

  if (!isFeatureKey(featureKey)) {
    return { message: 'Feature desconocida.', success: false };
  }

  const flag = await fetchFeatureFlagByKey(featureKey);
  if (!flag) {
    return { message: 'Feature no encontrada.', success: false };
  }

  const isEnabled = formData.get('isEnabled') === 'on' || formData.get('isEnabled') === 'true';

  try {
    await sql`
      UPDATE feature_flags
      SET
        is_enabled = ${isEnabled},
        updated_at = NOW()
      WHERE key = ${featureKey}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'No se pudo actualizar la visibilidad.',
      success: false,
    };
  }

  revalidateFeaturePaths(featureKey);
  return {
    message: isEnabled
      ? 'La feature quedó visible para todos.'
      : 'La feature quedó restringida (solo lista de acceso y admins).',
    success: true,
  };
}

export type FeatureAllowlistFormState = {
  errors?: { email?: string[] };
  message?: string | null;
  success?: boolean;
};

const AllowlistEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Ingresá un email válido.' })
    .max(254, { message: 'El email es demasiado largo.' }),
});

export async function addUserToFeatureAllowlist(
  featureKey: string,
  _prev: FeatureAllowlistFormState,
  formData: FormData
): Promise<FeatureAllowlistFormState> {
  await requireAdminSession();

  if (!isFeatureKey(featureKey)) {
    return { message: 'Feature desconocida.', success: false };
  }

  const flag = await fetchFeatureFlagByKey(featureKey);
  if (!flag) {
    return { message: 'Feature no encontrada.', success: false };
  }

  const validated = AllowlistEmailSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Revisá el email e intentá de nuevo.',
      success: false,
    };
  }

  const users = await fetchActiveUsersByEmail(validated.data.email);
  if (users.length === 0) {
    return {
      errors: { email: ['No hay un usuario activo con ese email.'] },
      message: 'Usuario no encontrado.',
      success: false,
    };
  }

  try {
    for (const user of users) {
      await sql`
        INSERT INTO feature_flag_users (feature_key, user_id)
        VALUES (${featureKey}, ${user.id})
        ON CONFLICT DO NOTHING
      `;
    }
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'No se pudo agregar el usuario a la lista.',
      success: false,
    };
  }

  revalidateFeaturePaths(featureKey);
  return {
    message:
      users.length > 1
        ? `Se agregaron ${users.length} cuentas asociadas a ese email.`
        : 'Usuario agregado a la lista de acceso.',
    success: true,
  };
}

export async function removeUserFromFeatureAllowlist(
  featureKey: string,
  userId: string
): Promise<void> {
  await requireAdminSession();

  if (!isFeatureKey(featureKey)) {
    throw new Error('Feature desconocida.');
  }

  try {
    await sql`
      DELETE FROM feature_flag_users
      WHERE feature_key = ${featureKey}
        AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('No se pudo quitar el usuario.');
  }

  revalidateFeaturePaths(featureKey);
}
