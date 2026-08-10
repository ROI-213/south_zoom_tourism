import { SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { HotelCard } from "@/components/hotels/hotel-card";
import { waLink } from "@/content/site";
import type { HotelSearchParams, HotelSearchResult } from "@/content/hotels";

export function HotelResults({
  results,
  params,
  loading,
}: {
  results: HotelSearchResult[];
  params: HotelSearchParams;
  loading: boolean;
}) {
  const nights = results[0]?.bestRate?.nights ?? 0;
  const stay = {
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    rooms: params.rooms,
    adults: params.adults,
    children: params.children,
  };

  return (
    <section id="hotel-results" className="mx-auto max-w-7xl px-4 py-12 sm:py-16" aria-live="polite">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {loading ? "Checking availability…" : `${results.length} stay${results.length === 1 ? "" : "s"} available`}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {params.destination ? `${params.destination} · ` : ""}
        {params.checkIn} to {params.checkOut}
        {nights ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""} · {params.rooms} room
        {params.rooms > 1 ? "s" : ""} · {params.adults} adult{params.adults > 1 ? "s" : ""}
        {params.children ? ` · ${params.children} children` : ""}
      </p>

      {loading ? (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : results.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
          <SearchX className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-3 text-base font-bold">No rooms free for these dates</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Availability is checked night by night, so a single sold-out night hides the property.
            Try shifting your dates, reducing rooms, or let us hold a block for you.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild size="sm">
              <AppLink href="/contact-us?intent=hotel-booking">Ask for options</AppLink>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a
                href={waLink(
                  `Hi South Zoom Tourism, I need a stay${
                    params.destination ? ` in ${params.destination}` : ""
                  } from ${params.checkIn} to ${params.checkOut} for ${params.rooms} room(s).`,
                )}
                target="_blank"
                rel="noreferrer noopener"
              >
                WhatsApp us
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r, i) => (
            <li key={r.hotel.id}>
              <HotelCard
                hotel={r.hotel}
                priceFrom={r.priceFrom}
                bestRate={r.bestRate}
                roomCount={r.matchingRooms.length}
                stay={stay}
                eager={i < 3}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
