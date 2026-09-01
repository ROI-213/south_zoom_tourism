import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Calculator,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeftRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Car,
  ChevronDown,
  Info,
  ShieldCheck,
  CreditCard,
  QrCode,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPublishedVehicles, type FleetVehicle } from "@/content/fleet";
import {
  getFleetFareSettings,
  getFleetFareConfig,
  calculateFleetFare,
  logFareCalculation,
  formatWhatsAppQuoteMessage,
  type FleetFareConfig,
  type FareCalculationResult,
} from "@/content/fleet-pricing";
import { calculateRoadRoute, type RouteCalculationResult } from "@/lib/routing-service";
import { searchLocationsOnline, type LocationSuggestion } from "@/lib/location-autocomplete";
import { company, waLink } from "@/content/site";
import { registerVehicleBooking } from "@/content/customer-data";
import { getLatestTravelSearch, saveLatestTravelSearch } from "@/lib/search-storage";
import { toast } from "sonner";

export type AutoFareCalculatorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVehicle?: FleetVehicle;
  initialTripType?: "one-way" | "round-trip";
  onProceedToBooking?: (calc: FareCalculationResult) => void;
};

export function AutoFareCalculatorModal({
  open,
  onOpenChange,
  initialVehicle,
  initialTripType = "one-way",
  onProceedToBooking,
}: AutoFareCalculatorProps) {
  const navigate = useNavigate();
  const [fleetDataVersion, setFleetDataVersion] = useState(0);
  const publishedVehicles = useMemo(() => getPublishedVehicles(), [fleetDataVersion]);
  const [fareSettings, setFareSettings] = useState<FleetFareConfig[]>(getFleetFareSettings());

  // Listen for admin rate updates live
  useEffect(() => {
    const handleFareUpdate = () => setFareSettings(getFleetFareSettings());
    const handleDataUpdate = () => {
      setFareSettings(getFleetFareSettings());
      setFleetDataVersion((v) => v + 1);
      setSelectedVehicleSlug((current) => {
        const vehicles = getPublishedVehicles();
        return vehicles.some((v) => v.slug === current) ? current : vehicles[0]?.slug || current;
      });
    };
    window.addEventListener("fleetFareSettingsUpdated", handleFareUpdate);
    window.addEventListener("fleetDataUpdated", handleDataUpdate);
    return () => {
      window.removeEventListener("fleetFareSettingsUpdated", handleFareUpdate);
      window.removeEventListener("fleetDataUpdated", handleDataUpdate);
    };
  }, []);

  const savedSearch = getLatestTravelSearch();

  // Form states
  const [selectedVehicleSlug, setSelectedVehicleSlug] = useState<string>(() => {
    if (initialVehicle?.slug) return initialVehicle.slug;
    if (savedSearch.vehicleType?.includes("WagonR") || savedSearch.vehicleType?.includes("Hatchback")) {
      return "hatchback-wagonr";
    }
    return publishedVehicles[0]?.slug || "hatchback-wagonr";
  });
  const [tripType, setTripType] = useState<"one-way" | "round-trip">(
    initialTripType || (savedSearch.tripType?.toLowerCase().includes("round") ? "round-trip" : "one-way"),
  );

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [pickup, setPickup] = useState<string>(savedSearch.pickupCity || "Bengaluru");
  const [destination, setDestination] = useState<string>(savedSearch.dropCity || "Mysuru");
  const [pickupDate, setPickupDate] = useState<string>(savedSearch.pickupDate || today);
  const [pickupTime, setPickupTime] = useState<string>(savedSearch.pickupTime || "08:00");
  const [returnDate, setReturnDate] = useState<string>(savedSearch.returnDate || tomorrow);
  const [returnTime, setReturnTime] = useState<string>(savedSearch.returnTime || "20:00");

  // Re-sync with latest travel search whenever modal is opened
  useEffect(() => {
    if (open) {
      const s = getLatestTravelSearch();
      if (s.pickupCity) setPickup(s.pickupCity);
      if (s.dropCity) setDestination(s.dropCity);
      if (s.pickupDate) setPickupDate(s.pickupDate);
      if (s.pickupTime) setPickupTime(s.pickupTime);
      if (s.returnDate) setReturnDate(s.returnDate);
      if (s.returnTime) setReturnTime(s.returnTime);
      if (initialVehicle?.slug) {
        setSelectedVehicleSlug(initialVehicle.slug);
      }
    }
  }, [open, initialVehicle]);

  useEffect(() => {
    if (initialVehicle?.slug) {
      setSelectedVehicleSlug(initialVehicle.slug);
    }
  }, [initialVehicle?.slug]);

  // Autocomplete UI states
  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [destSuggestions, setDestSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Routing and Calculation States
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeData, setRouteData] = useState<RouteCalculationResult | null>(null);
  const [fareResult, setFareResult] = useState<FareCalculationResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const routeAbortControllerRef = useRef<AbortController | null>(null);

  // Selected vehicle object & its active fare configuration
  const currentVehicle = useMemo(() => {
    return (
      publishedVehicles.find((v) => v.slug === selectedVehicleSlug) || publishedVehicles[0]
    );
  }, [publishedVehicles, selectedVehicleSlug]);

  const currentFareConfig = useMemo(() => {
    if (!currentVehicle) return getFleetFareConfig("fv-hatchback");
    return (
      fareSettings.find(
        (f) => f.fleetId === currentVehicle.id || f.vehicleSlug === currentVehicle.slug,
      ) || getFleetFareConfig(currentVehicle.id)
    );
  }, [fareSettings, currentVehicle]);

  // Trigger Road Route Calculation whenever locations change
  useEffect(() => {
    if (!open) return;
    if (!pickup.trim() || !destination.trim()) {
      setRouteData(null);
      setFareResult(null);
      return;
    }

    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setRouteError("Pickup and destination locations cannot be the same.");
      setRouteData(null);
      setFareResult(null);
      return;
    }

    setRouteError(null);
    setIsCalculatingRoute(true);

    if (routeAbortControllerRef.current) {
      routeAbortControllerRef.current.abort();
    }
    const abortCtrl = new AbortController();
    routeAbortControllerRef.current = abortCtrl;

    const timer = setTimeout(async () => {
      try {
        const result = await calculateRoadRoute(pickup.trim(), destination.trim(), abortCtrl.signal);
        setRouteData(result);
        setIsCalculatingRoute(false);
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("Route calculation error:", err);
          setIsCalculatingRoute(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      abortCtrl.abort();
    };
  }, [pickup, destination, open]);

  // Compute exact fare result whenever route, vehicle, dates, or trip type changes
  useEffect(() => {
    if (!routeData || !currentFareConfig) {
      setFareResult(null);
      return;
    }

    const calc = calculateFleetFare({
      fleetId: currentFareConfig.fleetId,
      tripType,
      pickup: routeData.pickupLocation,
      destination: routeData.destinationLocation,
      pickupDate,
      pickupTime,
      returnDate: tripType === "round-trip" ? returnDate : undefined,
      returnTime: tripType === "round-trip" ? returnTime : undefined,
      routeDistanceKm: routeData.distanceKm,
      routeDuration: routeData.durationText,
      estimatedTollAmount: routeData.estimatedToll,
      isInterstate: routeData.isInterstate,
    });

    setFareResult(calc);
  }, [
    routeData,
    currentFareConfig,
    tripType,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
  ]);

  // Search pickup suggestions
  const handlePickupChange = async (val: string) => {
    setPickup(val);
    saveLatestTravelSearch({ pickupCity: val });
    if (val.length >= 1) {
      const suggestions = await searchLocationsOnline(val);
      setPickupSuggestions(suggestions);
      setShowPickupSuggestions(true);
    } else {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    }
  };

  // Search destination suggestions
  const handleDestChange = async (val: string) => {
    setDestination(val);
    saveLatestTravelSearch({ dropCity: val });
    if (val.length >= 1) {
      const suggestions = await searchLocationsOnline(val);
      setDestSuggestions(suggestions);
      setShowDestSuggestions(true);
    } else {
      setDestSuggestions([]);
      setShowDestSuggestions(false);
    }
  };

  const swapLocations = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
    saveLatestTravelSearch({ pickupCity: destination, dropCity: temp });
  };

  // Action: Pay 15% Advance
  const handlePayAdvance = () => {
    if (!fareResult || !currentVehicle) return;

    logFareCalculation(fareResult, { source: "calculator_pay_advance" });

    const ref = `SZT-BK-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const advanceAmount = Math.round(fareResult.totalEstimatedFare * 0.15);
    const balanceToDriver = fareResult.totalEstimatedFare - advanceAmount;

    registerVehicleBooking({
      reference: ref,
      vehicleName: currentVehicle.name,
      vehicleSubtitle: `${currentVehicle.brand} ${currentVehicle.model}`,
      vehicleHref: `/fleet/${currentVehicle.slug}`,
      customerName: "Website Guest",
      phone: "+91 6366357757",
      email: null,
      pickup,
      destination,
      pickupDate,
      pickupTime,
      returnDate: tripType === "round-trip" ? returnDate : null,
      passengers: currentVehicle.seats,
      tripType: tripType === "one-way" ? "Outstation One Way" : "Outstation Round Trip",
      notes: `15% Advance Payment (₹${advanceAmount.toLocaleString("en-IN")}) initiated. Total Quoted Fare: ₹${fareResult.totalEstimatedFare.toLocaleString("en-IN")}, Balance to driver: ₹${balanceToDriver.toLocaleString("en-IN")}`,
    });

    saveLatestTravelSearch({
      pickupCity: pickup,
      dropCity: destination,
      pickupDate,
      pickupTime,
      returnDate: tripType === "round-trip" ? returnDate : undefined,
      tripType: tripType === "one-way" ? "One Way" : "Round Trip",
      vehicleType: currentVehicle.name,
    });

    onOpenChange(false);

    // Navigate to QR payment page with pre-filled 15% advance amount and booking reference
    navigate({
      to: "/qr-payment",
      search: {
        booking: ref,
        amount: String(advanceAmount),
        name: "Guest",
        phone: "6366357757",
      },
    });

    toast.success("Proceeding to 15% Advance Payment", {
      description: `Paying ₹${advanceAmount.toLocaleString("en-IN")} advance for ${currentVehicle.name}. Scan UPI QR code to complete.`,
    });
  };

  // Action: Book Now (Registers request, opens WhatsApp quote, and navigates to the booking details page)
  const handleBookNow = () => {
    if (!fareResult || !currentVehicle) return;

    // Log the calculation for Admin records
    logFareCalculation(fareResult, { source: "calculator_book_now" });

    const advanceAmount = Math.round(fareResult.totalEstimatedFare * 0.15);
    const balanceToDriver = fareResult.totalEstimatedFare - advanceAmount;

    // Generate vehicle booking request
    const ref = `SZT-BK-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    registerVehicleBooking({
      reference: ref,
      vehicleName: currentVehicle.name,
      vehicleSubtitle: `${currentVehicle.brand} ${currentVehicle.model}`,
      vehicleHref: `/fleet/${currentVehicle.slug}`,
      customerName: "Website Guest",
      phone: "+91 6366357757",
      email: null,
      pickup,
      destination,
      pickupDate,
      pickupTime,
      returnDate: tripType === "round-trip" ? returnDate : null,
      passengers: currentVehicle.seats,
      tripType: tripType === "one-way" ? "Outstation One Way" : "Outstation Round Trip",
      notes: `Quoted Estimated Fare: ₹${fareResult.totalEstimatedFare.toLocaleString("en-IN")} (${fareResult.billableDistanceKm} km @ ₹${fareResult.ratePerKm}/km). 15% Advance: ₹${advanceAmount.toLocaleString("en-IN")}, Balance to driver: ₹${balanceToDriver.toLocaleString("en-IN")}`,
    });

    saveLatestTravelSearch({
      pickupCity: pickup,
      dropCity: destination,
      pickupDate,
      pickupTime,
      returnDate: tripType === "round-trip" ? returnDate : undefined,
      tripType: tripType === "one-way" ? "One Way" : "Round Trip",
      vehicleType: currentVehicle.name,
    });

    if (onProceedToBooking) {
      onProceedToBooking(fareResult);
    }

    toast.success("Booking Request Prepared!", {
      description: `Quoted ₹${fareResult.totalEstimatedFare.toLocaleString("en-IN")} (15% Advance: ₹${advanceAmount.toLocaleString("en-IN")}) for ${currentVehicle.name}. Opening WhatsApp and booking section.`,
    });

    // Open WhatsApp with complete formatted quote
    const message = formatWhatsAppQuoteMessage(fareResult);
    window.open(waLink(message), "_blank", "noopener,noreferrer");

    onOpenChange(false);

    // Navigate to the vehicle detail booking form section so the next page opens immediately
    navigate({
      to: "/fleet/$slug",
      params: { slug: currentVehicle.slug },
    });

    setTimeout(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  };

  // Action: WhatsApp Quote
  const handleWhatsAppQuote = () => {
    if (!fareResult) return;
    logFareCalculation(fareResult, { source: "whatsapp_quote" });
    const message = formatWhatsAppQuoteMessage(fareResult);
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card border-border">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Auto Fare Calculator
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Dynamic distance-based billing for every fleet with transparent breakdown
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px] font-bold border-primary/40 text-primary bg-primary/5">
              Live Fare Engine
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* VEHICLE SELECTOR & LIVE RATE HEADER */}
          <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-white p-1">
                  <img
                    src={currentVehicle?.image}
                    alt={currentVehicle?.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Selected Vehicle
                  </span>
                  <div className="relative mt-0.5">
                    <select
                      value={selectedVehicleSlug}
                      onChange={(e) => setSelectedVehicleSlug(e.target.value)}
                      className="text-sm font-bold bg-transparent pr-7 py-0.5 border-b border-dashed border-primary text-foreground focus:outline-none cursor-pointer"
                    >
                      {publishedVehicles.map((v) => (
                        <option key={v.slug} value={v.slug} className="bg-card text-foreground">
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {currentVehicle?.seats} Seats · {currentVehicle?.luggage} Bags · {currentVehicle?.ac ? "AC" : "Non-AC"}
                  </p>
                </div>
              </div>

              {/* Rates Display */}
              <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-center bg-card/80 p-2.5 rounded-xl border border-border">
                <div className="text-center px-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">One Way Rate</span>
                  <span className="text-sm font-extrabold text-primary">
                    ₹{currentFareConfig.oneWayRatePerKm}
                    <span className="text-[10px] font-normal">/km</span>
                  </span>
                </div>
                <div className="h-7 w-[1px] bg-border" />
                <div className="text-center px-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Round Trip Rate</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{currentFareConfig.roundTripRatePerKm}
                    <span className="text-[10px] font-normal">/km</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TRIP TYPE SELECTION TABS */}
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Select Trip Type
            </Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl max-w-md">
              <button
                type="button"
                onClick={() => setTripType("one-way")}
                className={`py-2 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                  tripType === "one-way"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowRight className="h-4 w-4" />
                ONE WAY TRIP
              </button>
              <button
                type="button"
                onClick={() => setTripType("round-trip")}
                className={`py-2 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                  tripType === "round-trip"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowLeftRight className="h-4 w-4" />
                ROUND TRIP
              </button>
            </div>
          </div>

          {/* LOCATION INPUTS WITH AUTOCOMPLETE */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] items-center relative">
            {/* Pickup Location */}
            <div className="relative">
              <Label className="text-xs font-semibold mb-1 block">Pickup Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                <Input
                  value={pickup}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  onFocus={() => {
                    if (pickup.length >= 1) handlePickupChange(pickup);
                  }}
                  placeholder="Enter pickup city or location"
                  className="pl-9 pr-3 text-xs sm:text-sm"
                />
              </div>

              {/* Pickup Suggestions Dropdown */}
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden divide-y divide-border/60 max-h-56 overflow-y-auto">
                  {pickupSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setPickup(s.name);
                        setShowPickupSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold text-foreground">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">{s.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={swapLocations}
              title="Swap Locations"
              className="hidden sm:flex mt-5 h-9 w-9 shrink-0 rounded-full border-border hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            {/* Destination Location */}
            <div className="relative">
              <Label className="text-xs font-semibold mb-1 block">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                <Input
                  value={destination}
                  onChange={(e) => handleDestChange(e.target.value)}
                  onFocus={() => {
                    if (destination.length >= 1) handleDestChange(destination);
                  }}
                  placeholder="Enter destination city or location"
                  className="pl-9 pr-3 text-xs sm:text-sm"
                />
              </div>

              {/* Destination Suggestions Dropdown */}
              {showDestSuggestions && destSuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden divide-y divide-border/60 max-h-56 overflow-y-auto">
                  {destSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setDestination(s.name);
                        setShowDestSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold text-foreground">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">{s.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DATES & TIMINGS */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs font-semibold mb-1 block">Pickup Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">Pickup Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            {tripType === "round-trip" && (
              <>
                <div>
                  <Label className="text-xs font-semibold mb-1 block">Return Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      min={pickupDate || today}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1 block">Return Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ROUTE CALCULATION STATUS & ERROR */}
          {isCalculatingRoute && (
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl border border-primary/20 bg-primary/5 text-primary text-xs font-semibold animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating road route distance & driving time...
            </div>
          )}

          {routeError && (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{routeError}</span>
            </div>
          )}

          {/* JOURNEY SUMMARY & FARE BREAKDOWN SECTION */}
          {fareResult && !isCalculatingRoute && (
            <div className="space-y-4 pt-2">
              {/* Journey Summary Header */}
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{fareResult.pickup}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">{fareResult.destination}</span>
                    {fareResult.tripType === "round-trip" && (
                      <>
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">{fareResult.pickup}</span>
                      </>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    {fareResult.tripType === "one-way" ? "One Way" : `Round Trip (${fareResult.dayCount} Days)`}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">One-Way Route:</span>
                    <span className="font-bold text-foreground">{fareResult.routeDistanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Est. Drive Time:</span>
                    <span className="font-bold text-foreground">{fareResult.routeDuration || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Vehicle:</span>
                    <span className="font-bold text-primary block break-words" title={currentVehicle?.name || fareResult.fleet.vehicleName}>
                      {currentVehicle?.name || fareResult.fleet.vehicleName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Rate / KM:</span>
                    <span className="font-bold text-foreground">₹{fareResult.ratePerKm}/km</span>
                  </div>
                </div>
              </div>

              {/* FARE BREAKDOWN TABLE */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                    Transparent Fare Breakdown
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {fareResult.tripType === "one-way" ? "150 km Min Rule" : "300 km/Day Min Rule"}
                  </span>
                </div>

                <div className="divide-y divide-border/60 text-xs sm:text-sm p-3 sm:p-4 space-y-1">
                  <div className="flex items-center justify-between py-2 gap-2">
                    <span className="text-muted-foreground font-medium">Actual Route Distance:</span>
                    <span className="font-bold text-foreground shrink-0 text-right">
                      {fareResult.effectiveTripDistanceKm} km
                      {fareResult.tripType === "round-trip" ? ` (${fareResult.routeDistanceKm} km × 2)` : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 gap-2 bg-muted/20 px-2.5 rounded-lg">
                    <span className="text-muted-foreground font-medium">
                      Minimum Billing Distance:
                      <span className="text-[11px] text-primary block sm:inline sm:ml-1">
                        ({fareResult.tripType === "one-way" ? "Flat 150 km min" : `${fareResult.dayCount} days × 300 km`})
                      </span>
                    </span>
                    <span className="font-bold text-foreground shrink-0 text-right">{fareResult.minimumBillingKm} km</span>
                  </div>

                  <div className="flex items-center justify-between py-2 gap-2 font-bold bg-primary/5 px-2.5 rounded-lg">
                    <span className="text-foreground">Billable Distance:</span>
                    <span className="text-primary font-extrabold shrink-0 text-right text-sm sm:text-base">
                      {fareResult.billableDistanceKm} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 gap-2">
                    <span className="text-muted-foreground font-medium">
                      Base Fare ({fareResult.billableDistanceKm} km × ₹{fareResult.ratePerKm}/km):
                    </span>
                    <span className="font-bold text-foreground shrink-0 text-right">
                      ₹{fareResult.baseFare.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 gap-2">
                    <span className="text-muted-foreground font-medium">
                      Driver Allowance {fareResult.tripType === "round-trip" ? `(${fareResult.dayCount} days × ₹${fareResult.fleet.roundTripDriverAllowancePerDay})` : ""}:
                    </span>
                    <span className="font-bold text-foreground shrink-0 text-right">
                      ₹{fareResult.driverAllowance.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 gap-2">
                    <span className="text-muted-foreground font-medium">
                      Toll Charges:
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-right">
                      Included
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 gap-2">
                    <span className="text-muted-foreground font-medium">State Tax & Parking:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0 text-right text-xs">
                      Pay directly by customer (at actuals)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 gap-2 border-t border-border font-semibold">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground font-bold shrink-0 text-right text-sm">
                      ₹{fareResult.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 gap-2">
                    <span className="text-muted-foreground font-medium">GST ({fareResult.gstPercentage}%):</span>
                    <span className="font-bold text-foreground shrink-0 text-right">
                      ₹{fareResult.gstAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* 15% ADVANCE PAYMENT OPTION CARD */}
                {(() => {
                  const advanceAmount = Math.round(fareResult.totalEstimatedFare * 0.15);
                  const balanceToDriver = fareResult.totalEstimatedFare - advanceAmount;
                  return (
                    <>
                      <div className="p-3.5 sm:p-4 bg-primary/5 border-t border-b border-primary/20 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                            <CreditCard className="h-4 w-4" />
                            <span>15% Advance Booking Option</span>
                          </div>
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-semibold">
                            Pay 15% to Block Vehicle
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-card rounded-lg p-2.5 border border-border/80">
                            <span className="text-[10px] text-muted-foreground block font-medium">Total Fare:</span>
                            <span className="font-bold text-foreground text-xs sm:text-sm">
                              ₹{fareResult.totalEstimatedFare.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="bg-primary/10 rounded-lg p-2.5 border border-primary/40">
                            <span className="text-[10px] text-primary font-bold block">15% Advance to Pay Now:</span>
                            <span className="font-extrabold text-primary text-sm sm:text-base">
                              ₹{advanceAmount.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="col-span-2 sm:col-span-1 bg-card rounded-lg p-2.5 border border-border/80">
                            <span className="text-[10px] text-muted-foreground block font-medium">Balance (Pay to Driver):</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                              ₹{balanceToDriver.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                          Pay ₹{advanceAmount.toLocaleString("en-IN")} (15%) online via UPI / QR code to instantly secure your cab. Pay the remaining ₹{balanceToDriver.toLocaleString("en-IN")} directly to the driver during your trip.
                        </p>
                      </div>

                      {/* ESTIMATED TOTAL BOX */}
                      <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-t-2 border-primary/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Estimated Total Fare
                          </span>
                          <p className="text-2xl sm:text-3xl font-extrabold text-primary leading-none">
                            ₹{fareResult.totalEstimatedFare.toLocaleString("en-IN")}
                          </p>
                          <div className="mt-2 space-y-0.5">
                            <p className="text-[11px] font-semibold text-foreground">
                              Base fare, driver allowance, normal toll & 5% GST included.
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              NICE Road entry/exit & expressway charges not included. Please pay directly.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-center">
                          <Button
                            type="button"
                            onClick={handlePayAdvance}
                            className="flex-1 sm:flex-initial text-xs font-bold gap-1.5 h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                          >
                            <QrCode className="h-4 w-4" />
                            Pay 15% Advance (₹{advanceAmount.toLocaleString("en-IN")})
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleWhatsAppQuote}
                            className="text-xs font-semibold gap-1.5 h-11 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp Quote
                          </Button>
                          <Button
                            type="button"
                            onClick={handleBookNow}
                            className="flex-1 sm:flex-initial text-xs font-bold gap-1.5 h-11 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                          >
                            Book Now <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* DISCLAIMER NOTE */}
              <div className="rounded-xl border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Fare shown is an estimated fare based on the selected route and vehicle. Toll charges are included.
                  Parking, permits, and interstate/state taxes are paid directly by customer where applicable.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
