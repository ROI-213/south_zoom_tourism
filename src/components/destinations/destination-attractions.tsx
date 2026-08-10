import { MapPin, Route as RouteIcon, Clock } from "lucide-react";
import type { DestinationAttraction } from "@/content/destination-details";

export function DestinationAttractions({
  destinationName,
  attractions,
}: {
  destinationName: string;
  attractions: DestinationAttraction[];
}) {
  if (attractions.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Attraction details for {destinationName} are being added. Tell us what you'd like to see
        and we'll build the day plan around it.
      </p>
    );
  }

  return (
    <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {attractions.map((a) => (
        <li
          key={a.id}
          className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-4"
        >
          <div className="flex min-w-0 items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <h3 className="min-w-0 text-base font-bold">{a.name}</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
          {a.distanceKm !== undefined || a.travelTime ? (
            <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {a.distanceKm !== undefined ? (
                <div className="flex items-center gap-1.5">
                  <RouteIcon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <dt className="sr-only">Distance from {destinationName}</dt>
                  <dd>{a.distanceKm} km away</dd>
                </div>
              ) : null}
              {a.travelTime ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <dt className="sr-only">Approximate drive time</dt>
                  <dd>{a.travelTime} drive</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
