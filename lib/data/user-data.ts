import sql from '@/lib/db';
import type { User, UserListItem } from '@/types/user-definitions';

const ITEMS_PER_PAGE = 10;

const USER_LIST_COLUMNS = sql`
  id,
  username,
  name,
  email,
  image_url,
  role,
  customer_id,
  is_active,
  must_change_password,
  deleted_at
`;

export async function fetchUserByEmail(email: string): Promise<User | undefined> {
  try {
    const rows = await sql<User[]>`
      SELECT *
      FROM users
      WHERE lower(trim(email)) = lower(trim(${email}))
        AND deleted_at IS NULL
      ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END
      LIMIT 1
    `;
    return rows[0];
  } catch (error) {
    console.error('Failed to fetch user by email:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchUserByEmailAndRole(
  email: string,
  role: User['role']
): Promise<User | undefined> {
  try {
    const rows = await sql<User[]>`
      SELECT *
      FROM users
      WHERE lower(trim(email)) = lower(trim(${email}))
        AND role = ${role}
        AND deleted_at IS NULL
      LIMIT 1
    `;
    return rows[0];
  } catch (error) {
    console.error('Failed to fetch user by email and role:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchActiveUsersByEmail(email: string): Promise<User[]> {
  try {
    return await sql<User[]>`
      SELECT *
      FROM users
      WHERE lower(trim(email)) = lower(trim(${email}))
        AND deleted_at IS NULL
        AND is_active = true
      ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END
    `;
  } catch (error) {
    console.error('Failed to fetch users by email:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchActiveUsersWithPasswordByEmail(email: string): Promise<User[]> {
  try {
    return await sql<User[]>`
      SELECT *
      FROM users
      WHERE lower(trim(email)) = lower(trim(${email}))
        AND deleted_at IS NULL
        AND is_active = true
        AND password IS NOT NULL
      ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END
    `;
  } catch (error) {
    console.error('Failed to fetch users with password by email:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchAlternateAccountsForUser(
  email: string,
  currentUserId: string
): Promise<UserListItem[]> {
  try {
    return await sql<UserListItem[]>`
      SELECT ${USER_LIST_COLUMNS}
      FROM users
      WHERE lower(trim(email)) = lower(trim(${email}))
        AND id != ${currentUserId}
        AND deleted_at IS NULL
        AND is_active = true
      ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END
    `;
  } catch (error) {
    console.error('Failed to fetch alternate accounts:', error);
    throw new Error('Failed to fetch alternate accounts.');
  }
}

export async function fetchActiveUsersByIds(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) {
    return [];
  }

  try {
    return await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ANY(${userIds})
        AND deleted_at IS NULL
        AND is_active = true
      ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END
    `;
  } catch (error) {
    console.error('Failed to fetch users by ids:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchUserById(id: string): Promise<UserListItem | undefined> {
  try {
    const rows = await sql<UserListItem[]>`
      SELECT ${USER_LIST_COLUMNS}
      FROM users
      WHERE id = ${id}
        AND deleted_at IS NULL
      LIMIT 1
    `;
    return rows[0];
  } catch (error) {
    console.error('Failed to fetch user by id:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchUserHasPassword(id: string): Promise<boolean> {
  try {
    const rows = await sql<{ hasPassword: boolean }[]>`
      SELECT (password IS NOT NULL AND password <> '') as "hasPassword"
      FROM users
      WHERE id = ${id}
        AND deleted_at IS NULL
      LIMIT 1
    `;
    return rows[0]?.hasPassword ?? false;
  } catch (error) {
    console.error('Failed to fetch user password status:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchFilteredUsers(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    return await sql<UserListItem[]>`
      SELECT ${USER_LIST_COLUMNS}
      FROM users
      WHERE deleted_at IS NULL
        AND (
          name ILIKE ${`%${query}%`}
          OR email ILIKE ${`%${query}%`}
          OR username ILIKE ${`%${query}%`}
        )
      ORDER BY name ASC, username ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchUsersPages(query: string) {
  try {
    const rows = await sql`
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE deleted_at IS NULL
        AND (
          name ILIKE ${`%${query}%`}
          OR email ILIKE ${`%${query}%`}
          OR username ILIKE ${`%${query}%`}
        )
    `;

    return Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Failed to fetch user pages:', error);
    throw new Error('Failed to fetch user pages.');
  }
}

export async function requireAdminSessionUserId(): Promise<string> {
  const { auth } = await import('@/auth');
  const { canAccessAdmin } = await import('@/lib/auth/permissions');

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
