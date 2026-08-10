import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, History, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addDaysISO,
  getDestinationSuggestions,
  getRoomTypeOptions,
  hotelsSearchDefaults,
  isValidISODate,
  nightsBetween,
  todayISO,
} from "@/content/hotels";

export type HotelSearchFormValues = {
  destination: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  roomType: string;
};

const RECENT_KEY = "sz-hotel-recent-searches";
const RECENT_LIMIT = 3;

const schema = z
  .object({
    destination: z.string().trim().max(80, "Destination must be under 80 characters"),
    hotelName: z.string().trim().max(80, "Hotel name must be under 80 characters"),
    checkIn: z.string().refine(isValidISODate, "Enter a valid check-in date"),
    checkOut: z.string().refine(isValidISODate, "Enter a valid check-out date"),
    rooms: z
      .number()
      .int("Rooms must be a whole number")
      .min(1, "At least 1 room")
      .max(hotelsSearchDefaults.maxRooms, `Maximum ${hotelsSearchDefaults.maxRooms} rooms per search`),
    adults: z
      .number()
      .int("Adults must be a whole number")
      .min(1, "At least 1 adult")
      .max(hotelsSearchDefaults.maxAdults, `Maximum ${hotelsSearchDefaults.maxAdults} adults per search`),
    children: z
      .number()
      .int("Children must be a whole number")
      .min(0, "Children cannot be negative")
      .max(hotelsSearchDefaults.maxChildren, `Maximum ${hotelsSearchDefaults.maxChildren} children per search`),
    roomType: z.string().trim().max(40),
  })
  .refine((v) => nightsBetween(v.checkIn, v.checkOut) >= 1, {
    path: ["checkOut"],
    message: "Check-out must be at least one night after check-in",
  })
  .refine((v) => v.checkIn >= todayISO(), {
    path: ["checkIn"],
    message: "Check-in cannot be in the past",
  })
  .refine((v) => v.adults >= v.rooms, {
    path: ["adults"],
    message: "Each room needs at least one adult",
  });

type Errors = Partial<Record<keyof HotelSearchFormValues, string>>;

/** Only non-personal search facets are stored locally. */
type RecentSearch = Pick<
  HotelSearchFormValues,
  "destination" | "checkIn" | "checkOut" | "rooms" | "adults" | "children" | "roomType"
>;

function readRecent(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, RECENT_LIMIT).filter((item): item is RecentSearch => {
      const r = item as RecentSearch;
      return Boolean(r && typeof r.destination === "string" && typeof r.checkIn === "string");
    });
  } catch {
    return [];
  }
}

export function HotelSearchForm({ initial }: { initial?: Partial<HotelSearchFormValues> }) {
  const navigate = useNavigate();
  const suggestions = useMemo(() => getDestinationSuggestions(), []);
  const roomTypes = useMemo(() => getRoomTypeOptions(), []);
  const today = todayISO();

  const [values, setValues] = useState<HotelSearchFormValues>({
    destination: initial?.destination ?? "",
    hotelName: initial?.hotelName ?? "",
    checkIn: initial?.checkIn ?? today,
    checkOut: initial?.checkOut ?? addDaysISO(today, hotelsSearchDefaults.nights),
    rooms: initial?.rooms ?? hotelsSearchDefaults.rooms,
    adults: initial?.adults ?? hotelsSearchDefaults.adults,
    children: initial?.children ?? hotelsSearchDefaults.children,
    roomType: initial?.roomType ?? hotelsSearchDefaults.roomTypeSlug,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  const set = <K extends keyof HotelSearchFormValues>(key: K, value: HotelSearchFormValues[K]) =>
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "checkIn" && typeof value === "string") {
        if (nightsBetween(value, next.checkOut) < 1) next.checkOut = addDaysISO(value, 1);
      }
      return next;
    });

  const nights = nightsBetween(values.checkIn, values.checkOut);

  const saveRecent = (v: HotelSearchFormValues) => {
    if (typeof window === "undefined") return;
    const entry: RecentSearch = {
      destination: v.destination,
      checkIn: v.checkIn,
      checkOut: v.checkOut,
      rooms: v.rooms,
      adults: v.adults,
      children: v.children,
      roomType: v.roomType,
    };
    const next = [entry, ...recent.filter((r) => r.destination !== entry.destination)].slice(
      0,
      RECENT_LIMIT,
    );
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — recent searches are optional */
    }
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  };

  const submit = (v: HotelSearchFormValues) => {
    const parsed = schema.safeParse(v);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof HotelSearchFormValues | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    saveRecent(parsed.data);
    navigate({
      to: "/hotels/search",
      search: {
        destination: parsed.data.destination || undefined,
        hotelName: parsed.data.hotelName || undefined,
        checkIn: parsed.data.checkIn,
        checkOut: parsed.data.checkOut,
        rooms: parsed.data.rooms,
        adults: parsed.data.adults,
        children: parsed.data.children,
        roomType: parsed.data.roomType,
      },
    });
    if (typeof document !== "undefined") {
      requestAnimationFrame(() => {
        document.getElementById("hotel-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <section
      aria-labelledby="hotel-search-heading"
      className="relative z-10 mx-auto -mt-8 w-full max-w-6xl px-4 sm:-mt-12"
    >
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
        <h2 id="hotel-search-heading" className="text-lg font-bold sm:text-xl">
          Search hotels &amp; rooms
        </h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Availability is checked night by night against held room inventory.
        </p>

        <form
          noValidate
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(values);
          }}
        >
          <datalist id="sz-hotel-cities">
            {suggestions.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>

          <Field label="Destination" htmlFor="h-destination" error={errors.destination}>
            <Input
              id="h-destination"
              list="sz-hotel-cities"
              placeholder="City or state, e.g. Ooty"
              maxLength={80}
              autoComplete="off"
              value={values.destination}
              aria-invalid={Boolean(errors.destination)}
              onChange={(e) => set("destination", e.target.value)}
            />
          </Field>

          <Field label="Hotel name (optional)" htmlFor="h-name" error={errors.hotelName}>
            <Input
              id="h-name"
              placeholder="e.g. Hillview"
              maxLength={80}
              autoComplete="off"
              value={values.hotelName}
              aria-invalid={Boolean(errors.hotelName)}
              onChange={(e) => set("hotelName", e.target.value)}
            />
          </Field>

          <Field label="Check-in" htmlFor="h-checkin" error={errors.checkIn}>
            <Input
              id="h-checkin"
              type="date"
              min={today}
              max={addDaysISO(today, hotelsSearchDefaults.bookingWindowDays)}
              value={values.checkIn}
              aria-invalid={Boolean(errors.checkIn)}
              onChange={(e) => set("checkIn", e.target.value)}
            />
          </Field>

          <Field
            label="Check-out"
            htmlFor="h-checkout"
            error={errors.checkOut}
            hint={nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : undefined}
          >
            <Input
              id="h-checkout"
              type="date"
              min={addDaysISO(values.checkIn, 1)}
              max={addDaysISO(today, hotelsSearchDefaults.bookingWindowDays + 30)}
              value={values.checkOut}
              aria-invalid={Boolean(errors.checkOut)}
              onChange={(e) => set("checkOut", e.target.value)}
            />
          </Field>

          <Field label="Rooms" htmlFor="h-rooms" error={errors.rooms}>
            <Input
              id="h-rooms"
              type="number"
              inputMode="numeric"
              min={1}
              max={hotelsSearchDefaults.maxRooms}
              value={values.rooms}
              aria-invalid={Boolean(errors.rooms)}
              onChange={(e) => set("rooms", Number(e.target.value))}
            />
          </Field>

          <Field label="Adults" htmlFor="h-adults" error={errors.adults}>
            <Input
              id="h-adults"
              type="number"
              inputMode="numeric"
              min={1}
              max={hotelsSearchDefaults.maxAdults}
              value={values.adults}
              aria-invalid={Boolean(errors.adults)}
              onChange={(e) => set("adults", Number(e.target.value))}
            />
          </Field>

          <Field label="Children" htmlFor="h-children" error={errors.children}>
            <Input
              id="h-children"
              type="number"
              inputMode="numeric"
              min={0}
              max={hotelsSearchDefaults.maxChildren}
              value={values.children}
              aria-invalid={Boolean(errors.children)}
              onChange={(e) => set("children", Number(e.target.value))}
            />
          </Field>

          <div className="min-w-0">
            <Label htmlFor="h-roomtype" className="text-xs font-semibold">
              Room type
            </Label>
            <Select value={values.roomType} onValueChange={(v) => set("roomType", v)}>
              <SelectTrigger id="h-roomtype" className="mt-1.5 w-full">
                <SelectValue placeholder="Any room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((rt) => (
                  <SelectItem key={rt.slug} value={rt.slug}>
                    {rt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
              Search Hotels
            </Button>
          </div>
        </form>

        {recent.length > 0 ? (
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <History className="h-3.5 w-3.5" aria-hidden="true" /> Recent searches
              </p>
              <button
                type="button"
                onClick={clearRecent}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
              >
                <X className="h-3 w-3" aria-hidden="true" /> Clear
              </button>
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {recent.map((r, i) => (
                <li key={`${r.destination}-${i}`}>
                  <button
                    type="button"
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
                    onClick={() => {
                      const next = { ...values, ...r, hotelName: "" };
                      setValues(next);
                      submit(next);
                    }}
                  >
                    {r.destination || "Any destination"} · {r.checkIn} · {r.rooms} room
                    {r.rooms > 1 ? "s" : ""}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={htmlFor} className="text-xs font-semibold">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
