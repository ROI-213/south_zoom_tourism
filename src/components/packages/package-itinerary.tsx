import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Route as RouteIcon, BedDouble, UtensilsCrossed } from "lucide-react";
import type { ItineraryDay } from "@/content/package-details";

/** Day-wise vertical itinerary. Collapsed by default on mobile, open on desktop. */
export function PackageItinerary({ days }: { days: ItineraryDay[] }) {
  const ordered = [...days].sort((a, b) => a.order - b.order);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const next: Record<string, boolean> = {};
    ordered.forEach((day, index) => {
      next[day.id] = isDesktop || index === 0;
    });
    setOpen(next);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  if (!ordered.length) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        The day-by-day plan is being finalised. Send an enquiry and we will share it the same day.
      </p>
    );
  }

  const allOpen = ordered.every((d) => open[d.id]);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-medium text-primary underline underline-offset-4"
          onClick={() =>
            setOpen(Object.fromEntries(ordered.map((d) => [d.id, !allOpen])))
          }
        >
          {allOpen ? "Collapse all days" : "Expand all days"}
        </button>
      </div>

      <ol className="mt-3 space-y-3">
        {ordered.map((day) => {
          const isOpen = ready ? Boolean(open[day.id]) : true;
          const panelId = `${day.id}-panel`;
          return (
            <li key={day.id} className="relative rounded-xl border border-border bg-card">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen((prev) => ({ ...prev, [day.id]: !prev[day.id] }))}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {day.day}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold sm:text-base">{day.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {day.route}
                      {day.distanceKm > 0 ? ` · approx ${day.distanceKm} km` : ""}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`mt-1 size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </h3>

              <div id={panelId} hidden={!isOpen} className="border-t border-border p-4 pt-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="min-w-0 space-y-3 text-sm">
                    {day.activities.length ? (
                      <div>
                        <p className="font-medium">Activities</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                          {day.activities.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {day.sightseeing.length ? (
                      <div>
                        <p className="flex items-center gap-1.5 font-medium">
                          <MapPin className="size-4 text-primary" aria-hidden="true" /> Sightseeing
                        </p>
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {day.sightseeing.map((item) => (
                            <li
                              key={item}
                              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <dl className="grid gap-2 text-xs sm:grid-cols-3">
                      <div className="rounded-lg bg-muted/60 p-2">
                        <dt className="flex items-center gap-1 font-medium">
                          <BedDouble className="size-3.5 text-primary" aria-hidden="true" /> Stay
                        </dt>
                        <dd className="mt-0.5 text-muted-foreground">{day.hotel}</dd>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2">
                        <dt className="flex items-center gap-1 font-medium">
                          <UtensilsCrossed className="size-3.5 text-primary" aria-hidden="true" /> Meals
                        </dt>
                        <dd className="mt-0.5 text-muted-foreground">{day.meals}</dd>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2">
                        <dt className="flex items-center gap-1 font-medium">
                          <RouteIcon className="size-3.5 text-primary" aria-hidden="true" /> Distance
                        </dt>
                        <dd className="mt-0.5 text-muted-foreground">
                          {day.distanceKm > 0 ? `${day.distanceKm} km approx` : "Local travel"}
                        </dd>
                      </div>
                    </dl>

                    {day.notes ? (
                      <p className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
                        <span className="font-medium">Note: </span>
                        {day.notes}
                      </p>
                    ) : null}
                  </div>

                  {day.image ? (
                    <img
                      src={day.image}
                      alt={day.imageAlt ?? `${day.title} on day ${day.day}`}
                      width={440}
                      height={300}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
