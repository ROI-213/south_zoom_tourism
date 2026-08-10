import { CalendarClock, Car, LogIn, LogOut, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HotelRecord } from "@/content/hotels";
import type { HotelProfile } from "@/content/hotel-details";

export function HotelOverviewPanel({
  hotel,
  profile,
}: {
  hotel: HotelRecord;
  profile: HotelProfile | undefined;
}) {
  const overview = profile?.overview?.length ? profile.overview : [hotel.shortDescription];

  return (
    <section aria-labelledby="overview-heading" className="space-y-4">
      <h2 id="overview-heading" className="text-lg font-semibold">
        About this property
      </h2>

      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {overview.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Check-in & check-out
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                <LogIn className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Check-in
              </dt>
              <dd className="text-right font-medium">{profile?.checkInTime ?? "1:00 PM"}</dd>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Check-out
              </dt>
              <dd className="text-right font-medium">{profile?.checkOutTime ?? "11:00 AM"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Suits these travellers
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(profile?.travellerTypes ?? ["All travellers"]).map((type) => (
              <li key={type}>
                <Badge variant="secondary">{type}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {profile && profile.distances.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Car className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Distance from major locations
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {profile.distances.map((item) => (
              <li
                key={item.id}
                className="flex min-w-0 items-baseline justify-between gap-3 border-b border-dashed border-border pb-1.5 text-sm last:border-0"
              >
                <span className="min-w-0 break-words text-muted-foreground">{item.label}</span>
                <span className="shrink-0 text-right font-medium">
                  {item.km} km
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ~{item.driveMinutes} min
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
