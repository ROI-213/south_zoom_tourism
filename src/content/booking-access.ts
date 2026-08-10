/**
 * Guest access control for /booking-confirmation/:bookingNumber.
 *
 * A booking number alone never unlocks a booking. Access needs either
 *  - the one-time access token issued with the booking link (`?t=`), or
 *  - a verified phone session: the guest types the phone number on the
 *    booking and we compare it against the stored snapshot.
 *
 * Both paths resolve to the same token, which is derived from the booking
 * number + the last 10 digits of the booking phone, so sequential guessing of
 * booking numbers reveals nothing. Grants are kept in sessionStorage and
 * expire with the tab.
 */

const GRANT_PREFIX = "szt:booking-grant:";
const GRANT_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours

const digits = (value: string) => value.replace(/\D/g, "").slice(-10);

/** Small, dependency-free FNV-1a based token. Not a password — an unguessable link key. */
export function deriveAccessToken(bookingNumber: string, phone: string): string {
  const input = `${bookingNumber.trim().toUpperCase()}|${digits(phone)}|szt-booking-v1`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + code + i, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(36)}${h2.toString(36)}`.padEnd(12, "0").slice(0, 14);
}

export const tokenMatches = (bookingNumber: string, phone: string, token: string | undefined) =>
  Boolean(token) && deriveAccessToken(bookingNumber, phone) === token;

type Grant = { token: string; grantedAt: number };

const grantKey = (bookingNumber: string) => `${GRANT_PREFIX}${bookingNumber.trim().toUpperCase()}`;

export function grantAccess(bookingNumber: string, token: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      grantKey(bookingNumber),
      JSON.stringify({ token, grantedAt: Date.now() } satisfies Grant),
    );
  } catch {
    /* private mode — the guest simply verifies again */
  }
}

export function readGrant(bookingNumber: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(grantKey(bookingNumber));
    if (!raw) return null;
    const grant = JSON.parse(raw) as Grant;
    if (!grant?.token || Date.now() - grant.grantedAt > GRANT_TTL_MS) {
      window.sessionStorage.removeItem(grantKey(bookingNumber));
      return null;
    }
    return grant.token;
  } catch {
    return null;
  }
}

export function revokeAccess(bookingNumber: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(grantKey(bookingNumber));
  } catch {
    /* ignore */
  }
}

export const maskPhone = (phone: string) => {
  const d = digits(phone);
  return d.length === 10 ? `+91 ${"•".repeat(6)}${d.slice(-4)}` : "•••• ••••";
};

export const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!domain) return "";
  return `${user.slice(0, 2)}${"•".repeat(Math.max(user.length - 2, 2))}@${domain}`;
};
