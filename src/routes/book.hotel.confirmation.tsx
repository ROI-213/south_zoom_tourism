import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MessageCircle,
  Phone,
  Printer,
} from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLink } from "@/components/common/app-link";
import {
  formatStayDay,
  hotelBookingNextSteps,
  hotelBookingWhatsApp,
  inr,
  loadHotelBooking,
  type HotelBookingRecord,
} from "@/content/hotel-booking";
import {
  buildConfirmationPdfLines,
  buildInvoicePdfLines,
  confirmationFileName,
  invoiceFileName,
} from "@/content/hotel-documents";
import { deriveAccessToken } from "@/content/booking-access";
import { downloadPdf } from "@/lib/simple-pdf";
import { company, telLink, waLink } from "@/content/site";

const CANONICAL = "https://south-zoom-tourism.lovable.app/book/hotel/confirmation";
const TITLE = "Hotel Booking Confirmation — South Zoom Tourism";
const DESCRIPTION =
  "Your hotel booking details: booking number, hotel and room snapshot, guest details, nightly price break-up, downloadable confirmation voucher and GST invoice.";

type ConfirmSearch = { ref?: string };

export const Route = createFileRoute("/book/hotel/confirmation")({
  validateSearch: (search: Record<string, unknown>): ConfirmSearch => ({
    ref: typeof search.ref === "string" && search.ref ? search.ref : undefined,
  }),
  component: HotelConfirmationPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">We couldn't show this confirmation</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
    </div>
  ),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
});

function HotelConfirmationPage() {
  const { ref } = Route.useSearch();
  const [record, setRecord] = useState<HotelBookingRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRecord(ref ? loadHotelBooking(ref) : null);
    setLoading(false);
  }, [ref]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Hotels", href: "/hotels" },
              { label: "Booking confirmation", href: "/book/hotel/confirmation" },
            ]}
          />

          {loading ? (
            <div className="mt-8 space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !record ? (
            <EmptyState />
          ) : (
            <BookingDetails record={record} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <section className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight">No booking to show</h1>
      <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-muted-foreground">
        This confirmation link has no booking reference, or the booking was created on another device
        or browser. Start a fresh booking, or call us with your booking number and we'll resend the
        voucher.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild>
          <AppLink href="/book/hotel">Start a hotel booking</AppLink>
        </Button>
        <Button asChild variant="outline">
          <a href={telLink()}>
            <Phone aria-hidden="true" /> Call {company.phone}
          </a>
        </Button>
      </div>
    </section>
  );
}

function BookingDetails({ record }: { record: HotelBookingRecord }) {
  const pending = record.status === "pending-hotel-confirmation";
  const price = record.priceSnapshot;

  return (
    <>
      <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
          {pending ? (
            <Clock className="mt-1 h-7 w-7 shrink-0 text-amber-600" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {pending ? "Booking request received" : "Your stay is booked"}
            </h1>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              {pending
                ? "This property confirms manually. Our team is checking with the hotel and will confirm shortly — usually within a few hours."
                : "Rooms are held on live inventory. Your voucher and GST invoice are ready to download below."}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <KeyValue label="Booking number">
            <span className="font-mono text-sm font-bold">{record.bookingNumber}</span>
          </KeyValue>
          <KeyValue label="Invoice number">
            <span className="font-mono text-sm">{record.invoiceNumber}</span>
          </KeyValue>
          <KeyValue label="Status">
            <Badge variant={pending ? "outline" : "secondary"}>
              {pending ? "Pending hotel confirmation" : "Confirmed"}
            </Badge>
          </KeyValue>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() =>
              downloadPdf(
                buildConfirmationPdfLines(record),
                confirmationFileName(record),
                `Hotel confirmation ${record.bookingNumber}`,
              )
            }
          >
            <Download aria-hidden="true" /> Confirmation PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              downloadPdf(
                buildInvoicePdfLines(record),
                invoiceFileName(record),
                `Invoice ${record.invoiceNumber}`,
              )
            }
          >
            <FileText aria-hidden="true" /> Download invoice
          </Button>
          <Button type="button" variant="ghost" asChild>
            <AppLink href={`/booking-confirmation/${record.bookingNumber}?t=${deriveAccessToken(record.bookingNumber, record.primaryGuest.phone)}`}>
              Secure booking page
            </AppLink>
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" /> Print
          </Button>
          <Button asChild variant="outline">
            <a
              href={waLink(hotelBookingWhatsApp(record))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" /> Send on WhatsApp
            </a>
          </Button>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2" aria-label="Booking details">
        <div className="min-w-0 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Hotel & stay
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Hotel">
              {record.hotelSnapshot.name} · {record.hotelSnapshot.starRating}-star
            </Row>
            <Row label="Address">{record.hotelSnapshot.address}</Row>
            <Row label="Check-in">
              {formatStayDay(record.stay.checkIn)} from {record.hotelSnapshot.checkInTime}
            </Row>
            <Row label="Check-out">
              {formatStayDay(record.stay.checkOut)} by {record.hotelSnapshot.checkOutTime}
            </Row>
            <Row label="Nights">{record.stay.nights}</Row>
            <Row label="Room">
              {record.roomSnapshot.quantity} × {record.roomSnapshot.name} ·{" "}
              {record.roomSnapshot.bedType}
            </Row>
            <Row label="Rate plan">
              {record.ratePlanSnapshot.mealPlan} ·{" "}
              {record.ratePlanSnapshot.refundable ? "free cancellation" : "non-refundable"}
            </Row>
            <Row label="Cancellation">{record.ratePlanSnapshot.cancellationPolicy}</Row>
          </dl>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Guests & preferences
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Primary guest">{record.primaryGuest.name}</Row>
            <Row label="Mobile">{record.primaryGuest.phone}</Row>
            {record.primaryGuest.email ? <Row label="Email">{record.primaryGuest.email}</Row> : null}
            <Row label="ID at check-in">{record.primaryGuest.idType}</Row>
            <Row label="Occupancy">
              {record.stay.adults} adult{record.stay.adults === 1 ? "" : "s"}
              {record.stay.children
                ? `, ${record.stay.children} child${record.stay.children === 1 ? "" : "ren"}`
                : ""}
            </Row>
            {record.additionalGuests.length ? (
              <Row label="Other guests">
                {record.additionalGuests
                  .map((g) => `${g.name}${g.age !== null ? ` (${g.age})` : ""}`)
                  .join(", ")}
              </Row>
            ) : null}
            <Row label="Meal preference">{record.preferences.mealPreference}</Row>
            <Row label="Arrival">{record.preferences.arrivalSlot || "Not specified"}</Row>
            {record.preferences.requestTags.length ? (
              <Row label="Requests">{record.preferences.requestTags.join(", ")}</Row>
            ) : null}
            {record.preferences.notes ? <Row label="Notes">{record.preferences.notes}</Row> : null}
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5" aria-label="Price break-up">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Price break-up
        </h2>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-80 text-sm">
            <caption className="sr-only">Nightly rates for the booked rooms</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="py-2 font-semibold">
                  Night
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {price.nights.map((night) => (
                <tr key={night.date} className="border-b border-border/60">
                  <td className="py-1.5 text-muted-foreground">{formatStayDay(night.date)}</td>
                  <td className="py-1.5 text-right tabular-nums">{inr(night.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-2 border-t border-border pt-3">
          {price.lines.map((line) => (
            <div key={line.label} className="flex items-start justify-between gap-3">
              <dt className="min-w-0 text-sm">
                {line.label}
                {line.note ? (
                  <span className="block text-xs text-muted-foreground">{line.note}</span>
                ) : null}
              </dt>
              <dd className="shrink-0 text-sm font-semibold tabular-nums">{inr(line.amount)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="text-sm font-bold">Total</span>
          <span className="text-lg font-extrabold tabular-nums text-primary">{inr(price.total)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {record.payment.methodLabel} ·{" "}
            {record.payment.split === "full" ? "full payment" : "advance"}
          </span>
          <span className="text-xs font-semibold tabular-nums">{inr(price.advanceDue)}</span>
        </div>
        {price.balanceDue > 0 ? (
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Balance at check-in</span>
            <span className="text-xs font-semibold tabular-nums">{inr(price.balanceDue)}</span>
          </div>
        ) : null}
      </section>

      <section className="mt-6" aria-labelledby="hbc-next">
        <h2 id="hbc-next" className="text-lg font-bold tracking-tight">
          What happens next
        </h2>
        <ol className="mt-3 grid gap-4 sm:grid-cols-3">
          {hotelBookingNextSteps.map((s, i) => (
            <li key={s.id} className="min-w-0 rounded-xl border border-border bg-card p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold tracking-tight">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-muted/30 p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground sm:w-36">
        {label}
      </dt>
      <dd className="min-w-0 break-words sm:text-right">{children}</dd>
    </div>
  );
}
