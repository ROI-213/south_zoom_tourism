import { useMemo } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { SearchSummaryBar } from "@/components/hotels/search-summary-bar";
import { HotelDetailHeader } from "@/components/hotels/hotel-detail-header";
import { HotelDetailGallery } from "@/components/hotels/hotel-detail-gallery";
import { HotelOverviewPanel } from "@/components/hotels/hotel-overview-panel";
import { HotelAmenityGrid } from "@/components/hotels/hotel-amenity-grid";
import { RoomSelectCard } from "@/components/hotels/room-select-card";
import {
  HotelDetailFaqs,
  HotelNearbyPlaces,
  HotelPoliciesPanel,
} from "@/components/hotels/hotel-policies-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  resolveStay,
  validateListingSearch,
  type ListingSearch,
} from "@/components/hotels/listing-search";
import type { ListingStay } from "@/content/hotel-listing";
import { getPublishedHotels, getCategoryLabel } from "@/content/hotels";
import { getListingAttributes } from "@/content/hotel-listing";
import {
  buildRoomSelections,
  getHotelProfile,
  getRelatedHotels,
  hotelDetailBlock,
  mapsLink,
} from "@/content/hotel-details";

const stayObj = (stay: ListingStay): Record<string, string> => ({
  checkIn: stay.checkIn,
  checkOut: stay.checkOut,
  rooms: String(stay.rooms),
  adults: String(stay.adults),
  children: String(stay.children),
  ...(stay.roomType && stay.roomType !== "any" ? { roomType: stay.roomType } : {}),
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function findHotel(destinationSlug: string, hotelSlug: string) {
  return (
    getPublishedHotels().find(
      (h) => h.slug === hotelSlug && slugify(h.city) === destinationSlug,
    ) ?? null
  );
}

export const Route = createFileRoute("/hotels/$destinationSlug/$hotelSlug/")({
  validateSearch: (search: Record<string, unknown>): ListingSearch =>
    validateListingSearch(search),
  loader: ({ params }) => {
    const hotel = findHotel(params.destinationSlug, params.hotelSlug);
    if (!hotel) throw notFound();
    return { hotelId: hotel.id, name: hotel.name, city: hotel.city, image: hotel.image };
  },
  head: ({ loaderData, params }) => {
    const canonical = `https://southzoomtourism.com/hotels/${params.destinationSlug}/${params.hotelSlug}`;
    if (!loaderData) {
      return {
        meta: [
          { title: "Hotel unavailable | South Zoom Tourism" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name}, ${loaderData.city} — Rooms, Rates & Live Availability | South Zoom Tourism`;
    const description = `Book ${loaderData.name} in ${loaderData.city}: verified photos, amenities, room-wise rates with meal plans, taxes, policies and live date-wise availability.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl p-10 text-center" role="alert">
      <h1 className="text-xl font-semibold">We could not load this hotel</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-xl font-semibold">Hotel not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This property is not listed with us for the selected destination.
      </p>
      <Link to="/hotels" className="mt-4 inline-block text-primary underline">
        Back to hotels
      </Link>
    </div>
  ),
  component: HotelDetailPage,
});

function HotelDetailPage() {
  const { destinationSlug, hotelSlug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const hotel = findHotel(destinationSlug, hotelSlug)!;
  const profile = getHotelProfile(hotel.id);
  const attributes = getListingAttributes(hotel.id);

  const stay = resolveStay(search, hotel.city);
  const roomStay = {
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: stay.rooms,
    adults: stay.adults,
    children: stay.children,
  };

  const selections = useMemo(
    () => buildRoomSelections(hotel.id, roomStay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hotel.id, stay.checkIn, stay.checkOut, stay.rooms, stay.adults, stay.children],
  );

  const bookable = selections.filter((s) => s.plans.length > 0);
  const nights = selections[0]?.nights ?? 1;
  const startingPrice = bookable.length
    ? Math.min(...bookable.map((s) => s.bestPlan!.nightlyRate))
    : null;
  const taxPercent = profile?.taxPercent ?? 12;
  const related = getRelatedHotels(hotel, 3);

  const applyStay = (next: ListingStay) => {
    navigate({ search: { ...search, ...stayObj(next) } });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.shortDescription,
    image: hotel.image,
    starRating: { "@type": "Rating", ratingValue: hotel.starRating },
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      addressRegion: hotel.state,
      addressCountry: "IN",
    },
    ...(profile
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: profile.latitude,
            longitude: profile.longitude,
          },
          checkinTime: profile.checkInTime,
          checkoutTime: profile.checkOutTime,
        }
      : {}),
    ...(attributes
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: attributes.guestRating,
            reviewCount: attributes.guestReviewCount,
            bestRating: 5,
          },
        }
      : {}),
    ...(startingPrice !== null
      ? {
          priceRange: `From ₹${startingPrice} per night`,
          makesOffer: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: startingPrice,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Hotels", href: "/hotels" },
          { label: hotel.city, href: `/hotels/${destinationSlug}` },
          { label: hotel.name, href: `/hotels/${destinationSlug}/${hotelSlug}` },
        ]}
      />

      <HotelDetailHeader
        hotel={hotel}
        attributes={attributes ?? undefined}
        profile={profile}
        startingPrice={startingPrice}
        nights={nights}
      />

      <HotelDetailGallery hotelId={hotel.id} hotelName={hotel.name} />

      <SearchSummaryBar
        stay={stay}
        nights={nights}
        resultCount={bookable.length}
        destinationLocked
        onApply={applyStay}
        idPrefix="hotel-detail"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start">
        <div className="min-w-0 space-y-8">
          <HotelOverviewPanel hotel={hotel} profile={profile} />
          <HotelAmenityGrid hotelId={hotel.id} />

          <section id="rooms" aria-labelledby="rooms-heading" className="scroll-mt-24 space-y-4">
            <div>
              <h2 id="rooms-heading" className="text-lg font-semibold">
                {hotelDetailBlock.roomsHeading}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hotelDetailBlock.roomsSubheading}
              </p>
            </div>

            {selections.length === 0 ? (
              <Card className="p-6">
                <h3 className="text-base font-semibold">{hotelDetailBlock.emptyRoomsTitle}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hotelDetailBlock.emptyRoomsBody}
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/hotels/$destinationSlug" params={{ destinationSlug }}>
                    See other stays in {hotel.city}
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {selections.map((selection) => (
                  <RoomSelectCard
                    key={selection.room.id}
                    hotel={hotel}
                    selection={selection}
                    stay={roomStay}
                    taxPercent={taxPercent}
                  />
                ))}
              </div>
            )}
          </section>

          <HotelPoliciesPanel profile={profile} startingPrice={startingPrice} />
          <HotelNearbyPlaces profile={profile} />
          <HotelDetailFaqs profile={profile} />
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <Card className="p-4">
            <h2 className="text-sm font-semibold">{hotelDetailBlock.supportHeading}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{hotelDetailBlock.supportBody}</p>
            <Button asChild className="mt-3 w-full">
              <Link
                to="/contact-us"
                search={{
                  hotel: hotel.name,
                  city: hotel.city,
                  checkIn: stay.checkIn,
                  checkOut: stay.checkOut,
                  rooms: String(stay.rooms),
                  adults: String(stay.adults),
                  children: String(stay.children),
                  subject: `Group stay enquiry — ${hotel.name}, ${hotel.city}`,
                }}
              >
                Request a group hold
              </Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <a
                href={mapsLink(profile, `${hotel.name}, ${hotel.address}`)}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open location in Maps
              </a>
            </Button>
          </Card>

          {related.length > 0 && (
            <Card className="p-4">
              <h2 className="text-sm font-semibold">{hotelDetailBlock.relatedHeading}</h2>
              <ul className="mt-3 space-y-3">
                {related.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <Link
                      to="/hotels/$destinationSlug/$hotelSlug"
                      params={{
                        destinationSlug: slugify(item.city),
                        hotelSlug: item.slug,
                      }}
                      search={stayObj(stay)}
                      className="flex min-w-0 gap-3 rounded-lg border p-2 transition-colors hover:bg-muted"
                    >
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        width={160}
                        height={120}
                        loading="lazy"
                        decoding="async"
                        className="h-16 w-20 shrink-0 rounded-md object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{item.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.city} · {getCategoryLabel(item.categorySlug)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </main>
  );
}
