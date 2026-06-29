import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const TEMP_PASSWORD_CHARS =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';

export function generateTemporaryPassword(length = 12): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => TEMP_PASSWORD_CHARS[byte % TEMP_PASSWORD_CHARS.length]).join('');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string | null
): Promise<boolean> {
  if (!hashedPassword) {
    return false;
  }
  return bcrypt.compare(plainPassword, hashedPassword);
}
