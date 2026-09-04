import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, TriangleAlert, CreditCard, QrCode, Sparkles } from "lucide-react";
import { getFleetAdvancePercentage } from "@/content/fleet-pricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { company, waLink } from "@/content/site";
import { upsertRegistryEntry } from "@/content/customer-data";
import type { TourPackageRecord } from "@/content/tour-packages";
import {
  estimatePackageTotal,
  formatRupees,
  makePackageReference,
  type PackageDetail,
  type PackageDeparture,
  type PackageHotelOption,
  type PackageVehicleOption,
} from "@/content/package-details";

function buildSchema(maxTravellers: number, requireDeparture: boolean) {
  return z.object({
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
    adults: z.coerce
      .number()
      .int("Enter a whole number.")
      .min(1, "At least one adult.")
      .max(maxTravellers, `This package is quoted for up to ${maxTravellers} travellers.`),
    children: z.coerce
      .number()
      .int("Enter a whole number.")
      .min(0, "Children cannot be negative.")
      .max(maxTravellers, `This package is quoted for up to ${maxTravellers} travellers.`),
    travelDate: requireDeparture
      ? z.string().min(1, "Choose a departure.")
      : z.string().min(1, "Choose a travel date."),
    rooms: z.coerce.number().int().min(1, "At least one room.").max(20, "Call us for more than 20 rooms."),
    pickup: z.string().trim().min(3, "Where should we pick you up?").max(160, "Keep the pickup under 160 characters."),
    request: z.string().trim().max(600, "Please keep it under 600 characters."),
  });
}

type BookingValues = z.infer<ReturnType<typeof buildSchema>>;

export function PackageBookingPanel({
  pkg,
  detail,
  hotel,
  vehicle,
  departure,
  onDepartureChange,
  idPrefix = "pb",
}: {
  pkg: TourPackageRecord;
  detail: PackageDetail;
  hotel?: PackageHotelOption;
  vehicle?: PackageVehicleOption;
  departure?: PackageDeparture;
  onDepartureChange: (id: string) => void;
  /** Keeps ids unique when the panel renders twice (desktop + mobile). */
  idPrefix?: string;
}) {
  const navigate = useNavigate();
  const [reference, setReference] = useState<string | null>(null);
  const [luggageCarrier, setLuggageCarrier] = useState(false);
  const [petTravelling, setPetTravelling] = useState(false);
  const [newModel, setNewModel] = useState(false);
  const [spokenLang, setSpokenLang] = useState("");

  const departures = [...detail.departures].sort((a, b) => a.date.localeCompare(b.date));
  const hasDepartures = departures.length > 0;
  const openDepartures = departures.filter((d) => !d.soldOut);

  const schema = useMemo(
    () => buildSchema(pkg.maxTravellers, hasDepartures),
    [pkg.maxTravellers, hasDepartures],
  );

  const form = useForm<BookingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      adults: pkg.priceBasis === "per-group" ? 2 : 2,
      children: 0,
      travelDate: departure?.date ?? "",
      rooms: 1,
      pickup: pkg.startingCity,
      request: "",
    },
  });

  const adults = Number(form.watch("adults")) || 0;
  const children = Number(form.watch("children")) || 0;
  const rooms = Number(form.watch("rooms")) || 1;
  const travelDate = form.watch("travelDate");

  const estimate = useMemo(
    () => estimatePackageTotal(pkg, { adults, children, hotel, vehicle }),
    [pkg, adults, children, hotel, vehicle],
  );

  const addOnsTotal =
    (luggageCarrier ? 250 : 0) +
    (petTravelling ? 900 : 0) +
    (spokenLang ? 200 : 0) +
    (newModel ? 200 : 0);

  const [advancePercent, setAdvancePercent] = useState<number>(() => getFleetAdvancePercentage());

  useEffect(() => {
    const handler = () => setAdvancePercent(getFleetAdvancePercentage());
    window.addEventListener("fleetFareSettingsUpdated", handler);
    return () => window.removeEventListener("fleetFareSettingsUpdated", handler);
  }, []);

  const finalTotal = estimate.available ? estimate.total + addOnsTotal : 0;
  const advanceAmount = Math.round(finalTotal * (advancePercent / 100));
  const balanceToDriver = finalTotal - advanceAmount;

  const departureSoldOut = Boolean(departure?.soldOut);
  const blocked = pkg.soldOut || departureSoldOut;
  const today = new Date().toISOString().slice(0, 10);
  const fid = (name: string) => `${idPrefix}-${name}`;

  const summaryLines = [
    `Package: ${pkg.title} (${pkg.nights}N/${pkg.days}D)`,
    `Travellers: ${adults} adult(s)${children ? `, ${children} child(ren)` : ""}, ${rooms} room(s)`,
    `Travel date: ${travelDate || "to be advised"}`,
    hotel ? `Hotel: ${hotel.hotel} — ${hotel.category}, ${hotel.roomType}, ${hotel.mealPlan}` : null,
    vehicle ? `Vehicle: ${vehicle.category}${vehicle.ac ? " (AC)" : ""}, seats ${vehicle.seating}` : null,
    luggageCarrier ? "Luggage carrier: +₹250" : null,
    petTravelling ? "Pet travelling: +₹900" : null,
    spokenLang ? `Language: ${spokenLang} (+₹200)` : null,
    estimate.available ? `Total: ${formatRupees(finalTotal)} (${advancePercent}% Advance: ₹${advanceAmount.toLocaleString("en-IN")})` : "Estimate: on request",
  ].filter(Boolean) as string[];

  const handlePayAdvance = form.handleSubmit(async (values) => {
    if (blocked) return;
    const ref = makePackageReference(pkg.slug);
    const notesSummary = [
      `Package: ${pkg.title}`,
      `Hotel: ${hotel?.hotel || "Standard"}`,
      `Vehicle: ${vehicle?.category || "Standard"}`,
      luggageCarrier ? "Luggage carrier (+₹250)" : null,
      petTravelling ? "Pet travelling (+₹900)" : null,
      spokenLang ? `Language: ${spokenLang} (+₹200)` : null,
      values.request ? `Request: ${values.request}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    upsertRegistryEntry({
      reference: ref,
      kind: "tour-package",
      createdAt: new Date().toISOString(),
      ownerPhone: values.phone,
      ownerEmail: values.email || null,
      ownerName: values.name,
      customerId: null,
      linkedAt: null,
      statusLabel: "awaiting-review",
      hasInvoice: false,
      snapshot: {
        title: pkg.title,
        subtitle: `${pkg.nights}N/${pkg.days}D · ${pkg.startingCity}`,
        travelWindow: `${values.travelDate} from ${values.pickup}`,
        startDate: values.travelDate,
        guestsLabel: `${values.adults} Adult(s)`,
        detailRows: [
          { label: "Tour Package", value: pkg.title },
          { label: "Pickup", value: values.pickup },
          { label: "Total Quoted Fare", value: `₹${finalTotal.toLocaleString("en-IN")}` },
          { label: `${advancePercent}% Advance Paid`, value: `₹${advanceAmount.toLocaleString("en-IN")}` },
          { label: "Balance to driver", value: `₹${balanceToDriver.toLocaleString("en-IN")}` },
          { label: "Options", value: notesSummary },
        ],
        total: finalTotal,
        productHref: `/tour-packages/${pkg.slug}`,
      },
    });

    navigate({
      to: "/qr-payment",
      search: {
        booking: ref,
        amount: String(advanceAmount),
        total: String(finalTotal),
        balance: String(balanceToDriver),
        name: values.name,
        phone: values.phone,
      },
    });

    toast.success(`Proceeding to ${advancePercent}% Advance Payment`, {
      description: `Paying ₹${advanceAmount.toLocaleString("en-IN")} advance for ${pkg.title}.`,
    });
  });

  const onSubmit = async (values: BookingValues) => {
    if (blocked) return;
    const ref = makePackageReference(pkg.slug);
    // Booking request record: every selected option is preserved with the enquiry.
    const record = {
      reference: ref,
      package_id: pkg.id,
      package_slug: pkg.slug,
      hotel_option_id: hotel?.id ?? null,
      vehicle_option_id: vehicle?.id ?? null,
      departure_id: departure?.id ?? null,
      estimate_total: estimate.available ? estimate.total : null,
      estimate_confirmed: false,
      page_url: typeof window !== "undefined" ? window.location.href : `/tour-packages/${pkg.slug}`,
      source: "package-detail",
      ...values,
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (import.meta.env.DEV) console.info("Package booking request", record.reference);
    setReference(ref);
    form.reset({ ...form.getValues(), name: "", phone: "", email: "", request: "" });
    toast.success("Booking request received", {
      description: `Reference ${ref}. Our team confirms availability and the final price before any payment.`,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated total</p>
          <p className="text-2xl font-bold text-primary">
            {estimate.available ? formatRupees(estimate.total) : "On request"}
          </p>
        </div>
        <Badge variant="outline">Estimate — not confirmed</Badge>
      </div>

      {estimate.available ? (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
          {estimate.lines.map((line) => (
            <li key={line.label} className="flex items-start justify-between gap-3">
              <span className="min-w-0 text-muted-foreground">
                {line.label}
                {line.note ? <span className="block text-xs">{line.note}</span> : null}
              </span>
              <span className="shrink-0 font-medium">{formatRupees(line.amount)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 border-t border-border pt-2 font-semibold">
            <span>Total estimate</span>
            <span>{formatRupees(estimate.total)}</span>
          </li>
        </ul>
      ) : (
        <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
          Rates for this package are quoted on request. Send your dates and we will price it the same day.
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Excludes entry tickets, meals not listed and personal expenses — see Exclusions above.
      </p>

      {blocked ? (
        <div className="mt-4 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-medium">
              {pkg.soldOut ? "This package is sold out" : "This departure is sold out"}
            </p>
            {openDepartures.length ? (
              <p className="mt-1 text-muted-foreground">
                Alternative departures:{" "}
                {openDepartures.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="mr-2 font-medium text-primary underline underline-offset-4"
                    onClick={() => {
                      onDepartureChange(d.id);
                      form.setValue("travelDate", d.date, { shouldValidate: true });
                    }}
                  >
                    {d.date}
                  </button>
                ))}
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">
                We can still run this as a private departure on your dates — send an enquiry.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {reference ? (
        <div className="mt-4 flex gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>
            Request <span className="font-semibold">{reference}</span> is with our team. We confirm hotels,
            vehicle and the final price before asking for any payment.
          </p>
        </div>
      ) : null}

      <form className="mt-4 grid min-w-0 gap-3" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor={fid("name")}>Full name</Label>
          <Input id={fid("name")} autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor={fid("phone")}>Phone</Label>
            <Input id={fid("phone")} type="tel" inputMode="tel" autoComplete="tel" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor={fid("email")}>Email (optional)</Label>
            <Input id={fid("email")} type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor={fid("adults")}>Adults</Label>
            <Input id={fid("adults")} type="number" min={1} max={pkg.maxTravellers} {...form.register("adults")} />
          </div>
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor={fid("children")}>Children</Label>
            <Input id={fid("children")} type="number" min={0} max={pkg.maxTravellers} {...form.register("children")} />
          </div>
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor={fid("rooms")}>Rooms</Label>
            <Input id={fid("rooms")} type="number" min={1} max={20} {...form.register("rooms")} />
          </div>
        </div>
        {form.formState.errors.adults || form.formState.errors.children || form.formState.errors.rooms ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.adults?.message ??
              form.formState.errors.children?.message ??
              form.formState.errors.rooms?.message}
          </p>
        ) : null}

        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor={fid("travelDate")}>{hasDepartures ? "Departure" : "Travel date"}</Label>
          {hasDepartures ? (
            <select
              id={fid("travelDate")}
              className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
              {...form.register("travelDate", {
                onChange: (e) => {
                  const match = departures.find((d) => d.date === e.target.value);
                  onDepartureChange(match?.id ?? "");
                },
              })}
            >
              <option value="">Select a departure</option>
              {departures.map((d) => (
                <option key={d.id} value={d.date}>
                  {d.date} — {d.label}
                  {d.soldOut ? " (sold out)" : ` · ${d.seatsLeft} seats left`}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={fid("travelDate")}
              type="date"
              min={today}
              {...form.register("travelDate")}
            />
          )}
          {form.formState.errors.travelDate ? (
            <p className="text-xs text-destructive">{form.formState.errors.travelDate.message}</p>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor={fid("pickup")}>Pickup location</Label>
          <Input id={fid("pickup")} {...form.register("pickup")} />
          {form.formState.errors.pickup ? (
            <p className="text-xs text-destructive">{form.formState.errors.pickup.message}</p>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor={fid("request")}>Special requests (optional)</Label>
          <Textarea id={fid("request")} rows={2} {...form.register("request")} />
          {form.formState.errors.request ? (
            <p className="text-xs text-destructive">{form.formState.errors.request.message}</p>
          ) : null}
        </div>

        {/* Special Request Add-ons Section (Requested by User) */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Choosing / Selection Add-ons
            </span>
            <span className="text-[11px] font-bold text-primary">
              +₹{addOnsTotal}
            </span>
          </div>

          <div className="grid gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-border/60 p-2 hover:bg-muted/30">
              <input
                type="checkbox"
                checked={luggageCarrier}
                onChange={(e) => setLuggageCarrier(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
              <div>
                <span className="font-semibold block">Luggage carrier required</span>
                <span className="text-[10px] text-muted-foreground">+₹250/- (Safe roof-top luggage carrier)</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-border/60 p-2 hover:bg-muted/30">
              <input
                type="checkbox"
                checked={petTravelling}
                onChange={(e) => setPetTravelling(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
              <div>
                <span className="font-semibold block">Pet travelling</span>
                <span className="text-[10px] text-muted-foreground">+₹900/- (Pet friendly vehicle cleaning)</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-border/60 p-2 hover:bg-muted/30">
              <input
                type="checkbox"
                checked={newModel}
                onChange={(e) => setNewModel(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
              <div>
                <span className="font-semibold block">2023+ Model Vehicle</span>
                <span className="text-[10px] text-muted-foreground">+₹200/- (Latest model guarantee)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Advance Payment Box */}
        {estimate.available && (
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" /> {advancePercent}% Advance Booking Option
              </span>
              <Badge className="bg-primary text-primary-foreground text-[10px]">
                Pay {advancePercent}% to Block
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-card p-2 rounded-lg border border-border">
                <span className="text-[10px] text-muted-foreground block">{advancePercent}% Advance:</span>
                <span className="font-bold text-primary text-sm">₹{advanceAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="bg-card p-2 rounded-lg border border-border">
                <span className="text-[10px] text-muted-foreground block">Balance (On Trip):</span>
                <span className="font-bold text-foreground text-sm">₹{balanceToDriver.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Selections sent with this request</p>
          <ul className="mt-1 space-y-0.5 break-words">
            {summaryLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        {estimate.available && (
          <Button
            type="button"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md gap-2 h-11"
            disabled={form.formState.isSubmitting || blocked}
            onClick={handlePayAdvance}
          >
            <QrCode className="h-4 w-4" />
            Pay {advancePercent}% Advance (₹{advanceAmount.toLocaleString("en-IN")}) Online
          </Button>
        )}

        <Button type="submit" variant="outline" disabled={form.formState.isSubmitting || blocked}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending
            </>
          ) : blocked ? (
            "Booking closed for this departure"
          ) : (
            "Request this package (Pay Later)"
          )}
        </Button>

        <Button type="button" variant="outline" asChild>
          <Link
            to="/book/tour-package"
            search={{ pkg: pkg.slug, departure: departure?.id }}
          >
            Full booking form
          </Link>
        </Button>

        <Button type="button" variant="outline" asChild>
          <a
            href={waLink(
              `Hi South Zoom Tourism, I'm interested in the ${pkg.title} package.\n${summaryLines.join("\n")}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enquire on WhatsApp
          </a>
        </Button>

        <Button type="button" variant="ghost" asChild>
          <a href={`tel:${company.phoneRaw}`}>Call {company.phone}</a>
        </Button>
      </form>
    </div>
  );
}
