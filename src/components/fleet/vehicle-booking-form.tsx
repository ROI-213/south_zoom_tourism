import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerVehicleBooking } from "@/content/customer-data";
import { toast } from "sonner";
import { CheckCircle2, Loader2, TriangleAlert, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { tripTypeOptions, type FleetVehicle } from "@/content/fleet";
import {
  checkAvailability,
  makeBookingReference,
  type VehicleDetail,
} from "@/content/vehicle-details";
import { company } from "@/content/site";
import { BookingPoliciesCard } from "@/components/common/booking-policies";

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
      pickup: z.string().trim().min(3, "Where should the driver pick you up?").max(160),
      destination: z.string().trim().min(3, "Where are you heading?").max(160),
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
  idPrefix = "bk",
}: {
  vehicle: FleetVehicle;
  detail?: VehicleDetail;
  prefillTripType?: string;
  /** Keeps field ids unique when the form renders twice (desktop + mobile). */
  idPrefix?: string;
}) {
  const [reference, setReference] = useState<string | null>(null);
  const [fuelChoice, setFuelChoice] = useState<"cng" | "petrol_diesel">("cng");
  const [newModel, setNewModel] = useState(false);
  const [luggageCarrier, setLuggageCarrier] = useState(false);
  const [petTravelling, setPetTravelling] = useState(false);
  const [spokenLang, setSpokenLang] = useState("");

  const addonTotal =
    (newModel ? 200 : 0) +
    (luggageCarrier ? 200 : 0) +
    (petTravelling ? 500 : 0) +
    (spokenLang ? 200 : 0);

  const schema = useMemo(() => buildBookingSchema(vehicle.seats), [vehicle.seats]);
  const today = new Date().toISOString().slice(0, 10);

  const availableTripTypes = tripTypeOptions.filter((t) => vehicle.tripTypes.includes(t.value));
  const tripChoices = availableTripTypes.length ? availableTripTypes : tripTypeOptions;

  const form = useForm<BookingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      pickup: "",
      destination: "",
      pickupDate: "",
      pickupTime: "",
      returnDate: "",
      passengers: 1,
      tripType:
        prefillTripType && tripChoices.some((t) => t.value === prefillTripType)
          ? prefillTripType
          : tripChoices[0].value,
      request: "",
    },
  });

  const { register, handleSubmit, watch, formState, reset } = form;
  const pickupDate = watch("pickupDate");
  const returnDate = watch("returnDate");

  const availability = checkAvailability(detail, vehicle, pickupDate, returnDate);

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
      `Fuel Option: ${fuelChoice === "petrol_diesel" ? "Petrol / Diesel (+6%)" : "CNG (Standard Rate)"}`,
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

    // Persist the request so it shows up under the customer's vehicle bookings
    // (and can be linked to an account after contact verification).
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

    window.open(
      `https://wa.me/${company.whatsappRaw}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer",
    );

    setReference(ref);

    toast.success(`Request ${ref} created`, {
      description: `We've prepared it on WhatsApp. Our team confirms vehicle availability before the booking is final — or call ${company.phone}.`,
    });
    reset({ ...form.getValues(), name: "", phone: "", email: "", request: "" });
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

      {/* Fuel Type Options (Image 1: CNG vs Petrol/Diesel +6%) */}
      <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
        <label className="font-bold text-foreground block">Choose Fuel Option</label>
        <div className="grid grid-cols-2 gap-2">
          <label
            className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors ${
              fuelChoice === "cng"
                ? "border-primary bg-primary/5 font-semibold text-primary"
                : "border-border/80 hover:bg-background"
            }`}
            onClick={() => setFuelChoice("cng")}
          >
            <input
              type="radio"
              name="fuelChoice"
              checked={fuelChoice === "cng"}
              onChange={() => setFuelChoice("cng")}
              className="accent-primary"
            />
            <span>CNG (Standard Rate)</span>
          </label>

          <label
            className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors ${
              fuelChoice === "petrol_diesel"
                ? "border-primary bg-primary/5 font-semibold text-primary"
                : "border-border/80 hover:bg-background"
            }`}
            onClick={() => setFuelChoice("petrol_diesel")}
          >
            <input
              type="radio"
              name="fuelChoice"
              checked={fuelChoice === "petrol_diesel"}
              onChange={() => setFuelChoice("petrol_diesel")}
              className="accent-primary"
            />
            <span>Petrol / Diesel (+6% extra)</span>
          </label>
        </div>
      </div>

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

      {reference ? (
        <p className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs text-foreground">
          Request <span className="font-bold">{reference}</span> created. Availability is confirmed
          by our team before the booking is final.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={formState.isSubmitting} size="lg" className="font-bold">
          {formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Request Booking Now →
        </Button>
        <Button type="button" variant="outline" size="lg" asChild>
          <a href={`tel:${company.phoneRaw}`}>Call {company.phone}</a>
        </Button>
      </div>
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
