/**
 * Unified, read-only booking summary for the confirmation page.
 *
 * Everything shown to the guest is read from the immutable snapshot stored
 * when the booking was created (hotel or tour package) plus the *current*
 * lifecycle status and the verified payment ledger. Nothing here recomputes
 * prices — a snapshot is a snapshot.
 */

import {
  formatStayDay,
  hotelBookingNextSteps,
  inr,
  loadHotelBooking,
  type HotelBookingRecord,
} from "@/content/hotel-booking";
import {
  bookingNextSteps,
  formatDay,
  loadBookingRecord,
  type PackageBookingRecord,
} from "@/content/package-booking";
import { listPaymentSubmissions, type PaymentSubmissionRecord } from "@/content/payment";

export type BookingKind = "hotel" | "tour-package";

export type BookingLifecycleStatus =
  | "awaiting-review"
  | "payment-verification"
  | "confirmed"
  | "cancelled"
  | "refunded";

export type BookingStatusMeta = {
  label: string;
  headline: string;
  description: string;
  tone: "amber" | "green" | "red" | "muted";
  nextSteps: { id: string; title: string; description: string }[];
};

/* ------------------------------------------------------------------ */
/* Admin-controlled status overrides                                    */
/* ------------------------------------------------------------------ */

const STATUS_KEY = (bookingNumber: string) => `szt:booking-status:${bookingNumber.toUpperCase()}`;

export type BookingStatusOverride = {
  status: BookingLifecycleStatus;
  note: string;
  updatedAt: string;
  updatedBy: string;
};

export function loadStatusOverride(bookingNumber: string): BookingStatusOverride | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STATUS_KEY(bookingNumber));
    return raw ? (JSON.parse(raw) as BookingStatusOverride) : null;
  } catch {
    return null;
  }
}

/** Admin action: move a booking to confirmed / cancelled / refunded. */
export function setBookingStatus(
  bookingNumber: string,
  status: BookingLifecycleStatus,
  updatedBy: string,
  note = "",
) {
  if (typeof window === "undefined") return;
  const payload: BookingStatusOverride = {
    status,
    note,
    updatedBy,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STATUS_KEY(bookingNumber), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Status copy (admin-editable content block)                           */
/* ------------------------------------------------------------------ */

const supportSteps = (extra: { id: string; title: string; description: string }[]) => extra;

export const bookingStatusMeta: Record<BookingLifecycleStatus, BookingStatusMeta> = {
  "awaiting-review": {
    label: "Awaiting review",
    headline: "Booking request received",
    description:
      "Our reservations team is checking live availability and will confirm your booking shortly.",
    tone: "amber",
    nextSteps: supportSteps([
      {
        id: "aw-1",
        title: "Availability check",
        description: "We verify the hotel, room or departure and hold it while we confirm with you.",
      },
      {
        id: "aw-2",
        title: "Confirmation call",
        description: "You get a call or WhatsApp with the final amount and payment instructions.",
      },
    ]),
  },
  "payment-verification": {
    label: "Payment verification",
    headline: "Payment received — verifying",
    description:
      "We have your payment proof. Accounts verifies it with the bank before the booking is marked paid.",
    tone: "amber",
    nextSteps: supportSteps([
      {
        id: "pv-1",
        title: "Bank verification",
        description: "Usually within 4 working hours (Mon–Sat, 9:00 AM – 8:00 PM IST).",
      },
      {
        id: "pv-2",
        title: "Voucher release",
        description: "Once verified, your confirmation voucher and invoice update automatically here.",
      },
    ]),
  },
  confirmed: {
    label: "Confirmed",
    headline: "Your booking is confirmed",
    description: "Download your confirmation below and carry a copy — printed or on your phone.",
    tone: "green",
    nextSteps: supportSteps([
      {
        id: "cf-1",
        title: "Carry your documents",
        description: "Keep the confirmation and a photo ID for every adult traveller ready.",
      },
      {
        id: "cf-2",
        title: "Pay the balance",
        description: "Any pending amount is payable as per the schedule shown in the payment card.",
      },
    ]),
  },
  cancelled: {
    label: "Cancelled",
    headline: "This booking is cancelled",
    description:
      "The booking is no longer active. Any refund due is processed as per the cancellation policy.",
    tone: "red",
    nextSteps: supportSteps([
      {
        id: "cn-1",
        title: "Refund assessment",
        description: "Accounts calculates the refund due under the cancellation policy on your booking.",
      },
      {
        id: "cn-2",
        title: "Need to rebook?",
        description: "Call support and we will re-quote the same trip with current availability.",
      },
    ]),
  },
  refunded: {
    label: "Refunded",
    headline: "Refund processed",
    description:
      "The refund has been released to the original payment source. Banks usually credit in 5–7 working days.",
    tone: "muted",
    nextSteps: supportSteps([
      {
        id: "rf-1",
        title: "Check your account",
        description: "Credits appear within 5–7 working days depending on your bank.",
      },
      {
        id: "rf-2",
        title: "Keep the reference",
        description: "Quote this booking number for any refund follow-up.",
      },
    ]),
  },
};

/* ------------------------------------------------------------------ */
/* Summary model                                                        */
/* ------------------------------------------------------------------ */

export type SummaryRow = { label: string; value: string };

export type BookingPayments = {
  total: number;
  paid: number;
  underVerification: number;
  pending: number;
  currency: string;
  entries: {
    reference: string;
    amount: number;
    paidOn: string;
    method: string;
    status: PaymentSubmissionRecord["status"];
  }[];
};

export type BookingSummary = {
  bookingNumber: string;
  kind: BookingKind;
  createdAt: string;
  status: BookingLifecycleStatus;
  statusNote: string;
  statusUpdatedAt: string | null;
  customerName: string;
  phone: string;
  email: string;
  serviceLabel: string;
  serviceTitle: string;
  serviceSubtitle: string;
  travelWindow: string;
  guestsLabel: string;
  detailRows: SummaryRow[];
  invoiceNumber: string | null;
  hasInvoice: boolean;
  payments: BookingPayments;
  /** Deep link back to the originating product page, when we can resolve one. */
  productHref: string | null;
  hotelRecord: HotelBookingRecord | null;
  tourRecord: PackageBookingRecord | null;
};

export function bookingKindOf(bookingNumber: string): BookingKind | null {
  const upper = bookingNumber.trim().toUpperCase();
  if (upper.startsWith("SZT-HB-")) return "hotel";
  if (upper.startsWith("SZT-TP-")) return "tour-package";
  return null;
}

function paymentsFor(bookingNumber: string, total: number, alreadyPaid: number): BookingPayments {
  const entries = listPaymentSubmissions().filter(
    (p) => p.bookingNumber.toUpperCase() === bookingNumber.toUpperCase(),
  );
  const paid =
    alreadyPaid +
    entries.filter((p) => p.status === "verified").reduce((sum, p) => sum + p.amount, 0);
  const underVerification = entries
    .filter((p) => p.status === "pending-verification")
    .reduce((sum, p) => sum + p.amount, 0);
  return {
    total,
    paid,
    underVerification,
    pending: Math.max(total - paid, 0),
    currency: "INR",
    entries: entries
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((p) => ({
        reference: p.reference,
        amount: p.amount,
        paidOn: p.paidOn,
        method: p.method,
        status: p.status,
      })),
  };
}

function deriveStatus(
  bookingNumber: string,
  base: BookingLifecycleStatus,
  payments: BookingPayments,
): { status: BookingLifecycleStatus; note: string; updatedAt: string | null } {
  const override = loadStatusOverride(bookingNumber);
  if (override) return { status: override.status, note: override.note, updatedAt: override.updatedAt };
  if (payments.underVerification > 0)
    return { status: "payment-verification", note: "", updatedAt: null };
  return { status: base, note: "", updatedAt: null };
}

function summariseHotel(record: HotelBookingRecord): BookingSummary {
  const { stay, hotelSnapshot: hotel, roomSnapshot: room, ratePlanSnapshot: plan } = record;
  const payments = paymentsFor(
    record.bookingNumber,
    record.priceSnapshot.total,
    0,
  );
  const base: BookingLifecycleStatus =
    record.status === "confirmed" ? "confirmed" : "awaiting-review";
  const derived = deriveStatus(record.bookingNumber, base, payments);

  return {
    bookingNumber: record.bookingNumber,
    kind: "hotel",
    createdAt: record.createdAt,
    status: derived.status,
    statusNote: derived.note,
    statusUpdatedAt: derived.updatedAt,
    customerName: record.primaryGuest.name,
    phone: record.primaryGuest.phone,
    email: record.primaryGuest.email,
    serviceLabel: "Hotel stay",
    serviceTitle: hotel.name,
    serviceSubtitle: `${hotel.city}, ${hotel.state} · ${hotel.starRating}-star`,
    travelWindow: `${formatStayDay(stay.checkIn)} → ${formatStayDay(stay.checkOut)}`,
    guestsLabel: `${stay.adults} adult${stay.adults === 1 ? "" : "s"}${
      stay.children ? `, ${stay.children} child${stay.children === 1 ? "" : "ren"}` : ""
    }`,
    detailRows: [
      { label: "Room", value: `${room.quantity} × ${room.name} (${room.bedType})` },
      { label: "Meal plan", value: plan.mealPlan },
      { label: "Nights", value: `${stay.nights} night${stay.nights === 1 ? "" : "s"}` },
      { label: "Check-in", value: `${formatStayDay(stay.checkIn)} from ${hotel.checkInTime}` },
      { label: "Check-out", value: `${formatStayDay(stay.checkOut)} by ${hotel.checkOutTime}` },
      { label: "Cancellation", value: plan.refundable ? "Refundable" : "Non-refundable" },
      { label: "Payment mode", value: record.payment.methodLabel },
      { label: "Hotel address", value: hotel.address },
    ],
    invoiceNumber: record.invoiceNumber,
    hasInvoice: true,
    payments,
    productHref: `/hotels/${hotel.city
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}/${hotel.slug}`,
    hotelRecord: record,
    tourRecord: null,
  };
}

function summariseTour(record: PackageBookingRecord): BookingSummary {
  const pkg = record.packageSnapshot;
  const payments = paymentsFor(record.bookingNumber, record.estimatedTotal, 0);
  const derived = deriveStatus(record.bookingNumber, "awaiting-review", payments);
  const travellers = record.travellers;

  return {
    bookingNumber: record.bookingNumber,
    kind: "tour-package",
    createdAt: record.createdAt,
    status: derived.status,
    statusNote: derived.note,
    statusUpdatedAt: derived.updatedAt,
    customerName: record.contact.name,
    phone: record.contact.phone,
    email: record.contact.email,
    serviceLabel: "Tour package",
    serviceTitle: pkg.title,
    serviceSubtitle: `${pkg.nights}N / ${pkg.days}D · from ${pkg.startingCity}`,
    travelWindow: record.departureSnapshot.date
      ? `${formatDay(record.departureSnapshot.date)}${
          record.departureSnapshot.label ? ` · ${record.departureSnapshot.label}` : ""
        }`
      : "Dates to be confirmed",
    guestsLabel: `${travellers.adults} adult${travellers.adults === 1 ? "" : "s"}${
      travellers.children ? `, ${travellers.children} child${travellers.children === 1 ? "" : "ren"}` : ""
    }`,
    detailRows: [
      {
        label: "Stay",
        value: record.hotelSnapshot
          ? `${record.hotelSnapshot.hotel} — ${record.hotelSnapshot.category}`
          : `${pkg.hotelCategory} category`,
      },
      { label: "Rooms", value: `${record.stay.rooms} × ${record.stay.roomType} · ${record.stay.mealPlan}` },
      {
        label: "Vehicle",
        value: record.vehicleSnapshot
          ? `${record.vehicleSnapshot.category} (${record.vehicleSnapshot.seating} seats${
              record.vehicleSnapshot.ac ? ", AC" : ""
            })`
          : pkg.vehicleCategory,
      },
      {
        label: "Pickup",
        value: `${record.transport.pickup}${
          record.transport.pickupTime ? ` at ${record.transport.pickupTime}` : ""
        }`,
      },
      { label: "Drop", value: record.transport.drop || record.transport.pickup },
      {
        label: "Add-ons",
        value: record.addOns.length ? record.addOns.map((a) => a.label).join(", ") : "None",
      },
      { label: "Payment preference", value: record.paymentMode },
      {
        label: "Special requirements",
        value: record.requirements.tags.length ? record.requirements.tags.join(", ") : "None",
      },
    ],
    invoiceNumber: null,
    hasInvoice: false,
    payments,
    productHref: `/tour-packages/${pkg.slug}`,
    hotelRecord: null,
    tourRecord: record,
  };
}

/** Loads the booking snapshot for a booking number, or null when unknown here. */
export function loadBookingSummary(bookingNumber: string): BookingSummary | null {
  const reference = bookingNumber.trim().toUpperCase();
  const kind = bookingKindOf(reference);
  if (kind === "hotel") {
    const record = loadHotelBooking(reference);
    return record ? summariseHotel(record) : null;
  }
  if (kind === "tour-package") {
    const record = loadBookingRecord(reference);
    return record ? summariseTour(record) : null;
  }
  return null;
}

export function summaryNextSteps(summary: BookingSummary) {
  const meta = bookingStatusMeta[summary.status];
  if (summary.status !== "awaiting-review") return meta.nextSteps;
  return summary.kind === "hotel"
    ? hotelBookingNextSteps.slice(0, 3)
    : bookingNextSteps.slice(0, 3);
}

/** WhatsApp text: booking number + concise summary only — no guest PII. */
export function bookingShareMessage(summary: BookingSummary): string {
  return [
    `Booking ${summary.bookingNumber} — ${bookingStatusMeta[summary.status].label}`,
    `${summary.serviceLabel}: ${summary.serviceTitle}`,
    summary.travelWindow,
    `Total ${inr(summary.payments.total)} · pending ${inr(summary.payments.pending)}`,
    "Shared from South Zoom Tourism",
  ].join("\n");
}

export { inr };
