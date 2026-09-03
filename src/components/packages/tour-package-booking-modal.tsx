import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  QrCode,
  Download,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Car,
  FileText,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { company, waLink } from "@/content/site";
import { downloadTripTicketPdf, generateTicketWhatsAppShare, type TripTicketData } from "@/lib/trip-ticket-pdf";
import { supabase } from "@/lib/supabase";
import { upsertRegistryEntry } from "@/content/customer-data";
import { BookingPoliciesCard } from "@/components/common/booking-policies";

export type TourPackageBookingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageItem: {
    id: string;
    slug?: string;
    title: string;
    category?: string;
    destination?: string;
    nights?: number;
    days?: number;
    priceFrom?: number;
    image?: string;
    highlights?: string[];
  } | null;
};

export function TourPackageBookingModal({
  open,
  onOpenChange,
  packageItem,
}: TourPackageBookingModalProps) {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickup, setPickup] = useState("Bangalore / City Center");
  const [destination, setDestination] = useState(packageItem?.destination || "South India Tour");
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [pickupTime, setPickupTime] = useState("06:00");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  // Hotel is optional and NOT selected by default as requested
  const [hotelTier, setHotelTier] = useState<string>("");
  const [vehicleTier, setVehicleTier] = useState<"sedan" | "suv" | "crysta" | "tempo">("sedan");
  const [specialRequest, setSpecialRequest] = useState("");

  // Choosing / Selection Add-on Options (Requested by User)
  const [luggageCarrier, setLuggageCarrier] = useState(false);
  const [petTravelling, setPetTravelling] = useState(false);
  const [spokenLang, setSpokenLang] = useState("");
  const [newModel, setNewModel] = useState(false);

  // Ticket Voucher Dialog State
  const [ticketData, setTicketData] = useState<TripTicketData | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  // Reset/sync form state whenever a new packageItem is opened
  useEffect(() => {
    if (packageItem) {
      setDestination(packageItem.destination || "South India Tour");
      // Reset personal details and options for each new package
      setName("");
      setPhone("");
      setEmail("");
      setPickup("Bangalore / City Center");
      setHotelTier("");
      setVehicleTier("sedan");
      setSpecialRequest("");
      setLuggageCarrier(false);
      setPetTravelling(false);
      setSpokenLang("");
      setNewModel(false);
    }
  }, [packageItem?.id]);

  // Price Calculation Logic
  // Flow: Choose Options -> Add Charges -> Generate Final Estimate -> Show Total -> Advance Payment
  const pricing = useMemo(() => {
    const basePerPerson = packageItem?.priceFrom || 8999;
    const travellersCount = Math.max(1, adults + (children > 0 ? children * 0.6 : 0));
    const baseTotal = Math.round(basePerPerson * travellersCount);

    // Hotel Tier Surcharge (0 if no hotel selected)
    const nights = packageItem?.nights || 2;
    let hotelSurcharge = 0;
    if (hotelTier === "standard") hotelSurcharge = 800 * nights;
    if (hotelTier === "deluxe") hotelSurcharge = 1500 * nights;
    if (hotelTier === "luxury") hotelSurcharge = 3000 * nights;

    // Vehicle Tier Surcharge
    let vehicleSurcharge = 0;
    if (vehicleTier === "suv") vehicleSurcharge = 2200;
    if (vehicleTier === "crysta") vehicleSurcharge = 3800;
    if (vehicleTier === "tempo") vehicleSurcharge = 6500;

    // Add-on Extra Charges
    let addOnsTotal = 0;
    if (luggageCarrier) addOnsTotal += 250;
    if (petTravelling) addOnsTotal += 900;
    if (spokenLang) addOnsTotal += 200;
    if (newModel) addOnsTotal += 200;

    const subTotal = baseTotal + hotelSurcharge + vehicleSurcharge + addOnsTotal;
    const gst = Math.round(subTotal * 0.05); // 5% GST
    const finalTotal = subTotal + gst;
    const advanceAmount = Math.round(finalTotal * 0.15); // 15% Advance
    const balanceToDriver = finalTotal - advanceAmount;

    return {
      basePerPerson,
      baseTotal,
      hotelSurcharge,
      vehicleSurcharge,
      addOnsTotal,
      subTotal,
      gst,
      finalTotal,
      advanceAmount,
      balanceToDriver,
    };
  }, [
    packageItem,
    adults,
    children,
    hotelTier,
    vehicleTier,
    luggageCarrier,
    petTravelling,
    spokenLang,
    newModel,
  ]);

  if (!packageItem) return null;

  // Generates reference and saves booking
  const createBookingRecord = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return null;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return null;
    }

    const ref = `SZT-TP-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const nights = packageItem.nights || 2;
    const days = packageItem.days || 3;

    const stayLabel = hotelTier
      ? `${hotelTier.charAt(0).toUpperCase() + hotelTier.slice(1)} Hotel Stay`
      : "No Hotel (Own Stay / Cab Only)";

    const notesSummary = [
      `Package: ${packageItem.title} (${nights}N/${days}D)`,
      `Stay: ${stayLabel}`,
      `Vehicle: ${vehicleTier.toUpperCase()}`,
      newModel ? "2023+ Model Vehicle (+₹200)" : null,
      luggageCarrier ? "Luggage carrier (+₹250)" : null,
      petTravelling ? "Pet travelling (+₹900)" : null,
      spokenLang ? `Driver language: ${spokenLang} (+₹200)` : null,
      specialRequest ? `Requests: ${specialRequest}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const ticket: TripTicketData = {
      bookingNumber: ref,
      bookingType: `Tour Package (${packageItem.title})`,
      status: "Confirmed (Pending Advance)",
      createdAt: new Date().toISOString(),
      customerName: name,
      customerPhone: phone,
      customerEmail: email || undefined,
      pickupLocation: pickup,
      dropLocation: destination,
      pickupDate,
      pickupTime,
      passengers: adults + children,
      tripType: `${packageItem.title} (${nights}N/${days}D)`,
      vehicleName: `${vehicleTier.toUpperCase()} Cab · ${stayLabel}`,
      totalAmount: pricing.finalTotal,
      advanceAmount: pricing.advanceAmount,
      balanceAmount: pricing.balanceToDriver,
      notes: notesSummary,
    };

    // Save in Local Customer Registry
    upsertRegistryEntry({
      reference: ref,
      kind: "tour-package",
      createdAt: new Date().toISOString(),
      ownerPhone: phone,
      ownerEmail: email || null,
      ownerName: name,
      customerId: null,
      linkedAt: null,
      statusLabel: "awaiting-review",
      hasInvoice: false,
      snapshot: {
        title: packageItem.title,
        subtitle: `${nights}N / ${days}D · ${packageItem.destination || "South India"}`,
        travelWindow: `${pickupDate} at ${pickupTime}`,
        startDate: pickupDate,
        guestsLabel: `${adults} Adult${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} Child` : ""}`,
        detailRows: [
          { label: "Tour Package", value: packageItem.title },
          { label: "Pickup Location", value: `${pickup} at ${pickupTime}` },
          { label: "Destination", value: destination },
          { label: "Hotel Category", value: stayLabel },
          { label: "Vehicle Type", value: `${vehicleTier.toUpperCase()} Cab` },
          { label: "Total Quoted Fare", value: `₹${pricing.finalTotal.toLocaleString("en-IN")}` },
          { label: "15% Advance Paid", value: `₹${pricing.advanceAmount.toLocaleString("en-IN")}` },
          { label: "Balance to driver", value: `₹${pricing.balanceToDriver.toLocaleString("en-IN")}` },
          { label: "Special notes", value: notesSummary },
        ],
        total: pricing.finalTotal,
        productHref: `/tour-packages/${packageItem.slug || packageItem.id}`,
      },
    });

    // Save to Supabase Backend
    try {
      let custId = null;
      const { data: cust } = await supabase
        .from("customers")
        .upsert({ name, phone, email: email || "" }, { onConflict: "phone" })
        .select("id")
        .single();
      custId = cust?.id || null;

      await supabase.from("bookings").insert({
        booking_number: ref,
        customer_id: custId,
        booking_type: `Tour Package: ${packageItem.title}`,
        pickup_location: pickup,
        drop_location: destination,
        pickup_date: pickupDate,
        return_date: null,
        passengers: adults + children,
        total_amount: pricing.finalTotal,
        advance_amount: pricing.advanceAmount,
        balance_amount: pricing.balanceToDriver,
        status: "Confirmed",
        notes: notesSummary,
      });
    } catch (err) {
      console.error("Error syncing package booking:", err);
    }

    return { ref, ticket };
  };

  // Flow: Pay 15% Advance Online (QR)
  const handlePayAdvanceOnline = async () => {
    const result = await createBookingRecord();
    if (!result) return;

    onOpenChange(false);

    // Direct navigate to QR payment with prefilled data
    navigate({
      to: "/qr-payment",
      search: {
        booking: result.ref,
        amount: String(pricing.advanceAmount),
        total: String(pricing.finalTotal),
        balance: String(pricing.balanceToDriver),
        name: name || "Guest",
        phone: phone || "6366357757",
      },
    });

    toast.success("Proceeding to 15% Advance Payment", {
      description: `Paying ₹${pricing.advanceAmount.toLocaleString("en-IN")} advance for ${packageItem.title}. Scan QR code to complete.`,
    });
  };

  // Flow: Confirm & Generate Ticket Voucher
  const handleConfirmVoucher = async () => {
    const result = await createBookingRecord();
    if (!result) return;

    setTicketData(result.ticket);
    setTicketDialogOpen(true);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/95 text-primary-foreground">
                <Sparkles className="h-3 w-3 mr-1" /> {packageItem.category || "Tour Package"}
              </Badge>
              <Badge variant="outline">
                {packageItem.nights}N / {packageItem.days}D
              </Badge>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
              Book {packageItem.title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Complete your journey details. Choose options to generate your instant estimate and proceed to 15% advance booking.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Customer Details */}
            <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" /> 1. Customer Information
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="pkg-name" className="text-xs font-semibold">
                    Your Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pkg-name"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pkg-phone" className="text-xs font-semibold">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pkg-phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="pkg-email" className="text-xs font-semibold">
                  Email Address (optional)
                </Label>
                <Input
                  id="pkg-email"
                  type="email"
                  placeholder="For trip voucher & receipt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Travel Route & Dates */}
            <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> 2. Journey Details
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="pkg-pickup" className="text-xs font-semibold">
                    Pickup Location
                  </Label>
                  <Input
                    id="pkg-pickup"
                    placeholder="Hotel, residence or airport"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pkg-destination" className="text-xs font-semibold">
                    Tour Destination
                  </Label>
                  <Input
                    id="pkg-destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="pkg-date" className="text-xs font-semibold">
                    Start Date
                  </Label>
                  <Input
                    id="pkg-date"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pkg-time" className="text-xs font-semibold">
                    Pickup Time
                  </Label>
                  <Input
                    id="pkg-time"
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="pkg-adults" className="text-xs font-semibold">
                    Adults (12+ yrs)
                  </Label>
                  <Input
                    id="pkg-adults"
                    type="number"
                    min={1}
                    max={40}
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pkg-children" className="text-xs font-semibold">
                    Children (5–11 yrs)
                  </Label>
                  <Input
                    id="pkg-children"
                    type="number"
                    min={0}
                    max={20}
                    value={children}
                    onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>
            </div>

            {/* Accommodation & Vehicle Selection */}
            <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-primary" /> 3. Hotel Stay (Optional) & Vehicle Preference
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Select a stay category if required. Leave unselected if you have booked your own hotel.
                  </p>
                </div>
                {hotelTier && (
                  <button
                    type="button"
                    onClick={() => setHotelTier("")}
                    className="text-[11px] text-destructive hover:underline font-semibold shrink-0"
                  >
                    ✕ Clear Hotel
                  </button>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-3 text-xs">
                {[
                  {
                    id: "standard",
                    label: "Standard Hotel",
                    note: "Clean 2/3 Star Stay",
                    tag: `+₹${(800 * (packageItem.nights || 2)).toLocaleString("en-IN")}`,
                  },
                  {
                    id: "deluxe",
                    label: "Deluxe Resort",
                    note: "3/4 Star with Breakfast",
                    tag: `+₹${(1500 * (packageItem.nights || 2)).toLocaleString("en-IN")}`,
                  },
                  {
                    id: "luxury",
                    label: "Luxury 5-Star",
                    note: "Premium Villas & Resorts",
                    tag: `+₹${(3000 * (packageItem.nights || 2)).toLocaleString("en-IN")}`,
                  },
                ].map((tier) => {
                  const isSelected = hotelTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setHotelTier(isSelected ? "" : tier.id)}
                      className={`flex flex-col p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 font-semibold text-primary shadow-sm ring-1 ring-primary/40"
                          : "border-border/80 hover:border-primary/50 hover:bg-muted/30 text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-3.5 w-3.5 rounded accent-primary pointer-events-none"
                          />
                          {tier.label}
                        </span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          {tier.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 pl-5">{tier.note}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold block mb-1.5">Tour Vehicle Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: "sedan", label: "Sedan Cab", cap: "1–4 Seats", extra: "Included" },
                    { id: "suv", label: "Ertiga SUV", cap: "1–6 Seats", extra: "+₹2,200" },
                    { id: "crysta", label: "Innova Crysta", cap: "1–7 Luxury", extra: "+₹3,800" },
                    { id: "tempo", label: "Tempo 12-16S", cap: "Group Tour", extra: "+₹6,500" },
                  ].map((v) => (
                    <label
                      key={v.id}
                      className={`flex flex-col p-2 rounded-lg border cursor-pointer transition-colors ${
                        vehicleTier === v.id
                          ? "border-primary bg-primary/5 font-semibold text-primary"
                          : "border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <span className="font-bold text-[11px]">{v.label}</span>
                      <span className="text-[10px] text-muted-foreground">{v.cap}</span>
                      <span className="text-[10px] text-primary font-medium mt-0.5">{v.extra}</span>
                      <input
                        type="radio"
                        name="vehicleTier"
                        checked={vehicleTier === v.id}
                        onChange={() => setVehicleTier(v.id as any)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Special Request Add-ons Section (Requested by User) */}
            <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> 4. Choosing / Selection Add-ons
                </h4>
                <span className="text-[11px] font-bold text-primary">
                  Add-on Charges: +₹{pricing.addOnsTotal}
                </span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-lg border border-border/70 p-2.5 hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={luggageCarrier}
                    onChange={(e) => setLuggageCarrier(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block text-foreground">Luggage carrier required</span>
                    <span className="text-[10px] text-muted-foreground">+₹250/- (Safe roof-top luggage carrier)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-lg border border-border/70 p-2.5 hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={petTravelling}
                    onChange={(e) => setPetTravelling(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block text-foreground">Pet travelling</span>
                    <span className="text-[10px] text-muted-foreground">+₹900/- (Pet friendly vehicle cleaning & sanitized ride)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-lg border border-border/70 p-2.5 hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={newModel}
                    onChange={(e) => setNewModel(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block text-foreground">2023+ Model Vehicle</span>
                    <span className="text-[10px] text-muted-foreground">+₹200/- (Guaranteed latest model car)</span>
                  </div>
                </label>

                <div className="rounded-lg border border-border/70 p-2.5 space-y-1">
                  <span className="font-semibold block text-foreground">Driver Language Preference</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["Hindi", "English", "Tamil", "Telugu", "Kannada"].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setSpokenLang(spokenLang === lang ? "" : lang)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          spokenLang === lang
                            ? "bg-primary text-primary-foreground border-primary font-bold"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {lang} {spokenLang === lang ? "✓" : ""}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    {spokenLang ? `Selected: ${spokenLang} (+₹200)` : "Default local languages included"}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Live Bill / Estimate & 15% Advance Section (Flow: Choose Options -> Add Charges -> Final Estimate -> Show Total -> Advance Payment) */}
            <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-background p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-primary" /> Final Bill / Estimate & 15% Advance
                </span>
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  Instant Total Generated
                </Badge>
              </div>

              {/* Bill Line Items */}
              <div className="space-y-1.5 text-xs text-muted-foreground border-b border-border/50 pb-2.5">
                <div className="flex justify-between">
                  <span>Base Package ({adults} Adults{children > 0 ? `, ${children} Children` : ""}):</span>
                  <span className="font-semibold text-foreground">₹{pricing.baseTotal.toLocaleString("en-IN")}</span>
                </div>
                {pricing.hotelSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Hotel Upgrade ({hotelTier.toUpperCase()}):</span>
                    <span className="font-semibold text-foreground">+₹{pricing.hotelSurcharge.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {pricing.vehicleSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Vehicle Upgrade ({vehicleTier.toUpperCase()}):</span>
                    <span className="font-semibold text-foreground">+₹{pricing.vehicleSurcharge.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {pricing.addOnsTotal > 0 && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Selected Add-ons (Luggage/Pet/Lang):</span>
                    <span>+₹{pricing.addOnsTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px]">
                  <span>GST (5%):</span>
                  <span>₹{pricing.gst.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Summary Totals & Advance Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-card p-2 rounded-lg border border-border/80">
                  <span className="text-[10px] text-muted-foreground block font-medium">Total Bill</span>
                  <span className="font-bold text-foreground text-sm sm:text-base">
                    ₹{pricing.finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg border border-primary/30">
                  <span className="text-[10px] text-primary block font-bold">15% Advance</span>
                  <span className="font-extrabold text-primary text-sm sm:text-base">
                    ₹{pricing.advanceAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-card p-2 rounded-lg border border-border/80">
                  <span className="text-[10px] text-muted-foreground block font-medium">Balance on Trip</span>
                  <span className="font-bold text-foreground text-sm sm:text-base">
                    ₹{pricing.balanceToDriver.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                Pay only <strong className="text-primary">₹{pricing.advanceAmount.toLocaleString("en-IN")}</strong> now via UPI / QR code to block your hotel and vehicle. The remaining balance of ₹{pricing.balanceToDriver.toLocaleString("en-IN")} is paid directly during your journey.
              </p>
            </div>

            <BookingPoliciesCard />
          </div>

          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md gap-2 h-11"
              onClick={handlePayAdvanceOnline}
            >
              <QrCode className="h-4 w-4" />
              Pay 15% Advance (₹{pricing.advanceAmount.toLocaleString("en-IN")}) Online
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto font-semibold gap-2 h-11"
              onClick={handleConfirmVoucher}
            >
              <FileText className="h-4 w-4" />
              Ticket Voucher (Pay Later)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Voucher Modal (Exact same as fleet) */}
      {ticketData && (
        <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
          <DialogContent className="max-w-md p-5 sm:p-6">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                <CheckCircle2 size={28} />
              </div>
              <DialogTitle className="text-center text-xl font-bold">
                Package Booking Confirmed!
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                Your tour reservation has been recorded. Download your ticket voucher below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Ref:</span>
                  <span className="font-mono font-bold text-foreground">{ticketData.bookingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tour Package:</span>
                  <span className="font-semibold text-foreground">{ticketData.bookingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travel Date:</span>
                  <span className="font-semibold text-foreground">{ticketData.pickupDate}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-1.5">
                  <span className="text-muted-foreground">Total Quoted Fare:</span>
                  <span className="font-bold text-foreground">₹{ticketData.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-primary font-bold">
                  <span>15% Advance:</span>
                  <span>₹{(ticketData.advanceAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Balance to Driver:</span>
                  <span>₹{(ticketData.balanceAmount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2">
              <Button
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-10"
                onClick={() => {
                  downloadTripTicketPdf(ticketData);
                  toast.success("Downloaded PDF Ticket Voucher");
                }}
              >
                <Download size={16} />
                Download PDF Ticket
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-green-700 bg-green-50 hover:bg-green-100 border-green-300 gap-2 h-10"
                onClick={() => {
                  const msg = generateTicketWhatsAppShare(ticketData);
                  window.open(`https://wa.me/${company.whatsappRaw}?text=${encodeURIComponent(msg)}`, "_blank");
                }}
              >
                <MessageCircle size={16} />
                Share on WhatsApp
              </Button>
              <Button
                type="button"
                className="w-full bg-primary text-primary-foreground font-bold h-10"
                onClick={() => {
                  setTicketDialogOpen(false);
                  navigate({
                    to: "/qr-payment",
                    search: {
                      booking: ticketData.bookingNumber,
                      amount: String(ticketData.advanceAmount),
                      total: String(ticketData.totalAmount),
                      balance: String(ticketData.balanceAmount),
                      name: ticketData.customerName,
                      phone: ticketData.customerPhone,
                    },
                  });
                }}
              >
                Proceed to 15% Advance Payment (QR)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
