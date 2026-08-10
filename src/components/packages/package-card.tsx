import { Link } from "@tanstack/react-router";
import { MapPin, CalendarDays, BedDouble, Car, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPackagePrice,
  getPackageCategoryLabel,
  type TourPackageRecord,
} from "@/content/tour-packages";

export function PackageCard({
  pkg,
  priority = false,
  onEnquire,
}: {
  pkg: TourPackageRecord;
  priority?: boolean;
  onEnquire: (pkg: TourPackageRecord) => void;
}) {
  const price = formatPackagePrice(pkg);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors focus-within:border-primary hover:border-primary">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={pkg.image}
          alt={pkg.imageAlt}
          width={1200}
          height={750}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
        {pkg.soldOut ? (
          <Badge variant="secondary" className="absolute left-3 top-3">
            Sold out
          </Badge>
        ) : pkg.bestSeller ? (
          <Badge className="absolute left-3 top-3">Best seller</Badge>
        ) : null}
        <Badge variant="outline" className="absolute right-3 top-3 bg-background/90">
          {getPackageCategoryLabel(pkg.categorySlugs[0] ?? "")}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-base font-bold sm:text-lg">{pkg.title}</h3>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground/90">
          <li className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {pkg.destination}, {pkg.state}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {pkg.nights}N / {pkg.days}D
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            From {pkg.startingCity}
          </li>
        </ul>

        <ul className="mt-3 flex flex-wrap gap-2">
          {pkg.includesHotel ? (
            <li>
              <Badge variant="secondary" className="gap-1.5">
                <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                {pkg.hotelCategory} stay
              </Badge>
            </li>
          ) : null}
          {pkg.includesVehicle ? (
            <li>
              <Badge variant="secondary" className="gap-1.5">
                <Car className="h-3.5 w-3.5" aria-hidden="true" />
                {pkg.vehicleCategory}
              </Badge>
            </li>
          ) : null}
          {pkg.badges.map((badge) => (
            <li key={badge}>
              <Badge variant="outline">{badge}</Badge>
            </li>
          ))}
        </ul>

        {pkg.itinerarySummary.length > 0 ? (
          <ul className="mt-3 grid gap-1 text-xs text-muted-foreground">
            {pkg.itinerarySummary.slice(0, 3).map((line) => (
              <li key={line} className="line-clamp-1">
                {line}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-4">
          <p className="text-sm">
            <span className="text-lg font-bold text-primary">{price.amount}</span>{" "}
            <span className="text-xs text-muted-foreground">{price.basis}</span>
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/tour-packages/$slug" params={{ slug: pkg.slug }}>
                View Details
              </Link>
            </Button>
            <Button size="sm" type="button" onClick={() => onEnquire(pkg)}>
              {pkg.soldOut ? "Ask for alternatives" : "Enquire Now"}
            </Button>
          </div>
          {pkg.soldOut ? (
            <p className="mt-2 text-xs text-muted-foreground">
              This departure is fully booked — we'll suggest the closest available dates.
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
