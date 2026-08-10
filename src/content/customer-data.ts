/**
 * Customer portal data layer.
 *
 * Mirrors the Cloud schema one-for-one so the UI never changes when the
 * database is connected:
 *
 *   bookingRegistry      -> public.bookings           (RLS: customer_id = auth.uid())
 *   travellers           -> public.saved_travellers   (RLS: customer_id = auth.uid())
 *   cancellationRequests -> public.cancellation_requests
 *   supportRequests      -> public.support_requests
 *
 * Every read below is filtered by the *authenticated* customer id, exactly the
 * way the RLS policy will filter it server-side. A booking is only ever linked
 * to an account after the contact number on the booking is verified — the same
 * rule the `link_booking` RPC will enforce.
 *
 * Confirmed service snapshots are never edited from this portal: bookings are
 * read-only here and every change a customer asks for becomes a trackable
 * cancellation or support record for the admin queue.
 */

import { loadHotelBooking, type HotelBookingRecord } from "@/content/hotel-booking";
import { loadBookingRecord } from "@/content/package-booking";
import { loadBookingSummary, type BookingSummary } from "@/content/booking-summary";
import { listPaymentSubmissions, type PaymentSubmissionRecord } from "@/content/payment";
import type { CustomerProfile } from "@/content/customer-auth";

/* --------------------------------------------------------------- storage io */

const isBrowser = () => typeof window !== "undefined";

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
    /* storage unavailable — the portal degrades to read-only */
  }
}

const REGISTRY_KEY = "szt:customer:bookings";
const TRAVELLERS_KEY = "szt:customer:travellers";
const CANCELLATIONS_KEY = "szt:customer:cancellations";
const SUPPORT_KEY = "szt:customer:support";

const last10 = (value: string) => value.replace(/\D/g, "").slice(-10);

/* ------------------------------------------------------------------ types */

export type CustomerBookingKind = "vehicle" | "tour-package" | "hotel";

export const bookingKindMeta: Record<CustomerBookingKind, { label: string; plural: string }> = {
  vehicle: { label: "Vehicle trip", plural: "Vehicle bookings" },
  "tour-package": { label: "Tour package", plural: "Tour bookings" },
  hotel: { label: "Hotel stay", plural: "Hotel bookings" },
};

/** Immutable service snapshot captured when the booking was created. */
export type BookingSnapshot = {
  title: string;
  subtitle: string;
  travelWindow: string;
  /** ISO date used to sort upcoming trips. */
  startDate: string | null;
  guestsLabel: string;
  detailRows: { label: string; value: string }[];
  total: number;
  productHref: string | null;
};

export type BookingRegistryEntry = {
  reference: string;
  kind: CustomerBookingKind;
  createdAt: string;
  /** Contact captured on the booking — used to verify an account link. */
  ownerPhone: string;
  ownerEmail: string | null;
  ownerName: string;
  /** Null until the contact number is verified against the account. */
  customerId: string | null;
  linkedAt: string | null;
  statusLabel: string;
  hasInvoice: boolean;
  snapshot: BookingSnapshot;
};

export type CustomerBooking = BookingRegistryEntry & {
  /** Live status + payment ledger when the full record is on this device. */
  summary: BookingSummary | null;
  paid: number;
  pending: number;
  underVerification: number;
};

/* --------------------------------------------------------------- registry */

export function listRegistry(): BookingRegistryEntry[] {
  return readJson<BookingRegistryEntry[]>(REGISTRY_KEY, []);
}

function writeRegistry(entries: BookingRegistryEntry[]) {
  writeJson(REGISTRY_KEY, entries);
}

export function upsertRegistryEntry(entry: BookingRegistryEntry) {
  const entries = listRegistry();
  const index = entries.findIndex((e) => e.reference === entry.reference);
  if (index >= 0) {
    // Never overwrite an existing account link or the original snapshot date.
    entries[index] = { ...entry, customerId: entries[index].customerId ?? entry.customerId, linkedAt: entries[index].linkedAt };
  } else {
    entries.unshift(entry);
  }
  writeRegistry(entries.slice(0, 200));
}

function fromSummary(summary: BookingSummary, hotel: HotelBookingRecord | null): BookingRegistryEntry {
  return {
    reference: summary.bookingNumber,
    kind: summary.kind === "hotel" ? "hotel" : "tour-package",
    createdAt: summary.createdAt,
    ownerPhone: summary.phone,
    ownerEmail: summary.email || null,
    ownerName: summary.customerName,
    customerId: null,
    linkedAt: null,
    statusLabel: summary.status,
    hasInvoice: summary.hasInvoice,
    snapshot: {
      title: summary.serviceTitle,
      subtitle: summary.serviceSubtitle,
      travelWindow: summary.travelWindow,
      startDate: hotel ? hotel.stay.checkIn : summary.tourRecord?.departureSnapshot.date || null,
      guestsLabel: summary.guestsLabel,
      detailRows: summary.detailRows,
      total: summary.payments.total,
      productHref: summary.productHref,
    },
  };
}

/**
 * Picks up hotel and tour bookings that were completed on this device before
 * the customer had an account. On Cloud this is a no-op: bookings are written
 * straight to `public.bookings` with the contact details.
 */
export function syncRegistryFromDevice() {
  if (!isBrowser()) return;
  const references = new Set<string>();
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith("szt:hotel-booking:") && key !== "szt:hotel-booking:draft") {
        references.add(key.replace("szt:hotel-booking:", ""));
      }
    }
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key?.startsWith("szt:booking:SZT-TP-")) references.add(key.replace("szt:booking:", ""));
    }
  } catch {
    return;
  }

  references.forEach((reference) => {
    const summary = loadBookingSummary(reference);
    if (!summary) return;
    const hotel = summary.kind === "hotel" ? loadHotelBooking(reference) : null;
    upsertRegistryEntry(fromSummary(summary, hotel));
  });
}

/** Called by the vehicle booking form — vehicle requests have no other store. */
export function registerVehicleBooking(input: {
  reference: string;
  vehicleName: string;
  vehicleSubtitle: string;
  vehicleHref: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  pickup: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string | null;
  passengers: number;
  tripType: string;
  notes: string;
}) {
  upsertRegistryEntry({
    reference: input.reference,
    kind: "vehicle",
    createdAt: new Date().toISOString(),
    ownerPhone: input.phone,
    ownerEmail: input.email,
    ownerName: input.customerName,
    customerId: null,
    linkedAt: null,
    statusLabel: "awaiting-review",
    hasInvoice: false,
    snapshot: {
      title: input.vehicleName,
      subtitle: input.vehicleSubtitle,
      travelWindow: input.returnDate
        ? `${formatDate(input.pickupDate)} → ${formatDate(input.returnDate)}`
        : `${formatDate(input.pickupDate)} · ${input.pickupTime}`,
      startDate: input.pickupDate || null,
      guestsLabel: `${input.passengers} passenger${input.passengers === 1 ? "" : "s"}`,
      detailRows: [
        { label: "Trip type", value: input.tripType },
        { label: "Pickup", value: `${input.pickup} at ${input.pickupTime}` },
        { label: "Destination", value: input.destination },
        { label: "Return", value: input.returnDate ? formatDate(input.returnDate) : "One way" },
        { label: "Special request", value: input.notes || "None" },
      ],
      total: 0,
      productHref: input.vehicleHref,
    },
  });
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------- ownership + reads */

function ownedByProfile(entry: BookingRegistryEntry, profile: CustomerProfile): boolean {
  if (entry.customerId) return entry.customerId === profile.id;
  if (profile.mobile && last10(entry.ownerPhone) === profile.mobile) return true;
  if (profile.email && entry.ownerEmail && entry.ownerEmail.toLowerCase() === profile.email) return true;
  return false;
}

/**
 * Claims device bookings whose verified contact matches the signed-in account.
 * The mobile/email on the account was verified by OTP, so a match is a
 * verified link — anything else needs the explicit link flow below.
 */
function autoLink(profile: CustomerProfile) {
  const entries = listRegistry();
  let changed = false;
  const next = entries.map((entry) => {
    if (entry.customerId || !ownedByProfile(entry, profile)) return entry;
    changed = true;
    return { ...entry, customerId: profile.id, linkedAt: new Date().toISOString() };
  });
  if (changed) writeRegistry(next);
}

function decorate(entry: BookingRegistryEntry): CustomerBooking {
  const summary = entry.kind === "vehicle" ? null : loadBookingSummary(entry.reference);
  const own = listPaymentSubmissions().filter(
    (p) => p.bookingNumber.toUpperCase() === entry.reference.toUpperCase(),
  );
  const paid = summary
    ? summary.payments.paid
    : own.filter((p) => p.status === "verified").reduce((s, p) => s + p.amount, 0);
  const underVerification = summary
    ? summary.payments.underVerification
    : own.filter((p) => p.status === "pending-verification").reduce((s, p) => s + p.amount, 0);
  const total = summary ? summary.payments.total : entry.snapshot.total;
  return {
    ...entry,
    statusLabel: summary ? summary.status : entry.statusLabel,
    snapshot: summary
      ? { ...entry.snapshot, total, detailRows: summary.detailRows, travelWindow: summary.travelWindow }
      : entry.snapshot,
    summary,
    paid,
    underVerification,
    pending: Math.max(total - paid, 0),
  };
}

/** All bookings for the signed-in customer. RLS equivalent: customer_id = auth.uid(). */
export function listCustomerBookings(profile: CustomerProfile): CustomerBooking[] {
  syncRegistryFromDevice();
  autoLink(profile);
  return listRegistry()
    .filter((entry) => entry.customerId === profile.id)
    .map(decorate)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getCustomerBooking(profile: CustomerProfile, reference: string): CustomerBooking | null {
  return (
    listCustomerBookings(profile).find(
      (b) => b.reference.toUpperCase() === reference.trim().toUpperCase(),
    ) ?? null
  );
}

export type LinkResult =
  | { ok: true; booking: CustomerBooking }
  | { ok: false; reason: "not-found" | "mismatch" | "already-linked" };

/**
 * Links a guest booking to the account. The reference must resolve on this
 * device AND the phone number entered must match the one on the booking —
 * the same two-factor check the confirmation page uses.
 */
export function linkBookingToAccount(
  profile: CustomerProfile,
  referenceInput: string,
  phone: string,
): LinkResult {
  const reference = referenceInput.trim().toUpperCase();
  syncRegistryFromDevice();
  const entries = listRegistry();
  const entry = entries.find((e) => e.reference.toUpperCase() === reference);
  if (!entry) return { ok: false, reason: "not-found" };
  if (entry.customerId && entry.customerId !== profile.id) return { ok: false, reason: "already-linked" };
  if (last10(entry.ownerPhone) !== last10(phone)) return { ok: false, reason: "mismatch" };

  const linked: BookingRegistryEntry = {
    ...entry,
    customerId: profile.id,
    linkedAt: new Date().toISOString(),
  };
  writeRegistry(entries.map((e) => (e.reference === entry.reference ? linked : e)));
  return { ok: true, booking: decorate(linked) };
}

/* ------------------------------------------------------------- dashboard */

export type DashboardOverview = {
  bookings: CustomerBooking[];
  upcoming: CustomerBooking[];
  upcomingByKind: Record<CustomerBookingKind, CustomerBooking[]>;
  recent: CustomerBooking[];
  paymentDue: number;
  underVerification: number;
  totalBooked: number;
  openCancellations: CancellationRequest[];
  openSupport: SupportRequest[];
};

const isUpcoming = (booking: CustomerBooking) => {
  const start = booking.snapshot.startDate;
  if (!start) return booking.statusLabel !== "cancelled" && booking.statusLabel !== "refunded";
  const today = new Date().toISOString().slice(0, 10);
  return start >= today && booking.statusLabel !== "cancelled";
};

export function buildOverview(profile: CustomerProfile): DashboardOverview {
  const bookings = listCustomerBookings(profile);
  const upcoming = bookings
    .filter(isUpcoming)
    .sort((a, b) => (a.snapshot.startDate ?? "9999") .localeCompare(b.snapshot.startDate ?? "9999"));
  return {
    bookings,
    upcoming,
    upcomingByKind: {
      vehicle: upcoming.filter((b) => b.kind === "vehicle"),
      "tour-package": upcoming.filter((b) => b.kind === "tour-package"),
      hotel: upcoming.filter((b) => b.kind === "hotel"),
    },
    recent: bookings.slice(0, 4),
    paymentDue: bookings.reduce((sum, b) => sum + b.pending, 0),
    underVerification: bookings.reduce((sum, b) => sum + b.underVerification, 0),
    totalBooked: bookings.reduce((sum, b) => sum + b.snapshot.total, 0),
    openCancellations: listCancellations(profile).filter((c) => c.status === "requested"),
    openSupport: listSupportRequests(profile).filter((s) => s.status === "open"),
  };
}

/** Payment submissions that belong to the customer's own bookings. */
export function listCustomerPayments(profile: CustomerProfile): PaymentSubmissionRecord[] {
  const owned = new Set(listCustomerBookings(profile).map((b) => b.reference.toUpperCase()));
  return listPaymentSubmissions()
    .filter((p) => owned.has(p.bookingNumber.toUpperCase()))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/* ------------------------------------------------------------ travellers */

export type SavedTraveller = {
  id: string;
  customerId: string;
  fullName: string;
  relationship: string;
  age: number | null;
  gender: "male" | "female" | "other" | "unspecified";
  idType: string;
  idNumberLast4: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export const travellerRelationships = [
  "Self",
  "Spouse",
  "Child",
  "Parent",
  "Friend",
  "Colleague",
  "Other",
];

export const travellerIdTypes = ["Aadhaar", "Passport", "Driving licence", "Voter ID", "Not provided"];

function allTravellers(): SavedTraveller[] {
  return readJson<SavedTraveller[]>(TRAVELLERS_KEY, []);
}

export function listTravellers(profile: CustomerProfile): SavedTraveller[] {
  return allTravellers()
    .filter((t) => t.customerId === profile.id)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export type TravellerInput = Omit<SavedTraveller, "id" | "customerId" | "createdAt" | "updatedAt">;

export function saveTraveller(
  profile: CustomerProfile,
  input: TravellerInput,
  id?: string,
): SavedTraveller {
  const now = new Date().toISOString();
  const all = allTravellers();
  if (id) {
    const existing = all.find((t) => t.id === id && t.customerId === profile.id);
    if (existing) {
      const updated = { ...existing, ...input, updatedAt: now };
      writeJson(TRAVELLERS_KEY, all.map((t) => (t.id === id ? updated : t)));
      return updated;
    }
  }
  const created: SavedTraveller = {
    ...input,
    id: `trv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    customerId: profile.id,
    createdAt: now,
    updatedAt: now,
  };
  writeJson(TRAVELLERS_KEY, [created, ...all]);
  return created;
}

export function deleteTraveller(profile: CustomerProfile, id: string) {
  writeJson(
    TRAVELLERS_KEY,
    allTravellers().filter((t) => !(t.id === id && t.customerId === profile.id)),
  );
}

/* -------------------------------------------------------- cancellations */

export type CancellationStatus = "requested" | "in-review" | "approved" | "declined" | "refunded";

export const cancellationStatusMeta: Record<CancellationStatus, { label: string; tone: string }> = {
  requested: { label: "Requested", tone: "amber" },
  "in-review": { label: "In review", tone: "amber" },
  approved: { label: "Approved — refund processing", tone: "green" },
  declined: { label: "Declined", tone: "red" },
  refunded: { label: "Refunded", tone: "green" },
};

export type CancellationRequest = {
  reference: string;
  customerId: string;
  bookingReference: string;
  bookingTitle: string;
  bookingKind: CustomerBookingKind;
  reason: string;
  details: string;
  preferredResolution: "cancel" | "reschedule";
  status: CancellationStatus;
  createdAt: string;
  updatedAt: string;
  /** Refunds are never automatic — the admin decides the amount. */
  refundAmount: number | null;
  adminNote: string;
};

export const cancellationReasons = [
  "Change of travel plan",
  "Date change required",
  "Medical or emergency",
  "Booked by mistake",
  "Found a different option",
  "Other",
];

export type CancellationEligibility = { allowed: boolean; note: string };

/** Policy gate — mirrors the `can_request_cancellation` SQL function. */
export function cancellationEligibility(
  booking: CustomerBooking,
  existing: CancellationRequest[],
): CancellationEligibility {
  if (existing.some((c) => c.bookingReference === booking.reference && c.status !== "declined")) {
    return { allowed: false, note: "A request is already open for this booking." };
  }
  if (booking.statusLabel === "cancelled" || booking.statusLabel === "refunded") {
    return { allowed: false, note: "This booking is already cancelled." };
  }
  const start = booking.snapshot.startDate;
  if (start && start < new Date().toISOString().slice(0, 10)) {
    return { allowed: false, note: "Travel dates have passed — please raise a support request instead." };
  }
  const plan = booking.summary?.hotelRecord?.ratePlanSnapshot;
  if (plan && !plan.refundable) {
    return {
      allowed: true,
      note: "This rate is non-refundable. You can still request cancellation, but a refund is not guaranteed.",
    };
  }
  return { allowed: true, note: "Our team reviews the applicable policy and confirms any refund in writing." };
}

function allCancellations(): CancellationRequest[] {
  return readJson<CancellationRequest[]>(CANCELLATIONS_KEY, []);
}

export function listCancellations(profile: CustomerProfile): CancellationRequest[] {
  return allCancellations()
    .filter((c) => c.customerId === profile.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createCancellationRequest(
  profile: CustomerProfile,
  booking: CustomerBooking,
  input: { reason: string; details: string; preferredResolution: "cancel" | "reschedule" },
): CancellationRequest {
  const now = new Date().toISOString();
  const request: CancellationRequest = {
    reference: `SZT-CX-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    customerId: profile.id,
    bookingReference: booking.reference,
    bookingTitle: booking.snapshot.title,
    bookingKind: booking.kind,
    reason: input.reason,
    details: input.details,
    preferredResolution: input.preferredResolution,
    // Never auto-approved and never auto-refunded: an admin moves this on.
    status: "requested",
    createdAt: now,
    updatedAt: now,
    refundAmount: null,
    adminNote: "",
  };
  writeJson(CANCELLATIONS_KEY, [request, ...allCancellations()]);
  return request;
}

/* -------------------------------------------------------------- support */

export type SupportStatus = "open" | "in-progress" | "resolved" | "closed";

export const supportStatusMeta: Record<SupportStatus, { label: string; tone: string }> = {
  open: { label: "Open", tone: "amber" },
  "in-progress": { label: "In progress", tone: "amber" },
  resolved: { label: "Resolved", tone: "green" },
  closed: { label: "Closed", tone: "muted" },
};

export const supportCategories = [
  "Booking change",
  "Payment or invoice",
  "Driver or vehicle",
  "Hotel or room",
  "Itinerary question",
  "Document request",
  "Something else",
];

export type SupportRequest = {
  reference: string;
  customerId: string;
  category: string;
  subject: string;
  message: string;
  bookingReference: string | null;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  replies: { id: string; author: "customer" | "team"; body: string; createdAt: string }[];
};

function allSupport(): SupportRequest[] {
  return readJson<SupportRequest[]>(SUPPORT_KEY, []);
}

export function listSupportRequests(profile: CustomerProfile): SupportRequest[] {
  return allSupport()
    .filter((s) => s.customerId === profile.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createSupportRequest(
  profile: CustomerProfile,
  input: { category: string; subject: string; message: string; bookingReference: string | null },
): SupportRequest {
  const now = new Date().toISOString();
  const request: SupportRequest = {
    reference: `SZT-SR-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    customerId: profile.id,
    category: input.category,
    subject: input.subject,
    message: input.message,
    bookingReference: input.bookingReference,
    status: "open",
    createdAt: now,
    updatedAt: now,
    replies: [],
  };
  writeJson(SUPPORT_KEY, [request, ...allSupport()]);
  return request;
}

export function addSupportReply(profile: CustomerProfile, reference: string, body: string) {
  const now = new Date().toISOString();
  writeJson(
    SUPPORT_KEY,
    allSupport().map((s) =>
      s.reference === reference && s.customerId === profile.id
        ? {
            ...s,
            updatedAt: now,
            replies: [
              ...s.replies,
              { id: `rep_${Date.now().toString(36)}`, author: "customer" as const, body, createdAt: now },
            ],
          }
        : s,
    ),
  );
}

export { loadBookingRecord };
