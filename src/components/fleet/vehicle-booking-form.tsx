import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerVehicleBooking } from "@/content/customer-data";
import { toast } from "sonner";
import { CheckCircle2, Loader2, TriangleAlert, Info, CreditCard, QrCode, MessageCircle, Download, FileText, Printer, Check, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { tripTypeOptions, type FleetVehicle } from "@/content/fleet";
import {
  checkAvailability,
  makeBookingReference,
  type VehicleDetail,
} from "@/content/vehicle-details";
import { company } from "@/content/site";
import { getLatestTravelSearch, saveLatestTravelSearch } from "@/lib/search-storage";
import { useNavigate } from "@tanstack/react-router";
import { BookingPoliciesCard } from "@/components/common/booking-policies";
import { downloadTripTicketPdf, generateTicketWhatsAppShare, type TripTicketData } from "@/lib/trip-ticket-pdf";
import { supabase } from "@/lib/supabase";

export function buildBookingSchema(maxPassengers: number) {
  return z
    .object({
      name: z.string().trim().min(2, "Please enter your name.").max(100, "Keep the name under 100 characters."),
      phone: z
        .string()
        .trim()
        .regex(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number (10–15 digits)."),
      email: z
        .string()
        .trim()
        .max(255, "Email is too long.")
        .email("Enter a valid email address.")
        .or(z.literal("")),
      pickup: z.string().trim().min(2, "Where should the driver pick you up?").max(160),
      destination: z.string().trim().min(2, "Where are you heading?").max(160),
      pickupDate: z.string().min(1, "Choose a pickup date."),
      pickupTime: z.string().min(1, "Choose a pickup time."),
      returnDate: z.string(),
      passengers: z.coerce
        .number()
        .int("Enter a whole number.")
        .min(1, "At least one passenger.")
        .max(maxPassengers, `This vehicle seats ${maxPassengers} passengers.`),
      tripType: z.string().min(1, "Choose a trip type."),
      request: z.string().trim().max(600, "Please keep it under 600 characters."),
    })
    .refine((v) => !v.returnDate || v.returnDate >= v.pickupDate, {
      path: ["returnDate"],
      message: "The return date cannot be before the pickup date.",
    });
}

export type BookingValues = z.infer<ReturnType<typeof buildBookingSchema>>;

export function VehicleBookingForm({
  vehicle,
  detail,
  prefillTripType,
  prefillPickup,
  prefillDestination,
  prefillDate,
  prefillTime,
  prefillReturnDate,
  prefillPassengers,
  prefillFare,
  prefillAdvance,
  idPrefix = "bk",
}: {
  vehicle: FleetVehicle;
  detail?: VehicleDetail;
  prefillTripType?: string;
  prefillPickup?: string;
  prefillDestination?: string;
  prefillDate?: string;
  prefillTime?: string;
  prefillReturnDate?: string;
  prefillPassengers?: number;
  prefillFare?: number;
  prefillAdvance?: number;
  /** Keeps field ids unique when the form renders twice (desktop + mobile). */
  idPrefix?: string;
}) {
  const navigate = useNavigate();
  const [reference, setReference] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<TripTicketData | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [newModel, setNewModel] = useState(false);
  const [luggageCarrier, setLuggageCarrier] = useState(false);
  const [petTravelling, setPetTravelling] = useState(false);
  const [spokenLang, setSpokenLang] = useState("");

  const saved = getLatestTravelSearch();

  const addonTotal =
    (newModel ? 200 : 0) +
    (luggageCarrier ? 200 : 0) +
    (petTravelling ? 500 : 0) +
    (spokenLang ? 200 : 0);

  const schema = useMemo(() => buildBookingSchema(vehicle.seats), [vehicle.seats]);
  const today = new Date().toISOString().slice(0, 10);

  const availableTripTypes = tripTypeOptions.filter((t) => vehicle.tripTypes.includes(t.value));
  const tripChoices = availableTripTypes.length ? availableTripTypes : tripTypeOptions;

  const defaultPickup = prefillPickup || saved.pickupCity || "Bengaluru";
  const defaultDestination = prefillDestination || saved.dropCity || "Mysuru";
  const defaultPickupDate = prefillDate || saved.pickupDate || today;
  const defaultPickupTime = prefillTime || saved.pickupTime || "08:00";
  const defaultReturnDate = prefillReturnDate || saved.returnDate || "";
  const defaultPassengers = prefillPassengers || (saved.passengers ? Number(saved.passengers) : 2);

  const initialTripChoice = (() => {
    if (prefillTripType && tripChoices.some((t) => t.value === prefillTripType)) return prefillTripType;
    if (saved.tripType?.toLowerCase().includes("round")) return "outstation";
    return tripChoices[0].value;
  })();

  const form = useForm<BookingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      pickup: defaultPickup,
      destination: defaultDestination,
      pickupDate: defaultPickupDate,
      pickupTime: defaultPickupTime,
      returnDate: defaultReturnDate,
      passengers: Math.min(defaultPassengers, vehicle.seats),
      tripType: initialTripChoice,
      request: "",
    },
  });

  const { register, handleSubmit, watch, formState, reset } = form;
  const pickupDate = watch("pickupDate");
  const returnDate = watch("returnDate");
  const watchedPickup = watch("pickup");
  const watchedDestination = watch("destination");

  // Keep search memory synced
  useEffect(() => {
    if (watchedPickup || watchedDestination || pickupDate) {
      saveLatestTravelSearch({
        pickupCity: watchedPickup,
        dropCity: watchedDestination,
        pickupDate,
        returnDate,
      });
    }
  }, [watchedPickup, watchedDestination, pickupDate, returnDate]);

  const availability = checkAvailability(detail, vehicle, pickupDate, returnDate);

  // Compute 15% advance amount
  const estimatedFare = prefillFare || vehicle.pricePerKm * 150 + 300 + 225;
  const advanceAmount = prefillAdvance || Math.round(estimatedFare * 0.15);
  const balanceToDriver = estimatedFare - advanceAmount;

  const onSubmit = async (values: BookingValues) => {
    // No backend connected yet: the request is handed to the team over
    // WhatsApp with a reference so nothing is lost. The payload below is
    // already the shape the `vehicle_booking_requests` table expects.
    const ref = makeBookingReference(vehicle);
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    const payload = {
      reference: ref,
      vehicle_id: vehicle.id,
      vehicle_slug: vehicle.slug,
      page_url: pageUrl,
      source: "vehicle-detail",
      status: "pending_confirmation",
      customer_name: values.name,
      phone: values.phone,
      email: values.email || null,
      pickup_location: values.pickup,
      destination: values.destination,
      pickup_at: `${values.pickupDate} ${values.pickupTime}`,
      return_date: values.returnDate || null,
      passengers: values.passengers,
      trip_type: values.tripType,
      special_request: values.request || null,
    };

    const lines = [
      `New vehicle booking request — ${ref}`,
      `Vehicle: ${vehicle.name} (${vehicle.brand} ${vehicle.model})`,
      `Fuel: Petrol / Diesel (Included)`,
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.email ? `Email: ${values.email}` : null,
      `Pickup: ${values.pickup}`,
      `Destination: ${values.destination}`,
      `Pickup at: ${payload.pickup_at}`,
      values.returnDate ? `Return: ${values.returnDate}` : null,
      `Passengers: ${values.passengers}`,
      `Trip type: ${values.tripType}`,
      newModel ? `Add-on: 2023 above model (+₹200)` : null,
      luggageCarrier ? `Add-on: Luggage carrier required (+₹200)` : null,
      petTravelling ? `Add-on: Pet travelling (+₹500)` : null,
      spokenLang ? `Add-on Driver Language: ${spokenLang} (+₹200)` : null,
      addonTotal > 0 ? `Total Add-ons Extra: +₹${addonTotal}` : null,
      values.request ? `Special request: ${values.request}` : null,
      pageUrl ? `Page: ${pageUrl}` : null,
    ].filter(Boolean);

    // Create Trip Ticket Data
    const totalEst = prefillFare || (vehicle.minKmPerDay * vehicle.pricePerKm * 2) || 4500;
    const adv = advanceAmount || Math.round(totalEst * 0.15);

    const ticket: TripTicketData = {
      bookingNumber: ref,
      bookingType: values.tripType,
      status: 'Confirmed',
      customerName: values.name,
      customerPhone: values.phone,
      customerEmail: values.email || '',
      pickupLocation: values.pickup,
      dropLocation: values.destination,
      pickupDate: values.pickupDate,
      pickupTime: values.pickupTime,
      returnDate: values.returnDate || '',
      passengers: values.passengers,
      vehicleName: `${vehicle.name} (${vehicle.brand} ${vehicle.model})`,
      vehicleCategory: vehicle.category,
      driverName: 'To be assigned (2 hrs prior)',
      totalAmount: totalEst,
      advanceAmount: adv,
      balanceAmount: totalEst - adv,
      notes: [
        values.request,
        newModel ? '2023+ Model (+₹200)' : null,
        luggageCarrier ? 'Luggage carrier (+₹200)' : null,
        petTravelling ? 'Pet travelling (+₹500)' : null,
        spokenLang ? `Driver language: ${spokenLang} (+₹200)` : null,
      ].filter(Boolean).join(', '),
    };

    setTicketData(ticket);
    setTicketDialogOpen(true);

    // Save to Supabase Backend
    (async () => {
      try {
        let custId = null;
        const { data: cust } = await supabase
          .from('customers')
          .upsert({ name: values.name, phone: values.phone, email: values.email || '' }, { onConflict: 'phone' })
          .select('id')
          .single();
        custId = cust?.id || null;

        await supabase.from('bookings').insert({
          booking_number: ref,
          customer_id: custId,
          booking_type: values.tripType || 'Fleet Cab',
          pickup_location: values.pickup,
          drop_location: values.destination,
          pickup_date: values.pickupDate,
          return_date: values.returnDate || null,
          passengers: values.passengers,
          total_amount: totalEst,
          advance_amount: adv,
          balance_amount: totalEst - adv,
          status: 'Confirmed',
          notes: `Vehicle: ${vehicle.name} (${vehicle.brand} ${vehicle.model})\n${ticket.notes}`,
        });
      } catch (err) {
        console.error('Error saving booking to database:', err);
      }
    })();

    // Persist local request
    registerVehicleBooking({
      reference: ref,
      vehicleName: vehicle.name,
      vehicleSubtitle: `${vehicle.brand} ${vehicle.model}`,
      vehicleHref: `/fleet/${vehicle.slug}`,
      customerName: values.name,
      phone: values.phone,
      email: values.email || null,
      pickup: values.pickup,
      destination: values.destination,
      pickupDate: values.pickupDate,
      pickupTime: values.pickupTime,
      returnDate: values.returnDate || null,
      passengers: values.passengers,
      tripType: values.tripType,
      notes: values.request || "",
    });

    setReference(ref);

    toast.success(`Booking ${ref} confirmed!`, {
      description: `Your trip ticket is ready to download. You can also share it on WhatsApp.`,
    });
  };

  const err = formState.errors;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div
        className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
          availability.status === "blocked"
            ? "border-destructive/40 bg-destructive/5 text-destructive"
            : "border-border bg-secondary/40 text-muted-foreground"
        }`}
        role="status"
      >
        {availability.status === "blocked" ? (
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        ) : availability.status === "likely" ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span className="min-w-0">{availability.message}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}-name`} label="Your name" error={err.name?.message}>
          <Input id={`${idPrefix}-name`} autoComplete="name" {...register("name")} />
        </Field>
        <Field id={`${idPrefix}-phone`} label="Phone" error={err.phone?.message}>
          <Input id={`${idPrefix}-phone`} inputMode="tel" autoComplete="tel" {...register("phone")} />
        </Field>
      </div>

      <Field id={`${idPrefix}-email`} label="Email (optional)" error={err.email?.message}>
        <Input id={`${idPrefix}-email`} type="email" autoComplete="email" {...register("email")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}-pickup`} label="Pickup location" error={err.pickup?.message}>
          <Input id={`${idPrefix}-pickup`} placeholder="Hotel, address or airport" {...register("pickup")} />
        </Field>
        <Field id={`${idPrefix}-destination`} label="Destination" error={err.destination?.message}>
          <Input id={`${idPrefix}-destination`} placeholder="City or itinerary" {...register("destination")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}-date`} label="Pickup date" error={err.pickupDate?.message}>
          <Input id={`${idPrefix}-date`} type="date" min={today} {...register("pickupDate")} />
        </Field>
        <Field id={`${idPrefix}-time`} label="Pickup time" error={err.pickupTime?.message}>
          <Input id={`${idPrefix}-time`} type="time" {...register("pickupTime")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}-return`} label="Return date (optional)" error={err.returnDate?.message}>
          <Input id={`${idPrefix}-return`} type="date" min={pickupDate || today} {...register("returnDate")} />
        </Field>
        <Field
          id={`${idPrefix}-passengers`}
          label={`Passengers (max ${vehicle.seats})`}
          error={err.passengers?.message}
        >
          <Input
            id={`${idPrefix}-passengers`}
            type="number"
            min={1}
            max={vehicle.seats}
            {...register("passengers")}
          />
        </Field>
      </div>

      {/* Trip Type Selection Radio Group */}
      <Field id={`${idPrefix}-trip`} label="Choose Trip Type" error={err.tripType?.message}>
        <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-1">
          {[
            { id: "one-way", label: "1. One way trip", val: "outstation" },
            { id: "round-trip", label: "2. Round trip", val: "outstation" },
            { id: "local-pkg", label: "3. Local package", val: "local" },
            { id: "airport-tx", label: "4. Airport transfer", val: "airport" },
          ].map((t) => (
            <label
              key={t.id}
              className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                watch("tripType") === t.val
                  ? "border-primary bg-primary/5 font-bold text-primary"
                  : "border-border/80 hover:bg-muted/40"
              }`}
            >
              <input
                type="radio"
                value={t.val}
                {...register("tripType")}
                className="accent-primary"
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Special Request Add-ons Section */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <h4 className="font-bold text-sm text-foreground">Special Request Add-ons</h4>
          <span className="text-[11px] text-muted-foreground font-semibold">
            Add-on Extra: +₹{addonTotal}
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-border/60 p-2 hover:bg-muted/30">
            <input
              type="checkbox"
              checked={newModel}
              onChange={(e) => setNewModel(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <span>2023 above model vehicle (+₹200/-)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-border/60 p-2 hover:bg-muted/30">
            <input
              type="checkbox"
              checked={luggageCarrier}
              onChange={(e) => setLuggageCarrier(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <span>Luggage carrier required (+₹200/-)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-border/60 p-2 hover:bg-muted/30">
            <input
              type="checkbox"
              checked={petTravelling}
              onChange={(e) => setPetTravelling(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <span>Pet travelling (+₹500/-)</span>
          </label>
        </div>

        {/* Driver Spoken Language Options */}
        <div className="pt-2 border-t border-border/60 space-y-2">
          <label className="font-semibold text-foreground block">
            Driver Spoken Language (+₹200/- for non-local preference)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "lang-hi", label: "1. Hindi", val: "Hindi" },
              { id: "lang-en", label: "2. English", val: "English" },
              { id: "lang-ta", label: "3. Tamil", val: "Tamil" },
              { id: "lang-te", label: "4. Telugu", val: "Telugu" },
            ].map((l) => (
              <label
                key={l.id}
                className={`flex items-center gap-1.5 rounded-md border p-2 cursor-pointer transition-colors ${
                  spokenLang === l.val
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : "border-border/60 hover:bg-muted/40"
                }`}
                onClick={() => setSpokenLang(spokenLang === l.val ? "" : l.val)}
              >
                <input
                  type="checkbox"
                  checked={spokenLang === l.val}
                  onChange={() => setSpokenLang(spokenLang === l.val ? "" : l.val)}
                  className="accent-primary"
                />
                <span className="text-[11px]">{l.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 15% Advance Payment Option Box */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" /> 15% Advance Booking Option
          </span>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
            Pay 15% to Block Vehicle
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-card p-2 rounded-lg border border-border">
            <span className="text-[10px] text-muted-foreground block">15% Advance:</span>
            <span className="font-bold text-primary text-sm">₹{advanceAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="bg-card p-2 rounded-lg border border-border">
            <span className="text-[10px] text-muted-foreground block">Balance (Pay to Driver):</span>
            <span className="font-bold text-foreground text-sm">₹{balanceToDriver.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Pay ₹{advanceAmount.toLocaleString("en-IN")} online via UPI / QR code to instantly secure this {vehicle.name}. Balance of ₹{balanceToDriver.toLocaleString("en-IN")} is paid directly to the driver during your trip.
        </p>
      </div>

      <Field id={`${idPrefix}-request`} label="Additional request details (optional)" error={err.request?.message}>
        <Textarea
          id={`${idPrefix}-request`}
          rows={2}
          placeholder="Child seat, specific timing, multiple stops…"
          {...register("request")}
        />
      </Field>

      {/* Mandatory Policies Section */}
      <BookingPoliciesCard className="mt-2" />

      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[11px]">
        <span className="font-bold text-foreground">South Zoom Tourism</span>
        <span className="text-muted-foreground font-medium">{company.msmeRegistration}</span>
      </div>

      {reference ? (
        <p className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs text-foreground">
          Request <span className="font-bold">{reference}</span> created. Availability is confirmed
          by our team before the booking is final.
        </p>
      ) : null}

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
        <Button
          type="button"
          onClick={() => {
            handleSubmit(async (values) => {
              const ref = makeBookingReference(vehicle);
              registerVehicleBooking({
                reference: ref,
                vehicleName: vehicle.name,
                vehicleSubtitle: `${vehicle.brand} ${vehicle.model}`,
                vehicleHref: `/fleet/${vehicle.slug}`,
                customerName: values.name || "Guest",
                phone: values.phone || "6366357757",
                email: values.email || null,
                pickup: values.pickup,
                destination: values.destination,
                pickupDate: values.pickupDate,
                pickupTime: values.pickupTime,
                returnDate: values.returnDate || null,
                passengers: values.passengers,
                tripType: values.tripType,
                notes: `15% Advance Payment: ₹${advanceAmount.toLocaleString("en-IN")}. Balance: ₹${balanceToDriver.toLocaleString("en-IN")}. Special: ${values.request || ""}`,
              });

              toast.success("Opening 15% Advance QR Payment...", {
                description: `Paying ₹${advanceAmount.toLocaleString("en-IN")} advance for ${vehicle.name}.`,
              });

              navigate({
                to: "/qr-payment",
                search: {
                  booking: ref,
                  amount: String(advanceAmount),
                  name: values.name || "Guest",
                  phone: values.phone || "6366357757",
                },
              });
            })();
          }}
          size="lg"
          className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md"
        >
          <QrCode className="h-4 w-4" />
          Pay 15% Advance (₹{advanceAmount.toLocaleString("en-IN")})
        </Button>
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          size="lg"
          className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-md"
        >
          {formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Request Booking on WhatsApp →
        </Button>
        <Button type="button" variant="outline" size="lg" asChild>
          <a href={`tel:${company.phoneRaw}`}>Call {company.phone}</a>
        </Button>
      </div>

      {/* Ticket Voucher Modal */}
      {ticketData && (
        <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={22} />
                Trip Ticket Voucher Ready!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-1 border-b pb-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{company.name}</span>
                <span>{company.msmeRegistration}</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900">
                <div className="text-xs text-emerald-700 font-semibold uppercase">Booking Reference</div>
                <div className="text-xl font-bold font-mono">{ticketData.bookingNumber}</div>
                <div className="text-xs mt-1 text-emerald-800">
                  Confirmed for {ticketData.customerName} ({ticketData.customerPhone})
                </div>
              </div>

              {/* Trip Summary Card */}
              <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-xs text-gray-500 font-medium">Vehicle Reserved</span>
                  <span className="font-semibold text-gray-900">{ticketData.vehicleName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Pickup:</span>
                    <div className="font-medium text-gray-900">{ticketData.pickupLocation}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Destination:</span>
                    <div className="font-medium text-gray-900">{ticketData.dropLocation}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Pickup Date & Time:</span>
                    <div className="font-medium text-gray-900">{ticketData.pickupDate} {ticketData.pickupTime}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Passengers:</span>
                    <div className="font-medium text-gray-900">{ticketData.passengers} Person(s)</div>
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between items-center text-xs">
                  <span className="text-gray-600">Total Est. Fare:</span>
                  <span className="font-bold text-base text-gray-900">₹{ticketData.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-700 font-medium">
                  <span>15% Advance:</span>
                  <span>₹{(ticketData.advanceAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Driver and vehicle registration number will be dispatched via WhatsApp/SMS 2 hours prior to your scheduled pickup.
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={() => {
                  downloadTripTicketPdf(ticketData);
                  toast.success('Downloaded PDF Ticket Voucher');
                }}
              >
                <Download size={16} />
                Download PDF Ticket
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto text-green-700 bg-green-50 hover:bg-green-100 border-green-300 gap-2"
                onClick={() => {
                  const msg = generateTicketWhatsAppShare(ticketData);
                  window.open(`https://wa.me/${company.whatsappRaw}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
              >
                <MessageCircle size={16} />
                Share on WhatsApp
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTicketDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
