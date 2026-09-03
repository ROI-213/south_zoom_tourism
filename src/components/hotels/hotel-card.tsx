import { useState } from "react";
import { MapPin, Star, BedDouble, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import {
  getCategoryLabel,
  getRoomTypeLabel,
  type HotelRecord,
  type RoomAvailability,
} from "@/content/hotels";
import { HotelEnquiryModal } from "@/components/hotels/hotel-enquiry-modal";

export type HotelCardStay = {
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function HotelCard({
  hotel,
  priceFrom,
  bestRate,
  roomCount,
  stay = {},
  eager = false,
}: {
  hotel: HotelRecord;
  priceFrom: number | null;
  bestRate?: RoomAvailability | null;
  roomCount?: number;
  stay?: HotelCardStay;
  eager?: boolean;
}) {
  const [showEnquiry, setShowEnquiry] = useState(false);
  const nights = bestRate?.nights ?? 0;
  const destinationSlug = slugify(hotel.city);
  const detailHref = `/hotels/${destinationSlug}/${hotel.slug}`;

  return (
    <>
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
        <div className="relative">
          <AppLink href={detailHref} className="block overflow-hidden" ariaLabel={`View details for ${hotel.name}`}>
            <img
              src={hotel.image}
              alt={hotel.imageAlt}
              width={1920}
              height={1200}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="aspect-[16/10] w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </AppLink>
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground">
            {getCategoryLabel(hotel.categorySlug)}
          </span>
          {hotel.verifiedPartner ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors">
            <AppLink href={detailHref}>{hotel.name}</AppLink>
          </h3>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">
              {hotel.city}, {hotel.state}
            </span>
          </p>
          <p
            className="mt-2 inline-flex items-center gap-0.5"
            aria-label={`${hotel.starRating} star property`}
          >
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden="true" />
            ))}
          </p>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{hotel.shortDescription}</p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 3).map((a) => (
              <li
                key={a}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
              >
                {a}
              </li>
            ))}
          </ul>

          {bestRate ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
              {getRoomTypeLabel(bestRate.room.roomTypeSlug)} available ·{" "}
              {bestRate.unitsAvailable} left
            </p>
          ) : typeof roomCount === "number" ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
              {roomCount} room type{roomCount === 1 ? "" : "s"}
            </p>
          ) : null}

          <div className="mt-auto pt-3">
            {bestRate ? (
              <p className="text-sm font-semibold text-foreground">
                {inr(bestRate.avgNightlyRate)}
                <span className="text-xs font-normal text-muted-foreground"> / night avg</span>
                {nights > 0 ? (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {inr(bestRate.stayTotal)} total for {nights} night{nights > 1 ? "s" : ""}
                  </span>
                ) : null}
              </p>
            ) : priceFrom !== null ? (
              <p className="text-sm font-semibold text-foreground">
                From {inr(priceFrom)}
                <span className="text-xs font-normal text-muted-foreground"> / night</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Rates on request</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {/* Book now → opens enquiry form modal (like fleet page) */}
              <Button
                type="button"
                size="sm"
                onClick={() => setShowEnquiry(true)}
                className="flex-1 min-w-[7rem] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-transform active:scale-95"
              >
                Book now
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1 min-w-[7rem] font-semibold">
                <AppLink href={detailHref}>View details</AppLink>
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Hotel Enquiry Modal — mirrors fleet booking form */}
      <HotelEnquiryModal
        open={showEnquiry}
        onOpenChange={setShowEnquiry}
        hotel={hotel}
        stay={stay}
      />
    </>
  );
}
