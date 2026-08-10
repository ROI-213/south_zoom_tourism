import {
  AirVent,
  BatteryCharging,
  Check,
  CircleParking,
  ConciergeBell,
  Dumbbell,
  MapPinned,
  MoveVertical,
  PlaneLanding,
  Presentation,
  ShowerHead,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import { getHotelAmenityGrid } from "@/content/hotel-details";

const icons: Record<string, LucideIcon> = {
  Wifi,
  CircleParking,
  UtensilsCrossed,
  ConciergeBell,
  AirVent,
  ShowerHead,
  Tv,
  BatteryCharging,
  MoveVertical,
  Waves,
  Dumbbell,
  Presentation,
  MapPinned,
  WashingMachine,
  PlaneLanding,
};

export function HotelAmenityGrid({ hotelId }: { hotelId: string }) {
  const amenities = getHotelAmenityGrid(hotelId);
  const availableCount = amenities.filter((a) => a.available).length;

  return (
    <section aria-labelledby="amenities-heading" className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 id="amenities-heading" className="text-lg font-semibold">
        Amenities
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {availableCount} of {amenities.length} facilities available at this property.
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((amenity) => {
          const Icon = icons[amenity.icon] ?? Check;
          return (
            <li
              key={amenity.slug}
              className={`flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                amenity.available ? "text-foreground" : "text-muted-foreground/70"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  amenity.available ? "text-primary" : "text-muted-foreground/50"
                }`}
                aria-hidden="true"
              />
              <span className={`min-w-0 truncate ${amenity.available ? "" : "line-through"}`}>
                {amenity.label}
              </span>
              {amenity.available ? (
                <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <X className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
              )}
              <span className="sr-only">
                {amenity.available ? "Available" : "Not available"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
