import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Calculator, Plus, Minus, Info, ShieldAlert, CheckCircle2, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getRateCardConfig, calculateLocalTripFare, type RateCardConfig } from "@/content/rate-card";
import { AdminRateManagementDialog } from "@/components/admin/rate-management-dialog";
import { BookingPoliciesCard } from "@/components/common/booking-policies";

export function RateCardSection() {
  const [config, setConfig] = useState<RateCardConfig>(getRateCardConfig());
  const [adminOpen, setAdminOpen] = useState(false);

  // Local calculator state
  const [calcHours, setCalcHours] = useState(4);
  const [calcKm, setCalcKm] = useState(40);

  useEffect(() => {
    const handleUpdate = () => setConfig(getRateCardConfig());
    window.addEventListener("rateCardConfigUpdated", handleUpdate);
    return () => window.removeEventListener("rateCardConfigUpdated", handleUpdate);
  }, []);

  const fareBreakdown = calculateLocalTripFare(calcHours, calcKm, config.local);

  return (
    <section id="rate-card" className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
            Transparent Pricing
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Fleet Rate Cards & Package Fares
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Clear, upfront rate cards for local city use and outstation journeys. No hidden surprises.
          </p>
        </div>

        {/* Admin Rate Edit Button Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdminOpen(true)}
          className="self-start sm:self-auto gap-2 text-xs font-semibold border-dashed text-muted-foreground hover:text-primary"
        >
          <Settings className="h-3.5 w-3.5" />
          Edit Rate Cards (Admin)
        </Button>
      </div>

      {/* Main Rate Card Tabs */}
      <Tabs defaultValue="local" className="mt-8">
        <div className="overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-3 max-w-xl h-12 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="local" className="rounded-lg font-bold text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              LOCAL USE
            </TabsTrigger>
            <TabsTrigger value="airport" className="rounded-lg font-bold text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              AIRPORT TRANSFER
            </TabsTrigger>
            <TabsTrigger value="outstation" className="rounded-lg font-bold text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              OUTSTATION
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ---------------- AIRPORT TRANSFER TAB ---------------- */}
        <TabsContent value="airport" className="mt-6 space-y-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Airport Base Package</span>
                    <h3 className="text-xl sm:text-2xl font-bold mt-1">
                      {config.airport?.baseHours || 3} Hours × {config.airport?.baseKm || 30} KM
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-primary">
                      ₹{(config.airport?.basePrice || 1100).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground block">Base Fare</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground border-t border-border/60 pt-3">
                  Includes airport pickup/drop vehicle, fuel, and initial {config.airport?.baseHours || 3} hours / {config.airport?.baseKm || 30} km usage.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <h4 className="text-sm font-bold text-foreground">Airport Transfer Extra Rates</h4>
                </div>
                <div className="divide-y divide-border text-sm">
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground font-medium">Ex per km</span>
                    <span className="font-bold text-foreground">₹{config.airport?.extraKmRate || 28}/- per KM</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground font-medium">Ex per hour</span>
                    <span className="font-bold text-foreground">₹{config.airport?.extraHourRate || 200}/- per Hour</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground font-medium">Toll & Parking</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">Extra at actuals</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center rounded-2xl border border-border bg-card p-6 shadow-md">
              <h3 className="font-bold text-base mb-2">Need Airport Pickup or Drop?</h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Flight tracking included on all pickups. Drivers wait up to 60 minutes free of charge in case of flight delays.
              </p>
              <Button asChild size="lg" className="w-full font-bold">
                <Link to="/contact-us" search={{ intent: "booking", tripType: "airport" }}>
                  Book Airport Transfer Now →
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ---------------- LOCAL USE TAB ---------------- */}
        <TabsContent value="local" className="mt-6 space-y-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Local Base Package & Additional Charges Table */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Base Package Highlight Box */}
              <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Base Package</span>
                    <h3 className="text-xl sm:text-2xl font-bold mt-1">
                      {config.local.baseHours} Hours × {config.local.baseKm} KM
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-primary">
                      ₹{config.local.basePrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground block">Base Fare</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground border-t border-border/60 pt-3">
                  Includes vehicle, fuel, driver charges and initial {config.local.baseHours} hours / {config.local.baseKm} km usage within city limits.
                </p>
              </div>

              {/* Additional Charges Table */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <h4 className="text-sm font-bold text-foreground">Local Additional Usage Rates</h4>
                </div>
                <div className="divide-y divide-border text-sm">
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground font-medium">Ex per km</span>
                    <span className="font-bold text-foreground">₹{config.local.extraKmRate}/- per KM</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground font-medium">Ex per hour</span>
                    <span className="font-bold text-foreground">₹{config.local.extraHourRate}/- per Hour</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground font-medium">Driver allowance</span>
                    <span className="font-bold text-foreground">₹{config.local.driverAllowance}/-</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground font-medium">Toll</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{config.local.tollPolicy}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground font-medium">Parking</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{config.local.parkingPolicy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Local Interactive Calculator */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-md relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Local Rental Calculator</h3>
                    <p className="text-xs text-muted-foreground">Estimate your total fare instantly</p>
                  </div>
                </div>

                {/* Duration Stepper */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" /> Trip Duration
                      </span>
                      <span className="text-primary font-bold text-sm">{calcHours} Hours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setCalcHours((h) => Math.max(1, h - 1))}
                        disabled={calcHours <= 1}
                        className="h-9 w-9 shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                        type="range"
                        min={1}
                        max={24}
                        value={calcHours}
                        onChange={(e) => setCalcHours(Number(e.target.value))}
                        className="flex-1 accent-primary h-2 rounded-lg bg-muted cursor-pointer"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setCalcHours((h) => Math.min(24, h + 1))}
                        className="h-9 w-9 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Distance Stepper */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> Expected Distance
                      </span>
                      <span className="text-primary font-bold text-sm">{calcKm} KM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setCalcKm((k) => Math.max(10, k - 10))}
                        disabled={calcKm <= 10}
                        className="h-9 w-9 shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                        type="range"
                        min={10}
                        max={300}
                        step={5}
                        value={calcKm}
                        onChange={(e) => setCalcKm(Number(e.target.value))}
                        className="flex-1 accent-primary h-2 rounded-lg bg-muted cursor-pointer"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setCalcKm((k) => Math.min(300, k + 10))}
                        className="h-9 w-9 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Fare Calculation Breakdown */}
                <div className="mt-6 pt-4 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Package Fare</span>
                    <span className="font-semibold">₹{fareBreakdown.basePrice.toLocaleString()}</span>
                  </div>
                  {fareBreakdown.extraKm > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extra KM ({fareBreakdown.extraKm} km × ₹{config.local.extraKmRate})</span>
                      <span className="font-semibold text-emerald-600">+₹{fareBreakdown.extraKmCost}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extra KM</span>
                      <span className="font-semibold text-muted-foreground">₹0</span>
                    </div>
                  )}

                  {fareBreakdown.extraHours > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extra Hours ({fareBreakdown.extraHours} hrs × ₹{config.local.extraHourRate})</span>
                      <span className="font-semibold text-emerald-600">+₹{fareBreakdown.extraHoursCost}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extra Hours</span>
                      <span className="font-semibold text-muted-foreground">₹0</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver Allowance</span>
                    <span className="font-semibold">₹{fareBreakdown.driverAllowance}</span>
                  </div>
                </div>

                {/* Total Estimate */}
                <div className="mt-5 pt-4 border-t-2 border-primary/20 flex items-center justify-between bg-primary/5 p-4 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground block uppercase">Estimated Total</span>
                    <p className="text-2xl font-extrabold text-primary">₹{fareBreakdown.estimatedTotal.toLocaleString()}*</p>
                  </div>
                  <Button asChild size="sm" className="font-semibold gap-1">
                    <Link to="/contact-us" search={{ intent: "booking", tripType: "local" }}>
                      Get Quote <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground italic text-center">
                  *Toll, parking and GST are extra as applicable.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ---------------- OUTSTATION TAB ---------------- */}
        <TabsContent value="outstation" className="mt-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ONE WAY TRIP CARD */}
            <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-md flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div>
                    <Badge variant="default" className="mb-1">OUTSTATION</Badge>
                    <h3 className="text-xl font-bold text-foreground">ONE WAY TRIP</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Minimum Distance</span>
                    <span className="text-lg font-extrabold text-primary">{config.outstationOneWay.minKm} KM</span>
                  </div>
                </div>

                <ul className="divide-y divide-border text-sm space-y-3">
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Extra KM</span>
                    <span className="font-bold text-foreground">₹{config.outstationOneWay.extraKmRate}/- per KM</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Extra Hours</span>
                    <span className="font-bold text-foreground">₹{config.outstationOneWay.extraHourRate}/- per Hour</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Toll</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      ₹{config.outstationOneWay.toll.toLocaleString()}/-*
                    </span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">State Tax</span>
                    <span className="font-bold text-foreground">₹{config.outstationOneWay.stateTax.toLocaleString()}/-</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Driver Allowance</span>
                    <span className="font-bold text-foreground">₹{config.outstationOneWay.driverAllowance}/-</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Hill Charges</span>
                    <span className="font-bold text-foreground">₹{config.outstationOneWay.hillCharges}/-</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-border">
                <Button asChild size="lg" className="w-full font-bold">
                  <Link to="/contact-us" search={{ intent: "booking", tripType: "one-way" }}>
                    Get One-Way Quote →
                  </Link>
                </Button>
              </div>
            </div>

            {/* ROUND TRIP CARD */}
            <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-md flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div>
                    <Badge variant="secondary" className="mb-1">OUTSTATION</Badge>
                    <h3 className="text-xl font-bold text-foreground">ROUND TRIP</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Minimum Distance</span>
                    <span className="text-lg font-extrabold text-primary">{config.outstationRoundTrip.minKm} KM</span>
                  </div>
                </div>

                <ul className="divide-y divide-border text-sm space-y-3">
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Extra KM</span>
                    <span className="font-bold text-foreground">₹{config.outstationRoundTrip.extraKmRate}/- per KM</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Per Day</span>
                    <span className="font-bold text-primary">{config.outstationRoundTrip.perDayRate}</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Toll</span>
                    <span className="font-bold text-foreground">₹{config.outstationRoundTrip.toll.toLocaleString()}/-</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">State Tax</span>
                    <span className="font-bold text-foreground">₹{config.outstationRoundTrip.stateTax.toLocaleString()}/-</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Driver Allowance</span>
                    <span className="font-bold text-muted-foreground">{config.outstationRoundTrip.driverAllowance}</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="text-muted-foreground font-medium">Hill Charges</span>
                    <span className="font-bold text-foreground">₹{config.outstationRoundTrip.hillCharges}/-</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-border">
                <Button asChild size="lg" variant="outline" className="w-full font-bold border-primary text-primary hover:bg-primary hover:text-white">
                  <Link to="/contact-us" search={{ intent: "booking", tripType: "round-trip" }}>
                    Get Round Trip Quote →
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>

      {/* ---------------- MANDATORY TRIP POLICIES ---------------- */}
      <BookingPoliciesCard className="mt-8" />

      {/* ---------------- RATE CARD DISCLAIMER ---------------- */}
      <div className="mt-12 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-base">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <h3>{config.disclaimer.gstNotice}</h3>
        </div>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground pl-7 list-disc">
          <li>{config.disclaimer.additionalChargesNotice}</li>
          <li>{config.disclaimer.variationNotice}</li>
          <li className="font-medium text-foreground">{config.disclaimer.quoteConfirmationNotice}</li>
        </ul>
      </div>

      {/* Admin Rate Edit Modal */}
      <AdminRateManagementDialog
        open={adminOpen}
        onOpenChange={setAdminOpen}
        onSave={() => setConfig(getRateCardConfig())}
      />
    </section>
  );
}
