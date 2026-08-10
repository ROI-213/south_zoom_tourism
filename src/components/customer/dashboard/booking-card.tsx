import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Car,
  ChevronDown,
  Download,
  FileText,
  Hotel,
  IndianRupee,
  LifeBuoy,
  Map,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { inr } from "@/content/payment";
import { deriveAccessToken } from "@/content/booking-access";
import {
  buildBookingConfirmationLines,
  buildBookingInvoiceLines,
  bookingConfirmationFileName,
  bookingInvoiceFileName,
} from "@/content/booking-documents";
import { downloadPdf } from "@/lib/simple-pdf";
import { bookingKindMeta, formatDate, type CustomerBooking } from "@/content/customer-data";
import { BookingStatusBadge } from "./status-badge";

const kindIcon = { vehicle: Car, "tour-package": Map, hotel: Hotel } as const;

export function BookingCard({
  booking,
  onCancel,
  onSupport,
  compact = false,
}: {
  booking: CustomerBooking;
  onCancel?: (booking: CustomerBooking) => void;
  onSupport?: (booking: CustomerBooking) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = kindIcon[booking.kind];
  const summary = booking.summary;
  // Authorization-checked document link: the token is derived from the booking
  // number + the verified contact number, exactly like a signed URL.
  const token = deriveAccessToken(booking.reference, booking.ownerPhone);

  return (
    <article className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {bookingKindMeta[booking.kind].label} · {booking.reference}
            </p>
            <h3 className="mt-0.5 truncate text-base font-bold tracking-tight">
              {booking.snapshot.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{booking.snapshot.subtitle}</p>
          </div>
        </div>
        <BookingStatusBadge status={booking.statusLabel} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Travel dates</dt>
          <dd className="mt-0.5 font-semibold">{booking.snapshot.travelWindow}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Guests</dt>
          <dd className="mt-0.5 font-semibold">{booking.snapshot.guestsLabel}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Booked on</dt>
          <dd className="mt-0.5 font-semibold">{formatDate(booking.createdAt)}</dd>
        </div>
      </dl>

      {booking.snapshot.total > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-sm">
          <span>
            <span className="text-xs text-muted-foreground">Value </span>
            <span className="font-bold">{inr(booking.snapshot.total)}</span>
          </span>
          <span>
            <span className="text-xs text-muted-foreground">Paid </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{inr(booking.paid)}</span>
          </span>
          {booking.underVerification > 0 ? (
            <span>
              <span className="text-xs text-muted-foreground">Verifying </span>
              <span className="font-bold">{inr(booking.underVerification)}</span>
            </span>
          ) : null}
          <span>
            <span className="text-xs text-muted-foreground">Pending </span>
            <span className="font-bold">{inr(booking.pending)}</span>
          </span>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-secondary/60 px-3 py-2.5 text-xs text-muted-foreground">
          Pricing is confirmed by our team before any payment is requested.
        </p>
      )}

      {!compact && (
        <>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {open ? "Hide service details" : "View service details"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {open ? (
            <div className="mt-3 rounded-xl border border-border p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Confirmed snapshot — read only
              </p>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                {booking.snapshot.detailRows.map((row) => (
                  <div key={row.label} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="break-words text-sm font-medium">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {summary ? (
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link
              to="/booking-confirmation/$bookingNumber"
              params={{ bookingNumber: booking.reference }}
              search={{ t: token }}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Booking page
            </Link>
          </Button>
        ) : null}

        {booking.pending > 0 ? (
          <Button asChild size="sm" className="gap-1.5">
            <Link
              to="/qr-payment"
              search={{
                booking: booking.reference,
                amount: String(booking.pending),
                name: booking.ownerName,
                phone: booking.ownerPhone,
              }}
            >
              <IndianRupee className="h-4 w-4" aria-hidden="true" />
              Pay {inr(booking.pending)}
            </Link>
          </Button>
        ) : null}

        {summary ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              downloadPdf(
                buildBookingConfirmationLines(summary),
                bookingConfirmationFileName(summary),
                `${summary.bookingNumber} confirmation`,
              )
            }
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Confirmation
          </Button>
        ) : null}

        {summary && buildBookingInvoiceLines(summary) ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              const lines = buildBookingInvoiceLines(summary);
              if (lines) downloadPdf(lines, bookingInvoiceFileName(summary), `${summary.bookingNumber} invoice`);
            }}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Invoice
          </Button>
        ) : null}

        {onCancel ? (
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => onCancel(booking)}>
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Request cancellation
          </Button>
        ) : null}

        {onSupport ? (
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => onSupport(booking)}>
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />
            Get support
          </Button>
        ) : null}

        {booking.snapshot.productHref ? (
          <Button asChild size="sm" variant="ghost">
            <AppLink href={booking.snapshot.productHref}>View service</AppLink>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
