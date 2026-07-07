'use server';

import sql from '@/lib/db';
import { createCustomerRecord } from '@/lib/actions/customer-actions';
import { generateUniqueUsername } from '@/lib/actions/oauth-customer-actions';
import { fetchCustomerByEmail } from '@/lib/data/customer-data';
import { fetchUserByEmailAndRole } from '@/lib/data/user-data';
import { composeUserFullName } from '@/lib/utils';
import type { User } from '@/types/user-definitions';

type EnrollmentUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type EnrollmentUserResult = {
  userId: string;
  customerId: string;
  displayName: string;
  email: string;
};

export async function resolveOrCreateEnrollmentUser(
  input: EnrollmentUserInput
): Promise<EnrollmentUserResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const trimmedFirstName = input.firstName.trim();
  const trimmedLastName = input.lastName.trim();
  const fullName = composeUserFullName(trimmedFirstName, trimmedLastName);
  const phone = input.phone?.trim() || '';

  let customerId: string;
  const existingCustomer = await fetchCustomerByEmail(normalizedEmail);

  if (existingCustomer) {
    customerId = existingCustomer.id;

    if (existingCustomer.type === 'person') {
      await sql`
        UPDATE customers
        SET
          first_name = ${trimmedFirstName},
          last_name = ${trimmedLastName || null},
          phone = CASE
            WHEN ${phone} <> '' THEN ${phone}
            ELSE phone
          END
        WHERE id = ${customerId}
      `;
    } else if (phone) {
      await sql`
        UPDATE customers
        SET phone = ${phone}
        WHERE id = ${customerId}
      `;
    }
  } else {
    const customer = await createCustomerRecord({
      email: normalizedEmail,
      phone,
      type: 'person',
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    });
    customerId = customer.id;
  }

  const existingUser = await fetchUserByEmailAndRole(normalizedEmail, 'customer');

  if (existingUser) {
    await sql`
      UPDATE users
      SET
        first_name = ${trimmedFirstName},
        last_name = ${trimmedLastName},
        name = ${fullName},
        customer_id = COALESCE(customer_id, ${customerId})
      WHERE id = ${existingUser.id}
        AND deleted_at IS NULL
    `;

    return {
      userId: existingUser.id,
      customerId: existingUser.customer_id ?? customerId,
      displayName: fullName,
      email: normalizedEmail,
    };
  }

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
      google_subject_id,
      role,
      customer_id,
      must_change_password,
      is_active
    )
    VALUES (
      ${username},
      ${trimmedFirstName},
      ${trimmedLastName},
      ${fullName},
      ${normalizedEmail},
      NULL,
      NULL,
      NULL,
      'customer',
      ${customerId},
      false,
      true
    )
    RETURNING *
  `;

  const insertedUser = insertedUsers[0];

  if (!insertedUser) {
    throw new Error('No se pudo crear el usuario de inscripción.');
  }

  return {
    userId: insertedUser.id,
    customerId,
    displayName: fullName,
    email: normalizedEmail,
  };
}
