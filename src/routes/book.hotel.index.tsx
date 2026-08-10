import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Toaster } from "@/components/ui/sonner";
import { HotelBookingWizard } from "@/components/hotel-booking/hotel-booking-wizard";
import {
  hotelBookingBanner,
  hotelBookingNextSteps,
  hotelBookingSettings,
  resolveHotelParam,
} from "@/content/hotel-booking";
import { isValidISODate } from "@/content/hotels";
import { company } from "@/content/site";

const CANONICAL = "https://south-zoom-tourism.lovable.app/book/hotel";
const TITLE = "Book a Hotel Stay — Rooms, Rate Plans & Confirmation";
const DESCRIPTION =
  "Book South India hotel stays in seven steps: dates and guests, hotel, room and rate plan, guest details, price summary with taxes, payment preference and instant confirmation with voucher and invoice.";

type HotelBookSearch = {
  hotel?: string;
  room?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
};

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
};
const date = (v: unknown) => {
  const s = str(v);
  return s && isValidISODate(s) ? s : undefined;
};

export const Route = createFileRoute("/book/hotel/")({
  validateSearch: (search: Record<string, unknown>): HotelBookSearch => ({
    hotel: str(search.hotel),
    room: str(search.room),
    destination: str(search.destination),
    checkIn: date(search.checkIn),
    checkOut: date(search.checkOut),
    rooms: num(search.rooms),
    adults: num(search.adults),
    children: num(search.children),
  }),
  component: BookHotelPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The hotel booking form didn't load</h1>
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
      { property: "og:image", content: hotelBookingBanner.image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: hotelBookingBanner.image },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://south-zoom-tourism.lovable.app/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Hotels",
              item: "https://south-zoom-tourism.lovable.app/hotels",
            },
            { "@type": "ListItem", position: 3, name: "Book a hotel", item: CANONICAL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: TITLE,
          description: DESCRIPTION,
          url: CANONICAL,
          serviceType: "Hotel booking",
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

function BookHotelPage() {
  const search = Route.useSearch();
  const hotel = resolveHotelParam(search.hotel);

  const seed = {
    ...(hotel ? { hotelId: hotel.id, destination: search.destination ?? hotel.city } : {}),
    ...(search.destination ? { destination: search.destination } : {}),
    ...(search.room ? { roomId: search.room } : {}),
    ...(search.checkIn ? { checkIn: search.checkIn } : {}),
    ...(search.checkOut ? { checkOut: search.checkOut } : {}),
    ...(search.rooms ? { rooms: search.rooms, quantity: search.rooms } : {}),
    ...(search.adults ? { adults: search.adults } : {}),
    ...(search.children !== undefined ? { children: search.children } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <h1 className="sr-only">Hotel booking — South Zoom Tourism</h1>
        {hotelBookingBanner.visible ? (
          <PageBanner
            title={hotelBookingBanner.title}
            subtitle={hotelBookingBanner.subtitle}
            image={hotelBookingBanner.image}
            imageAlt={hotelBookingBanner.imageAlt}
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Hotels", href: "/hotels" },
              { label: "Book a hotel", href: "/book/hotel" },
            ]}
          />
        ) : null}

        <section className="py-10 sm:py-14" aria-labelledby="hb-heading">
          <div className="mx-auto max-w-7xl px-4">
            <h2 id="hb-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
              Seven steps to a confirmed room
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
              Availability is checked against live date-wise inventory and re-verified the moment you
              confirm. Rooms are held for {hotelBookingSettings.holdHours} hours; nothing is charged
              on this page.
            </p>
            <div className="mt-6">
              <HotelBookingWizard seed={seed} />
            </div>
          </div>
        </section>

        <section className="pb-14 sm:pb-20" aria-labelledby="hb-next-heading">
          <div className="mx-auto max-w-7xl px-4">
            <h2 id="hb-next-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
              What happens after you confirm
            </h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3">
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
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
