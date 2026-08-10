import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { company, waLink } from "@/content/site";
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
  const [reference, setReference] = useState<string | null>(null);
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
    estimate.available ? `Estimate: ${formatRupees(estimate.total)} (not confirmed)` : "Estimate: on request",
  ].filter(Boolean) as string[];

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
          <Textarea id={fid("request")} rows={3} {...form.register("request")} />
          {form.formState.errors.request ? (
            <p className="text-xs text-destructive">{form.formState.errors.request.message}</p>
          ) : null}
        </div>

        <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Selections sent with this request</p>
          <ul className="mt-1 space-y-0.5 break-words">
            {summaryLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting || blocked}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending
            </>
          ) : blocked ? (
            "Booking closed for this departure"
          ) : (
            "Request this package"
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
