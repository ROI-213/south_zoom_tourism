import { Users, Briefcase, Snowflake, Fuel, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getVehicleCategoryLabel, type FleetVehicle } from "@/content/fleet";
import { waLink } from "@/content/site";

export function VehicleCard({
  vehicle,
  priority = false,
}: {
  vehicle: FleetVehicle;
  priority?: boolean;
}) {
  const bookable = vehicle.available;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors focus-within:border-primary hover:border-primary">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={vehicle.image}
          alt={vehicle.imageAlt}
          width={1200}
          height={750}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
        <Badge
          variant={bookable ? "default" : "secondary"}
          className="absolute left-3 top-3"
        >
          {vehicle.availabilityText}
        </Badge>
        <Badge variant="outline" className="absolute right-3 top-3 bg-background/90">
          {getVehicleCategoryLabel(vehicle.categorySlug)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-base font-bold sm:text-lg">{vehicle.name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {vehicle.brand} · {vehicle.model}
        </p>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground/90">
          <li className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {vehicle.seats} seats
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {vehicle.luggage} bags
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Snowflake className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {vehicle.ac ? "AC" : "Non-AC"}
          </li>
          {vehicle.fuel ? (
            <li className="inline-flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {vehicle.fuel}
            </li>
          ) : null}
        </ul>

        <p className="mt-4 text-sm font-semibold text-primary">Starting {vehicle.priceFromLabel}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <Button variant="outline" asChild>
            <Link to="/fleet/$slug" params={{ slug: vehicle.slug }}>
              View Details
            </Link>
          </Button>
          {bookable ? (
            <Button asChild>
              <Link to="/contact-us" search={{ vehicle: vehicle.slug, intent: "booking" }}>
                Book Now
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/fleet/$slug" params={{ slug: vehicle.slug }}>
                Enquire
              </Link>
            </Button>
          )}
          <a
            href={waLink(`Hi South Zoom Tourism, I'd like to book the ${vehicle.name}.`)}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Chat on WhatsApp about the ${vehicle.name}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-primary transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
