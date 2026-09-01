import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, MessageCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppLink } from "@/components/common/app-link";
import { BookingStepIndicator } from "@/components/booking/booking-step-indicator";
import { PriceBreakdown } from "@/components/booking/price-breakdown";
import { cn } from "@/lib/utils";
import { waLink } from "@/content/site";
import { getPublishedPackages, type TourPackageRecord } from "@/content/tour-packages";
import {
  formatRupees,
  getPackageDetail,
  type PackageDetail,
  type PackageHotelOption,
  type PackageVehicleOption,
} from "@/content/package-details";
import {
  bookingAddOns,
  bookingSettings,
  bookingSteps,
  buildWhatsAppSummary,
  childAgeBands,
  childPolicyNote,
  DRAFT_KEY,
  earliestOpenDate,
  estimateBooking,
  formatDay,
  getChildBand,
  getDepartureStatuses,
  getVisibleAddOns,
  hasFixedDepartures,
  makeBookingNumber,
  mealPlanOptions,
  paymentModes,
  roomTypeOptions,
  saveBookingRecord,
  specialRequirementOptions,
  today,
  type ChildEntry,
  type DepartureStatus,
  type PackageBookingRecord,
  type TravellerEntry,
} from "@/content/package-booking";

type Errors = Record<string, string>;

type WizardState = {
  packageSlug: string;
  departureId: string;
  travelDate: string;
  adults: number;
  children: ChildEntry[];
  travellers: TravellerEntry[];
  name: string;
  phone: string;
  email: string;
  city: string;
  hotelId: string;
  rooms: number;
  roomTypeId: string;
  mealPlanId: string;
  addOnIds: string[];
  vehicleId: string;
  pickup: string;
  drop: string;
  pickupTime: string;
  requirementTags: string[];
  notes: string;
  agreed: boolean;
  paymentMode: string;
};

const uid = () => Math.random().toString(36).slice(2, 9);

function baseState(pkg: TourPackageRecord | undefined, detail: PackageDetail | undefined): WizardState {
  return {
    packageSlug: pkg?.slug ?? "",
    departureId: "",
    travelDate: "",
    adults: 2,
    children: [],
    travellers: [],
    name: "",
    phone: "",
    email: "",
    city: "",
    hotelId: detail?.hotelOptions.find((h) => h.isDefault)?.id ?? detail?.hotelOptions[0]?.id ?? "",
    rooms: 1,
    roomTypeId: roomTypeOptions[0].id,
    mealPlanId: mealPlanOptions[0].id,
    addOnIds: [],
    vehicleId:
      detail?.vehicleOptions.find((v) => v.isDefault)?.id ?? detail?.vehicleOptions[0]?.id ?? "",
    pickup: pkg?.startingCity ?? "",
    drop: pkg?.startingCity ?? "",
    pickupTime: "",
    requirementTags: [],
    notes: "",
    agreed: false,
    paymentMode: paymentModes[0].id,
  };
}

const phoneRe = /^[+]?[\d\s-]{10,15}$/;

export function TourBookingWizard({
  initialPackageSlug,
  initialDepartureId,
}: {
  initialPackageSlug?: string;
  initialDepartureId?: string;
}) {
  const navigate = useNavigate();
  const packages = useMemo(() => getPublishedPackages(), []);

  const firstSlug =
    packages.find((p) => p.slug === initialPackageSlug)?.slug ?? packages[0]?.slug ?? "";
  const firstPkg = packages.find((p) => p.slug === firstSlug);
  const firstDetail = firstPkg ? getPackageDetail(firstPkg) : undefined;

  const [state, setState] = useState<WizardState>(() => ({
    ...baseState(firstPkg, firstDetail),
    departureId: initialDepartureId ?? "",
  }));
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore a saved draft once on the client (no SSR mismatch).
  useEffect(() => {
    setHydrated(true);
    if (initialPackageSlug) return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as WizardState;
      if (draft && typeof draft.packageSlug === "string") {
        setState((prev) => ({ ...prev, ...draft, agreed: false }));
        toast.info("We restored your saved booking draft.");
      }
    } catch {
      /* ignore malformed drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pkg = packages.find((p) => p.slug === state.packageSlug);
  const detail = useMemo(() => (pkg ? getPackageDetail(pkg) : undefined), [pkg]);

  const departures: DepartureStatus[] = useMemo(
    () => (detail ? getDepartureStatuses(detail) : []),
    [detail],
  );
  const fixedDepartures = detail ? hasFixedDepartures(detail) : false;
  const selectedDeparture = departures.find((d) => d.departure.id === state.departureId);

  const hotel: PackageHotelOption | undefined = detail?.hotelOptions.find(
    (h) => h.id === state.hotelId,
  );
  const vehicle: PackageVehicleOption | undefined = detail?.vehicleOptions.find(
    (v) => v.id === state.vehicleId,
  );

  const estimate = useMemo(
    () =>
      pkg && detail
        ? estimateBooking(pkg, detail, {
            adults: state.adults,
            children: state.children,
            hotel,
            vehicle,
            rooms: state.rooms,
            roomTypeId: state.roomTypeId,
            mealPlanId: state.mealPlanId,
            addOnIds: state.addOnIds,
          })
        : { available: false, lines: [], total: 0, manualChildren: 0, advance: 0 },
    [
      pkg,
      detail,
      state.adults,
      state.children,
      hotel,
      vehicle,
      state.rooms,
      state.roomTypeId,
      state.mealPlanId,
      state.addOnIds,
    ],
  );

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  function changePackage(slug: string) {
    const next = packages.find((p) => p.slug === slug);
    const nextDetail = next ? getPackageDetail(next) : undefined;
    setState((prev) => ({
      ...prev,
      packageSlug: slug,
      departureId: "",
      travelDate: "",
      hotelId:
        nextDetail?.hotelOptions.find((h) => h.isDefault)?.id ?? nextDetail?.hotelOptions[0]?.id ?? "",
      vehicleId:
        nextDetail?.vehicleOptions.find((v) => v.isDefault)?.id ??
        nextDetail?.vehicleOptions[0]?.id ??
        "",
      pickup: next?.startingCity ?? prev.pickup,
      drop: next?.startingCity ?? prev.drop,
    }));
    setErrors({});
  }

  function setChildCount(count: number) {
    const safe = Math.max(0, Math.min(10, count));
    setState((prev) => {
      const next = [...prev.children];
      while (next.length < safe) next.push({ id: uid(), age: null });
      next.length = safe;
      return { ...prev, children: next };
    });
  }

  function setTravellerCount(): TravellerEntry[] {
    const total = state.adults + state.children.length;
    const entries = [...state.travellers];
    while (entries.length < total) {
      entries.push({ id: uid(), name: "", kind: "adult", age: null, idProof: "" });
    }
    entries.length = total;
    return entries.map((entry, i) => {
      const isChild = i >= state.adults;
      return {
        ...entry,
        kind: isChild ? "child" : "adult",
        age: isChild ? (state.children[i - state.adults]?.age ?? null) : null,
      };
    });
  }

  const travellerRows = setTravellerCount();

  function updateTraveller(index: number, patch: Partial<TravellerEntry>) {
    setState((prev) => {
      const rows = travellerRows.map((row, i) => (i === index ? { ...row, ...patch } : row));
      return { ...prev, travellers: rows };
    });
  }

  function validate(current: number): Errors {
    const e: Errors = {};
    if (current === 0) {
      if (!pkg) e.packageSlug = "Choose a tour package.";
      if (pkg?.soldOut) e.packageSlug = "This package is sold out. Please pick another one.";
      if (fixedDepartures) {
        if (!state.departureId) e.departureId = "Choose a departure date.";
        else if (!selectedDeparture?.bookable)
          e.departureId = selectedDeparture?.soldOut
            ? "That departure is sold out. Pick another date."
            : "Bookings for that departure have closed. Pick another date.";
      } else {
        const parsed = z.string().min(1).safeParse(state.travelDate);
        if (!parsed.success) e.travelDate = "Choose your travel start date.";
        else if (state.travelDate < earliestOpenDate())
          e.travelDate = `We need at least ${bookingSettings.minNoticeDays} days' notice. Earliest date is ${formatDay(earliestOpenDate())}.`;
      }
    }

    if (current === 1) {
      const maxT = pkg?.maxTravellers ?? 20;
      if (state.adults < 1) e.adults = "At least one adult must travel.";
      if (state.adults + state.children.length > maxT)
        e.adults = `This package is quoted for up to ${maxT} travellers. Contact us for larger groups.`;
      if (fixedDepartures && selectedDeparture) {
        const seats = selectedDeparture.departure.seatsLeft;
        if (state.adults + state.children.length > seats)
          e.adults = `Only ${seats} seat${seats === 1 ? "" : "s"} remain on this departure.`;
      }
      if (!z.string().trim().min(2).max(100).safeParse(state.name).success)
        e.name = "Enter the lead traveller's name.";
      if (!phoneRe.test(state.phone.trim())) e.phone = "Enter a valid phone number (10–15 digits).";
      if (state.email.trim() && !z.string().email().safeParse(state.email.trim()).success)
        e.email = "Enter a valid email address.";
      travellerRows.forEach((row, i) => {
        if (i === 0 && !row.name.trim() && !state.name.trim()) e[`traveller-${i}`] = "Name required.";
      });
    }

    if (current === 2) {
      if (pkg?.includesHotel) {
        if (detail?.hotelOptions.length && !state.hotelId) e.hotelId = "Choose a hotel option.";
        const minRooms = Math.ceil(state.adults / bookingSettings.adultsPerRoom);
        if (state.rooms < 1) e.rooms = "At least one room.";
        else if (state.rooms > 20) e.rooms = "Call us for more than 20 rooms.";
        else {
          const roomType = roomTypeOptions.find((r) => r.id === state.roomTypeId);
          if (roomType && state.adults > state.rooms * roomType.maxAdults)
            e.rooms = `${state.adults} adults need at least ${Math.ceil(state.adults / roomType.maxAdults)} × ${roomType.label}.`;
          else if (state.rooms < 1) e.rooms = `At least ${minRooms} room(s).`;
        }
      }
    }

    if (current === 3) {
      if (pkg?.includesVehicle && detail?.vehicleOptions.length && !state.vehicleId)
        e.vehicleId = "Choose a vehicle.";
      if (vehicle && state.adults + state.children.length > vehicle.seating)
        e.vehicleId = `${vehicle.category} seats ${vehicle.seating}. Choose a larger vehicle or reduce travellers.`;
      if (!z.string().trim().min(3).max(160).safeParse(state.pickup).success)
        e.pickup = "Where should the vehicle pick you up?";
      if (state.drop.trim().length > 160) e.drop = "Keep the drop location under 160 characters.";
    }

    if (current === 4) {
      if (!state.agreed) e.agreed = "Please accept the booking terms to continue.";
      if (state.notes.length > 600) e.notes = "Keep special requirements under 600 characters.";
    }

    if (current === 5) {
      if (!state.paymentMode) e.paymentMode = "Choose how you would like to pay.";
    }
    return e;
  }

  function goNext() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const next = Math.min(step + 1, bookingSteps.length - 1);
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function jump(index: number) {
    if (index > maxReached) return;
    setErrors({});
    setStep(index);
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
      toast.success("Draft saved on this device. Return any time to finish.");
    } catch {
      toast.error("We could not save the draft in this browser.");
    }
  }

  function buildRecord(): PackageBookingRecord | null {
    if (!pkg || !detail) return null;
    const meal = mealPlanOptions.find((m) => m.id === state.mealPlanId);
    const roomType = roomTypeOptions.find((r) => r.id === state.roomTypeId);
    return {
      bookingNumber: makeBookingNumber(),
      createdAt: new Date().toISOString(),
      status: "requested",
      source: "web:/book/tour-package",
      packageSnapshot: {
        slug: pkg.slug,
        title: pkg.title,
        nights: pkg.nights,
        days: pkg.days,
        startingCity: pkg.startingCity,
        price: pkg.price,
        priceBasis: pkg.priceBasis,
        hotelCategory: pkg.hotelCategory,
        vehicleCategory: pkg.vehicleCategory,
      },
      departureSnapshot: selectedDeparture
        ? {
            id: selectedDeparture.departure.id,
            date: selectedDeparture.departure.date,
            label: selectedDeparture.departure.label,
            seatsLeft: selectedDeparture.departure.seatsLeft,
            deadline: selectedDeparture.deadline,
          }
        : { id: null, date: state.travelDate, label: "Open date", seatsLeft: null, deadline: null },
      hotelSnapshot: hotel
        ? {
            id: hotel.id,
            hotel: hotel.hotel,
            category: hotel.category,
            roomType: hotel.roomType,
            mealPlan: meal?.label ?? hotel.mealPlan,
            upgradePrice: hotel.upgradePrice,
          }
        : null,
      vehicleSnapshot: vehicle
        ? {
            id: vehicle.id,
            category: vehicle.category,
            seating: vehicle.seating,
            ac: vehicle.ac,
            upgradePrice: vehicle.upgradePrice,
          }
        : null,
      stay: {
        rooms: state.rooms,
        roomType: roomType?.label ?? "",
        mealPlan: meal?.label ?? "",
      },
      transport: { pickup: state.pickup, drop: state.drop, pickupTime: state.pickupTime },
      travellers: {
        adults: state.adults,
        children: state.children.length,
        entries: travellerRows,
      },
      addOns: getVisibleAddOns()
        .filter((a) => state.addOnIds.includes(a.id))
        .map((a) => ({ id: a.id, label: a.label, unit: a.unit, price: a.price })),
      contact: { name: state.name, phone: state.phone, email: state.email, city: state.city },
      requirements: { tags: state.requirementTags, notes: state.notes },
      priceBreakdown: estimate.lines,
      estimatedTotal: estimate.total,
      advanceDue: estimate.advance,
      finalTotal: null,
      manualChildren: estimate.manualChildren,
      paymentMode: paymentModes.find((m) => m.id === state.paymentMode)?.label ?? state.paymentMode,
      assignedTo: null,
      followUpAt: null,
    };
  }

  async function submit() {
    const e = validate(5);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (fixedDepartures && !selectedDeparture?.bookable) {
      toast.error("That departure is no longer bookable. Please choose another date.");
      setStep(0);
      return;
    }
    const record = buildRecord();
    if (!record) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    saveBookingRecord(record);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setSubmitting(false);
    navigate({ to: "/book/tour-package/confirmation", search: { ref: record.bookingNumber } });
  }

  if (!pkg || !detail) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <h2 className="text-base font-bold">No packages are open for booking right now</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team can still plan a trip for you.
        </p>
        <Button asChild className="mt-4">
          <AppLink href="/custom-tour">Build a custom tour</AppLink>
        </Button>
      </div>
    );
  }

  const totalTravellers = state.adults + state.children.length;
  const summary = (
    <BookingSummary
      pkg={pkg}
      departureLabel={
        selectedDeparture
          ? `${selectedDeparture.departure.label} · ${formatDay(selectedDeparture.departure.date)}`
          : state.travelDate
            ? formatDay(state.travelDate)
            : "Not chosen yet"
      }
      travellers={`${state.adults} adult${state.adults === 1 ? "" : "s"}${state.children.length ? `, ${state.children.length} child${state.children.length === 1 ? "" : "ren"}` : ""}`}
      stay={
        pkg.includesHotel
          ? `${hotel ? `${hotel.hotel} · ${hotel.category}` : "Hotel to be chosen"} · ${state.rooms} room${state.rooms === 1 ? "" : "s"}`
          : "No stay in this package"
      }
      vehicle={vehicle ? `${vehicle.category} · ${vehicle.seating} seats` : "No vehicle in this package"}
      estimate={estimate}
      onJump={jump}
      maxReached={maxReached}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <BookingStepIndicator current={step} maxReached={maxReached} onJump={jump} />

        <div className="mt-6 min-w-0">
          <h2 className="text-lg font-bold tracking-tight">{bookingSteps[step].title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{bookingSteps[step].hint}</p>

          <div className="mt-5 space-y-5">
            {step === 0 ? (
              <StepPackage
                packages={packages}
                pkg={pkg}
                departures={departures}
                fixedDepartures={fixedDepartures}
                state={state}
                errors={errors}
                onPackage={changePackage}
                onSet={set}
              />
            ) : null}

            {step === 1 ? (
              <StepTravellers
                pkg={pkg}
                state={state}
                errors={errors}
                travellerRows={travellerRows}
                onSet={set}
                onChildCount={setChildCount}
                onChildAge={(id, age) =>
                  setState((prev) => ({
                    ...prev,
                    children: prev.children.map((c) => (c.id === id ? { ...c, age } : c)),
                  }))
                }
                onTraveller={updateTraveller}
              />
            ) : null}

            {step === 2 ? (
              <StepStay pkg={pkg} detail={detail} state={state} errors={errors} onSet={set} />
            ) : null}

            {step === 3 ? (
              <StepTransport pkg={pkg} detail={detail} state={state} errors={errors} onSet={set} />
            ) : null}

            {step === 4 ? (
              <StepReview
                detail={detail}
                state={state}
                errors={errors}
                estimate={estimate}
                onSet={set}
              />
            ) : null}

            {step === 5 ? (
              <StepSubmit
                state={state}
                errors={errors}
                estimate={estimate}
                onSet={set}
                totalTravellers={totalTravellers}
              />
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft aria-hidden="true" /> Back
              </Button>
            ) : null}
            {step < bookingSteps.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Continue <ArrowRight aria-hidden="true" />
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                {submitting ? "Submitting…" : "Submit booking request"}
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={saveDraft}>
              Save draft
            </Button>
            {hydrated ? (
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button type="button" variant="secondary">
                      View summary
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Your booking so far</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">{summary}</div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="hidden min-w-0 lg:block">
        <div className="sticky top-24">{summary}</div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

function BookingSummary({
  pkg,
  departureLabel,
  travellers,
  stay,
  vehicle,
  estimate,
  onJump,
  maxReached,
}: {
  pkg: TourPackageRecord;
  departureLabel: string;
  travellers: string;
  stay: string;
  vehicle: string;
  estimate: ReturnType<typeof estimateBooking>;
  onJump: (i: number) => void;
  maxReached: number;
}) {
  const rows = [
    { label: "Package", value: `${pkg.title} · ${pkg.nights}N/${pkg.days}D`, step: 0 },
    { label: "Departure", value: departureLabel, step: 0 },
    { label: "Travellers", value: travellers, step: 1 },
    { label: "Stay", value: stay, step: 2 },
    { label: "Vehicle", value: vehicle, step: 3 },
  ];

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-bold tracking-tight">Your booking so far</h2>
      <dl className="mt-3 divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-2 py-2.5">
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-sm">{row.value}</dd>
            </div>
            <button
              type="button"
              onClick={() => onJump(row.step)}
              disabled={row.step > maxReached}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label={`Edit ${row.label}`}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </dl>
      {estimate.available ? (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold">Estimated total</span>
          <span className="text-base font-extrabold tabular-nums text-primary">
            {formatRupees(estimate.total)}
          </span>
        </div>
      ) : (
        <p className="mt-2 border-t border-border pt-3 text-xs text-muted-foreground">
          Price on request — we send a written quote.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

type SetFn = <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;

function StepPackage({
  packages,
  pkg,
  departures,
  fixedDepartures,
  state,
  errors,
  onPackage,
  onSet,
}: {
  packages: TourPackageRecord[];
  pkg: TourPackageRecord;
  departures: DepartureStatus[];
  fixedDepartures: boolean;
  state: WizardState;
  errors: Errors;
  onPackage: (slug: string) => void;
  onSet: SetFn;
}) {
  return (
    <>
      <div>
        <Label htmlFor="bk-package">Tour package</Label>
        <Select value={state.packageSlug} onValueChange={onPackage}>
          <SelectTrigger id="bk-package" className="mt-1.5">
            <SelectValue placeholder="Choose a package" />
          </SelectTrigger>
          <SelectContent>
            {packages.map((p) => (
              <SelectItem key={p.slug} value={p.slug} disabled={p.soldOut}>
                {p.title} · {p.nights}N/{p.days}D{p.soldOut ? " — sold out" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id="bk-package-error" message={errors.packageSlug} />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Starting from {pkg.startingCity} · {pkg.hotelCategory} stay ·{" "}
          {pkg.showPrice && pkg.price > 0 ? `${formatRupees(pkg.price)} ${pkg.priceBasis === "per-person" ? "per person" : "per group"}` : "price on request"}
        </p>
      </div>

      {fixedDepartures ? (
        <fieldset>
          <legend className="text-sm font-medium">Departure date</legend>
          <p className="mt-1 text-xs text-muted-foreground">
            Bookings close {bookingSettings.bookingLeadDays} days before departure.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {departures.map((d) => {
              const active = state.departureId === d.departure.id;
              return (
                <label
                  key={d.departure.id}
                  className={cn(
                    "flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    !d.bookable && "cursor-not-allowed opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    name="departure"
                    className="mt-1 accent-[hsl(var(--primary))]"
                    value={d.departure.id}
                    checked={active}
                    disabled={!d.bookable}
                    onChange={() => onSet("departureId", d.departure.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{d.departure.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDay(d.departure.date)} · book by {formatDay(d.deadline)}
                    </span>
                    <span className="mt-1 block">
                      {d.soldOut ? (
                        <Badge variant="destructive">Sold out</Badge>
                      ) : d.closed ? (
                        <Badge variant="secondary">Booking closed</Badge>
                      ) : d.lowSeats ? (
                        <Badge variant="secondary">Only {d.departure.seatsLeft} seats left</Badge>
                      ) : (
                        <Badge variant="secondary">{d.departure.seatsLeft} seats available</Badge>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <FieldError id="bk-departure-error" message={errors.departureId} />
        </fieldset>
      ) : (
        <div>
          <Label htmlFor="bk-date">Travel start date</Label>
          <Input
            id="bk-date"
            type="date"
            className="mt-1.5"
            min={earliestOpenDate()}
            value={state.travelDate}
            onChange={(e) => onSet("travelDate", e.target.value)}
            aria-invalid={Boolean(errors.travelDate)}
            aria-describedby={errors.travelDate ? "bk-date-error" : undefined}
          />
          <FieldError id="bk-date-error" message={errors.travelDate} />
          <p className="mt-1.5 text-xs text-muted-foreground">
            This package runs on open dates — earliest start is {formatDay(earliestOpenDate())}.
          </p>
        </div>
      )}
      <input type="hidden" value={today()} readOnly />
    </>
  );
}

function StepTravellers({
  pkg,
  state,
  errors,
  travellerRows,
  onSet,
  onChildCount,
  onChildAge,
  onTraveller,
}: {
  pkg: TourPackageRecord;
  state: WizardState;
  errors: Errors;
  travellerRows: TravellerEntry[];
  onSet: SetFn;
  onChildCount: (n: number) => void;
  onChildAge: (id: string, age: number | null) => void;
  onTraveller: (index: number, patch: Partial<TravellerEntry>) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bk-adults">Adults (12+)</Label>
          <Input
            id="bk-adults"
            type="number"
            min={1}
            max={pkg.maxTravellers}
            className="mt-1.5"
            value={state.adults}
            onChange={(e) => onSet("adults", Number(e.target.value) || 0)}
            aria-invalid={Boolean(errors.adults)}
          />
          <FieldError id="bk-adults-error" message={errors.adults} />
        </div>
        <div>
          <Label htmlFor="bk-children">Children (under 12)</Label>
          <Input
            id="bk-children"
            type="number"
            min={0}
            max={10}
            className="mt-1.5"
            value={state.children.length}
            onChange={(e) => onChildCount(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {state.children.length > 0 ? (
        <fieldset className="rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold">Child ages</legend>
          <p className="text-xs text-muted-foreground">{childPolicyNote}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {state.children.map((child, i) => {
              const band = getChildBand(child.age);
              return (
                <div key={child.id} className="min-w-0">
                  <Label htmlFor={`bk-child-${child.id}`}>Child {i + 1} age</Label>
                  <Input
                    id={`bk-child-${child.id}`}
                    type="number"
                    min={0}
                    max={17}
                    className="mt-1.5"
                    value={child.age ?? ""}
                    onChange={(e) =>
                      onChildAge(child.id, e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {band
                      ? `${band.label} — ${band.note}`
                      : "Enter an age so the right child rate applies, or we will confirm it manually."}
                  </p>
                </div>
              );
            })}
          </div>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {childAgeBands.map((b) => (
              <li key={b.id}>
                <strong className="font-semibold text-foreground">{b.label}:</strong> {b.note}
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      <fieldset className="rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-semibold">Traveller names (optional now)</legend>
        <p className="text-xs text-muted-foreground">
          Names as printed on the ID used at hotel check-in. You can send them later.
        </p>
        <div className="mt-3 space-y-3">
          {travellerRows.map((row, i) => (
            <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <div className="min-w-0">
                <Label htmlFor={`bk-tr-${row.id}`}>
                  {row.kind === "adult" ? `Adult ${i + 1}` : `Child ${i - state.adults + 1}`} name
                </Label>
                <Input
                  id={`bk-tr-${row.id}`}
                  className="mt-1.5"
                  value={row.name}
                  maxLength={100}
                  onChange={(e) => onTraveller(i, { name: e.target.value })}
                />
              </div>
              <div className="min-w-0">
                <Label htmlFor={`bk-id-${row.id}`}>ID type</Label>
                <Input
                  id={`bk-id-${row.id}`}
                  className="mt-1.5"
                  placeholder="Aadhaar / Passport"
                  maxLength={40}
                  value={row.idProof}
                  onChange={(e) => onTraveller(i, { idProof: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-semibold">Lead traveller contact</legend>
        <div>
          <Label htmlFor="bk-name">Full name</Label>
          <Input
            id="bk-name"
            className="mt-1.5"
            value={state.name}
            maxLength={100}
            onChange={(e) => onSet("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError id="bk-name-error" message={errors.name} />
        </div>
        <div>
          <Label htmlFor="bk-phone">Mobile number</Label>
          <Input
            id="bk-phone"
            type="tel"
            className="mt-1.5"
            value={state.phone}
            onChange={(e) => onSet("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
          />
          <FieldError id="bk-phone-error" message={errors.phone} />
        </div>
        <div>
          <Label htmlFor="bk-email">Email (optional)</Label>
          <Input
            id="bk-email"
            type="email"
            className="mt-1.5"
            value={state.email}
            onChange={(e) => onSet("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError id="bk-email-error" message={errors.email} />
        </div>
        <div>
          <Label htmlFor="bk-city">City you travel from (optional)</Label>
          <Input
            id="bk-city"
            className="mt-1.5"
            value={state.city}
            maxLength={80}
            onChange={(e) => onSet("city", e.target.value)}
          />
        </div>
      </fieldset>
    </>
  );
}

function StepStay({
  pkg,
  detail,
  state,
  errors,
  onSet,
}: {
  pkg: TourPackageRecord;
  detail: PackageDetail;
  state: WizardState;
  errors: Errors;
  onSet: SetFn;
}) {
  if (!pkg.includesHotel || detail.hotelOptions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        This package does not include accommodation. Continue to the transport step — our team can
        add hotels to the quote if you mention it in the requirements.
      </div>
    );
  }

  return (
    <>
      <fieldset>
        <legend className="text-sm font-medium">Hotel category</legend>
        <div className="mt-3 space-y-2">
          {detail.hotelOptions.map((h) => {
            const active = state.hotelId === h.id;
            return (
              <label
                key={h.id}
                className={cn(
                  "flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                )}
              >
                <input
                  type="radio"
                  name="hotel"
                  className="mt-1 accent-[hsl(var(--primary))]"
                  checked={active}
                  onChange={() => onSet("hotelId", h.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{h.hotel}</span>
                  <span className="block text-xs text-muted-foreground">
                    {h.category} · {h.roomType} · {h.mealPlan} · {h.nights} night
                    {h.nights === 1 ? "" : "s"}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-primary">
                    {h.upgradePrice > 0 ? `+${formatRupees(h.upgradePrice)} per traveller` : "Included"}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <FieldError id="bk-hotel-error" message={errors.hotelId} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bk-rooms">Number of rooms</Label>
          <Input
            id="bk-rooms"
            type="number"
            min={1}
            max={20}
            className="mt-1.5"
            value={state.rooms}
            onChange={(e) => onSet("rooms", Number(e.target.value) || 1)}
            aria-invalid={Boolean(errors.rooms)}
          />
          <FieldError id="bk-rooms-error" message={errors.rooms} />
        </div>
        <div>
          <Label htmlFor="bk-room-type">Room type</Label>
          <Select value={state.roomTypeId} onValueChange={(v) => onSet("roomTypeId", v)}>
            <SelectTrigger id="bk-room-type" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roomTypeOptions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="bk-meal">Meal plan</Label>
        <Select value={state.mealPlanId} onValueChange={(v) => onSet("mealPlanId", v)}>
          <SelectTrigger id="bk-meal" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mealPlanOptions.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
                {m.pricePerPersonPerNight > 0
                  ? ` (+${formatRupees(m.pricePerPersonPerNight)}/person/night)`
                  : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Upgrades and add-ons</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {getVisibleAddOns().map((a) => {
            const checked = state.addOnIds.includes(a.id);
            return (
              <label
                key={a.id}
                className={cn(
                  "flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                  checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) =>
                    onSet(
                      "addOnIds",
                      v === true
                        ? [...state.addOnIds, a.id]
                        : state.addOnIds.filter((id) => id !== a.id),
                    )
                  }
                  aria-label={a.label}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{a.label}</span>
                  <span className="block text-xs text-muted-foreground">{a.description}</span>
                  <span className="mt-1 block text-xs font-semibold text-primary">
                    +{formatRupees(a.price)}{" "}
                    {a.unit === "per-person"
                      ? "per traveller"
                      : a.unit === "per-night"
                        ? "per night"
                        : "per trip"}
                  </span>
                </span>
              </label>
            );
          })}
          {bookingAddOns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No add-ons configured for this package.</p>
          ) : null}
        </div>
      </fieldset>
    </>
  );
}

function StepTransport({
  pkg,
  detail,
  state,
  errors,
  onSet,
}: {
  pkg: TourPackageRecord;
  detail: PackageDetail;
  state: WizardState;
  errors: Errors;
  onSet: SetFn;
}) {
  return (
    <>
      {pkg.includesVehicle && detail.vehicleOptions.length > 0 ? (
        <fieldset>
          <legend className="text-sm font-medium">Vehicle</legend>
          <div className="mt-3 space-y-2">
            {detail.vehicleOptions.map((v) => {
              const active = state.vehicleId === v.id;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  )}
                >
                  <input
                    type="radio"
                    name="vehicle"
                    className="mt-1 accent-[hsl(var(--primary))]"
                    checked={active}
                    onChange={() => onSet("vehicleId", v.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{v.category}</span>
                    <span className="block text-xs text-muted-foreground">
                      Seats {v.seating} · {v.ac ? "Air conditioned" : "Non AC"} · {v.pickup} → {v.drop}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-primary">
                      {v.upgradePrice > 0 ? `+${formatRupees(v.upgradePrice)} per trip` : "Included"}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <FieldError id="bk-vehicle-error" message={errors.vehicleId} />
        </fieldset>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          This package is quoted without a vehicle. Tell us below if you need transport and we will
          add it to the quote.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bk-pickup">Pickup location</Label>
          <Input
            id="bk-pickup"
            className="mt-1.5"
            maxLength={160}
            value={state.pickup}
            onChange={(e) => onSet("pickup", e.target.value)}
            aria-invalid={Boolean(errors.pickup)}
          />
          <FieldError id="bk-pickup-error" message={errors.pickup} />
        </div>
        <div>
          <Label htmlFor="bk-drop">Drop location (optional)</Label>
          <Input
            id="bk-drop"
            className="mt-1.5"
            maxLength={160}
            value={state.drop}
            onChange={(e) => onSet("drop", e.target.value)}
          />
          <FieldError id="bk-drop-error" message={errors.drop} />
        </div>
        <div>
          <Label htmlFor="bk-time">Preferred pickup time (optional)</Label>
          <Input
            id="bk-time"
            type="time"
            className="mt-1.5"
            value={state.pickupTime}
            onChange={(e) => onSet("pickupTime", e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

function StepReview({
  detail,
  state,
  errors,
  estimate,
  onSet,
}: {
  detail: PackageDetail;
  state: WizardState;
  errors: Errors;
  estimate: ReturnType<typeof estimateBooking>;
  onSet: SetFn;
}) {
  const inclusions = detail.policies.find((p) => p.key === "inclusions" && p.visible);
  const exclusions = detail.policies.find((p) => p.key === "exclusions" && p.visible);
  const terms = detail.policies.filter(
    (p) => p.visible && ["terms", "payment-policy", "cancellation-policy", "child-policy"].includes(p.key),
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {inclusions ? (
          <section className="min-w-0 rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold">{inclusions.title}</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {inclusions.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {exclusions ? (
          <section className="min-w-0 rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold">{exclusions.title}</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {exclusions.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <section>
        <h3 className="text-sm font-bold">Price break-up</h3>
        <div className="mt-2">
          <PriceBreakdown estimate={estimate} />
        </div>
      </section>

      <fieldset>
        <legend className="text-sm font-medium">Special requirements</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {specialRequirementOptions.map((tag) => {
            const checked = state.requirementTags.includes(tag);
            return (
              <label key={tag} className="flex min-w-0 cursor-pointer items-center gap-2.5 text-sm">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) =>
                    onSet(
                      "requirementTags",
                      v === true
                        ? [...state.requirementTags, tag]
                        : state.requirementTags.filter((t) => t !== tag),
                    )
                  }
                  aria-label={tag}
                />
                <span className="min-w-0">{tag}</span>
              </label>
            );
          })}
        </div>
        <div className="mt-3">
          <Label htmlFor="bk-notes">Anything else we should plan for?</Label>
          <Textarea
            id="bk-notes"
            className="mt-1.5"
            rows={4}
            maxLength={600}
            value={state.notes}
            onChange={(e) => onSet("notes", e.target.value)}
          />
          <FieldError id="bk-notes-error" message={errors.notes} />
        </div>
      </fieldset>

      {terms.length ? (
        <section className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold">Booking terms</h3>
          {terms.map((policy) => (
            <div key={policy.id} className="mt-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {policy.title}
              </h4>
              <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                {policy.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <Checkbox
            checked={state.agreed}
            onCheckedChange={(v) => onSet("agreed", v === true)}
            aria-label="Accept booking terms"
          />
          <span className="min-w-0">
            I have read the inclusions, exclusions and booking terms, and I understand the amount
            shown is an estimate until South Zoom Tourism confirms it. See our{" "}
            <AppLink href="/faqs" className="font-semibold text-primary hover:underline">
              booking FAQs
            </AppLink>
            .
          </span>
        </label>
        <FieldError id="bk-agree-error" message={errors.agreed} />
      </div>
    </>
  );
}

function StepSubmit({
  state,
  errors,
  estimate,
  onSet,
  totalTravellers,
}: {
  state: WizardState;
  errors: Errors;
  estimate: ReturnType<typeof estimateBooking>;
  onSet: SetFn;
  totalTravellers: number;
}) {
  return (
    <>
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
        <p className="font-semibold">
          {totalTravellers} traveller{totalTravellers === 1 ? "" : "s"} ·{" "}
          {estimate.available ? `${formatRupees(estimate.total)} estimated` : "Price on request"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Nothing is charged now. We confirm seats within a few hours and hold them for{" "}
          {bookingSettings.holdHours} hours while you review the final quote.
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">How would you like to pay the advance?</legend>
        <div className="mt-3 space-y-2">
          {paymentModes
            .filter((m) => m.visible)
            .sort((a, b) => a.order - b.order)
            .map((mode) => {
              const active = state.paymentMode === mode.id;
              return (
                <label
                  key={mode.id}
                  className={cn(
                    "flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1 accent-[hsl(var(--primary))]"
                    checked={active}
                    onChange={() => onSet("paymentMode", mode.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{mode.label}</span>
                    <span className="block text-xs text-muted-foreground">{mode.description}</span>
                  </span>
                </label>
              );
            })}
        </div>
        <FieldError id="bk-payment-error" message={errors.paymentMode} />
      </fieldset>

      {estimate.manualChildren > 0 ? (
        <p className="flex gap-2 rounded-lg bg-amber-500/10 p-3 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            Some child ages need a manual rate confirmation — our team will include them in the final
            quote.
          </span>
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[11px]">
        <span className="font-bold text-foreground">South Zoom Tourism</span>
        <span className="text-muted-foreground font-medium">{company.msmeRegistration}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Prefer chat? You can also send the same details on{" "}
        <a
          href={waLink("Hi South Zoom Tourism, I would like to book a tour package.")}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp
        </a>
        .
      </p>
    </>
  );
}

export { buildWhatsAppSummary };
