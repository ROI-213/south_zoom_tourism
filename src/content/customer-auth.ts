/**
 * Customer authentication layer (local demo implementation).
 *
 * IMPORTANT: this module is a drop-in stand-in for Supabase Auth. Every export
 * mirrors a real auth call so the UI never has to change when the backend is
 * enabled:
 *
 *   requestOtp()      -> supabase.auth.signInWithOtp({ phone | email })
 *   verifyOtp()       -> supabase.auth.verifyOtp({ token, type })
 *   signInWithPassword-> supabase.auth.signInWithPassword()
 *   requestRecovery() -> supabase.auth.resetPasswordForEmail()
 *   getSession()      -> supabase.auth.getSession()
 *   signOut()         -> supabase.auth.signOut()
 *
 * Until then, accounts/sessions live in localStorage on the visitor's own
 * device only. No credential is ever sent anywhere. Profiles are still only
 * created after a verified challenge, mirroring the production rule.
 */

/* ------------------------------------------------------------------ settings */

/** Admin-controlled auth settings. Moves to an `auth_settings` table on Cloud. */
export type AuthSettings = {
  mobileOtpEnabled: boolean;
  emailOtpEnabled: boolean;
  passwordLoginEnabled: boolean;
  /** Minutes an OTP stays valid. */
  otpExpiryMinutes: number;
  /** Seconds before a new OTP can be requested. */
  resendCooldownSeconds: number;
  /** Failed attempts allowed per identifier before a cool-off. */
  maxVerifyAttempts: number;
};

export const authSettings: AuthSettings = {
  mobileOtpEnabled: true,
  emailOtpEnabled: true,
  passwordLoginEnabled: true,
  otpExpiryMinutes: 10,
  resendCooldownSeconds: 45,
  maxVerifyAttempts: 5,
};

export const accountBenefits = [
  {
    key: "history",
    title: "Booking history in one place",
    body: "Every taxi, tour package and hotel stay you have booked with us, with dates, references and current status.",
  },
  {
    key: "invoices",
    title: "Invoices & payment receipts",
    body: "Download GST-ready invoices and payment acknowledgements any time instead of asking our office for a copy.",
  },
  {
    key: "travellers",
    title: "Saved traveller details",
    body: "Store names, ages and ID details for family or colleagues so the next booking takes under a minute.",
  },
  {
    key: "cancellations",
    title: "Cancellations & date changes",
    body: "Raise a change or cancellation request against a booking and follow the refund progress without phone tag.",
  },
  {
    key: "support",
    title: "Faster support",
    body: "Our team sees your trip context immediately, so driver, hotel and itinerary queries get answered quicker.",
  },
] as const;

/* --------------------------------------------------------------- identifiers */

export type IdentifierKind = "mobile" | "email";

export type ParsedIdentifier = {
  kind: IdentifierKind;
  /** Normalised storage key: 10-digit mobile or lowercased email. */
  value: string;
  /** Privacy-safe version for display. */
  masked: string;
};

export function parseIdentifier(raw: string): ParsedIdentifier | null {
  const input = raw.trim();
  if (!input) return null;

  if (input.includes("@")) {
    const value = input.toLowerCase();
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(value)) return null;
    const [name, domain] = value.split("@");
    const head = name.slice(0, 2);
    return { kind: "email", value, masked: `${head}${"•".repeat(Math.max(2, name.length - 2))}@${domain}` };
  }

  const digits = input.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return null;
  return { kind: "mobile", value: digits, masked: `+91 ${"•".repeat(6)}${digits.slice(-4)}` };
}

/* ------------------------------------------------------------------- storage */

const ACCOUNTS_KEY = "szt:auth:accounts";
const SESSION_KEY = "szt:auth:session";
const CHALLENGE_KEY = "szt:auth:challenge";

export type CustomerProfile = {
  id: string;
  fullName: string;
  mobile: string | null;
  email: string | null;
  /** Which identifier was verified at sign-up. */
  verifiedVia: IdentifierKind;
  createdAt: string;
  /** Optional profile fields the customer can edit. */
  city?: string;
  notes?: string;
  /** Present only when the customer opted into password login. */
  passwordHash?: string;
};

export type CustomerSession = {
  userId: string;
  profile: CustomerProfile;
  issuedAt: string;
  expiresAt: string;
};

const SESSION_HOURS = 24 * 14;

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — treat as a signed-out device */
  }
}

function readAccounts(): CustomerProfile[] {
  return readJson<CustomerProfile[]>(ACCOUNTS_KEY, []);
}

function writeAccounts(accounts: CustomerProfile[]) {
  writeJson(ACCOUNTS_KEY, accounts);
}

function findAccount(identifier: ParsedIdentifier): CustomerProfile | undefined {
  return readAccounts().find((account) =>
    identifier.kind === "mobile"
      ? account.mobile === identifier.value
      : account.email === identifier.value,
  );
}

/** Non-reversible obfuscation. Real password hashing happens server-side on Cloud. */
function hashPassword(password: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < password.length; i += 1) {
    const c = password.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c + i, 2246822519) >>> 0;
  }
  return `${h1.toString(36)}.${h2.toString(36)}`;
}

/* ------------------------------------------------------------------ sessions */

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn) => fn());
}

/** Mirrors supabase.auth.onAuthStateChange. */
export function onAuthStateChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSession(): CustomerSession | null {
  const session = readJson<CustomerSession | null>(SESSION_KEY, null);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    if (isBrowser()) window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
  // Re-read the profile so edits elsewhere are reflected.
  const fresh = readAccounts().find((a) => a.id === session.userId);
  return fresh ? { ...session, profile: fresh } : null;
}

function startSession(profile: CustomerProfile): CustomerSession {
  const now = Date.now();
  const session: CustomerSession = {
    userId: profile.id,
    profile,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_HOURS * 3600_000).toISOString(),
  };
  writeJson(SESSION_KEY, session);
  emit();
  return session;
}

export function signOut() {
  if (isBrowser()) window.localStorage.removeItem(SESSION_KEY);
  emit();
}

/* ---------------------------------------------------------------- challenges */

export type ChallengeIntent = "login" | "register" | "recovery";

export type Challenge = {
  id: string;
  intent: ChallengeIntent;
  kind: IdentifierKind;
  identifier: string;
  masked: string;
  /** Demo-only: the code is generated on-device so it can be shown to the tester. */
  code: string;
  fullName?: string;
  password?: string;
  createdAt: number;
  expiresAt: number;
  resendAvailableAt: number;
  attempts: number;
};

function randomCode() {
  const bytes = new Uint32Array(1);
  if (isBrowser() && window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else bytes[0] = Math.floor(Math.random() * 1e9);
  return String(100000 + (bytes[0] % 900000));
}

function saveChallenge(challenge: Challenge) {
  writeJson(CHALLENGE_KEY, challenge);
}

export function getChallenge(): Challenge | null {
  const challenge = readJson<Challenge | null>(CHALLENGE_KEY, null);
  if (!challenge) return null;
  if (challenge.expiresAt < Date.now() - 5 * 60_000) {
    clearChallenge();
    return null;
  }
  return challenge;
}

export function clearChallenge() {
  if (isBrowser()) window.localStorage.removeItem(CHALLENGE_KEY);
}

export type OtpRequestResult =
  | { ok: true; challenge: Challenge }
  | { ok: false; reason: "invalid-identifier" | "channel-disabled" | "cooldown"; retryInMs?: number };

/**
 * Requests a one-time code. Deliberately returns the same shape whether or not
 * an account exists, so the page can never be used to discover which mobile
 * numbers or emails are registered.
 */
export function requestOtp(
  rawIdentifier: string,
  intent: ChallengeIntent,
  options: { fullName?: string; password?: string } = {},
): OtpRequestResult {
  const identifier = parseIdentifier(rawIdentifier);
  if (!identifier) return { ok: false, reason: "invalid-identifier" };
  if (identifier.kind === "mobile" && !authSettings.mobileOtpEnabled)
    return { ok: false, reason: "channel-disabled" };
  if (identifier.kind === "email" && !authSettings.emailOtpEnabled)
    return { ok: false, reason: "channel-disabled" };

  const existing = getChallenge();
  if (
    existing &&
    existing.identifier === identifier.value &&
    existing.resendAvailableAt > Date.now()
  ) {
    return { ok: false, reason: "cooldown", retryInMs: existing.resendAvailableAt - Date.now() };
  }

  const now = Date.now();
  const challenge: Challenge = {
    id: `chl_${now.toString(36)}`,
    intent,
    kind: identifier.kind,
    identifier: identifier.value,
    masked: identifier.masked,
    code: randomCode(),
    fullName: options.fullName?.trim() || existing?.fullName,
    password: options.password || existing?.password,
    createdAt: now,
    expiresAt: now + authSettings.otpExpiryMinutes * 60_000,
    resendAvailableAt: now + authSettings.resendCooldownSeconds * 1000,
    attempts: 0,
  };
  saveChallenge(challenge);
  return { ok: true, challenge };
}

export type VerifyResult =
  | { ok: true; session: CustomerSession; createdAccount: boolean }
  | { ok: false; reason: "no-challenge" | "expired" | "invalid-code" | "too-many-attempts"; attemptsLeft?: number };

/** Verifies the code and only then creates or opens the customer profile. */
export function verifyOtp(code: string): VerifyResult {
  const challenge = getChallenge();
  if (!challenge) return { ok: false, reason: "no-challenge" };
  if (challenge.expiresAt < Date.now()) return { ok: false, reason: "expired" };
  if (challenge.attempts >= authSettings.maxVerifyAttempts)
    return { ok: false, reason: "too-many-attempts" };

  if (code.trim() !== challenge.code) {
    const next = { ...challenge, attempts: challenge.attempts + 1 };
    saveChallenge(next);
    const attemptsLeft = authSettings.maxVerifyAttempts - next.attempts;
    return attemptsLeft <= 0
      ? { ok: false, reason: "too-many-attempts" }
      : { ok: false, reason: "invalid-code", attemptsLeft };
  }

  const accounts = readAccounts();
  const existing = accounts.find((account) =>
    challenge.kind === "mobile"
      ? account.mobile === challenge.identifier
      : account.email === challenge.identifier,
  );

  clearChallenge();

  // Existing account: sign in regardless of which flow was used, and never
  // report "already registered" back to an unverified visitor.
  if (existing) {
    let profile = existing;
    if (challenge.intent === "recovery" && challenge.password) {
      profile = { ...existing, passwordHash: hashPassword(challenge.password) };
      writeAccounts(accounts.map((a) => (a.id === profile.id ? profile : a)));
    } else if (challenge.fullName && !existing.fullName) {
      profile = { ...existing, fullName: challenge.fullName };
      writeAccounts(accounts.map((a) => (a.id === profile.id ? profile : a)));
    }
    return { ok: true, session: startSession(profile), createdAccount: false };
  }

  const profile: CustomerProfile = {
    id: `cust_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    fullName: challenge.fullName?.trim() || "Traveller",
    mobile: challenge.kind === "mobile" ? challenge.identifier : null,
    email: challenge.kind === "email" ? challenge.identifier : null,
    verifiedVia: challenge.kind,
    createdAt: new Date().toISOString(),
    ...(challenge.password ? { passwordHash: hashPassword(challenge.password) } : {}),
  };
  writeAccounts([...accounts, profile]);
  return { ok: true, session: startSession(profile), createdAccount: true };
}

/* ------------------------------------------------------------------ password */

export type PasswordResult =
  | { ok: true; session: CustomerSession }
  | { ok: false; reason: "disabled" | "invalid-identifier" | "invalid-credentials" };

/** Uniform failure message: never distinguishes "no account" from "wrong password". */
export function signInWithPassword(rawIdentifier: string, password: string): PasswordResult {
  if (!authSettings.passwordLoginEnabled) return { ok: false, reason: "disabled" };
  const identifier = parseIdentifier(rawIdentifier);
  if (!identifier) return { ok: false, reason: "invalid-identifier" };
  const account = findAccount(identifier);
  if (!account?.passwordHash || account.passwordHash !== hashPassword(password))
    return { ok: false, reason: "invalid-credentials" };
  return { ok: true, session: startSession(account) };
}

export const genericAuthError =
  "Those details don't match an account with a password set. Try a one-time code instead, or reset your password below.";

/* ---------------------------------------------------------------- redirects */

/** Only same-origin app paths may be used as a post-login destination. */
export function safeRedirectPath(raw: string | undefined | null): string {
  if (!raw) return "/customer/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/customer/dashboard";
  if (raw.startsWith("/admin")) return "/customer/dashboard";
  return raw.slice(0, 300);
}

/* ------------------------------------------------------------------ profile */

export type ProfileUpdate = {
  fullName: string;
  /** Only a *verified* channel may be changed here; the other one is added via OTP. */
  city?: string;
  notes?: string;
};

/** Mirrors an update on public.customer_profiles where id = auth.uid(). */
export function updateProfile(userId: string, update: ProfileUpdate): CustomerProfile | null {
  const accounts = readAccounts();
  const existing = accounts.find((a) => a.id === userId);
  if (!existing) return null;
  const profile: CustomerProfile = {
    ...existing,
    fullName: update.fullName.trim() || existing.fullName,
    city: update.city?.trim() ?? existing.city,
    notes: update.notes?.trim() ?? existing.notes,
  };
  writeAccounts(accounts.map((a) => (a.id === userId ? profile : a)));
  const session = readJson<CustomerSession | null>(SESSION_KEY, null);
  if (session && session.userId === userId) writeJson(SESSION_KEY, { ...session, profile });
  emit();
  return profile;
}

/** Adds the second contact channel after it has been verified by OTP. */
export function attachVerifiedIdentifier(userId: string, identifier: ParsedIdentifier): boolean {
  const accounts = readAccounts();
  const taken = accounts.some(
    (a) =>
      a.id !== userId &&
      (identifier.kind === "mobile" ? a.mobile === identifier.value : a.email === identifier.value),
  );
  if (taken) return false;
  const existing = accounts.find((a) => a.id === userId);
  if (!existing) return false;
  const profile: CustomerProfile = {
    ...existing,
    ...(identifier.kind === "mobile" ? { mobile: identifier.value } : { email: identifier.value }),
  };
  writeAccounts(accounts.map((a) => (a.id === userId ? profile : a)));
  const session = readJson<CustomerSession | null>(SESSION_KEY, null);
  if (session && session.userId === userId) writeJson(SESSION_KEY, { ...session, profile });
  emit();
  return true;
}
