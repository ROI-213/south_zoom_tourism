/**
 * Downloadable payment acknowledgement, generated from the stored submission
 * snapshot so the customer copy and the admin record can never diverge.
 */

import { company } from "@/content/site";
import {
  formatPaidOn,
  inr,
  paymentSettings,
  paymentStatusMeta,
  type PaymentSubmissionRecord,
} from "@/content/payment";
import type { PdfLine } from "@/lib/simple-pdf";

const rule = (): PdfLine => ({ text: "-".repeat(88), style: "small" });

const row = (label: string, value: string) => `${label.padEnd(28, ".")} ${value}`;

/**
 * Resolves the Total Quoted Fare, Advance Paid, and Pending Balance for any booking.
 */
export function resolveBookingBalance(record: PaymentSubmissionRecord): {
  totalFare: number | null;
  advancePaid: number;
  pendingBalance: number | null;
} {
  const advancePaid = record.amount;
  let totalFare: number | null = record.totalAmount ?? null;
  let pendingBalance: number | null = record.pendingBalance ?? null;

  if (totalFare != null && pendingBalance != null) {
    return { totalFare, advancePaid, pendingBalance };
  }

  // Look in customer bookings registry
  if (typeof window !== "undefined") {
    try {
      const rawRegistry = window.localStorage.getItem("szt:customer:bookings");
      if (rawRegistry) {
        const entries = JSON.parse(rawRegistry);
        const entry = entries.find((e: any) => e.reference === record.bookingNumber);
        if (entry) {
          if (entry.snapshot?.total && entry.snapshot.total > 0) {
            totalFare = entry.snapshot.total;
          } else if (entry.snapshot?.detailRows) {
            for (const r of entry.snapshot.detailRows) {
              const textVal = String(r.value || "");
              const textLbl = String(r.label || "");
              if (textLbl.toLowerCase().includes("total") || textVal.includes("Total Quoted Fare") || textVal.includes("Estimated Fare")) {
                const m = textVal.match(/₹\s*([\d,]+)/);
                if (m) totalFare = Number(m[1].replace(/,/g, ""));
              }
              if (textLbl.toLowerCase().includes("balance") || textVal.includes("Balance to driver")) {
                const m = textVal.match(/₹\s*([\d,]+)/);
                if (m) pendingBalance = Number(m[1].replace(/,/g, ""));
              }
            }
          }
        }
      }
    } catch {}

    // Check hotel booking records
    if (totalFare == null) {
      try {
        const hotelRaw = window.localStorage.getItem(`szt:hotel-booking:${record.bookingNumber}`);
        if (hotelRaw) {
          const h = JSON.parse(hotelRaw);
          if (h.pricing?.grandTotal) {
            totalFare = h.pricing.grandTotal;
          }
        }
      } catch {}
    }

    // Check tour booking records
    if (totalFare == null) {
      try {
        const tourRaw = window.sessionStorage.getItem(`szt:booking:${record.bookingNumber}`);
        if (tourRaw) {
          const t = JSON.parse(tourRaw);
          if (t.quote?.total) {
            totalFare = t.quote.total;
          }
        }
      } catch {}
    }

    // Check recent fare calculation logs
    if (totalFare == null) {
      try {
        const logsRaw = window.localStorage.getItem("szt_fare_calc_logs");
        if (logsRaw) {
          const logs = JSON.parse(logsRaw);
          const matched = logs.find((l: any) => l.advanceAmount === advancePaid);
          if (matched) {
            totalFare = matched.totalEstimatedFare;
            pendingBalance = matched.balanceToDriver;
          }
        }
      } catch {}
    }
  }

  // If total is known, calculate pending balance
  if (totalFare != null && pendingBalance == null) {
    pendingBalance = Math.max(0, totalFare - advancePaid);
  } else if (totalFare == null && advancePaid > 0) {
    // Standard 15% advance formula for cab bookings
    totalFare = Math.round(advancePaid / 0.15);
    pendingBalance = Math.max(0, totalFare - advancePaid);
  }

  return { totalFare, advancePaid, pendingBalance };
}

export function buildAcknowledgementLines(record: PaymentSubmissionRecord): PdfLine[] {
  const status = paymentStatusMeta[record.status].label;
  const balanceInfo = resolveBookingBalance(record);

  return [
    { text: "Payment Acknowledgement", style: "title" },
    { text: company.name, style: "heading" },
    { text: company.address, style: "small" },
    { text: `${company.phone} · ${company.email}`, style: "small" },
    rule(),
    { text: "Submission", style: "heading", gapBefore: 6 },
    { text: row("Payment reference", record.reference) },
    { text: row("Status", status) },
    { text: row("Submitted on", new Date(record.createdAt).toLocaleString("en-IN")) },
    { text: row("Booking number", record.bookingNumber) },
    { text: row("Payment method", record.method) },
    rule(),
    { text: "Payment details", style: "heading", gapBefore: 6 },
    { text: row("Amount declared (Paid)", inr(record.amount)) },
    ...(balanceInfo.totalFare != null
      ? [{ text: row("Total booking fare", inr(balanceInfo.totalFare)) }]
      : []),
    ...(balanceInfo.pendingBalance != null
      ? [{ text: row("Pending balance amount", `${inr(balanceInfo.pendingBalance)} (Pay during trip)`) }]
      : []),
    { text: row("Paid on", formatPaidOn(record.paidOn)) },
    { text: row("Transaction / UTR ID", record.transactionId) },
    {
      text: row(
        "Proof attached",
        record.screenshot ? `${record.screenshot.fileName} (stored privately)` : "Not attached",
      ),
    },
    ...(record.remarks ? [{ text: row("Remarks", record.remarks) }] : []),
    rule(),
    { text: "Payer", style: "heading", gapBefore: 6 },
    { text: row("Name", record.customerName) },
    { text: row("Phone", record.phone) },
    rule(),
    { text: "Important Notice", style: "heading", gapBefore: 6 },
    {
      text: `This is an acknowledgement of your payment claim, not a receipt. The booking is not marked as paid until our accounts team verifies the transaction with the bank (usually within ${paymentSettings.verificationSlaHours} working hours, ${paymentSettings.deskHours}).`,
      style: "small",
    },
    ...(balanceInfo.pendingBalance != null && balanceInfo.pendingBalance > 0
      ? [
          {
            text: `Note: The pending balance of ${inr(balanceInfo.pendingBalance)} must be paid directly to the driver / hotel during your trip.`,
            style: "small" as const,
          },
        ]
      : []),
    ...(record.rejectionReason
      ? [{ text: `Rejection reason: ${record.rejectionReason}`, style: "small" as const }]
      : []),
    {
      text: `Questions? Call ${company.phone} quoting ${record.reference}.`,
      style: "small",
    },
    rule(),
    { text: "Terms & Conditions", style: "heading", gapBefore: 6 },
    {
      text: "1. Advance & Balance Settlement: A 15% advance payment confirms your reservation. The remaining pending balance must be paid directly to the assigned driver or hotel during the trip.",
      style: "small",
    },
    {
      text: "2. Tolls, Permits & Parking: Toll gates, inter-state entry permits, and parking fees are charged as per actual receipts unless explicitly included in the package estimate.",
      style: "small",
    },
    {
      text: "3. Kilometres & Time Usage: Fares are calculated garage-to-garage. Any extra kilometres or hours beyond the booked package will be charged at standard vehicle extra rates.",
      style: "small",
    },
    {
      text: "4. Driver Allocation & Details: Vehicle registration and driver contact details are dispatched via WhatsApp/SMS at least 2 hours prior to pickup.",
      style: "small",
    },
    {
      text: "5. Cancellation & Rescheduling: Free cancellation or date changes are permitted up to 24 hours before pickup. Cancellations within 24 hours of departure are non-refundable.",
      style: "small",
    },
    {
      text: "6. Luggage & Pet Guidelines: Luggage carrier (Rs. 250) and pet travel permissions (Rs. 900) must be pre-arranged as per vehicle carrying capacity.",
      style: "small",
    },
    {
      text: "7. Air Conditioning Policy: AC remains active throughout the trip, except on steep ghat climbs or when the vehicle is stationary, to ensure engine safety.",
      style: "small",
    },
  ];
}

export const standardPaymentTerms = [
  "Advance & Balance: A 15% advance payment confirms your reservation. The remaining pending balance must be paid directly to the assigned driver or hotel during the trip.",
  "Tolls, Permits & Parking: Toll gates, inter-state entry permits, and parking fees are charged as per actual receipts unless explicitly included in the package estimate.",
  "Kilometres & Time Usage: Fares are calculated garage-to-garage. Any extra kilometres or hours beyond the booked package will be charged at standard vehicle extra rates.",
  "Driver Allocation & Details: Vehicle registration and driver contact details are dispatched via WhatsApp/SMS at least 2 hours prior to pickup.",
  "Cancellation & Rescheduling: Free cancellation or date changes are permitted up to 24 hours before pickup. Cancellations within 24 hours of departure are non-refundable.",
  "Luggage & Pet Guidelines: Luggage carrier (₹250) and pet travel permissions (₹900) must be pre-arranged as per vehicle carrying capacity.",
  "Air Conditioning Policy: AC remains active throughout the trip, except on steep ghat climbs or when the vehicle is stationary, to ensure engine safety.",
];

export const acknowledgementFileName = (record: PaymentSubmissionRecord) =>
  `${record.reference}-payment-acknowledgement.pdf`;

