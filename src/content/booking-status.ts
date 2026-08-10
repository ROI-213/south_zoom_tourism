/**
 * Booking / enquiry status tracking for /booking-status.
 *
 * Privacy model (mirrors booking-access.ts):
 *  - A reference number alone NEVER returns data. The guest must also prove
 *    the phone number or email address on the record.
 *  - What we return is a *limited* status projection: stage timeline, masked
 *    contact, service headline, dates and payment state. No addresses, no
 *    full contact details, no internal notes.
 *  - Failed lookups are rate-limited per device and every attempt is logged
 *    with a hashed reference only (no phone, no email, no name).
 *
 * Records are read from the same device-local snapshots the booking and
 * payment flows already write, so nothing here is hard-coded demo content.
 */

import {
  bookingKindOf,
  loadBookingSummary,
  type BookingLifecycleStatus,
} from "@/content/booking-summary";
import { deriveAccessToken, maskEmail, maskPhone } from "@/content/booking-access";
import { loadPaymentSubmission } from "@/content/payment";

/* ------------------------------------------------------------------ */
/* Stages (admin-editable copy block)                                   */
/* ------------------------------------------------------------------ */

export type TrackingStage =
  | "new"
  | "contacted"
  | "quotation-sent"
  | "awaiting-confirmation"
  | "confirmed"
  | "advance-paid"
  | "fully-paid"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "refunded";

export type StageMeta = {
  id: TrackingStage;
  label: string;
  /** Status-specific help text shown when this is the current stage. */
  help: string;
  /** Short description used inside the timeline. */
  description: string;
  terminal?: boolean;
};

export const trackingStages: StageMeta[] = [
  {
    id: "new",
    label: "New",
    description: "Your request reached our reservations desk.",
    help: "We have your request. A travel consultant picks it up during office hours and calls you back.",
  },
  {
    id: "contacted",
    label: "Contacted",
    description: "A travel consultant has reached out to you.",
    help: "Our consultant has contacted you. Share any missing details so we can prepare an accurate quote.",
  },
  {
    id: "quotation-sent",
    label: "Quotation Sent",
    description: "A priced itinerary or rate sheet has been shared.",
    help: "Check the quotation we shared. Reply with changes, or confirm to block your dates.",
  },
  {
    id: "awaiting-confirmation",
    label: "Awaiting Confirmation",
    description: "We are holding availability and waiting for your go-ahead.",
    help: "Availability is held for a limited time. Confirm with our team to lock the booking.",
  },
  {
    id: "confirmed",
    label: "Confirmed",
    description: "The booking is confirmed with the hotel or operations team.",
    help: "Your booking is confirmed. Download the confirmation and carry a photo ID for every adult traveller.",
  },
  {
    id: "advance-paid",
    label: "Advance Paid",
    description: "Advance payment received and verified.",
    help: "Advance received. The balance is payable as per the schedule on your booking.",
  },
  {
    id: "fully-paid",
    label: "Fully Paid",
    description: "The full amount has been received.",
    help: "Payment complete. Nothing is pending — we will share final travel documents before departure.",
  },
  {
    id: "in-progress",
    label: "In Progress",
    description: "Your trip or stay is currently running.",
    help: "Your trip is under way. Our 24×7 emergency desk is available for on-trip support.",
  },
  {
    id: "completed",
    label: "Completed",
    description: "Travel completed. Thank you for travelling with us.",
    help: "Trip completed. We would love your feedback — it helps other travellers choose with confidence.",
  },
  {
    id: "cancelled",
    label: "Cancelled",
    description: "This request is no longer active.",
    help: "This booking is cancelled. Any refund due is assessed under the cancellation policy on your booking.",
    terminal: true,
  },
  {
    id: "refunded",
    label: "Refunded",
    description: "Refund released to the original payment source.",
    help: "Refund released. Banks usually credit within 5–7 working days. Quote this reference for follow-ups.",
    terminal: true,
  },
];

export const stageMeta = (stage: TrackingStage): StageMeta =>
  trackingStages.find((s) => s.id === stage) ?? trackingStages[0];

/** Stages rendered in the timeline for a given record (terminal ones only if reached). */
const LINEAR: TrackingStage[] = [
  "new",
  "contacted",
  "quotation-sent",
  "awaiting-confirmation",
  "confirmed",
  "advance-paid",
  "fully-paid",
  "in-progress",
  "completed",
];

/* ------------------------------------------------------------------ */
/* Enquiry tracking registry                                            */
/* ------------------------------------------------------------------ */

export type EnquiryTrackingKind = "contact" | "custom-tour" | "travel-enquiry";

export type EnquiryTrackingRecord = {
  reference: string;
  kind: EnquiryTrackingKind;
  serviceLabel: string;
  serviceTitle: string;
  travelWindow: string;
  guestsLabel: string;
  name: string;
  phone: string;
  email: string;
  stage: TrackingStage;
  note: string;
  createdAt: string;
  updatedAt: string;
};

const ENQ_INDEX = "szt:tracking:enquiries";
const enqKey = (reference: string) => `szt:tracking:enquiry:${reference.toUpperCase()}`;

const parse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/** Called by the enquiry forms so the guest can track the reference later. */
export function recordEnquiryForTracking(
  input: Omit<EnquiryTrackingRecord, "stage" | "note" | "createdAt" | "updatedAt"> &
    Partial<Pick<EnquiryTrackingRecord, "stage" | "note">>,
) {
  if (typeof window === "undefined") return;
  const now = new Date().toISOString();
  const record: EnquiryTrackingRecord = {
    stage: "new",
    note: "",
    ...input,
    reference: input.reference.toUpperCase(),
    createdAt: now,
    updatedAt: now,
  };
  try {
    window.localStorage.setItem(enqKey(record.reference), JSON.stringify(record));
    const index = parse<string[]>(window.localStorage.getItem(ENQ_INDEX)) ?? [];
    if (!index.includes(record.reference)) {
      window.localStorage.setItem(
        ENQ_INDEX,
        JSON.stringify([record.reference, ...index].slice(0, 100)),
      );
    }
  } catch {
    /* storage unavailable — tracking simply falls back to phone support */
  }
}

export function loadEnquiryTracking(reference: string): EnquiryTrackingRecord | null {
  if (typeof window === "undefined") return null;
  return parse<EnquiryTrackingRecord>(window.localStorage.getItem(enqKey(reference)));
}

/** Admin action: move an enquiry along the pipeline. */
export function setEnquiryStage(reference: string, stage: TrackingStage, note = "") {
  const record = loadEnquiryTracking(reference);
  if (!record || typeof window === "undefined") return;
  const next: EnquiryTrackingRecord = {
    ...record,
    stage,
    note,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(enqKey(next.reference), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Abuse monitoring: hashed attempt log + rate limit                    */
/* ------------------------------------------------------------------ */

const ATTEMPT_KEY = "szt:tracking:attempts";
export const lookupPolicy = { maxFailures: 5, windowMs: 15 * 60 * 1000 };

export type LookupAttempt = {
  /** Hashed reference — the raw reference is never stored. */
  refHash: string;
  outcome: "found" | "not-found" | "mismatch" | "blocked";
  at: number;
};

/** Non-reversible short hash so attempt logs carry no personal data. */
export function hashReference(reference: string): string {
  let h = 0x811c9dc5;
  const input = reference.trim().toUpperCase();
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h.toString(36);
}

export function listLookupAttempts(): LookupAttempt[] {
  if (typeof window === "undefined") return [];
  const all = parse<LookupAttempt[]>(window.localStorage.getItem(ATTEMPT_KEY)) ?? [];
  const cutoff = Date.now() - lookupPolicy.windowMs * 8;
  return all.filter((a) => a.at > cutoff);
}

export function recordLookupAttempt(reference: string, outcome: LookupAttempt["outcome"]) {
  if (typeof window === "undefined") return;
  const attempts = listLookupAttempts();
  attempts.unshift({ refHash: hashReference(reference), outcome, at: Date.now() });
  try {
    window.localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempts.slice(0, 60)));
  } catch {
    /* ignore */
  }
}

export type RateLimitState = { blocked: boolean; failures: number; retryInMs: number };

export function lookupRateLimit(): RateLimitState {
  const cutoff = Date.now() - lookupPolicy.windowMs;
  const failures = listLookupAttempts().filter(
    (a) => a.at > cutoff && (a.outcome === "not-found" || a.outcome === "mismatch"),
  );
  if (failures.length < lookupPolicy.maxFailures) {
    return { blocked: false, failures: failures.length, retryInMs: 0 };
  }
  const oldest = failures[failures.length - 1];
  return {
    blocked: true,
    failures: failures.length,
    retryInMs: Math.max(oldest.at + lookupPolicy.windowMs - Date.now(), 0),
  };
}

/* ------------------------------------------------------------------ */
/* Status projection                                                    */
/* ------------------------------------------------------------------ */

export type TimelineStep = {
  id: TrackingStage;
  label: string;
  description: string;
  state: "done" | "current" | "upcoming";
};

export type StatusPaymentState = {
  total: number;
  paid: number;
  underVerification: number;
  pending: number;
};

export type StatusResult = {
  reference: string;
  recordType: "booking" | "enquiry" | "payment";
  serviceLabel: string;
  serviceTitle: string;
  serviceSubtitle: string;
  travelWindow: string;
  guestsLabel: string;
  createdAt: string;
  updatedAt: string | null;
  stage: TrackingStage;
  note: string;
  maskedName: string;
  maskedPhone: string;
  maskedEmail: string;
  timeline: TimelineStep[];
  payments: StatusPaymentState | null;
  pendingActions: string[];
  /** Secure deep link to the full confirmation page, when one exists. */
  confirmationHref: string | null;
  documentsAvailable: boolean;
};

export type LookupOutcome =
  | { ok: true; result: StatusResult }
  | { ok: false; reason: "blocked"; retryInMs: number }
  | { ok: false; reason: "not-found" | "mismatch" };

const digits = (value: string) => value.replace(/\D/g, "").slice(-10);

const contactMatches = (input: string, phone: string, email: string) => {
  const value = input.trim().toLowerCase();
  if (!value) return false;
  if (value.includes("@")) return Boolean(email) && email.trim().toLowerCase() === value;
  const d = digits(value);
  return d.length >= 10 && digits(phone) === d;
};

const maskName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Guest";
  return parts
    .map((p, i) => (i === 0 ? p : `${p[0]}.`))
    .join(" ");
};

function buildTimeline(reached: TrackingStage, extras: TrackingStage[] = []): TimelineStep[] {
  const terminal = reached === "cancelled" || reached === "refunded";
  const highest = terminal ? -1 : LINEAR.indexOf(reached);
  const steps: TimelineStep[] = LINEAR.filter(
    (id) => LINEAR.indexOf(id) <= Math.max(highest, 3) || extras.includes(id),
  ).map((id) => {
    const index = LINEAR.indexOf(id);
    const meta = stageMeta(id);
    return {
      id,
      label: meta.label,
      description: meta.description,
      state: terminal
        ? index <= LINEAR.indexOf("confirmed") && extras.includes(id)
          ? "done"
          : "upcoming"
        : index < highest
          ? "done"
          : index === highest
            ? "current"
            : "upcoming",
    };
  });
  if (terminal) {
    const meta = stageMeta(reached);
    steps.push({ id: reached, label: meta.label, description: meta.description, state: "current" });
  }
  return steps;
}

function bookingStageFrom(
  status: BookingLifecycleStatus,
  payments: StatusPaymentState,
  startsAt: string | null,
  endsAt: string | null,
): TrackingStage {
  if (status === "cancelled") return "cancelled";
  if (status === "refunded") return "refunded";
  const now = Date.now();
  const start = startsAt ? new Date(startsAt).getTime() : NaN;
  const end = endsAt ? new Date(endsAt).getTime() : NaN;
  if (status === "confirmed") {
    if (!Number.isNaN(end) && now > end) return "completed";
    if (!Number.isNaN(start) && now >= start) return "in-progress";
    if (payments.total > 0 && payments.paid >= payments.total) return "fully-paid";
    if (payments.paid > 0) return "advance-paid";
    return "confirmed";
  }
  if (payments.paid > 0 && payments.paid < payments.total) return "advance-paid";
  if (payments.total > 0 && payments.paid >= payments.total) return "fully-paid";
  if (payments.underVerification > 0) return "awaiting-confirmation";
  return "awaiting-confirmation";
}

function pendingActionsFor(stage: TrackingStage, payments: StatusPaymentState | null): string[] {
  const actions: string[] = [];
  if (stage === "new" || stage === "contacted")
    actions.push("Keep your phone reachable — our consultant will call to confirm details.");
  if (stage === "quotation-sent")
    actions.push("Review the quotation we shared and reply with your confirmation or changes.");
  if (stage === "awaiting-confirmation")
    actions.push("Confirm with our team so we can hold your dates before availability changes.");
  if (payments && payments.underVerification > 0)
    actions.push("A payment is under verification — no action needed for up to 4 working hours.");
  if (payments && payments.pending > 0 && payments.underVerification === 0)
    actions.push("Balance payment is pending. Use the QR payment page to pay and upload proof.");
  if (stage === "confirmed")
    actions.push("Download your confirmation and carry a photo ID for every adult traveller.");
  if (stage === "completed")
    actions.push("Share your feedback — it takes a minute and helps other travellers.");
  return actions;
}

/** Secure status lookup. Returns limited data and only after contact verification. */
export function lookupBookingStatus(referenceInput: string, contact: string): LookupOutcome {
  const reference = referenceInput.trim().toUpperCase();

  const limit = lookupRateLimit();
  if (limit.blocked) {
    recordLookupAttempt(reference, "blocked");
    return { ok: false, reason: "blocked", retryInMs: limit.retryInMs };
  }

  // 1. Hotel / tour package bookings
  if (bookingKindOf(reference)) {
    const summary = loadBookingSummary(reference);
    if (!summary) {
      recordLookupAttempt(reference, "not-found");
      return { ok: false, reason: "not-found" };
    }
    if (!contactMatches(contact, summary.phone, summary.email)) {
      recordLookupAttempt(reference, "mismatch");
      return { ok: false, reason: "mismatch" };
    }
    const payments: StatusPaymentState = {
      total: summary.payments.total,
      paid: summary.payments.paid,
      underVerification: summary.payments.underVerification,
      pending: summary.payments.pending,
    };
    const startsAt = summary.hotelRecord?.stay.checkIn ?? summary.tourRecord?.departureSnapshot.date ?? null;
    const endsAt = summary.hotelRecord?.stay.checkOut ?? null;
    const stage = bookingStageFrom(summary.status, payments, startsAt, endsAt);
    const extras: TrackingStage[] = ["new", "contacted"];
    if (summary.status === "confirmed") extras.push("quotation-sent", "awaiting-confirmation", "confirmed");
    if (payments.paid > 0) extras.push("advance-paid");
    recordLookupAttempt(reference, "found");
    return {
      ok: true,
      result: {
        reference,
        recordType: "booking",
        serviceLabel: summary.serviceLabel,
        serviceTitle: summary.serviceTitle,
        serviceSubtitle: summary.serviceSubtitle,
        travelWindow: summary.travelWindow,
        guestsLabel: summary.guestsLabel,
        createdAt: summary.createdAt,
        updatedAt: summary.statusUpdatedAt,
        stage,
        note: summary.statusNote,
        maskedName: maskName(summary.customerName),
        maskedPhone: maskPhone(summary.phone),
        maskedEmail: summary.email ? maskEmail(summary.email) : "",
        timeline: buildTimeline(stage, extras),
        payments,
        pendingActions: pendingActionsFor(stage, payments),
        confirmationHref: `/booking-confirmation/${reference}?t=${deriveAccessToken(
          reference,
          summary.phone,
        )}`,
        documentsAvailable: true,
      },
    };
  }

  // 2. Payment proof references
  if (reference.startsWith("SZT-PAY-")) {
    const proof = loadPaymentSubmission(reference);
    if (!proof) {
      recordLookupAttempt(reference, "not-found");
      return { ok: false, reason: "not-found" };
    }
    if (!contactMatches(contact, proof.phone, "")) {
      recordLookupAttempt(reference, "mismatch");
      return { ok: false, reason: "mismatch" };
    }
    const payments: StatusPaymentState = {
      total: proof.amount,
      paid: proof.status === "verified" ? proof.amount : 0,
      underVerification: proof.status === "pending-verification" ? proof.amount : 0,
      pending: proof.status === "verified" ? 0 : proof.amount,
    };
    const stage: TrackingStage =
      proof.status === "verified" ? "advance-paid" : proof.status === "rejected" ? "awaiting-confirmation" : "awaiting-confirmation";
    recordLookupAttempt(reference, "found");
    return {
      ok: true,
      result: {
        reference,
        recordType: "payment",
        serviceLabel: "Payment",
        serviceTitle: `Payment against ${proof.bookingNumber || "your booking"}`,
        serviceSubtitle: proof.method,
        travelWindow: proof.paidOn ? `Paid on ${proof.paidOn}` : "",
        guestsLabel: "",
        createdAt: proof.createdAt,
        updatedAt: null,
        stage,
        note:
          proof.status === "rejected"
            ? "This payment proof could not be verified. Please contact accounts with the correct transaction ID."
            : "",
        maskedName: maskName(proof.customerName),
        maskedPhone: proof.phone ? maskPhone(proof.phone) : "",
        maskedEmail: "",
        timeline: buildTimeline(stage, ["new", "contacted"]),
        payments,
        pendingActions: pendingActionsFor(stage, payments),
        confirmationHref: null,
        documentsAvailable: false,
      },
    };
  }

  // 3. Enquiries (contact, custom tour, travel enquiry)
  const enquiry = loadEnquiryTracking(reference);
  if (!enquiry) {
    recordLookupAttempt(reference, "not-found");
    return { ok: false, reason: "not-found" };
  }
  if (!contactMatches(contact, enquiry.phone, enquiry.email)) {
    recordLookupAttempt(reference, "mismatch");
    return { ok: false, reason: "mismatch" };
  }
  recordLookupAttempt(reference, "found");
  return {
    ok: true,
    result: {
      reference,
      recordType: "enquiry",
      serviceLabel: enquiry.serviceLabel,
      serviceTitle: enquiry.serviceTitle,
      serviceSubtitle: "",
      travelWindow: enquiry.travelWindow,
      guestsLabel: enquiry.guestsLabel,
      createdAt: enquiry.createdAt,
      updatedAt: enquiry.updatedAt,
      stage: enquiry.stage,
      note: enquiry.note,
      maskedName: maskName(enquiry.name),
      maskedPhone: enquiry.phone ? maskPhone(enquiry.phone) : "",
      maskedEmail: enquiry.email ? maskEmail(enquiry.email) : "",
      timeline: buildTimeline(enquiry.stage, ["new"]),
      payments: null,
      pendingActions: pendingActionsFor(enquiry.stage, null),
      confirmationHref: null,
      documentsAvailable: false,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Resend requests                                                      */
/* ------------------------------------------------------------------ */

const RESEND_KEY = "szt:tracking:resend-requests";

export type ResendRequest = {
  reference: string;
  channel: "whatsapp" | "email";
  requestedAt: string;
};

export function listResendRequests(): ResendRequest[] {
  if (typeof window === "undefined") return [];
  return parse<ResendRequest[]>(window.localStorage.getItem(RESEND_KEY)) ?? [];
}

/** Queues a "resend my confirmation / receipt" request for the ops desk. */
export function requestResend(reference: string, channel: ResendRequest["channel"]): ResendRequest {
  const entry: ResendRequest = {
    reference: reference.toUpperCase(),
    channel,
    requestedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        RESEND_KEY,
        JSON.stringify([entry, ...listResendRequests()].slice(0, 50)),
      );
    } catch {
      /* ignore */
    }
  }
  return entry;
}

export const formatTrackedDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
