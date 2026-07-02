import { createHash, randomBytes } from 'crypto';
import sql from '@/lib/db';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export type PasswordResetTokenRow = {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export type PasswordResetUser = {
  userId: string;
  email: string;
  name: string;
  role: string;
};

function hashResetToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export function createPasswordResetRawToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function invalidatePasswordResetTokensForUser(userId: string): Promise<void> {
  try {
    await sql`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ${userId}
        AND used_at IS NULL
    `;
  } catch (error) {
    console.error('Failed to invalidate password reset tokens:', error);
    throw new Error('Failed to invalidate password reset tokens.');
  }
}

export async function insertPasswordResetToken(
  userId: string,
  rawToken: string
): Promise<void> {
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  try {
    await invalidatePasswordResetTokensForUser(userId);

    await sql`
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (${userId}, ${tokenHash}, ${expiresAt})
    `;
  } catch (error) {
    console.error('Failed to insert password reset token:', error);
    throw new Error('Failed to insert password reset token.');
  }
}

export async function fetchPasswordResetByRawToken(
  rawToken: string
): Promise<PasswordResetUser | undefined> {
  const tokenHash = hashResetToken(rawToken);

  try {
    const rows = await sql<PasswordResetUser[]>`
      SELECT
        u.id as "userId",
        u.email,
        u.name,
        u.role
      FROM password_reset_tokens t
      JOIN users u ON u.id = t.user_id
      WHERE t.token_hash = ${tokenHash}
        AND t.used_at IS NULL
        AND t.expires_at > NOW()
        AND u.deleted_at IS NULL
        AND u.is_active = true
      LIMIT 1
    `;

    return rows[0];
  } catch (error) {
    console.error('Failed to fetch password reset token:', error);
    throw new Error('Failed to fetch password reset token.');
  }
}

export async function markPasswordResetTokenUsed(rawToken: string): Promise<void> {
  const tokenHash = hashResetToken(rawToken);

  try {
    await sql`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE token_hash = ${tokenHash}
        AND used_at IS NULL
    `;
  } catch (error) {
    console.error('Failed to mark password reset token used:', error);
    throw new Error('Failed to mark password reset token used.');
  }
}
