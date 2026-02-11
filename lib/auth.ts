import crypto from 'crypto';

const AUTH_SECRET = (() => {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;

  // Avoid coupling token signing to the login password if possible.
  if (process.env.PASSWORD) {
    console.warn(
      '[auth] AUTH_SECRET is not set; falling back to PASSWORD for token signing. Set AUTH_SECRET to improve security.'
    );
    return process.env.PASSWORD;
  }

  // Last-resort: ephemeral per-process secret (safer than a hard-coded fallback).
  // Note: tokens will be invalidated on server restart.
  console.warn(
    '[auth] AUTH_SECRET and PASSWORD are not set; using an ephemeral secret. Set AUTH_SECRET (recommended) to avoid forced logouts.'
  );
  return crypto.randomBytes(32).toString('hex');
})();

const ADMIN_AUTH_SECRET = (() => {
  if (process.env.ADMIN_AUTH_SECRET) return process.env.ADMIN_AUTH_SECRET;

  // Fall back to AUTH_SECRET with a prefix to keep admin tokens distinct.
  console.warn(
    '[auth] ADMIN_AUTH_SECRET is not set; deriving from AUTH_SECRET. Set ADMIN_AUTH_SECRET for stronger separation.'
  );
  return `admin:${AUTH_SECRET}`;
})();

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

/**
 * Creates a signed admin authentication token using a separate secret
 */
export function createAdminAuthToken(): string {
  const payload: TokenPayload = {
    exp: Date.now() + TOKEN_EXPIRY_SECONDS * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_AUTH_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies an admin authentication token using a separate secret
 */
export function verifyAdminAuthToken(token: string): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadBase64, signature] = parts;

  // Verify signature with admin-specific secret
  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_AUTH_SECRET)
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
