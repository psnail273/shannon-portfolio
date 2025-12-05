import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.PASSWORD || 'fallback-secret';
const TOKEN_EXPIRY_HOURS = 1;
export const TOKEN_EXPIRY_SECONDS = TOKEN_EXPIRY_HOURS * 60 * 60;

interface TokenPayload {
  exp: number; // expiration timestamp
}

/**
 * Creates a signed authentication token
 */
export function createAuthToken(): string {
  const payload: TokenPayload = {
    exp: Date.now() + TOKEN_EXPIRY_SECONDS * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies an authentication token and checks if it's still valid
 */
export function verifyAuthToken(token: string): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadBase64, signature] = parts;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return false;
  }

  // Check expiration
  try {
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString()
    );

    if (Date.now() > payload.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
