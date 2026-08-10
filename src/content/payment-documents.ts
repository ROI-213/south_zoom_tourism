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

export function buildAcknowledgementLines(record: PaymentSubmissionRecord): PdfLine[] {
  const status = paymentStatusMeta[record.status].label;

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
    { text: row("Amount declared", inr(record.amount)) },
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
    { text: "Important", style: "heading", gapBefore: 6 },
    {
      text: `This is an acknowledgement of your payment claim, not a receipt. The booking is not marked as paid until our accounts team verifies the transaction with the bank (usually within ${paymentSettings.verificationSlaHours} working hours, ${paymentSettings.deskHours}).`,
      style: "small",
    },
    ...(record.rejectionReason
      ? [{ text: `Rejection reason: ${record.rejectionReason}`, style: "small" as const }]
      : []),
    {
      text: `Questions? Call ${company.phone} quoting ${record.reference}.`,
      style: "small",
    },
  ];
}

export const acknowledgementFileName = (record: PaymentSubmissionRecord) =>
  `${record.reference}-payment-acknowledgement.pdf`;
