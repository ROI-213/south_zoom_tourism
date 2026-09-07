import { useState, useEffect } from "react";
import { Users, Briefcase, Snowflake, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { featuredFleet, waLink } from "@/content/site";
import { getFleetVehicles, fetchFleetVehicles, fleetVehicles, getVehicleCategoryLabel, type FleetVehicle } from "@/content/fleet";
import { getFleetFareConfig } from "@/content/fleet-pricing";
import { AutoFareCalculatorModal } from "@/components/fleet/auto-fare-calculator-modal";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { AppLink } from "@/components/common/app-link";

export function FleetSection() {
  function getInitialVehicles(): FleetVehicle[] {
    const all = getFleetVehicles().filter((v) => v.published);
    const featured = all.filter((v) => v.featured);
    return featured.length > 0 ? featured : (all.length > 0 ? all : fleetVehicles);
  }

  const [vehiclesList, setVehiclesList] = useState<FleetVehicle[]>(getInitialVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<FleetVehicle | null>(null);

  function loadVehicles() {
    const all = getFleetVehicles().filter((v) => v.published);
    const featured = all.filter((v) => v.featured);
    setVehiclesList(featured.length > 0 ? featured : (all.length > 0 ? all : fleetVehicles));
  }

  useEffect(() => {
    loadVehicles();
    fetchFleetVehicles().then(() => loadVehicles()).catch(console.error);
    const handleUpdate = () => loadVehicles();
    window.addEventListener("fleetDataUpdated", handleUpdate);
    window.addEventListener("fleetFareSettingsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("fleetDataUpdated", handleUpdate);
      window.removeEventListener("fleetFareSettingsUpdated", handleUpdate);
    };
  }, []);

  if (!featuredFleet.meta.visible) return null;

  return (
    <section id="fleet" className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <SectionHeader meta={featuredFleet.meta} />

      {vehiclesList.length === 0 ? (
        <EmptyState message="No vehicles are featured right now." />
      ) : (
        <ul className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {vehiclesList.map((v) => (
            <li
              key={v.id}
              className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
            >
              {/* Full-bleed Image Box with Lightbox Trigger */}
              <div
                onClick={() => setSelectedVehicle(v)}
                className="relative aspect-[16/10] w-full overflow-hidden bg-white cursor-pointer"
              >
                <img
                  src={typeof v.image === "string" ? v.image : undefined}
                  alt={v.imageAlt || v.name}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Fullscreen hover trigger badge */}
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-1 sm:gap-2 text-white font-medium text-[10px] sm:text-xs backdrop-blur-[2px]">
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">View Full Screen</span>
                </div>
              </div>

              {/* Vehicle Card Body */}
              <div className="flex flex-1 flex-col p-2.5 sm:p-5">
                {(() => {
                  const fare = getFleetFareConfig(v.slug || v.id, v.name);
                  const displayRate = fare?.oneWayRatePerKm || v.pricePerKm || 14;

                  return (
                    <>
                      <div className="flex items-start justify-between gap-1 sm:gap-2">
                        <div className="min-w-0">
                          <AppLink href={`/fleet/${v.slug}`}>
                            <h3 className="text-xs sm:text-base font-bold group-hover:text-primary transition-colors truncate">{v.name}</h3>
                          </AppLink>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{getVehicleCategoryLabel(v.categorySlug)}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-bold text-primary">
                          ₹{displayRate}/km
                        </span>
                      </div>

                      <ul className="mt-2 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-3 text-[9px] sm:text-xs text-muted-foreground border-t border-b border-border/60 py-1.5 sm:py-3">
                        <li className="inline-flex items-center gap-1 font-medium">
                          <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" aria-hidden="true" /> {v.seats}s
                        </li>
                        <li className="inline-flex items-center gap-1 font-medium">
                          <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" aria-hidden="true" /> {v.luggage}b
                        </li>
                        {v.ac ? (
                          <li className="inline-flex items-center gap-1 font-medium">
                            <Snowflake className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" aria-hidden="true" /> AC
                          </li>
                        ) : null}
                      </ul>

                      <div className="mt-2.5 sm:mt-5 flex gap-1.5 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setBookingVehicle(v)}
                          className="h-7 sm:h-8 flex-1 text-[10px] sm:text-xs font-bold px-1 sm:px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-transform active:scale-95 cursor-pointer"
                        >
                          Book Now
                        </Button>
                        <Button asChild size="sm" variant="outline" className="h-7 sm:h-8 flex-1 text-[10px] sm:text-xs font-semibold px-1 sm:px-3 border-emerald-600/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                          <a
                            href={waLink(
                              `Hi South Zoom Tourism, I'd like a quote for the ${v.name} (${getVehicleCategoryLabel(v.categorySlug)}, ${v.seats} seats, ₹${displayRate}/km).`,
                            )}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            WhatsApp
                          </a>
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Auto Fare Calculator / Fleet Booking Enquiry Modal */}
      <AutoFareCalculatorModal
        open={Boolean(bookingVehicle)}
        onOpenChange={(open) => !open && setBookingVehicle(null)}
        initialVehicle={bookingVehicle ?? undefined}
      />

      {/* Full-Screen Image Lightbox Modal */}
      <Dialog open={Boolean(selectedVehicle)} onOpenChange={(open) => !open && setSelectedVehicle(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-none text-white overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedVehicle?.name ?? "Vehicle Preview"}
          </DialogTitle>
          <div className="relative flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-2 right-2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors z-20"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            {selectedVehicle ? (
              <div className="flex flex-col items-center">
                <img
                  src={typeof selectedVehicle.image === "string" ? selectedVehicle.image : undefined}
                  alt={selectedVehicle.imageAlt || selectedVehicle.name}
                  className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
                />
                <h4 className="mt-3 text-lg font-bold text-white text-center">{selectedVehicle.name}</h4>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <ViewAllMobile meta={featuredFleet.meta} />
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}
