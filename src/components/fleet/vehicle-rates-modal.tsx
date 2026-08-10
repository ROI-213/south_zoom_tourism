import { useState } from "react";
import { Users, Briefcase, Snowflake, Fuel, CheckCircle2, MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getVehicleCategoryLabel, type FleetVehicle } from "@/content/fleet";
import { getRateCardConfig } from "@/content/rate-card";
import { waLink } from "@/content/site";

interface VehicleRatesModalProps {
  vehicle: FleetVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleRatesModal({ vehicle, open, onOpenChange }: VehicleRatesModalProps) {
  if (!vehicle) return null;

  const rateConfig = getRateCardConfig();
  const categoryLabel = getVehicleCategoryLabel(vehicle.categorySlug);

  // Calculate starting rates based on config & vehicle rate factor
  const localBase = rateConfig.local.basePrice;
  const outstationMinKm = rateConfig.outstationOneWay.minKm;
  const outstationEstimated = vehicle.pricePerKm * outstationMinKm;

  const whatsappMsg = `Hello South Zoom Tourism, I am interested in booking:

Vehicle: ${vehicle.name}
Category: ${categoryLabel}
Seating: ${vehicle.seats} Seater
Trip Type: Rate Inquiry

Please share the detailed quotation.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-2xl">
        {/* Header Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <img
            src={vehicle.image}
            alt={vehicle.imageAlt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-semibold">
                {categoryLabel}
              </Badge>
              <Badge variant="outline" className="border-white/30 bg-black/40 text-white backdrop-blur-md">
                {vehicle.brand}
              </Badge>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">{vehicle.name}</h2>
            <p className="text-xs text-white/80">{vehicle.model}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 bg-muted/40 p-4 rounded-xl border border-border/50 text-xs">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground font-medium">Seating</p>
                <p className="font-bold text-foreground">{vehicle.seats} Passengers</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground font-medium">Luggage</p>
                <p className="font-bold text-foreground">{vehicle.luggage} Bags</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground font-medium">Climate Control</p>
                <p className="font-bold text-foreground">{vehicle.ac ? "AC" : "Non-AC"}</p>
              </div>
            </div>

            {vehicle.fuel ? (
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-muted-foreground font-medium">Fuel Type</p>
                  <p className="font-bold text-foreground">{vehicle.fuel}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Suitable For */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suitable For</h4>
            <div className="flex flex-wrap gap-2">
              {vehicle.tripTypes.map((type) => (
                <span key={type} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  <CheckCircle2 className="h-3 w-3" />
                  {type === "local" && "Local City Trips (4h/40km & 8h/80km)"}
                  {type === "outstation" && "Outstation One-Way & Round Trips"}
                  {type === "airport" && "Airport Transfers"}
                  {type === "group" && "Group Travel & Events"}
                </span>
              ))}
            </div>
          </div>

          {/* Rates Summary Card */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center justify-between border-b border-border/60 pb-3">
              <span>Transparent Rate Card</span>
              <span className="text-xs font-normal text-muted-foreground">GST Extra</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-background border border-border">
                <span className="text-xs font-medium text-muted-foreground block">LOCAL RENTAL</span>
                <p className="text-xl font-bold text-primary mt-1">₹{localBase.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">Ex per km: ₹{rateConfig.local.extraKmRate}/km · Ex per hour: ₹{rateConfig.local.extraHourRate}/hr</p>
                <p className="text-[11px] text-muted-foreground">Driver allowance: ₹{rateConfig.local.driverAllowance}/day</p>
              </div>

              <div className="p-3.5 rounded-lg bg-background border border-border">
                <span className="text-xs font-medium text-muted-foreground block">OUTSTATION RATE</span>
                <p className="text-xl font-bold text-primary mt-1">₹{vehicle.pricePerKm} <span className="text-xs font-normal text-muted-foreground">/ km</span></p>
                <p className="text-[11px] text-muted-foreground mt-0.5">One-Way Min: {rateConfig.outstationOneWay.minKm} KM</p>
                <p className="text-[11px] text-muted-foreground">Round-Trip Min: {rateConfig.outstationRoundTrip.minKm} KM</p>
              </div>
            </div>
          </div>

          {/* Features Checklist */}
          {vehicle.features && vehicle.features.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Amenities</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground/90">
                {vehicle.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border">
            <Button asChild className="flex-1 font-semibold" size="lg">
              <Link
                to="/contact-us"
                search={{
                  vehicle: vehicle.slug,
                  category: vehicle.categorySlug,
                  intent: "booking",
                }}
                onClick={() => onOpenChange(false)}
              >
                Get Custom Quote
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="flex-1 font-semibold border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
              <a href={waLink(whatsappMsg)} target="_blank" rel="noreferrer noopener">
                <MessageCircle className="mr-2 h-4 w-4 fill-emerald-600/10 text-emerald-600" />
                WhatsApp Inquiry
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
