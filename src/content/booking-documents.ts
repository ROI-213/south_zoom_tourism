/**
 * Confirmation + invoice PDFs for the unified booking confirmation page.
 * Hotel bookings reuse the voucher/invoice built from their price snapshot;
 * tour bookings get a request confirmation from their estimate snapshot.
 */

import { company } from "@/content/site";
import type { PdfLine } from "@/lib/simple-pdf";
import {
  bookingStatusMeta,
  inr,
  type BookingSummary,
} from "@/content/booking-summary";
import {
  buildConfirmationPdfLines,
  buildInvoicePdfLines,
  invoiceFileName,
} from "@/content/hotel-documents";

const rule = (): PdfLine => ({ text: "-".repeat(88), style: "small" });

const money = (label: string, amount: number) =>
  `${label.padEnd(58, ".")} ${inr(amount).padStart(14, " ")}`;

function genericConfirmationLines(summary: BookingSummary): PdfLine[] {
  const meta = bookingStatusMeta[summary.status];
  return [
    { text: company.name, style: "heading" },
    { text: company.address, style: "small" },
    { text: `${company.phone} · ${company.email}`, style: "small" },
    { text: "Booking confirmation", style: "title", gapBefore: 10 },
    { text: `Booking number: ${summary.bookingNumber}` },
    { text: `Status: ${meta.label}` },
    { text: `Issued: ${new Date().toLocaleString("en-IN")}`, style: "small" },
    rule(),
    { text: "Customer", style: "heading", gapBefore: 6 },
    { text: `Name: ${summary.customerName}` },
    { text: `Phone: ${summary.phone}` },
    summary.email ? { text: `Email: ${summary.email}` } : null,
    { text: summary.serviceLabel, style: "heading", gapBefore: 8 },
    { text: summary.serviceTitle },
    { text: summary.serviceSubtitle, style: "small" },
    { text: `Travel dates: ${summary.travelWindow}` },
    { text: `Guests: ${summary.guestsLabel}` },
    ...summary.detailRows.map((row) => ({ text: `${row.label}: ${row.value}` })),
    { text: "Payment", style: "heading", gapBefore: 8 },
    { text: money("Booking value", summary.payments.total) },
    { text: money("Amount paid", summary.payments.paid) },
    summary.payments.underVerification > 0
      ? { text: money("Under verification", summary.payments.underVerification) }
      : null,
    { text: money("Pending amount", summary.payments.pending), style: "heading" },
    { text: "Next steps", style: "heading", gapBefore: 8 },
    ...meta.nextSteps.map((step) => ({ text: `- ${step.title}: ${step.description}`, style: "small" as const })),
    { text: `Support: ${company.phone} · ${company.email}`, style: "small", gapBefore: 8 },
  ].filter(Boolean) as PdfLine[];
}

export function buildBookingConfirmationLines(summary: BookingSummary): PdfLine[] {
  if (summary.hotelRecord) return buildConfirmationPdfLines(summary.hotelRecord);
  return genericConfirmationLines(summary);
}

export function buildBookingInvoiceLines(summary: BookingSummary): PdfLine[] | null {
  if (summary.hotelRecord) return buildInvoicePdfLines(summary.hotelRecord);
  return null;
}

export const bookingConfirmationFileName = (summary: BookingSummary) =>
  `${summary.bookingNumber}-confirmation.pdf`;

export const bookingInvoiceFileName = (summary: BookingSummary) =>
  summary.hotelRecord ? invoiceFileName(summary.hotelRecord) : `${summary.bookingNumber}-invoice.pdf`;
