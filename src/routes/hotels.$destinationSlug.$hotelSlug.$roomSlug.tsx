import { useMemo } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { SearchSummaryBar } from "@/components/hotels/search-summary-bar";
import { RoomDetailGallery } from "@/components/hotels/room-detail-gallery";
import { RoomSpecPanel } from "@/components/hotels/room-spec-panel";
import { RoomRatePlans } from "@/components/hotels/room-rate-plans";
import {
  HotelNearbyPlaces,
  HotelPoliciesPanel,
} from "@/components/hotels/hotel-policies-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  resolveStay,
  validateListingSearch,
  type ListingSearch,
} from "@/components/hotels/listing-search";
import type { ListingStay } from "@/content/hotel-listing";
import { getPublishedHotels, getCategoryLabel, getRoomTypeLabel } from "@/content/hotels";
import { getHotelProfile, getRoomDetailAttributes, mapsLink } from "@/content/hotel-details";
import {
  buildRoomQuotes,
  getRoomGallery,
  getRoomProfile,
  getRoomSlug,
  getSiblingRooms,
  resolveRoom,
  roomDetailBlock,
} from "@/content/room-details";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const stayObj = (stay: ListingStay): Record<string, string> => ({
  checkIn: stay.checkIn,
  checkOut: stay.checkOut,
  rooms: String(stay.rooms),
  adults: String(stay.adults),
  children: String(stay.children),
});

function findHotel(destinationSlug: string, hotelSlug: string) {
  return (
    getPublishedHotels().find(
      (h) => h.slug === hotelSlug && slugify(h.city) === destinationSlug,
    ) ?? null
  );
}

export const Route = createFileRoute("/hotels/$destinationSlug/$hotelSlug/$roomSlug")({
  validateSearch: (search: Record<string, unknown>): ListingSearch =>
    validateListingSearch(search),
  loader: ({ params }) => {
    const hotel = findHotel(params.destinationSlug, params.hotelSlug);
    if (!hotel) throw notFound();
    const room = resolveRoom(hotel, params.roomSlug);
    if (!room) throw notFound();
    return {
      hotelName: hotel.name,
      city: hotel.city,
      roomName: room.name,
      image: room.image,
      bedType: room.bedType,
    };
  },
  head: ({ loaderData, params }) => {
    const canonical = `https://southzoomtourism.com/hotels/${params.destinationSlug}/${params.hotelSlug}/${params.roomSlug}`;
    if (!loaderData) {
      return {
        meta: [
          { title: "Room unavailable | South Zoom Tourism" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.roomName} — ${loaderData.hotelName}, ${loaderData.city} | South Zoom Tourism`;
    const description = `${loaderData.roomName} at ${loaderData.hotelName}, ${loaderData.city}: ${loaderData.bedType}, photos, amenities, rate plans, date-wise price breakdown, taxes and cancellation rules.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: loaderData.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: loaderData.image },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl p-10 text-center" role="alert">
      <h1 className="text-xl font-semibold">We could not load this room</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-xl font-semibold">Room not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This room is not published for the selected hotel.
      </p>
      <Link to="/hotels" className="mt-4 inline-block text-primary underline">
        Back to hotels
      </Link>
    </div>
  ),
  component: RoomDetailPage,
});

function RoomDetailPage() {
  const { destinationSlug, hotelSlug, roomSlug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const hotel = findHotel(destinationSlug, hotelSlug)!;
  const room = resolveRoom(hotel, roomSlug)!;
  const profile = getRoomProfile(room.id);
  const attributes = getRoomDetailAttributes(room.id);
  const hotelProfile = getHotelProfile(hotel.id);

  const stay = resolveStay(search, hotel.city);
  const roomStay = {
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: stay.rooms,
    adults: stay.adults,
    children: stay.children,
  };

  const quotes = useMemo(
    () => buildRoomQuotes(hotel.id, room, roomStay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hotel.id, room.id, stay.checkIn, stay.checkOut, stay.rooms, stay.adults, stay.children],
  );
  const media = useMemo(() => getRoomGallery(hotel, room), [hotel, room]);
  const siblings = getSiblingRooms(hotel.id, room.id);

  const nights = quotes[0]?.nightCount ?? 1;
  const best = quotes.find((q) => q.selectable) ?? quotes[0] ?? null;

  const applyStay = (next: ListingStay) => {
    navigate({ search: { ...search, ...stayObj(next) } });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: profile?.description ?? hotel.shortDescription,
    image: room.image,
    bed: { "@type": "BedDetails", typeOfBed: room.bedType, numberOfBeds: profile?.bedCount ?? 1 },
    occupancy: { "@type": "QuantitativeValue", maxValue: room.maxAdults + room.maxChildren },
    floorSize: { "@type": "QuantitativeValue", value: room.sizeSqft, unitCode: "FTK" },
    amenityFeature: room.amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    containedInPlace: {
      "@type": "Hotel",
      name: hotel.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: hotel.address,
        addressLocality: hotel.city,
        addressRegion: hotel.state,
        addressCountry: "IN",
      },
    },
    ...(best
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: best.total,
            availability: best.available
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
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
          { label: room.name, href: `/hotels/${destinationSlug}/${hotelSlug}/${roomSlug}` },
        ]}
      />

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{getRoomTypeLabel(room.roomTypeSlug)}</Badge>
          <Badge variant="outline">{getCategoryLabel(hotel.categorySlug)}</Badge>
          {profile?.airConditioned && <Badge variant="outline">AC</Badge>}
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{room.name}</h1>
        <p className="text-sm text-muted-foreground">
          at{" "}
          <Link
            to="/hotels/$destinationSlug/$hotelSlug"
            params={{ destinationSlug, hotelSlug }}
            search={stayObj(stay)}
            className="font-medium text-primary underline underline-offset-2"
          >
            {hotel.name}
          </Link>{" "}
          · {hotel.city}, {hotel.state}
        </p>
        {profile && (
          <p className="text-sm text-muted-foreground">
            Recommended for {profile.recommendedAdults} adult
            {profile.recommendedAdults === 1 ? "" : "s"}
            {profile.recommendedChildren > 0
              ? ` and up to ${profile.recommendedChildren} child${profile.recommendedChildren === 1 ? "" : "ren"}`
              : ""}
            . Base rate covers {profile.baseOccupancy} guest
            {profile.baseOccupancy === 1 ? "" : "s"}.
          </p>
        )}
      </header>

      <RoomDetailGallery media={media} roomName={room.name} />

      <SearchSummaryBar
        stay={stay}
        nights={nights}
        resultCount={quotes.filter((q) => q.selectable).length}
        destinationLocked
        onApply={applyStay}
        idPrefix="room-detail"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start">
        <div className="min-w-0 space-y-8">
          <RoomSpecPanel room={room} profile={profile} attributes={attributes} />

          <RoomRatePlans
            hotel={hotel}
            room={room}
            quotes={quotes}
            stay={roomStay}
            destinationSlug={destinationSlug}
          />

          <HotelPoliciesPanel profile={hotelProfile} startingPrice={best?.perNightAverage ?? null} />
          <HotelNearbyPlaces profile={hotelProfile} />

          {siblings.length > 0 && (
            <section aria-labelledby="other-rooms-heading" className="space-y-4">
              <h2 id="other-rooms-heading" className="text-lg font-semibold">
                {roomDetailBlock.otherRoomsHeading}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {siblings.map((item) => (
                  <Link
                    key={item.id}
                    to="/hotels/$destinationSlug/$hotelSlug/$roomSlug"
                    params={{ destinationSlug, hotelSlug, roomSlug: getRoomSlug(item) }}
                    search={stayObj(stay)}
                    className="flex min-w-0 gap-3 rounded-xl border p-3 transition-colors hover:bg-muted"
                  >
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      width={200}
                      height={150}
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-24 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.bedType} · up to {item.maxAdults} adults
                      </span>
                      <span className="mt-1 block text-sm font-semibold">
                        ₹{item.basePricePerNight.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}
                          / night
                        </span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <Card className="p-4">
            <h2 className="text-sm font-semibold">{hotel.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground break-words">{hotel.address}</p>
            <p className="mt-2 text-sm text-muted-foreground">{hotel.shortDescription}</p>
            {hotelProfile && (
              <p className="mt-2 text-xs text-muted-foreground">
                Check-in {hotelProfile.checkInTime} · Check-out {hotelProfile.checkOutTime}
              </p>
            )}
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link
                to="/hotels/$destinationSlug/$hotelSlug"
                params={{ destinationSlug, hotelSlug }}
                search={stayObj(stay)}
              >
                View full hotel
              </Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <a
                href={mapsLink(hotelProfile, `${hotel.name}, ${hotel.address}`)}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open location in Maps
              </a>
            </Button>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold">Need help with this room?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Talk to our stay desk for group blocks, early check-in or extra beds.
            </p>
            <Button asChild className="mt-3 w-full">
              <Link
                to="/contact-us"
                search={{
                  hotel: hotel.name,
                  city: hotel.city,
                  room: room.name,
                  ...stayObj(stay),
                  subject: `Room enquiry — ${room.name}, ${hotel.name}`,
                }}
              >
                Talk to our stay desk
              </Link>
            </Button>
          </Card>
        </aside>
      </div>
    </main>
  );
}
