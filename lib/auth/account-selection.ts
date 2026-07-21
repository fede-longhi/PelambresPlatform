import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_TTL_MS = 10 * 60 * 1000;

type AccountSelectionPayload = {
  email: string;
  userIds: string[];
  exp: number;
};

function getSelectionSecret(): string {
  const secret = process.env.SECRET;

  if (!secret) {
    throw new Error('SECRET is not configured.');
  }

  return secret;
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getSelectionSecret()).update(encodedPayload).digest('base64url');
}

export function createAccountSelectionToken(email: string, userIds: string[]): string {
  const payload: AccountSelectionPayload = {
    email: email.trim().toLowerCase(),
    userIds,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyAccountSelectionToken(token: string): AccountSelectionPayload | null {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as AccountSelectionPayload;

    if (!payload.email || !Array.isArray(payload.userIds) || !payload.exp) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
