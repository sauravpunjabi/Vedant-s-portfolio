import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// A session token is "<expiry ms>.<HMAC of expiry>", keyed off the admin password,
// so changing ADMIN_PASSWORD signs everyone out.
const key = (password: string) => createHash("sha256").update("session:" + password).digest();
const sign = (exp: string, password: string) => createHmac("sha256", key(password)).update(exp).digest("base64url");

const sameBytes = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

export function passwordMatches(input: string, password: string) {
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return password.length > 0 && sameBytes(hash(input), hash(password));
}

export function makeToken(password: string, ttlMs: number, now = Date.now()) {
  const exp = String(now + ttlMs);
  return `${exp}.${sign(exp, password)}`;
}

export function tokenIsValid(token: string | undefined, password: string, now = Date.now()) {
  if (!token || !password) return false;
  const [exp, sig, extra] = token.split(".");
  if (!exp || !sig || extra !== undefined || !(Number(exp) > now)) return false;
  return sameBytes(Buffer.from(sig), Buffer.from(sign(exp, password)));
}
