import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Toaster } from "@/components/ui/sonner";
import { TourBookingWizard } from "@/components/booking/tour-booking-wizard";
import { bookingBannerBlock, bookingNextSteps, bookingSettings } from "@/content/package-booking";
import { company } from "@/content/site";

const CANONICAL = "https://south-zoom-tourism.lovable.app/book/tour-package";
const TITLE = "Book a Tour Package — Departures, Stay & Vehicle";
const DESCRIPTION =
  "Request a South India tour package booking in six steps: departure and seats, travellers, hotel and meal plan, vehicle, price break-up and submission. No online charge until we confirm.";

type BookSearch = { pkg?: string; departure?: string };

export const Route = createFileRoute("/book/tour-package/")({
  validateSearch: (search: Record<string, unknown>): BookSearch => ({
    pkg: typeof search.pkg === "string" && search.pkg ? search.pkg : undefined,
    departure:
      typeof search.departure === "string" && search.departure ? search.departure : undefined,
  }),
  component: BookTourPackagePage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The booking form didn't load</h1>
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
      { title: `${TITLE} | ${company.name}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://south-zoom-tourism.lovable.app/" },
            {
              "@type": "ListItem",
              position: 2,
              name: "Tour Packages",
              item: "https://south-zoom-tourism.lovable.app/tour-packages",
            },
            { "@type": "ListItem", position: 3, name: "Book", item: CANONICAL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ReservationPackage",
          name: TITLE,
          description: DESCRIPTION,
          url: CANONICAL,
          provider: {
            "@type": "TravelAgency",
            name: company.name,
            telephone: company.phoneRaw,
            email: company.email,
          },
        }),
      },
    ],
  }),
});

function BookTourPackagePage() {
  const { pkg, departure } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <h1 className="sr-only">Tour package booking request — South Zoom Tourism</h1>
        {bookingBannerBlock.visible ? (
          <PageBanner
            title={bookingBannerBlock.title}
            subtitle={bookingBannerBlock.subtitle}
            image={bookingBannerBlock.image}
            imageAlt={bookingBannerBlock.imageAlt}
            breadcrumbs={bookingBannerBlock.breadcrumbs}
          />
        ) : null}

        <section className="py-10 sm:py-14" aria-labelledby="booking-heading">
          <div className="mx-auto max-w-7xl px-4">
            <h2 id="booking-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
              Six steps to a confirmed quote
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
              Seats are checked live against the departure you choose. Bookings close{" "}
              {bookingSettings.bookingLeadDays} days before a fixed departure, and sold-out dates
              cannot be selected.
            </p>
            <div className="mt-6">
              <TourBookingWizard initialPackageSlug={pkg} initialDepartureId={departure} />
            </div>
          </div>
        </section>

        <section className="pb-14 sm:pb-20" aria-labelledby="booking-next-heading">
          <div className="mx-auto max-w-7xl px-4">
            <h2 id="booking-next-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
              What happens after you submit
            </h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3">
              {bookingNextSteps.map((s, i) => (
                <li key={s.id} className="min-w-0 rounded-xl border border-border bg-card p-5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
