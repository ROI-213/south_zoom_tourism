import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppLink } from "@/components/common/app-link";
import { HotelSearchForm } from "@/components/hotels/hotel-search-form";
import { HotelCard } from "@/components/hotels/hotel-card";
import { RoomCard } from "@/components/hotels/room-card";
import { HotelResults } from "@/components/hotels/hotel-results";
import {
  HotelProcessSection,
  HotelTrustSection,
} from "@/components/hotels/hotel-trust-process";
import { company, telLink, waLink } from "@/content/site";
import {
  addDaysISO,
  getFeaturedHotels,
  getFeaturedRooms,
  getHotelPriceFrom,
  getHotelRooms,
  getVisibleCategories,
  getVisibleFaqs,
  getVisibleProcessSteps,
  getVisibleTrustPoints,
  hotelsBannerBlock,
  hotelsProcessBlock,
  hotelsSearchDefaults,
  hotelsSupportBlock,
  hotelsTrustBlock,
  isValidISODate,
  searchHotels,
  todayISO,
  mapDbHotelToHotelRecord,
  mapDbRoomToRoomRecord,
  setDynamicHotelsAndRooms,
  type HotelSearchParams,
} from "@/content/hotels";
import { fetchLiveHotels } from "@/lib/hotel-service";

type HotelsSearch = {
  destination?: string;
  hotelName?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  roomType?: string;
  category?: string;
  searched?: number;
};

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : undefined);
const date = (v: unknown) => (typeof v === "string" && isValidISODate(v) ? v : undefined);
const int = (v: unknown, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), max) : undefined;
};

export const Route = createFileRoute("/hotels/")({
  validateSearch: (search: Record<string, unknown>): HotelsSearch => ({
    destination: str(search.destination) ?? str(search.city),
    hotelName: str(search.hotelName),
    checkIn: date(search.checkIn),
    checkOut: date(search.checkOut),
    rooms: int(search.rooms, hotelsSearchDefaults.maxRooms),
    adults: int(search.adults, hotelsSearchDefaults.maxAdults),
    children: int(search.children, hotelsSearchDefaults.maxChildren),
    roomType: str(search.roomType),
    category: str(search.category),
    searched: int(search.searched, 1),
  }),
  component: HotelsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The hotels page didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <AppLink href="/" className="mt-6 inline-block text-sm font-semibold text-primary underline">
        Back to home
      </AppLink>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <AppLink href="/hotels" className="mt-6 inline-block text-sm font-semibold text-primary underline">
        Search hotels
      </AppLink>
    </div>
  ),
  head: () => {
    const title = "Hotels & Rooms in South India — South Zoom Tourism";
    const description =
      "Search verified hotels, resorts, homestays, service apartments and group stays across Tamil Nadu, Kerala, Karnataka and Goa with live, date-wise room availability.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "/hotels" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: "/hotels" }],
    };
  },
});

function HotelsPage() {
  const search = Route.useSearch();
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    async function loadDynamicHotels() {
      try {
        const live = await fetchLiveHotels();
        if (live && live.length > 0) {
          const mappedHotels = live.map((h, i) => mapDbHotelToHotelRecord(h, i));
          const mappedRooms = live.flatMap((h) =>
            (h.hotel_rooms || []).map((r, ri) => mapDbRoomToRoomRecord(r, ri))
          );
          setDynamicHotelsAndRooms(mappedHotels, mappedRooms);
          setDataVersion((v) => v + 1);
        }
      } catch (err) {
        console.error("Error fetching dynamic hotels:", err);
      }
    }
    loadDynamicHotels();
  }, []);

  const categories = useMemo(() => getVisibleCategories(), []);
  const faqs = useMemo(() => getVisibleFaqs(), []);
  const trust = useMemo(() => getVisibleTrustPoints(), []);
  const steps = useMemo(() => getVisibleProcessSteps(), []);
  const featuredRooms = useMemo(() => getFeaturedRooms(6), [dataVersion]);

  const activeCategory = search.category;
  const featuredHotels = useMemo(() => {
    const list = getFeaturedHotels();
    if (!activeCategory) return list;
    const inCategory = list.filter((h) => h.categorySlug === activeCategory);
    return inCategory.length > 0 ? inCategory : list;
  }, [activeCategory, dataVersion]);

  const today = todayISO();
  const params: HotelSearchParams = {
    destination: search.destination ?? "",
    hotelName: search.hotelName ?? "",
    checkIn: search.checkIn ?? today,
    checkOut: search.checkOut ?? addDaysISO(today, hotelsSearchDefaults.nights),
    rooms: search.rooms || hotelsSearchDefaults.rooms,
    adults: search.adults || hotelsSearchDefaults.adults,
    children: search.children ?? hotelsSearchDefaults.children,
    roomTypeSlug: search.roomType ?? hotelsSearchDefaults.roomTypeSlug,
    category: search.category ?? "all",
  };

  const hasQuery = Boolean(
    search.searched || search.destination || search.hotelName || search.checkIn,
  );

  const results = useMemo(
    () => (hasQuery ? searchHotels(params) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasQuery, params.destination, params.hotelName, params.checkIn, params.checkOut, params.rooms, params.adults, params.children, params.roomTypeSlug, params.category],
  );

  // Brief skeleton while the recomputed result set paints.
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!hasQuery) return;
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(t);
  }, [hasQuery, params.destination, params.checkIn, params.checkOut, params.rooms, params.adults, params.children, params.roomTypeSlug, params.category]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Hotels & Rooms", item: "/hotels" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <PageBanner
          title={hotelsBannerBlock.title}
          subtitle={hotelsBannerBlock.subtitle}
          image={hotelsBannerBlock.image}
          imageAlt={hotelsBannerBlock.imageAlt}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Hotels & Rooms", href: "/hotels" },
          ]}
        />

        <HotelSearchForm
          initial={{
            destination: params.destination,
            hotelName: params.hotelName,
            checkIn: params.checkIn,
            checkOut: params.checkOut,
            rooms: params.rooms,
            adults: params.adults,
            children: params.children,
            roomType: params.roomTypeSlug,
          }}
        />

        {hasQuery ? <HotelResults results={results} params={params} loading={loading} /> : null}

        {/* Featured hotels ----------------------------------------- */}
        <section className="bg-muted/40 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured hotels</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Partner properties our coordinators book most often this season.
            </p>
            {featuredHotels.length === 0 ? (
              <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No featured hotels right now — search above or talk to the stay desk.
              </p>
            ) : (
              <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featuredHotels.map((h) => (
                  <li key={h.id}>
                    <HotelCard
                      hotel={h}
                      priceFrom={getHotelPriceFrom(h.id)}
                      roomCount={getHotelRooms(h.id).length}
                      stay={{
                        checkIn: params.checkIn,
                        checkOut: params.checkOut,
                        rooms: params.rooms,
                        adults: params.adults,
                        children: params.children,
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Featured rooms ------------------------------------------ */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured rooms</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Specific room types with held inventory — reserve one directly.
          </p>
          {featuredRooms.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No rooms are featured right now.
            </p>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRooms.map(({ room, hotel }) => (
                <li key={room.id}>
                  <RoomCard
                    room={room}
                    hotel={hotel}
                    stayParams={{
                      checkIn: params.checkIn,
                      checkOut: params.checkOut,
                      rooms: String(params.rooms),
                      adults: String(params.adults),
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Trust --------------------------------------------------- */}
        {hotelsTrustBlock.visible ? (
          <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {hotelsTrustBlock.heading}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {hotelsTrustBlock.subheading}
            </p>
            <div className="mt-6">
              <HotelTrustSection points={trust} />
            </div>
          </section>
        ) : null}

        {/* Process ------------------------------------------------- */}
        {hotelsProcessBlock.visible ? (
          <section className="bg-muted/40 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {hotelsProcessBlock.heading}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {hotelsProcessBlock.subheading}
              </p>
              <div className="mt-6">
                <HotelProcessSection steps={steps} />
              </div>
            </div>
          </section>
        ) : null}

        {/* FAQs ---------------------------------------------------- */}
        <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Hotel booking FAQs</h2>
          {faqs.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No published questions yet — send yours to the stay desk and we'll answer today.
            </p>
          ) : (
            <Accordion type="single" collapsible className="mt-4 w-full">
              {faqs.map((f) => (
                <AccordionItem key={f.id} value={f.id}>
                  <AccordionTrigger className="text-left text-sm font-semibold sm:text-base">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>

        {/* Support CTA --------------------------------------------- */}
        {hotelsSupportBlock.visible ? (
          <section className="border-t border-border bg-card py-12 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {hotelsSupportBlock.heading}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">{hotelsSupportBlock.body}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <AppLink href={hotelsSupportBlock.primaryCta.href}>
                    {hotelsSupportBlock.primaryCta.label}
                  </AppLink>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href={waLink(hotelsSupportBlock.whatsappMessage)} target="_blank" rel="noreferrer noopener">
                    <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" /> WhatsApp
                  </a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href={telLink()}>
                    <Phone className="mr-2 h-4 w-4" aria-hidden="true" /> {company.phone}
                  </a>
                </Button>
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
