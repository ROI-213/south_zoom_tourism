import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Phone, Printer } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deriveAccessToken } from "@/content/booking-access";
import { AppLink } from "@/components/common/app-link";
import { PriceBreakdown } from "@/components/booking/price-breakdown";
import { formatRupees } from "@/content/package-details";
import {
  bookingNextSteps,
  bookingSettings,
  buildWhatsAppSummary,
  formatDay,
  loadBookingRecord,
  type PackageBookingRecord,
} from "@/content/package-booking";
import { company, telLink, waLink } from "@/content/site";

const CANONICAL = "https://south-zoom-tourism.lovable.app/book/tour-package/confirmation";
const TITLE = "Booking Request Received — South Zoom Tourism";
const DESCRIPTION =
  "Your tour package booking request has been received. Here is your booking number, selected departure, stay, vehicle and estimated price break-up.";

type ConfirmSearch = { ref?: string };

export const Route = createFileRoute("/book/tour-package/confirmation")({
  validateSearch: (search: Record<string, unknown>): ConfirmSearch => ({
    ref: typeof search.ref === "string" && search.ref ? search.ref : undefined,
  }),
  component: ConfirmationPage,
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

function ConfirmationPage() {
  const { ref } = Route.useSearch();
  const [record, setRecord] = useState<PackageBookingRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRecord(ref ? loadBookingRecord(ref) : null);
    setLoading(false);
  }, [ref]);

  const estimate = record
    ? {
        available: record.estimatedTotal > 0,
        lines: record.priceBreakdown,
        total: record.estimatedTotal,
        manualChildren: record.manualChildren,
        advance: record.advanceDue,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-4xl px-4">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Tour Packages", href: "/tour-packages" },
                { label: "Booking confirmation", href: "/book/tour-package/confirmation" },
              ]}
            />

            <div className="mt-4 flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Booking request received
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We have your request. Our team confirms seats and the final amount, then holds
                  them for {bookingSettings.holdHours} hours.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="mt-8 space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ) : !ref ? (
              <EmptyState
                title="No booking reference in this link"
                body="Start a booking request and we'll show your reference here as soon as it's submitted."
              />
            ) : !record ? (
              <EmptyState
                title={`We can't find the details for ${ref} in this browser`}
                body="Your request was still sent to our team. Quote this reference when you call or message us and we'll pull it up."
                reference={ref}
              />
            ) : (
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Booking number
                  </p>
                  <p className="mt-1 font-mono text-lg font-extrabold tracking-tight text-primary">
                    {record.bookingNumber}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Requested on {formatDay(record.createdAt.slice(0, 10))} · status:{" "}
                    {record.status}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild>
                      <a
                        href={waLink(buildWhatsAppSummary(record))}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <MessageCircle aria-hidden="true" /> Send on WhatsApp
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href={telLink()}>
                        <Phone aria-hidden="true" /> Call {company.phone}
                      </a>
                    </Button>
                    <Button type="button" variant="ghost" asChild>
            <AppLink href={`/booking-confirmation/${record.bookingNumber}?t=${deriveAccessToken(record.bookingNumber, record.contact.phone)}`}>
              Secure booking page
            </AppLink>
          </Button>
          <Button type="button" variant="ghost" onClick={() => window.print()}>
                      <Printer aria-hidden="true" /> Print
                    </Button>
                  </div>
                </div>

                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-base font-bold tracking-tight">Your selection</h2>
                  <dl className="mt-3 divide-y divide-border text-sm">
                    <Row label="Package">
                      {record.packageSnapshot.title} · {record.packageSnapshot.nights}N/
                      {record.packageSnapshot.days}D
                    </Row>
                    <Row label="Departure">
                      {record.departureSnapshot.label}
                      {record.departureSnapshot.date
                        ? ` · ${formatDay(record.departureSnapshot.date)}`
                        : ""}
                    </Row>
                    <Row label="Travellers">
                      {record.travellers.adults} adult
                      {record.travellers.adults === 1 ? "" : "s"}
                      {record.travellers.children
                        ? `, ${record.travellers.children} child${record.travellers.children === 1 ? "" : "ren"}`
                        : ""}
                    </Row>
                    <Row label="Stay">
                      {record.hotelSnapshot
                        ? `${record.hotelSnapshot.hotel} · ${record.hotelSnapshot.category} · ${record.stay.rooms} × ${record.stay.roomType} · ${record.stay.mealPlan}`
                        : "Not included in this package"}
                    </Row>
                    <Row label="Vehicle">
                      {record.vehicleSnapshot
                        ? `${record.vehicleSnapshot.category} · ${record.vehicleSnapshot.seating} seats · ${record.vehicleSnapshot.ac ? "AC" : "Non AC"}`
                        : "Not included in this package"}
                    </Row>
                    <Row label="Pickup">
                      {record.transport.pickup}
                      {record.transport.pickupTime ? ` at ${record.transport.pickupTime}` : ""}
                      {record.transport.drop ? ` · drop ${record.transport.drop}` : ""}
                    </Row>
                    <Row label="Add-ons">
                      {record.addOns.length
                        ? record.addOns.map((a) => a.label).join(", ")
                        : "None selected"}
                    </Row>
                    <Row label="Requirements">
                      {[record.requirements.tags.join(", "), record.requirements.notes]
                        .filter(Boolean)
                        .join(" — ") || "None"}
                    </Row>
                    <Row label="Payment preference">{record.paymentMode}</Row>
                  </dl>
                </section>

                {estimate ? (
                  <section>
                    <h2 className="text-base font-bold tracking-tight">Estimated price</h2>
                    <div className="mt-2">
                      <PriceBreakdown estimate={estimate} />
                    </div>
                    {record.advanceDue > 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Advance payable on confirmation: {formatRupees(record.advanceDue)}.
                      </p>
                    ) : null}
                  </section>
                ) : null}

                <section>
                  <h2 className="text-base font-bold tracking-tight">Next steps</h2>
                  <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                    {bookingNextSteps.map((s, i) => (
                      <li key={s.id} className="min-w-0 rounded-xl border border-border bg-card p-4">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <h3 className="mt-2 text-sm font-bold">{s.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                      </li>
                    ))}
                  </ol>
                </section>

                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <AppLink href="/tour-packages">Browse more packages</AppLink>
                  </Button>
                  <Button asChild variant="ghost">
                    <AppLink href="/contact-us">Contact our team</AppLink>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:w-40 sm:shrink-0">
        {label}
      </dt>
      <dd className="min-w-0 text-sm sm:text-right">{children}</dd>
    </div>
  );
}

function EmptyState({
  title,
  body,
  reference,
}: {
  title: string;
  body: string;
  reference?: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {reference ? (
        <p className="mt-3 font-mono text-sm font-bold text-primary">{reference}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <AppLink href="/book/tour-package">Start a booking request</AppLink>
        </Button>
        <Button asChild variant="outline">
          <a href={telLink()}>Call {company.phone}</a>
        </Button>
      </div>
    </div>
  );
}
