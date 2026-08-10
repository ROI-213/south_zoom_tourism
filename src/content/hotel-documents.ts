/**
 * Confirmation voucher and GST invoice, both generated from the single stored
 * price snapshot on the booking record so the two documents can never diverge.
 */

import { company } from "@/content/site";
import {
  formatStayDay,
  hotelBookingSettings,
  inr,
  type HotelBookingRecord,
} from "@/content/hotel-booking";
import type { PdfLine } from "@/lib/simple-pdf";

const rule = (): PdfLine => ({ text: "-".repeat(88), style: "small" });

const money = (label: string, amount: number) =>
  `${label.padEnd(58, ".")} ${inr(amount).padStart(14, " ")}`;

function companyBlock(): PdfLine[] {
  return [
    { text: company.name, style: "heading" },
    { text: company.address, style: "small" },
    { text: `${company.phone} · ${company.email}`, style: "small" },
    { text: `GSTIN ${hotelBookingSettings.gstin}`, style: "small" },
  ];
}

function stayBlock(record: HotelBookingRecord): PdfLine[] {
  const { stay, hotelSnapshot: hotel, roomSnapshot: room, ratePlanSnapshot: plan } = record;
  return [
    { text: "Stay details", style: "heading", gapBefore: 8 },
    { text: `Hotel: ${hotel.name} (${hotel.starRating}-star), ${hotel.city}, ${hotel.state}` },
    { text: `Address: ${hotel.address}` },
    { text: `Check-in: ${formatStayDay(stay.checkIn)} from ${hotel.checkInTime}` },
    { text: `Check-out: ${formatStayDay(stay.checkOut)} by ${hotel.checkOutTime}` },
    { text: `Nights: ${stay.nights} · Rooms: ${room.quantity} × ${room.name} (${room.bedType})` },
    { text: `Rate plan: ${plan.mealPlan} · ${plan.refundable ? "Refundable" : "Non-refundable"}` },
    { text: `Guests: ${stay.adults} adult(s), ${stay.children} child(ren)` },
  ];
}

function priceBlock(record: HotelBookingRecord): PdfLine[] {
  const price = record.priceSnapshot;
  const lines: PdfLine[] = [
    { text: "Price break-up", style: "heading", gapBefore: 8 },
    ...price.nights.map((night) => ({
      text: money(`${formatStayDay(night.date)} — all rooms`, night.rate),
      style: "small" as const,
    })),
    rule(),
    ...price.lines.map((line) => ({ text: money(line.label, line.amount) })),
    rule(),
    { text: money("Total payable", price.total), style: "heading" },
    { text: money("Paid / payable now", price.advanceDue) },
    { text: money("Balance at check-in", price.balanceDue) },
  ];
  return lines;
}

export function buildConfirmationPdfLines(record: HotelBookingRecord): PdfLine[] {
  return [
    { text: "Hotel Booking Confirmation", style: "title" },
    ...companyBlock(),
    rule(),
    { text: `Booking number: ${record.bookingNumber}`, style: "heading" },
    {
      text: `Status: ${record.status === "confirmed" ? "Confirmed — room held on live inventory" : "Pending hotel confirmation — partner approval in progress"}`,
    },
    { text: `Booked on: ${formatStayDay(record.createdAt.slice(0, 10))}` },
    ...stayBlock(record),
    { text: "Guest details", style: "heading", gapBefore: 8 },
    { text: `Primary guest: ${record.primaryGuest.name} (${record.primaryGuest.idType})` },
    {
      text: `Contact: ${record.primaryGuest.phone}${record.primaryGuest.email ? ` · ${record.primaryGuest.email}` : ""}`,
    },
    ...(record.additionalGuests.length
      ? record.additionalGuests.map((g) => ({
          text: `Also travelling: ${g.name}${g.age !== null ? ` (${g.age} yrs)` : ""} — ${g.type}`,
          style: "small" as const,
        }))
      : [{ text: "No additional guests listed.", style: "small" as const }]),
    { text: `Meal preference: ${record.preferences.mealPreference}` },
    { text: `Expected arrival: ${record.preferences.arrivalSlot}` },
    {
      text: `Requests: ${[record.preferences.requestTags.join(", "), record.preferences.notes].filter(Boolean).join(" — ") || "None"}`,
    },
    ...priceBlock(record),
    { text: "Cancellation policy", style: "heading", gapBefore: 8 },
    { text: record.ratePlanSnapshot.cancellationPolicy || "As per hotel policy.", style: "small" },
    {
      text: `Payment method: ${record.payment.methodLabel} (${record.payment.split === "full" ? "full payment" : `${hotelBookingSettings.advancePercent}% advance`})`,
      style: "small",
    },
    {
      text: `Voucher generated from booking ${record.bookingNumber}. Present this at the hotel reception along with the ID used at booking.`,
      style: "small",
      gapBefore: 6,
    },
  ];
}

export function buildInvoicePdfLines(record: HotelBookingRecord): PdfLine[] {
  const price = record.priceSnapshot;
  return [
    { text: "Tax Invoice", style: "title" },
    ...companyBlock(),
    rule(),
    { text: `Invoice number: ${record.invoiceNumber}`, style: "heading" },
    { text: `Against booking: ${record.bookingNumber}` },
    { text: `Invoice date: ${formatStayDay(record.createdAt.slice(0, 10))}` },
    { text: "Billed to", style: "heading", gapBefore: 8 },
    { text: record.primaryGuest.name },
    {
      text: `${record.primaryGuest.phone}${record.primaryGuest.email ? ` · ${record.primaryGuest.email}` : ""}${record.primaryGuest.city ? ` · ${record.primaryGuest.city}` : ""}`,
      style: "small",
    },
    { text: "Description", style: "heading", gapBefore: 8 },
    {
      text: `Accommodation at ${record.hotelSnapshot.name}, ${record.hotelSnapshot.city} — ${record.roomSnapshot.quantity} × ${record.roomSnapshot.name}, ${record.stay.nights} night(s), ${record.ratePlanSnapshot.mealPlan}.`,
    },
    ...priceBlock(record),
    { text: money("Taxable value", price.subtotal), style: "small" },
    { text: money(`GST @ ${price.taxPercent}%`, price.taxAmount), style: "small" },
    {
      text: `Amount in currency: ${price.currency}. This invoice is generated from the stored booking snapshot ${record.bookingNumber}.`,
      style: "small",
      gapBefore: 6,
    },
    {
      text: "Computer-generated document — valid without signature.",
      style: "small",
    },
  ];
}

export const confirmationFileName = (record: HotelBookingRecord) =>
  `${record.bookingNumber}-confirmation.pdf`;

export const invoiceFileName = (record: HotelBookingRecord) => `${record.invoiceNumber}.pdf`;
