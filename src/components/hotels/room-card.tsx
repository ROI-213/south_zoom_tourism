import { Users, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { waLink } from "@/content/site";
import { getRoomTypeLabel, type HotelRecord, type RoomRecord } from "@/content/hotels";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function RoomCard({
  room,
  hotel,
  unitsAvailable,
  stayTotal,
  nights,
  stayParams,
}: {
  room: RoomRecord;
  hotel: HotelRecord;
  unitsAvailable?: number;
  stayTotal?: number;
  nights?: number;
  stayParams?: Record<string, string>;
}) {
  const contactHref = `/contact-us?${new URLSearchParams({
    hotel: hotel.slug,
    room: room.id,
    city: hotel.city,
    intent: "hotel-booking",
    ...(stayParams ?? {}),
  }).toString()}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <img
        src={room.image}
        alt={room.imageAlt}
        width={1920}
        height={1200}
        loading="lazy"
        decoding="async"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/10] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {getRoomTypeLabel(room.roomTypeSlug)}
        </p>
        <h3 className="mt-1 text-base font-bold text-foreground">{room.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {hotel.name} · {hotel.city}
        </p>

        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          <li className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Up to {room.maxAdults} adults · {room.maxChildren} children
          </li>
          <li className="inline-flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {room.bedType} · {room.sizeSqft} sq ft
          </li>
        </ul>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {room.amenities.slice(0, 3).map((a) => (
            <li
              key={a}
              className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
            >
              {a}
            </li>
          ))}
        </ul>

        {typeof unitsAvailable === "number" ? (
          <p className="mt-3 text-xs font-medium text-primary">
            {unitsAvailable} room{unitsAvailable === 1 ? "" : "s"} left on your dates
          </p>
        ) : null}

        <div className="mt-auto pt-3">
          <p className="text-sm font-semibold text-foreground">
            {inr(room.basePricePerNight)}
            <span className="text-xs font-normal text-muted-foreground"> / night</span>
          </p>
          {typeof stayTotal === "number" && nights ? (
            <p className="text-xs text-muted-foreground">
              {inr(stayTotal)} for {nights} night{nights > 1 ? "s" : ""}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" className="flex-1 min-w-[7rem]">
              <AppLink href={contactHref}>Reserve</AppLink>
            </Button>
            <Button asChild size="sm" variant="outline" className="flex-1 min-w-[7rem]">
              <a
                href={waLink(
                  `Hi South Zoom Tourism, is the ${room.name} at ${hotel.name}, ${hotel.city} available?`,
                )}
                target="_blank"
                rel="noreferrer noopener"
              >
                Ask
              </a>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
