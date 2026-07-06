'use server';

import sql from '@/lib/db';
import { createCustomerRecord } from '@/lib/actions/customer-actions';
import { linkCourseRegistrationsToUser } from '@/lib/data/course-data';
import { fetchCustomerByEmail } from '@/lib/data/customer-data';
import { fetchUserByEmailAndRole } from '@/lib/data/user-data';
import { splitPersonName } from '@/lib/utils';
import type { User } from '@/types/user-definitions';

type OAuthProfile = {
  email: string;
  name: string;
  imageUrl?: string | null;
};

export async function generateUniqueUsername(email: string): Promise<string> {
  const localPart = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 40);
  let candidate = localPart || 'user';
  let suffix = 0;

  while (suffix < 100) {
    const username = suffix === 0 ? candidate : `${candidate}${suffix}`;

    const rows = await sql<{ id: string }[]>`
      SELECT id
      FROM users
      WHERE username = ${username}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (!rows[0]) {
      return username;
    }

    suffix += 1;
  }

  throw new Error('No se pudo generar un nombre de usuario único.');
}

export async function resolveOrCreateCustomerId(email: string, displayName: string): Promise<string> {
  const existingCustomer = await fetchCustomerByEmail(email);

  if (existingCustomer) {
    return existingCustomer.id;
  }

  const nameParts = splitPersonName(displayName);
  const fallbackFirstName = email.split('@')[0];

  const customer = await createCustomerRecord({
    email,
    phone: '',
    type: 'person',
    firstName: nameParts.firstName || fallbackFirstName,
    lastName: nameParts.lastName,
  });

  return customer.id;
}

export async function syncOAuthUserImage(userId: string, imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return;
  }

  try {
    await sql`
      UPDATE users
      SET image_url = ${imageUrl}
      WHERE id = ${userId}
        AND deleted_at IS NULL
    `;
  } catch (error) {
    console.error('Failed to sync OAuth user image:', error);
  }
}

export async function provisionCustomerUserFromOAuth(
  profile: OAuthProfile
): Promise<User | null> {
  const email = profile.email.trim();
  const displayName = profile.name.trim() || email.split('@')[0];

  const existingCustomerUser = await fetchUserByEmailAndRole(email, 'customer');

  if (existingCustomerUser) {
    if (!existingCustomerUser.is_active) {
      return null;
    }

    await syncOAuthUserImage(existingCustomerUser.id, profile.imageUrl);
    await linkCourseRegistrationsToUser(existingCustomerUser.id, email);
    return existingCustomerUser;
  }

  try {
    const customerId = await resolveOrCreateCustomerId(email, displayName);
    const username = await generateUniqueUsername(email);

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
        ${displayName},
        ${email},
        NULL,
        ${profile.imageUrl ?? null},
        'customer',
        ${customerId},
        false,
        true
      )
      RETURNING *
    `;

    const insertedUser = insertedUsers[0] ?? null;

    if (insertedUser) {
      await linkCourseRegistrationsToUser(insertedUser.id, email);
    }

    return insertedUser;
  } catch (error) {
    console.error('Failed to provision OAuth customer user:', error);
    return null;
  }
}

export async function ensureCustomerAccountForOAuth(profile: OAuthProfile): Promise<void> {
  await provisionCustomerUserFromOAuth(profile);
}
