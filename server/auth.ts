import crypto from 'node:crypto';
import { db } from './db.ts';

const FIREBASE_PROJECT_ID = 'bounty-c1dfb';
const CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.trim().length >= 16
    ? process.env.ADMIN_SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

async function getFirebaseCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }

  const res = await fetch(CERTS_URL);
  if (!res.ok) {
    throw new Error('Failed to fetch Firebase signing certificates');
  }
  const cacheControl = res.headers.get('cache-control') || '';
  const match = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = match ? Number(match[1]) : 3600;

  cachedCerts = (await res.json()) as Record<string, string>;
  certsExpiresAt = now + maxAgeSec * 1000;
  return cachedCerts;
}

function decodeBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

export async function verifyFirebaseIdToken(
  token: string
): Promise<VerifiedFirebaseUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const header = JSON.parse(decodeBase64Url(headerB64).toString('utf8')) as {
      alg?: string;
      kid?: string;
    };
    const payload = JSON.parse(decodeBase64Url(payloadB64).toString('utf8')) as {
      aud?: string;
      iss?: string;
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      exp?: number;
      iat?: number;
    };

    if (header.alg !== 'RS256' || !header.kid) return null;
    if (payload.aud !== FIREBASE_PROJECT_ID) return null;
    if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;
    if (!payload.sub || typeof payload.sub !== 'string') return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= nowSec) return null;
    if (payload.iat && payload.iat > nowSec + 300) return null;

    const certs = await getFirebaseCerts();
    const cert = certs[header.kid];
    if (!cert) return null;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();

    const sigBuf = decodeBase64Url(sigB64);
    const validSig = verifier.verify(cert, sigBuf);
    if (!validSig) return null;

    return {
      uid: payload.sub,
      email: (payload.email || '').toLowerCase(),
      emailVerified: Boolean(payload.email_verified),
      name: payload.name,
    };
  } catch {
    return null;
  }
}

const DEFAULT_OWNER_EMAIL = 'ngabonzizaissa2@gmail.com';

export function getEnvAdminPasscode(): string {
  return (process.env.ADMIN_PASSCODE || '').trim();
}

export function getEnvAdminEmails(): string[] {
  const raw = (process.env.ADMIN_EMAIL || '').trim();
  const parsed = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [DEFAULT_OWNER_EMAIL];
}

export function isAllowedOwnerEmail(email: string): boolean {
  if (!email) return false;
  return getEnvAdminEmails().includes(email.trim().toLowerCase());
}

export function getClaimedAdminRow() {
  return db
    .prepare('SELECT claimed_uid, claimed_email, password_hash, password_salt FROM admin_config WHERE id = 1')
    .get() as
    | {
        claimed_uid: string | null;
        claimed_email: string | null;
        password_hash: string | null;
        password_salt: string | null;
      }
    | undefined;
}

export function hashAdminPassword(password: string, saltHex?: string) {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminPassword(password: string): boolean {
  const envPasscode = getEnvAdminPasscode();
  if (envPasscode.length > 0) {
    return safeEqualStrings(password, envPasscode);
  }

  const claimed = getClaimedAdminRow();
  if (!claimed || !claimed.password_hash || !claimed.password_salt) {
    return false;
  }
  const { hash } = hashAdminPassword(password, claimed.password_salt);
  return safeEqualStrings(hash, claimed.password_hash);
}

export function claimFirstAdmin(uid: string, email: string, password: string): boolean {
  if (getEnvAdminPasscode().length > 0) return false;
  const existing = getClaimedAdminRow();
  if (existing && existing.password_hash) return false;

  const { salt, hash } = hashAdminPassword(password);
  db.prepare(`
    INSERT INTO admin_config (id, claimed_uid, claimed_email, password_hash, password_salt, updated_at)
    VALUES (1, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      claimed_uid = excluded.claimed_uid,
      claimed_email = excluded.claimed_email,
      password_hash = excluded.password_hash,
      password_salt = excluded.password_salt,
      updated_at = excluded.updated_at
  `).run(uid, email, hash, salt, new Date().toISOString());
  return true;
}

export function signAdminToken(uid: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid,
      email,
      exp: Date.now() + 12 * 60 * 60 * 1000,
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string, expectedUid: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, sigB64] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');
    if (!safeEqualStrings(sigB64, expectedSig)) return false;

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    ) as { uid?: string; exp?: number };
    if (!payload.uid || payload.uid !== expectedUid) return false;
    if (!payload.exp || payload.exp <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function isEnvEmailAdmin(email: string): boolean {
  return isAllowedOwnerEmail(email);
}

export function isOwnerAutoAuthorized(user: VerifiedFirebaseUser): boolean {
  return (
    isAllowedOwnerEmail(user.email) &&
    user.emailVerified &&
    getEnvAdminPasscode().length === 0
  );
}
