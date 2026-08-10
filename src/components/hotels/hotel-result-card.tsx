import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppLink } from "@/components/common/app-link";
import { getCategoryLabel, getRoomTypeLabel } from "@/content/hotels";
import {
  availabilityLabel,
  getMealPlanLabel,
  listingPageBlock,
  type ListingResult,
  type ListingStay,
} from "@/content/hotel-listing";
import { stayQuery } from "./listing-search";

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

type Props = {
  result: ListingResult;
  stay: ListingStay;
  eager?: boolean;
};

function HotelResultCardBase({ result, stay, eager = false }: Props) {
  const { hotel, attributes, offers, bestOffer, status } = result;
  const query = stayQuery(stay);
  const citySlug = hotel.city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const detailHref = `/hotels/${citySlug}/${hotel.slug}?${query}`;
  const bookSearch: Record<string, string | number> = {
    hotel: hotel.name,
    city: hotel.city,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: stay.rooms,
    adults: stay.adults,
    children: stay.children,
    subject:
      status === "sold-out"
        ? `Alternative stays — ${hotel.name}, ${hotel.city}`
        : `Hotel booking — ${hotel.name}, ${hotel.city}`,
  };
  const roomTypes = Array.from(new Set(offers.map((o) => o.room.roomTypeSlug))).slice(0, 4);
  const mealPlansShown = Array.from(new Set(offers.map((o) => o.ratePlan.mealPlanSlug))).slice(0, 3);
  const soldOut = status === "sold-out";

  return (
    <Card
      className="overflow-hidden"
      data-testid="hotel-result-card"
      data-hotel={hotel.slug}
      data-status={status}
    >
      <div className="grid gap-0 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted md:aspect-auto md:h-full">
          <img
            src={hotel.image}
            alt={hotel.imageAlt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            width={640}
            height={480}
            className="h-full w-full object-cover"
          />
          {attributes.recommended ? (
            <Badge className="absolute left-3 top-3">Recommended</Badge>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold leading-tight break-words">{hotel.name}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="break-words">
                  {attributes.locality}, {hotel.city}, {hotel.state}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {attributes.landmarkDistanceKm} km from {attributes.landmarkName}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold text-primary"
                aria-label={`Guest rating ${attributes.guestRating} out of 5`}
              >
                {attributes.guestRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                {attributes.guestReviewCount} reviews
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{getCategoryLabel(hotel.categorySlug)}</Badge>
            <span
              className="inline-flex items-center gap-0.5 text-sm text-muted-foreground"
              aria-label={`${hotel.starRating} star property`}
            >
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              ))}
            </span>
            {hotel.verifiedPartner ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified partner
              </span>
            ) : null}
            <Badge
              variant={soldOut ? "destructive" : status === "limited" ? "outline" : "secondary"}
              data-testid="availability-badge"
            >
              {availabilityLabel[status]}
              {status === "limited" ? ` — ${result.unitsAvailable} left` : ""}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{hotel.shortDescription}</p>

          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {hotel.amenities.slice(0, 5).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>

          {roomTypes.length > 0 ? (
            <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {roomTypes.map((slug) => getRoomTypeLabel(slug)).join(" · ")}
              {mealPlansShown.length
                ? ` · ${mealPlansShown.map((m) => getMealPlanLabel(m)).join(" · ")}`
                : ""}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t pt-3">
            <div className="min-w-0">
              {bestOffer ? (
                <>
                  <p className="text-xl font-semibold">
                    {inr(bestOffer.nightlyRate)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">/ night</span>
                  </p>
                  <p className="text-xs text-muted-foreground break-words">
                    {inr(bestOffer.stayTotal)} total for {result.nights} night
                    {result.nights === 1 ? "" : "s"}, {stay.rooms} room
                    {stay.rooms === 1 ? "" : "s"} · {listingPageBlock.taxNote}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {attributes.freeCancellation
                      ? "Free cancellation up to 72 hrs before check-in"
                      : "Non-refundable rate"}
                    {attributes.payAtHotel ? " · Pay at hotel" : ""}
                    {attributes.instantConfirmation ? " · Instant confirmation" : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No rooms match these dates and occupancy.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <AppLink href={detailHref}>View hotel</AppLink>
              </Button>
              <Button asChild size="sm">
                <Link to="/contact-us" search={bookSearch}>
                  {soldOut ? "Request alternatives" : "Book now"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export const HotelResultCard = memo(HotelResultCardBase);
