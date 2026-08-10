import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HotelStepIndicator } from "./hotel-step-indicator";
import { StayPriceSummary } from "./stay-price-summary";
import {
  HOTEL_BOOKING_DRAFT_KEY,
  buildHotelSnapshot,
  buildPriceSnapshot,
  citySlug,
  defaultCheckIn,
  defaultCheckOut,
  formatStayDay,
  getBookableRooms,
  getHotelPaymentMethods,
  hotelAllowsPayAtHotel,
  hotelBookingSettings,
  hotelBookingSteps,
  hotelNeedsPartnerApproval,
  inr,
  makeHotelBookingNumber,
  makeInvoiceNumber,
  quoteFor,
  ratePlanSnapshotOf,
  reserveRoomInventory,
  saveHotelBooking,
  visibleArrivalSlots,
  visibleMealPreferences,
  specialRequestTags,
  type GuestEntry,
  type HotelBookingRecord,
  type PaymentSplit,
} from "@/content/hotel-booking";
import {
  getPublishedHotels,
  hotelsSearchDefaults,
  isValidISODate,
  nightsBetween,
  todayISO,
  type HotelRecord,
} from "@/content/hotels";
import { getListingAttributes } from "@/content/hotel-listing";
import type { RoomStay } from "@/content/hotel-details";

type WizardState = {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  hotelId: string;
  roomId: string;
  ratePlanId: string;
  quantity: number;
  refundableOnly: boolean;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestCity: string;
  idType: string;
  additionalGuests: GuestEntry[];
  mealPreference: string;
  arrivalSlot: string;
  requestTags: string[];
  notes: string;
  paymentMethodId: string;
  paymentSplit: PaymentSplit;
};

const idTypes = ["Aadhaar", "Passport", "Driving licence", "Voter ID"];

const initialState = (seed: Partial<WizardState>): WizardState => ({
  destination: "",
  checkIn: defaultCheckIn(),
  checkOut: defaultCheckOut(),
  rooms: hotelsSearchDefaults.rooms ?? 1,
  adults: hotelsSearchDefaults.adults ?? 2,
  children: 0,
  hotelId: "",
  roomId: "",
  ratePlanId: "",
  quantity: 1,
  refundableOnly: false,
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  guestCity: "",
  idType: idTypes[0],
  additionalGuests: [],
  mealPreference: visibleMealPreferences()[0]?.label ?? "No preference",
  arrivalSlot: visibleArrivalSlots()[1]?.label ?? "",
  requestTags: [],
  notes: "",
  paymentMethodId: "qr",
  paymentSplit: "advance",
  ...seed,
});

const phoneOk = (value: string) => /^[6-9]\d{9}$/.test(value.replace(/[^\d]/g, "").slice(-10));
const emailOk = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export function HotelBookingWizard({ seed }: { seed: Partial<WizardState> }) {
  const navigate = useNavigate();
  const [state, setState] = useState<WizardState>(() => initialState(seed));
  const [step, setStep] = useState(seed.hotelId ? (seed.roomId ? 2 : 1) : 0);
  const [maxReached, setMaxReached] = useState(step);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inventoryNotice, setInventoryNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  /* Draft persistence — back/next and reloads never lose data. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HOTEL_BOOKING_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<WizardState>;
      setState((prev) => ({ ...prev, ...draft, ...seed }));
    } catch {
      /* ignore malformed drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(HOTEL_BOOKING_DRAFT_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  const hotels = useMemo(() => getPublishedHotels(), []);
  const destinationOptions = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.city))).sort(),
    [hotels],
  );

  const stay: RoomStay = useMemo(
    () => ({
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      rooms: Math.max(1, state.quantity || state.rooms),
      adults: state.adults,
      children: state.children,
    }),
    [state.checkIn, state.checkOut, state.quantity, state.rooms, state.adults, state.children],
  );

  const nights = nightsBetween(state.checkIn, state.checkOut);

  const matchingHotels = useMemo(
    () =>
      state.destination
        ? hotels.filter((h) => h.city.toLowerCase() === state.destination.toLowerCase())
        : hotels,
    [hotels, state.destination],
  );

  const hotel: HotelRecord | null = useMemo(
    () => hotels.find((h) => h.id === state.hotelId) ?? null,
    [hotels, state.hotelId],
  );

  const roomOptions = useMemo(
    () => (hotel ? getBookableRooms(hotel, stay) : []),
    [hotel, stay],
  );

  const selectedRoomOption = roomOptions.find((r) => r.room.id === state.roomId) ?? null;

  const quote = useMemo(
    () =>
      hotel && selectedRoomOption && state.ratePlanId
        ? quoteFor(hotel, selectedRoomOption.room, state.ratePlanId, stay)
        : null,
    [hotel, selectedRoomOption, state.ratePlanId, stay],
  );

  const paymentMethods = useMemo(
    () => getHotelPaymentMethods(hotel ? hotelAllowsPayAtHotel(hotel.id) : false),
    [hotel],
  );

  const goto = (next: number) => {
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
    setErrors({});
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  function validate(current: number): boolean {
    const next: Record<string, string> = {};
    if (current === 0) {
      if (!isValidISODate(state.checkIn) || state.checkIn < todayISO())
        next.checkIn = "Choose a check-in date from today onwards.";
      if (!isValidISODate(state.checkOut) || state.checkOut <= state.checkIn)
        next.checkOut = "Check-out must be after check-in.";
      if (state.adults < 1) next.adults = "At least one adult is required.";
      if (state.rooms < 1) next.rooms = "Select at least one room.";
      if (state.adults > state.rooms * 4)
        next.rooms = "Add more rooms — up to 4 adults can share one room.";
    }
    if (current === 1 && !state.hotelId) next.hotel = "Select the hotel you want to book.";
    if (current === 2) {
      if (!state.roomId) next.room = "Select a room type.";
      else if (!state.ratePlanId) next.ratePlan = "Select a rate plan.";
      else if (quote && !quote.occupancy.ok) next.ratePlan = quote.occupancy.reason ?? "";
      else if (quote && !quote.meetsMinNights)
        next.ratePlan = `This rate needs a minimum stay of ${quote.minNights} nights.`;
      else if (selectedRoomOption && selectedRoomOption.availability.unitsAvailable < state.quantity)
        next.room =
          selectedRoomOption.availability.reason ?? "Not enough rooms left for these dates.";
    }
    if (current === 3) {
      if (state.guestName.trim().length < 3) next.guestName = "Enter the primary guest's full name.";
      if (!phoneOk(state.guestPhone)) next.guestPhone = "Enter a valid 10-digit Indian mobile number.";
      if (!emailOk(state.guestEmail)) next.guestEmail = "Enter a valid email address.";
      const blank = state.additionalGuests.some((g) => g.name.trim().length < 2);
      if (blank) next.additionalGuests = "Remove empty guest rows or enter their names.";
      const totalGuests = 1 + state.additionalGuests.length;
      if (totalGuests > state.adults + state.children)
        next.additionalGuests = `You listed ${totalGuests} guests but booked for ${state.adults + state.children}.`;
    }
    if (current === 5 && !state.paymentMethodId) next.payment = "Choose how you'd like to pay.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext() {
    if (!validate(step)) return;
    if (step === hotelBookingSteps.length - 2) {
      void submit();
      return;
    }
    goto(step + 1);
  }

  async function submit() {
    if (!hotel || !selectedRoomOption || !quote) return;
    setSubmitting(true);
    setInventoryNotice(null);

    // Re-check live inventory immediately before creating the booking.
    const recheck = reserveRoomInventory(selectedRoomOption.room, stay, state.quantity);
    if (!recheck.ok) {
      setSubmitting(false);
      setInventoryNotice(
        `${recheck.reason ?? "Those rooms were just taken."} Please pick another room or rate plan — nothing has been booked.`,
      );
      goto(2);
      return;
    }

    const pendingApproval = hotelNeedsPartnerApproval(hotel.id);
    const bookingNumber = makeHotelBookingNumber();
    const method = paymentMethods.find((m) => m.id === state.paymentMethodId);
    const price = buildPriceSnapshot(quote, state.paymentSplit);

    const record: HotelBookingRecord = {
      bookingNumber,
      invoiceNumber: makeInvoiceNumber(bookingNumber),
      createdAt: new Date().toISOString(),
      status: pendingApproval ? "pending-hotel-confirmation" : "confirmed",
      source: "web:/book/hotel",
      stay: {
        destination: state.destination || hotel.city,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        nights,
        rooms: state.quantity,
        adults: state.adults,
        children: state.children,
      },
      hotelSnapshot: buildHotelSnapshot(hotel),
      roomSnapshot: {
        id: selectedRoomOption.room.id,
        slug: selectedRoomOption.roomSlug,
        name: selectedRoomOption.room.name,
        bedType: selectedRoomOption.room.bedType,
        maxAdults: selectedRoomOption.room.maxAdults,
        maxChildren: selectedRoomOption.room.maxChildren,
        quantity: state.quantity,
      },
      ratePlanSnapshot: ratePlanSnapshotOf(quote),
      priceSnapshot: price,
      primaryGuest: {
        name: state.guestName.trim(),
        phone: state.guestPhone.trim(),
        email: state.guestEmail.trim(),
        city: state.guestCity.trim(),
        idType: state.idType,
      },
      additionalGuests: state.additionalGuests,
      preferences: {
        mealPreference: state.mealPreference,
        arrivalSlot: state.arrivalSlot,
        requestTags: state.requestTags,
        notes: state.notes.trim(),
      },
      payment: {
        methodId: state.paymentMethodId,
        methodLabel: method?.label ?? state.paymentMethodId,
        split: state.paymentSplit,
        amountNow: price.advanceDue,
      },
      inventoryReserved: true,
      assignedTo: null,
      followUpAt: null,
    };

    saveHotelBooking(record);
    try {
      window.localStorage.removeItem(HOTEL_BOOKING_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    await navigate({ to: "/book/hotel/confirmation", search: { ref: bookingNumber } });
  }

  return (
    <div ref={topRef} className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <HotelStepIndicator current={step} maxReached={maxReached} onJump={goto} />

        {inventoryNotice ? (
          <p
            role="alert"
            className="mt-5 flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>{inventoryNotice}</span>
          </p>
        ) : null}

        <div className="mt-6 min-w-0">
          <h2 className="text-lg font-bold tracking-tight">{hotelBookingSteps[step].label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{hotelBookingSteps[step].hint}</p>

          <div className="mt-5 min-w-0 space-y-5">
            {step === 0 ? (
              <StayStep state={state} set={set} errors={errors} destinations={destinationOptions} />
            ) : null}

            {step === 1 ? (
              <HotelStep
                hotels={matchingHotels}
                selected={state.hotelId}
                error={errors.hotel}
                onSelect={(id) => {
                  setState((prev) => ({ ...prev, hotelId: id, roomId: "", ratePlanId: "" }));
                }}
              />
            ) : null}

            {step === 2 ? (
              <RoomStep
                options={roomOptions}
                state={state}
                set={set}
                setState={setState}
                errors={errors}
              />
            ) : null}

            {step === 3 ? <GuestStep state={state} set={set} setState={setState} errors={errors} /> : null}

            {step === 4 ? (
              <SummaryStep state={state} hotel={hotel} quote={quote} nights={nights} />
            ) : null}

            {step === 5 ? (
              <PaymentStep
                state={state}
                set={set}
                errors={errors}
                methods={paymentMethods}
                total={quote?.total ?? 0}
                pendingApproval={hotel ? hotelNeedsPartnerApproval(hotel.id) : false}
              />
            ) : null}
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => goto(Math.max(0, step - 1))}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft aria-hidden="true" /> Back
          </Button>
          <Button type="button" onClick={handleNext} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" /> Confirming availability
              </>
            ) : step === hotelBookingSteps.length - 2 ? (
              "Confirm booking"
            ) : (
              <>
                Continue <ArrowRight aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold tracking-tight">Your stay</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <SummaryRow label="Dates">
              {formatStayDay(state.checkIn)} → {formatStayDay(state.checkOut)}
            </SummaryRow>
            <SummaryRow label="Nights">{nights || "—"}</SummaryRow>
            <SummaryRow label="Hotel">{hotel ? hotel.name : "Not chosen yet"}</SummaryRow>
            <SummaryRow label="Room">
              {selectedRoomOption
                ? `${state.quantity} × ${selectedRoomOption.room.name}`
                : "Not chosen yet"}
            </SummaryRow>
            <SummaryRow label="Rate plan">{quote ? quote.mealPlanLabel : "Not chosen yet"}</SummaryRow>
            <SummaryRow label="Guests">
              {state.adults} adult{state.adults === 1 ? "" : "s"}
              {state.children ? `, ${state.children} child${state.children === 1 ? "" : "ren"}` : ""}
            </SummaryRow>
          </dl>
          <div className="mt-3 border-t border-border pt-3">
            <StayPriceSummary quote={quote} split={state.paymentSplit} compact showNights={false} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

/* ---------------------------- Step 1: stay ---------------------------- */

function StayStep({
  state,
  set,
  errors,
  destinations,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  errors: Record<string, string>;
  destinations: string[];
}) {
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="grid min-w-0 gap-1.5 sm:col-span-2">
        <Label htmlFor="hb-destination">Destination</Label>
        <select
          id="hb-destination"
          className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
          value={state.destination}
          onChange={(e) => set("destination", e.target.value)}
        >
          <option value="">All destinations</option>
          {destinations.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="grid min-w-0 gap-1.5">
        <Label htmlFor="hb-checkin">Check-in</Label>
        <Input
          id="hb-checkin"
          type="date"
          min={todayISO()}
          value={state.checkIn}
          onChange={(e) => set("checkIn", e.target.value)}
        />
        <FieldError message={errors.checkIn} />
      </div>
      <div className="grid min-w-0 gap-1.5">
        <Label htmlFor="hb-checkout">Check-out</Label>
        <Input
          id="hb-checkout"
          type="date"
          min={state.checkIn}
          value={state.checkOut}
          onChange={(e) => set("checkOut", e.target.value)}
        />
        <FieldError message={errors.checkOut} />
      </div>

      <div className="grid min-w-0 gap-1.5">
        <Label htmlFor="hb-rooms">Rooms</Label>
        <Input
          id="hb-rooms"
          type="number"
          min={1}
          max={hotelBookingSettings.maxRooms}
          value={state.rooms}
          onChange={(e) => {
            const rooms = Math.max(1, Math.min(hotelBookingSettings.maxRooms, Number(e.target.value) || 1));
            set("rooms", rooms);
            set("quantity", rooms);
          }}
        />
        <FieldError message={errors.rooms} />
      </div>
      <div className="grid min-w-0 gap-1.5">
        <Label htmlFor="hb-adults">Adults</Label>
        <Input
          id="hb-adults"
          type="number"
          min={1}
          max={hotelBookingSettings.maxAdults}
          value={state.adults}
          onChange={(e) =>
            set("adults", Math.max(1, Math.min(hotelBookingSettings.maxAdults, Number(e.target.value) || 1)))
          }
        />
        <FieldError message={errors.adults} />
      </div>
      <div className="grid min-w-0 gap-1.5">
        <Label htmlFor="hb-children">Children</Label>
        <Input
          id="hb-children"
          type="number"
          min={0}
          max={hotelBookingSettings.maxChildren}
          value={state.children}
          onChange={(e) =>
            set("children", Math.max(0, Math.min(hotelBookingSettings.maxChildren, Number(e.target.value) || 0)))
          }
        />
      </div>
    </div>
  );
}

/* ---------------------------- Step 2: hotel --------------------------- */

function HotelStep({
  hotels,
  selected,
  error,
  onSelect,
}: {
  hotels: HotelRecord[];
  selected: string;
  error?: string;
  onSelect: (id: string) => void;
}) {
  if (!hotels.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No published hotels match this destination. Go back and pick another destination.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      <FieldError message={error} />
      <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
        {hotels.map((h) => {
          const attrs = getListingAttributes(h.id);
          const active = h.id === selected;
          return (
            <li key={h.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(h.id)}
                aria-pressed={active}
                className={cn(
                  "flex w-full min-w-0 gap-3 rounded-xl border p-3 text-left transition-colors",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                )}
              >
                <img
                  src={h.image}
                  alt={h.imageAlt}
                  width={96}
                  height={96}
                  loading="lazy"
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{h.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {h.city}, {h.state} · {h.starRating}-star
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {attrs?.instantConfirmation ? (
                      <Badge variant="secondary">Instant confirmation</Badge>
                    ) : (
                      <Badge variant="outline">Hotel approval</Badge>
                    )}
                    {attrs?.payAtHotel ? <Badge variant="outline">Pay at hotel</Badge> : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------- Step 3: room & rate ------------------------ */

function RoomStep({
  options,
  state,
  set,
  setState,
  errors,
}: {
  options: ReturnType<typeof getBookableRooms>;
  state: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  errors: Record<string, string>;
}) {
  if (!options.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        This hotel has no published rooms for the selected dates. Go back and change the dates or the
        hotel.
      </div>
    );
  }

  const selected = options.find((o) => o.room.id === state.roomId) ?? null;
  const plans = selected
    ? selected.quotes.filter((q) => (state.refundableOnly ? q.refundable : true))
    : [];

  return (
    <div className="min-w-0 space-y-5">
      <FieldError message={errors.room} />
      <ul className="grid min-w-0 gap-3">
        {options.map((option) => {
          const active = option.room.id === state.roomId;
          const soldOut = option.availability.unitsAvailable === 0;
          return (
            <li key={option.room.id} className="min-w-0">
              <button
                type="button"
                disabled={soldOut}
                aria-pressed={active}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    roomId: option.room.id,
                    ratePlanId: option.bestQuote?.ratePlan.id ?? "",
                    quantity: Math.min(prev.quantity, Math.max(1, option.availability.unitsAvailable)),
                  }))
                }
                className={cn(
                  "flex w-full min-w-0 flex-col gap-2 rounded-xl border p-3 text-left transition-colors sm:flex-row sm:items-center",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  soldOut && "cursor-not-allowed opacity-60",
                )}
              >
                <img
                  src={option.room.image}
                  alt={option.room.imageAlt}
                  width={96}
                  height={72}
                  loading="lazy"
                  className="h-20 w-full shrink-0 rounded-lg object-cover sm:w-28"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{option.room.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {option.room.bedType} · up to {option.room.maxAdults} adults,{" "}
                    {option.room.maxChildren} children
                  </span>
                  <span className="mt-1 block text-xs">
                    {soldOut ? (
                      <span className="text-destructive">Sold out for these dates</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {option.availability.unitsAvailable} room
                        {option.availability.unitsAvailable === 1 ? "" : "s"} left
                      </span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-extrabold tabular-nums text-primary">
                    {option.bestQuote ? inr(option.bestQuote.total) : "On request"}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">total incl. taxes</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <div className="min-w-0 space-y-4 rounded-xl border border-border p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h3 className="min-w-0 truncate text-sm font-bold">Rate plans — {selected.room.name}</h3>
            <label className="flex shrink-0 items-center gap-2 text-xs">
              <Checkbox
                checked={state.refundableOnly}
                onCheckedChange={(v) => set("refundableOnly", v === true)}
                aria-label="Show only free-cancellation rates"
              />
              Free cancellation only
            </label>
          </div>

          <FieldError message={errors.ratePlan} />

          {plans.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No refundable rate is published for this room. Clear the filter to see non-refundable
              options.
            </p>
          ) : (
            <ul className="grid min-w-0 gap-2">
              {plans.map((plan) => {
                const active = plan.ratePlan.id === state.ratePlanId;
                return (
                  <li key={plan.ratePlan.id} className="min-w-0">
                    <button
                      type="button"
                      aria-pressed={active}
                      disabled={!plan.selectable}
                      onClick={() => set("ratePlanId", plan.ratePlan.id)}
                      className={cn(
                        "grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3 text-left",
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                        !plan.selectable && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {plan.mealPlanLabel}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {plan.refundable ? "Free cancellation" : "Non-refundable"}
                          {plan.minNights > 1 ? ` · min ${plan.minNights} nights` : ""}
                        </span>
                        {!plan.selectable ? (
                          <span className="block text-xs text-destructive">
                            {plan.occupancy.reason ??
                              (!plan.meetsMinNights
                                ? `Needs a ${plan.minNights}-night stay`
                                : "Not available for these dates")}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-bold tabular-nums">
                          {inr(plan.total)}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {inr(plan.perNightAverage)}/night
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="grid min-w-0 gap-1.5 sm:max-w-48">
            <Label htmlFor="hb-quantity">Rooms of this type</Label>
            <Input
              id="hb-quantity"
              type="number"
              min={1}
              max={Math.max(1, Math.min(hotelBookingSettings.maxRooms, selected.availability.unitsAvailable))}
              value={state.quantity}
              onChange={(e) => {
                const max = Math.max(1, Math.min(hotelBookingSettings.maxRooms, selected.availability.unitsAvailable));
                set("quantity", Math.max(1, Math.min(max, Number(e.target.value) || 1)));
              }}
            />
            <p className="text-xs text-muted-foreground">
              Up to {Math.max(1, Math.min(hotelBookingSettings.maxRooms, selected.availability.unitsAvailable))} for
              these dates.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------- Step 4: guests -------------------------- */

function GuestStep({
  state,
  set,
  setState,
  errors,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  errors: Record<string, string>;
}) {
  const addGuest = () =>
    setState((prev) => ({
      ...prev,
      additionalGuests: [
        ...prev.additionalGuests,
        { id: `g-${Date.now()}-${prev.additionalGuests.length}`, name: "", age: null, type: "adult" },
      ],
    }));

  const updateGuest = (id: string, patch: Partial<GuestEntry>) =>
    setState((prev) => ({
      ...prev,
      additionalGuests: prev.additionalGuests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));

  const removeGuest = (id: string) =>
    setState((prev) => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter((g) => g.id !== id),
    }));

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="hb-name">Primary guest name</Label>
          <Input
            id="hb-name"
            value={state.guestName}
            autoComplete="name"
            onChange={(e) => set("guestName", e.target.value)}
          />
          <FieldError message={errors.guestName} />
        </div>
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="hb-phone">Mobile number</Label>
          <Input
            id="hb-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={state.guestPhone}
            onChange={(e) => set("guestPhone", e.target.value)}
          />
          <FieldError message={errors.guestPhone} />
        </div>
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="hb-email">Email (optional)</Label>
          <Input
            id="hb-email"
            type="email"
            autoComplete="email"
            value={state.guestEmail}
            onChange={(e) => set("guestEmail", e.target.value)}
          />
          <FieldError message={errors.guestEmail} />
        </div>
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="hb-city">City (optional)</Label>
          <Input
            id="hb-city"
            value={state.guestCity}
            onChange={(e) => set("guestCity", e.target.value)}
          />
        </div>
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="hb-idtype">ID for check-in</Label>
          <select
            id="hb-idtype"
            className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
            value={state.idType}
            onChange={(e) => set("idType", e.target.value)}
          >
            {idTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="hb-meal">Meal preference</Label>
          <select
            id="hb-meal"
            className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
            value={state.mealPreference}
            onChange={(e) => set("mealPreference", e.target.value)}
          >
            {visibleMealPreferences().map((m) => (
              <option key={m.id} value={m.label}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="hb-arrival">Expected arrival</Label>
          <select
            id="hb-arrival"
            className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
            value={state.arrivalSlot}
            onChange={(e) => set("arrivalSlot", e.target.value)}
          >
            {visibleArrivalSlots().map((a) => (
              <option key={a.id} value={a.label}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-w-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h3 className="min-w-0 text-sm font-bold">Additional guests</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGuest}
            disabled={state.additionalGuests.length >= hotelBookingSettings.maxAdditionalGuests}
          >
            <Plus aria-hidden="true" /> Add guest
          </Button>
        </div>
        <FieldError message={errors.additionalGuests} />
        {state.additionalGuests.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Only the primary guest is listed. Add names for everyone the hotel should register.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {state.additionalGuests.map((guest, i) => (
              <li
                key={guest.id}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_8rem_auto]"
              >
                <div className="grid min-w-0 gap-1.5">
                  <Label htmlFor={`hb-guest-${guest.id}`} className="text-xs">
                    Guest {i + 2} name
                  </Label>
                  <Input
                    id={`hb-guest-${guest.id}`}
                    value={guest.name}
                    onChange={(e) => updateGuest(guest.id, { name: e.target.value })}
                  />
                </div>
                <div className="grid min-w-0 gap-1.5">
                  <Label htmlFor={`hb-guest-age-${guest.id}`} className="text-xs">
                    Age
                  </Label>
                  <Input
                    id={`hb-guest-age-${guest.id}`}
                    type="number"
                    min={0}
                    max={120}
                    value={guest.age ?? ""}
                    onChange={(e) =>
                      updateGuest(guest.id, {
                        age: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid min-w-0 gap-1.5">
                  <Label htmlFor={`hb-guest-type-${guest.id}`} className="text-xs">
                    Type
                  </Label>
                  <select
                    id={`hb-guest-type-${guest.id}`}
                    className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
                    value={guest.type}
                    onChange={(e) =>
                      updateGuest(guest.id, { type: e.target.value as GuestEntry["type"] })
                    }
                  >
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                  </select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGuest(guest.id)}
                  aria-label={`Remove guest ${i + 2}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <fieldset className="min-w-0">
        <legend className="text-sm font-bold">Special requests</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {specialRequestTags.map((tag) => {
            const active = state.requestTags.includes(tag.label);
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    requestTags: active
                      ? prev.requestTags.filter((t) => t !== tag.label)
                      : [...prev.requestTags, tag.label],
                  }))
                }
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border",
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid min-w-0 gap-1.5">
          <Label htmlFor="hb-notes">Anything else for the hotel? (optional)</Label>
          <Textarea
            id="hb-notes"
            rows={3}
            maxLength={600}
            value={state.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </fieldset>
    </div>
  );
}

/* ---------------------------- Step 5: summary ------------------------- */

function SummaryStep({
  state,
  hotel,
  quote,
  nights,
}: {
  state: WizardState;
  hotel: HotelRecord | null;
  quote: ReturnType<typeof quoteFor>;
  nights: number;
}) {
  if (!hotel || !quote) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Go back and finish the hotel and rate-plan steps to see the full summary.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <dl className="min-w-0 divide-y divide-border rounded-xl border border-border">
        <SummaryLine label="Hotel">
          {hotel.name}, {hotel.city} · {hotel.starRating}-star
        </SummaryLine>
        <SummaryLine label="Stay">
          {formatStayDay(state.checkIn)} → {formatStayDay(state.checkOut)} · {nights} night
          {nights === 1 ? "" : "s"}
        </SummaryLine>
        <SummaryLine label="Rooms">
          {state.quantity} × {quote.mealPlanLabel} ·{" "}
          {quote.refundable ? "free cancellation" : "non-refundable"}
        </SummaryLine>
        <SummaryLine label="Guests">
          {state.adults} adult{state.adults === 1 ? "" : "s"}
          {state.children ? `, ${state.children} child${state.children === 1 ? "" : "ren"}` : ""} ·{" "}
          {1 + state.additionalGuests.length} named
        </SummaryLine>
        <SummaryLine label="Primary guest">
          {state.guestName || "—"} · {state.guestPhone || "—"}
        </SummaryLine>
        <SummaryLine label="Preferences">
          {[state.mealPreference, state.arrivalSlot, state.requestTags.join(", ")]
            .filter(Boolean)
            .join(" · ")}
        </SummaryLine>
      </dl>

      <StayPriceSummary quote={quote} split={state.paymentSplit} />
    </div>
  );
}

function SummaryLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:w-40 sm:shrink-0">
        {label}
      </dt>
      <dd className="min-w-0 text-sm sm:text-right">{children}</dd>
    </div>
  );
}

/* ---------------------------- Step 6: payment ------------------------- */

function PaymentStep({
  state,
  set,
  errors,
  methods,
  total,
  pendingApproval,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  errors: Record<string, string>;
  methods: ReturnType<typeof getHotelPaymentMethods>;
  total: number;
  pendingApproval: boolean;
}) {
  const advance = Math.round((total * hotelBookingSettings.advancePercent) / 100);

  return (
    <div className="min-w-0 space-y-5">
      {pendingApproval ? (
        <p className="flex gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            This property confirms bookings manually. We raise the request now and confirm with the
            partner before collecting any payment.
          </span>
        </p>
      ) : null}

      <FieldError message={errors.payment} />
      <ul className="grid min-w-0 gap-2">
        {methods.map((method) => {
          const active = method.id === state.paymentMethodId;
          return (
            <li key={method.id} className="min-w-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => set("paymentMethodId", method.id)}
                className={cn(
                  "w-full min-w-0 rounded-lg border p-3 text-left transition-colors",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                )}
              >
                <span className="block text-sm font-semibold">{method.label}</span>
                <span className="block text-xs text-muted-foreground">{method.description}</span>
                {active ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {method.instructions}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {hotelBookingSettings.allowPartialAdvance ? (
        <fieldset className="min-w-0">
          <legend className="text-sm font-bold">How much would you like to pay now?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={state.paymentSplit === "advance"}
              onClick={() => set("paymentSplit", "advance")}
              className={cn(
                "rounded-lg border p-3 text-left",
                state.paymentSplit === "advance"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
              )}
            >
              <span className="block text-sm font-semibold">
                {hotelBookingSettings.advancePercent}% advance
              </span>
              <span className="block text-xs text-muted-foreground">
                {inr(advance)} now, balance at check-in
              </span>
            </button>
            <button
              type="button"
              aria-pressed={state.paymentSplit === "full"}
              onClick={() => set("paymentSplit", "full")}
              className={cn(
                "rounded-lg border p-3 text-left",
                state.paymentSplit === "full"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
              )}
            >
              <span className="block text-sm font-semibold">Full payment</span>
              <span className="block text-xs text-muted-foreground">
                {inr(total)} now, nothing due at the hotel
              </span>
            </button>
          </div>
        </fieldset>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Nothing is charged on this page. We verify availability, then share payment details for your
        chosen method. Rooms are held for {hotelBookingSettings.holdHours} hours.
      </p>
    </div>
  );
}

export { citySlug };
