import { BadgeCheck, MapPin, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryLabel, type HotelRecord } from "@/content/hotels";
import type { HotelListingAttributes } from "@/content/hotel-listing";
import { mapsLink, type HotelProfile } from "@/content/hotel-details";

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function HotelDetailHeader({
  hotel,
  attributes,
  profile,
  startingPrice,
  nights,
}: {
  hotel: HotelRecord;
  attributes: HotelListingAttributes | undefined;
  profile: HotelProfile | undefined;
  startingPrice: number | null;
  nights: number;
}) {
  const maps = mapsLink(profile, `${hotel.name}, ${hotel.address}`);

  return (
    <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{getCategoryLabel(hotel.categorySlug)}</Badge>
          {hotel.verifiedPartner && (
            <Badge className="gap-1">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified partner
            </Badge>
          )}
          {attributes?.recommended && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Recommended
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {hotel.name}
        </h1>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="break-words">
              {attributes?.locality ? `${attributes.locality}, ` : ""}
              {hotel.address}
            </span>
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span
            className="inline-flex items-center gap-1"
            aria-label={`${hotel.starRating} star property`}
          >
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-primary text-primary"
                aria-hidden="true"
              />
            ))}
            <span className="ml-1 text-muted-foreground">{hotel.starRating}-star</span>
          </span>

          {attributes && (
            <span className="inline-flex items-center gap-2">
              <span className="rounded-md bg-primary px-2 py-0.5 text-sm font-bold text-primary-foreground">
                {attributes.guestRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                Guest rating · {attributes.guestReviewCount.toLocaleString("en-IN")} reviews
              </span>
            </span>
          )}
        </div>

        <p className="max-w-2xl text-sm text-muted-foreground">{hotel.shortDescription}</p>
      </div>

      <div className="rounded-xl border bg-card p-4 lg:w-64">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Starting from
        </p>
        {startingPrice !== null ? (
          <>
            <p className="mt-1 text-2xl font-bold text-foreground">{inr(startingPrice)}</p>
            <p className="text-xs text-muted-foreground">
              per room / night · {nights} night{nights === 1 ? "" : "s"} selected
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            No rooms open for these dates
          </p>
        )}
        <Button asChild variant="outline" size="sm" className="mt-3 w-full">
          <a href={maps} target="_blank" rel="noreferrer noopener">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            View on Google Maps
          </a>
        </Button>
        <Button asChild size="sm" className="mt-2 w-full">
          <a href="#rooms">Select a room</a>
        </Button>
      </div>
    </header>
  );
}
