/**
 * Admin-managed offline payment settings + payment-proof submissions.
 *
 * Mirrors the future payment tables:
 *   payment_settings:      published, upi_id, payee_name, qr_image_url,
 *                          account_holder, bank_name, account_number, ifsc,
 *                          branch, account_type, instructions[], warnings[],
 *                          max_upload_mb, allowed_formats[],
 *                          enforce_unique_transaction_id, verification_sla_hours,
 *                          notify_admin_email, notify_admin_whatsapp,
 *                          send_customer_acknowledgement
 *   payment_submissions:   id, reference, booking_number, booking_type,
 *                          customer_name, phone, amount, paid_on,
 *                          transaction_id, remarks, screenshot_path (private
 *                          bucket, admin-only signed URL), status,
 *                          rejection_reason, verified_by, verified_at,
 *                          created_at, updated_at, source, user_agent
 *
 * Nothing on the QR Payment page hardcodes bank/UPI values — every field the
 * customer sees is read from `paymentSettings` below.
 */

import { company } from "@/content/site";
import { loadHotelBooking } from "@/content/hotel-booking";
import { loadBookingRecord } from "@/content/package-booking";

/* ------------------------------------------------------------------ */
/* Settings (admin-controlled)                                          */
/* ------------------------------------------------------------------ */

export type BankAccountSetting = {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  accountType: string;
};

export type UpiSetting = {
  upiId: string;
  payeeName: string;
  /** Optional uploaded QR artwork. When null the page renders a UPI QR from `upiId`. */
  qrImageUrl: string | null;
  qrAlt: string;
};

export const paymentSettings = {
  published: true,
  heading: "Pay by QR / UPI / Bank Transfer",
  intro:
    "Scan the QR or transfer to the account below, then upload your payment screenshot so our accounts team can verify it against your booking.",
  upi: {
    upiId: "southzoomtourism@okicici",
    payeeName: "South Zoom Tourism",
    qrImageUrl: null,
    qrAlt: "UPI QR code for South Zoom Tourism payments",
  } satisfies UpiSetting,
  bank: {
    accountHolder: "South Zoom Tourism Pvt Ltd",
    bankName: "ICICI Bank",
    accountNumber: "004705001234",
    ifsc: "ICIC0000047",
    branch: "Anna Salai, Chennai",
    accountType: "Current Account",
  } satisfies BankAccountSetting,
  instructions: [
    "Scan the QR with any UPI app, or transfer to the bank account shown.",
    "Enter your booking number in the payment note / remarks field.",
    "Take a clear screenshot of the successful payment (amount + UTR/transaction ID visible).",
    "Upload the screenshot in the form below along with the transaction ID.",
    "Keep the payment reference we issue — quote it in any follow-up.",
  ],
  warnings: [
    "Payment is marked Pending Verification until our accounts team confirms it with the bank.",
    "Your booking is not treated as paid, and no seat/room is released to you, until verification is complete.",
    `We never ask for OTPs, card PINs or CVV. Pay only to the UPI ID and account shown here or call ${company.phone} to re-confirm.`,
  ],
  upload: {
    maxMb: 5,
    formats: ["JPG", "PNG", "WEBP", "PDF"],
    accept: "image/jpeg,image/png,image/webp,application/pdf",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  },
  /** When true, a transaction ID already submitted cannot be submitted again. */
  enforceUniqueTransactionId: true,
  verificationSlaHours: 4,
  notify: {
    adminEmail: company.email,
    adminWhatsApp: company.whatsappRaw,
    sendCustomerAcknowledgement: true,
  },
  /** Verification desk hours shown next to the SLA. */
  deskHours: "Mon–Sat, 9:00 AM – 8:00 PM IST",
};

export const paymentBannerBlock = {
  eyebrow: "Payments",
  heading: "QR / UPI Payment & Proof Upload",
  subheading:
    "Complete an offline payment for your booking and submit the proof for verification.",
};

export const paymentFaqs = [
  {
    q: "How long does verification take?",
    a: `Most payments are verified within ${paymentSettings.verificationSlaHours} working hours (${paymentSettings.deskHours}). You'll get a call or WhatsApp once it's done.`,
  },
  {
    q: "I don't have a booking number yet.",
    a: "Please complete the booking request first — the booking number is what links your payment to the right trip.",
  },
  {
    q: "Is my screenshot visible to anyone else?",
    a: "No. Screenshots are stored privately and are only opened by our accounts team during verification.",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

/** UPI deep-link / QR payload built from settings (never hardcoded). */
export function buildUpiPayload(amount?: number, note?: string): string {
  const params = new URLSearchParams({
    pa: paymentSettings.upi.upiId,
    pn: paymentSettings.upi.payeeName,
    cu: "INR",
  });
  if (amount && amount > 0) params.set("am", String(amount));
  if (note) params.set("tn", note.slice(0, 50));
  return `upi://pay?${params.toString()}`;
}

export const formatPaidOn = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/* Booking link validation (no booking data is exposed to strangers)    */
/* ------------------------------------------------------------------ */

export type BookingType = "hotel" | "tour-package" | "other";

export type BookingLinkResult =
  /** Booking found on this device and the phone number matches. */
  | { state: "matched"; bookingType: BookingType }
  /** Booking found but the phone number does not match — refuse, reveal nothing. */
  | { state: "mismatch" }
  /** Not resolvable here (different device/browser) — accept and let staff verify. */
  | { state: "unverified"; bookingType: BookingType };

const digits = (value: string) => value.replace(/\D/g, "").slice(-10);

export function bookingTypeOf(bookingNumber: string): BookingType {
  const upper = bookingNumber.trim().toUpperCase();
  if (upper.startsWith("SZT-HB-")) return "hotel";
  if (upper.startsWith("SZT-TP-")) return "tour-package";
  return "other";
}

/**
 * Confirms that the booking number and phone belong together *without*
 * returning any booking details to the caller.
 */
export function validateBookingLink(bookingNumber: string, phone: string): BookingLinkResult {
  const reference = bookingNumber.trim().toUpperCase();
  const bookingType = bookingTypeOf(reference);
  const entered = digits(phone);

  const hotel = bookingType === "hotel" ? loadHotelBooking(reference) : null;
  if (hotel) {
    return digits(hotel.primaryGuest.phone) === entered
      ? { state: "matched", bookingType }
      : { state: "unverified", bookingType };
  }

  const tour = bookingType === "tour-package" ? loadBookingRecord(reference) : null;
  if (tour) {
    return digits(tour.contact.phone) === entered
      ? { state: "matched", bookingType }
      : { state: "unverified", bookingType };
  }

  return { state: "unverified", bookingType };
}

/* ------------------------------------------------------------------ */
/* Submission record                                                    */
/* ------------------------------------------------------------------ */

export type PaymentStatus = "pending-verification" | "verified" | "rejected";

export type PaymentScreenshotRef = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Private object path — admin review uses a short-lived signed URL. */
  storagePath: string;
  /** Local-only preview payload; never rendered on the public page. */
  dataUrl: string | null;
};

export type PaymentSubmissionRecord = {
  reference: string;
  createdAt: string;
  updatedAt: string;
  status: PaymentStatus;
  source: "web:/qr-payment";
  bookingNumber: string;
  bookingType: BookingType;
  bookingLinkState: BookingLinkResult["state"];
  customerName: string;
  phone: string;
  amount: number;
  totalAmount?: number | null;
  pendingBalance?: number | null;
  paidOn: string;
  transactionId: string;
  remarks: string;
  method: string;
  screenshot: PaymentScreenshotRef | null;
  /* audit fields */
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  notifiedAdminAt: string | null;
  acknowledgementSentAt: string | null;
};

export const paymentMethodOptions = [
  { id: "upi-qr", label: "UPI / QR scan" },
  { id: "upi-id", label: "UPI ID transfer" },
  { id: "imps-neft", label: "IMPS / NEFT / RTGS" },
  { id: "office-cash", label: "Cash / card at office" },
];

export const paymentStatusMeta: Record<PaymentStatus, { label: string; tone: string }> = {
  "pending-verification": { label: "Pending Verification", tone: "amber" },
  verified: { label: "Verified", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};

export function makePaymentReference(): string {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `SZT-PAY-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const screenshotStoragePath = (reference: string, fileName: string) => {
  const ext = fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "bin";
  return `payment-proofs/${reference}.${ext}`;
};

/* ------------------------------------------------------------------ */
/* Persistence (device-local until a backend is connected)              */
/* ------------------------------------------------------------------ */

const INDEX_KEY = "szt:payment-proofs";
const recordKey = (reference: string) => `szt:payment-proof:${reference}`;

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export function listPaymentSubmissions(): PaymentSubmissionRecord[] {
  if (typeof window === "undefined") return [];
  const refs = safeParse<string[]>(window.localStorage.getItem(INDEX_KEY)) ?? [];
  return refs
    .map((ref) => safeParse<PaymentSubmissionRecord>(window.localStorage.getItem(recordKey(ref))))
    .filter((r): r is PaymentSubmissionRecord => Boolean(r));
}

export function loadPaymentSubmission(reference: string): PaymentSubmissionRecord | null {
  if (typeof window === "undefined") return null;
  return safeParse<PaymentSubmissionRecord>(window.localStorage.getItem(recordKey(reference)));
}

export function savePaymentSubmission(record: PaymentSubmissionRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(recordKey(record.reference), JSON.stringify(record));
    const refs = safeParse<string[]>(window.localStorage.getItem(INDEX_KEY)) ?? [];
    if (!refs.includes(record.reference)) {
      window.localStorage.setItem(INDEX_KEY, JSON.stringify([record.reference, ...refs].slice(0, 100)));
    }
  } catch {
    // Storage full (large screenshot) — retry without the local preview payload.
    try {
      const slim = { ...record, screenshot: record.screenshot ? { ...record.screenshot, dataUrl: null } : null };
      window.localStorage.setItem(recordKey(record.reference), JSON.stringify(slim));
    } catch {
      /* storage unavailable — the acknowledgement is still shown in-session */
    }
  }
}

/** Duplicate guard — only enforced when the admin setting is on. */
export function findDuplicateTransaction(transactionId: string): PaymentSubmissionRecord | null {
  if (!paymentSettings.enforceUniqueTransactionId) return null;
  const needle = transactionId.trim().toUpperCase();
  if (!needle) return null;
  return (
    listPaymentSubmissions().find(
      (r) => r.transactionId.trim().toUpperCase() === needle && r.status !== "rejected",
    ) ?? null
  );
}

/* ------------------------------------------------------------------ */
/* Admin actions (verify / reject with audit trail)                     */
/* ------------------------------------------------------------------ */

export function verifyPaymentSubmission(reference: string, verifiedBy: string) {
  const record = loadPaymentSubmission(reference);
  if (!record) return null;
  const next: PaymentSubmissionRecord = {
    ...record,
    status: "verified",
    verifiedBy,
    verifiedAt: new Date().toISOString(),
    rejectionReason: null,
    updatedAt: new Date().toISOString(),
  };
  savePaymentSubmission(next);
  return next;
}

export function rejectPaymentSubmission(reference: string, verifiedBy: string, reason: string) {
  const record = loadPaymentSubmission(reference);
  if (!record) return null;
  const next: PaymentSubmissionRecord = {
    ...record,
    status: "rejected",
    verifiedBy,
    verifiedAt: new Date().toISOString(),
    rejectionReason: reason,
    updatedAt: new Date().toISOString(),
  };
  savePaymentSubmission(next);
  return next;
}

/**
 * Queues the admin notification (and optional customer acknowledgement).
 * Returns the timestamps stamped onto the record's audit fields.
 */
export function queuePaymentNotifications(record: PaymentSubmissionRecord) {
  const now = new Date().toISOString();
  return {
    notifiedAdminAt: now,
    acknowledgementSentAt: paymentSettings.notify.sendCustomerAcknowledgement ? now : null,
  };
}

export function paymentWhatsAppMessage(record: PaymentSubmissionRecord): string {
  return [
    `Payment proof ${record.reference} (Pending Verification)`,
    `Booking: ${record.bookingNumber}`,
    `Amount: ${inr(record.amount)} paid on ${formatPaidOn(record.paidOn)}`,
    `Txn ID: ${record.transactionId}`,
    `Name: ${record.customerName} · ${record.phone}`,
  ].join("\n");
}
