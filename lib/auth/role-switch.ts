import { createHmac, timingSafeEqual } from 'crypto';

const ROLE_SWITCH_TOKEN_TTL_MS = 5 * 60 * 1000;

type RoleSwitchPayload = {
  email: string;
  currentUserId: string;
  targetUserId: string;
  exp: number;
};

function getRoleSwitchSecret(): string {
  const secret = process.env.SECRET;

  if (!secret) {
    throw new Error('SECRET is not configured.');
  }

  return secret;
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getRoleSwitchSecret()).update(encodedPayload).digest('base64url');
}

export function createRoleSwitchToken(
  currentUserId: string,
  targetUserId: string,
  email: string
): string {
  const payload: RoleSwitchPayload = {
    email: email.trim().toLowerCase(),
    currentUserId,
    targetUserId,
    exp: Date.now() + ROLE_SWITCH_TOKEN_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyRoleSwitchToken(
  token: string,
  targetUserId: string
): RoleSwitchPayload | null {
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
    ) as RoleSwitchPayload;

    if (
      !payload.email ||
      !payload.currentUserId ||
      !payload.targetUserId ||
      !payload.exp ||
      payload.targetUserId !== targetUserId
    ) {
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
