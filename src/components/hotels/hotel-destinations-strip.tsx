import { MapPin } from "lucide-react";
import { AppLink } from "@/components/common/app-link";
import { countHotelsInCity, type HotelDestinationRecord } from "@/content/hotels";

export function HotelDestinationsStrip({ items }: { items: HotelDestinationRecord[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Destination shortcuts are being refreshed — search any city above instead.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((d) => {
        const count = countHotelsInCity(d.city);
        return (
          <li key={d.id}>
            <AppLink
              href={`/hotels/${d.destinationSlug || d.city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-primary/60"
              ariaLabel={`See stays in ${d.city}`}
            >
              <img
                src={d.image}
                alt={d.imageAlt}
                width={640}
                height={480}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="flex flex-1 flex-col p-3">
                <span className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 truncate">{d.city}</span>
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground">{d.blurb}</span>
                <span className="mt-1.5 text-[11px] font-medium text-primary">
                  {count} {count === 1 ? "property" : "properties"}
                </span>
              </span>
            </AppLink>
          </li>
        );
      })}
    </ul>
  );
}
