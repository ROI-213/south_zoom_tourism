import { MapPin, CalendarRange, Package, BedDouble, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import {
  getDestinationHotelCount,
  getDestinationPackageCount,
  getTripTypeLabel,
  type DestinationRecord,
} from "@/content/destinations";

export function DestinationCard({
  destination,
  priority = false,
}: {
  destination: DestinationRecord;
  priority?: boolean;
}) {
  const packageCount = getDestinationPackageCount(destination);
  const hotelCount = getDestinationHotelCount(destination);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={destination.image}
          alt={`${destination.name}, ${destination.state} — ${destination.imageAlt}`}
          width={1600}
          height={1000}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {destination.featured ? <Badge>Featured</Badge> : null}
          {destination.popular ? <Badge variant="secondary">Popular</Badge> : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="truncate text-lg font-bold">{destination.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {destination.state} · {destination.region}
          </span>
        </p>

        <p className="mt-3 line-clamp-3 text-pretty text-sm text-muted-foreground">
          {destination.shortDescription}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {destination.tripTypeSlugs.map((slug) => (
            <li
              key={slug}
              className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {getTripTypeLabel(slug)}
            </li>
          ))}
        </ul>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex min-w-0 items-start gap-1.5">
            <CalendarRange className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <dt className="sr-only">Best time to visit</dt>
            <dd className="min-w-0 text-muted-foreground">{destination.bestTime}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Package className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <dt className="sr-only">Packages available</dt>
            <dd className="truncate text-muted-foreground">
              {packageCount} package{packageCount === 1 ? "" : "s"}
            </dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <dt className="sr-only">Partner hotels</dt>
            <dd className="truncate text-muted-foreground">
              {hotelCount} hotel{hotelCount === 1 ? "" : "s"}
            </dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <dt className="sr-only">Ideal duration</dt>
            <dd className="truncate text-muted-foreground">{destination.idealDuration}</dd>
          </div>
        </dl>

        <div className="mt-4 flex-1" />
        <Link
          to="/destinations/$slug"
          params={{ slug: destination.slug }}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Explore {destination.name}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-12 w-full animate-pulse rounded bg-muted" />
        <div className="h-9 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
