import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Users, Briefcase, Snowflake, Maximize2, X, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getVehicleCategoryLabel, type FleetVehicle } from "@/content/fleet";
import { getFleetFareConfig, getFleetFareSettings, type FleetFareConfig } from "@/content/fleet-pricing";
import { AutoFareCalculatorModal } from "@/components/fleet/auto-fare-calculator-modal";
import { waLink } from "@/content/site";

export function VehicleCard({
  vehicle,
  priority = false,
}: {
  vehicle: FleetVehicle;
  priority?: boolean;
}) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [fareConfig, setFareConfig] = useState<FleetFareConfig>(() => getFleetFareConfig(vehicle.id));

  useEffect(() => {
    const handleUpdate = () => {
      setFareConfig(getFleetFareConfig(vehicle.id));
    };
    window.addEventListener("fleetFareSettingsUpdated", handleUpdate);
    return () => window.removeEventListener("fleetFareSettingsUpdated", handleUpdate);
  }, [vehicle.id]);

  const displayRate = fareConfig?.oneWayRatePerKm ?? vehicle.pricePerKm;

  return (
    <>
      <article
        className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
      >
        {/* Full-bleed Image Box with Lightbox Trigger */}
        <div
          onClick={() => setShowLightbox(true)}
          className="relative aspect-[16/10] w-full overflow-hidden bg-white cursor-pointer"
        >
          <img
            src={vehicle.image}
            alt={vehicle.imageAlt}
            width={1920}
            height={1080}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
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
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="min-w-0">
              <Link to="/fleet/$slug" params={{ slug: vehicle.slug }}>
                <h3 className="text-xs sm:text-base font-bold group-hover:text-primary transition-colors truncate">{vehicle.name}</h3>
              </Link>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{getVehicleCategoryLabel(vehicle.categorySlug)}</p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-bold text-primary">
              ₹{displayRate}/km
            </span>
          </div>

          <ul className="mt-2 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-3 text-[9px] sm:text-xs text-muted-foreground border-t border-b border-border/60 py-1.5 sm:py-3">
            <li className="inline-flex items-center gap-1 font-medium">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" aria-hidden="true" /> {vehicle.seats}s
            </li>
            <li className="inline-flex items-center gap-1 font-medium">
              <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" aria-hidden="true" /> {vehicle.luggage}b
            </li>
            {vehicle.ac ? (
              <li className="inline-flex items-center gap-1 font-medium">
                <Snowflake className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" aria-hidden="true" /> AC
              </li>
            ) : null}
          </ul>

          <div className="mt-2.5 sm:mt-4 flex gap-1.5 pt-1">
            <Button
              type="button"
              size="sm"
              onClick={() => setShowCalculator(true)}
              className="h-8 flex-1 text-xs font-bold px-2 sm:px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-transform active:scale-95"
            >
              Book Now
            </Button>
            <Button asChild size="sm" variant="outline" className="h-8 flex-1 text-xs font-semibold px-2 sm:px-3 border-emerald-600/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
              <a
                href={waLink(
                  `Hi South Zoom Tourism, I'd like a quote for the ${vehicle.name} (${getVehicleCategoryLabel(vehicle.categorySlug)}, ${vehicle.seats} seats, ₹${displayRate}/km).`,
                )}
                target="_blank"
                rel="noreferrer noopener"
              >
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </article>

      {/* Auto Fare Calculator Modal */}
      <AutoFareCalculatorModal
        open={showCalculator}
        onOpenChange={setShowCalculator}
        initialVehicle={vehicle}
      />

      {/* Full-Screen Image Lightbox Modal */}
      <Dialog open={showLightbox} onOpenChange={(open) => !open && setShowLightbox(false)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-none text-white overflow-hidden">
          <DialogTitle className="sr-only">
            {vehicle.name ?? "Vehicle Preview"}
          </DialogTitle>
          <div className="relative flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-2 right-2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors z-20"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center">
              <img
                src={vehicle.image}
                alt={vehicle.imageAlt}
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
              />
              <h4 className="mt-3 text-lg font-bold text-white text-center">{vehicle.name}</h4>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
