import { recordEnquiryForTracking } from "@/content/booking-status";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, MessageCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppLink } from "@/components/common/app-link";
import { company, waLink } from "@/content/site";
import {
  budgetBands,
  customTourFormBlock,
  customTourSteps,
  generateCustomTourReference,
  getHotelCategoryOptions,
  getRoomTypeChoices,
  getSightseeingOptions,
  getVehicleOptions,
  labelFor,
  mealPlanOptions,
  type CustomEnquiryPayload,
} from "@/content/custom-tour";
import { StepIndicator } from "./step-indicator";
import { DestinationPicker } from "./destination-picker";
import { SummaryPanel } from "./summary-panel";
import {
  buildSummary,
  DRAFT_KEY,
  initialState,
  toStops,
  validateStep,
  type CustomTourState,
  type Errors,
} from "./state";

const REVIEW_STEP = customTourSteps.length;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

export function CustomTourWizard() {
  const [state, setState] = useState<CustomTourState>(initialState);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const lastSubmit = useRef<{ hash: string; at: number } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const vehicleOptions = getVehicleOptions();
  const hotelCategoryOptions = getHotelCategoryOptions();
  const roomTypeChoices = getRoomTypeChoices();
  const sightseeingOptions = getSightseeingOptions();

  const rows = useMemo(() => buildSummary(state), [state]);

  /* Restore a saved draft (Save & continue later). */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { state: CustomTourState; step: number };
        if (parsed?.state) {
          setState({ ...initialState, ...parsed.state });
          const s = Math.min(Math.max(parsed.step ?? 0, 0), REVIEW_STEP);
          setStep(s);
          setMaxReached(s);
          toast.info("Draft restored", { description: "We picked up where you left off." });
        }
      }
    } catch {
      /* corrupt draft — start fresh */
    }
    setDraftLoaded(true);
  }, []);

  const set = <K extends keyof CustomTourState>(key: K, value: CustomTourState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const goTo = (next: number) => {
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleNext = () => {
    const e = validateStep(step, state);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please check the highlighted fields");
      return;
    }
    goTo(Math.min(step + 1, REVIEW_STEP));
  };

  const handleBack = () => goTo(Math.max(step - 1, 0));

  const saveDraft = () => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ state, step }));
      toast.success("Draft saved on this device", {
        description: "Come back any time — your selections will be waiting.",
      });
    } catch {
      toast.error("We couldn't save the draft in this browser.");
    }
  };

  const buildPayload = (ref: string): CustomEnquiryPayload => ({
    reference: ref,
    source: "custom-tour",
    page_url: typeof window !== "undefined" ? window.location.href : "",
    status: "new",
    assigned_to: null,
    follow_up_at: null,
    created_at: new Date().toISOString(),
    stops: toStops(state),
    start_date: state.startDate,
    days: state.days,
    adults: state.adults,
    children: state.children,
    child_ages: state.children > 0 ? state.childAges.trim() : null,
    vehicle_category: state.needVehicle ? state.vehicleCategory : null,
    self_drive_pickup: state.needVehicle ? state.pickupCity.trim() : null,
    hotel_required: state.hotelRequired,
    hotel_category: state.hotelRequired ? state.hotelCategory : null,
    room_type: state.hotelRequired ? state.roomType : null,
    rooms: state.hotelRequired ? state.rooms : null,
    meal_plan: state.hotelRequired ? state.mealPlan : null,
    sightseeing: state.sightseeing,
    guide_required: state.guideRequired,
    budget_band: state.budgetBand,
    budget_amount: state.budgetAmount ? Number(state.budgetAmount) : null,
    requirements: state.requirements.trim() || null,
    name: state.name.trim(),
    phone: state.phone.trim(),
    email: state.email.trim() || null,
    contact_consent: state.consent,
  });

  const summaryMessage = (ref: string) =>
    [
      `Custom tour enquiry — ${ref}`,
      ...rows.map((r) => `${r.label}: ${r.value}`),
      state.requirements.trim() ? `Notes: ${state.requirements.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  const handleSubmit = () => {
    // Re-validate every step so a jump-back edit can't skip a rule.
    for (let i = 0; i < customTourSteps.length; i += 1) {
      const e = validateStep(i, state);
      if (Object.keys(e).length > 0) {
        setErrors(e);
        goTo(i);
        toast.error("Some details are still missing", {
          description: `Please complete "${customTourSteps[i].title}".`,
        });
        return;
      }
    }

    const hash = JSON.stringify(state);
    const now = Date.now();
    if (
      lastSubmit.current &&
      lastSubmit.current.hash === hash &&
      now - lastSubmit.current.at < customTourFormBlock.duplicateWindowMs
    ) {
      toast.info("We already have this enquiry", {
        description: "You sent the same plan a moment ago — our team is on it.",
      });
      return;
    }
    lastSubmit.current = { hash, at: now };

    setSubmitting(true);
    const ref = generateCustomTourReference();
    // Structured payload matching the future `custom_enquiries` +
    // `custom_enquiry_items` tables. No backend is connected yet, so the
    // enquiry is handed to the team over WhatsApp and nothing is lost.
    const payload = buildPayload(ref);
    void payload;

    // Make the reference trackable on /booking-status.
    recordEnquiryForTracking({
      reference: ref,
      kind: "custom-tour",
      serviceLabel: "Custom tour enquiry",
      serviceTitle: payload.stops.length
        ? payload.stops.map((s) => s.destination_slug ?? "").filter(Boolean).join(" → ") ||
          "Customised itinerary"
        : "Customised itinerary",
      travelWindow: payload.start_date
        ? `${payload.start_date} · ${payload.days} day(s)`
        : `${payload.days} day(s)`,
      guestsLabel: `${payload.adults} adult(s)${payload.children ? `, ${payload.children} child(ren)` : ""}`,
      name: payload.name,
      phone: payload.phone,
      email: payload.email ?? "",
    });

    window.setTimeout(() => {
      setSubmitting(false);
      setReference(ref);
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      requestAnimationFrame(() => headingRef.current?.focus());
    }, 500);
  };

  /* ---------------------------------------------------------------- */
  /* Success state                                                     */
  /* ---------------------------------------------------------------- */

  if (reference) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold tracking-tight outline-none sm:text-2xl"
            >
              Your custom tour request is in
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference{" "}
              <span className="font-mono font-bold text-foreground">{reference}</span> —{" "}
              {customTourFormBlock.successNote}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold">What you sent us</h3>
          <div className="mt-2">
            <SummaryPanel rows={rows} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <a href={waLink(summaryMessage(reference))} target="_blank" rel="noreferrer noopener">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Send summary on WhatsApp
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`tel:${company.phoneRaw}`}>Call {company.phone}</a>
          </Button>
          <Button variant="ghost" asChild>
            <AppLink href="/tour-packages">Browse ready packages</AppLink>
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Steps                                                             */
  /* ---------------------------------------------------------------- */

  const stepTitle =
    step === REVIEW_STEP ? "Review & submit" : customTourSteps[step].title;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <StepIndicator current={Math.min(step, customTourSteps.length - 1)} maxReached={maxReached} onJump={goTo} />

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-6 text-lg font-bold tracking-tight outline-none sm:text-xl"
        >
          {stepTitle}
        </h2>

        <form
          className="mt-4 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (step === REVIEW_STEP) handleSubmit();
            else handleNext();
          }}
        >
          {/* Step 1 — route & dates */}
          {step === 0 ? (
            <>
              <DestinationPicker
                stops={state.stops}
                onChange={(next) => set("stops", next)}
                error={errors.stops}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Label htmlFor="ct-start">Travel start date</Label>
                  <Input
                    id="ct-start"
                    type="date"
                    className="mt-1.5"
                    value={state.startDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => set("startDate", e.target.value)}
                    aria-invalid={Boolean(errors.startDate)}
                    aria-describedby={errors.startDate ? "ct-start-err" : undefined}
                  />
                  <FieldError id="ct-start-err" message={errors.startDate} />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="ct-days">Number of days</Label>
                  <Input
                    id="ct-days"
                    type="number"
                    min={1}
                    max={60}
                    className="mt-1.5"
                    value={state.days}
                    onChange={(e) => set("days", Number(e.target.value) || 0)}
                    aria-invalid={Boolean(errors.days)}
                    aria-describedby={errors.days ? "ct-days-err" : undefined}
                  />
                  <FieldError id="ct-days-err" message={errors.days} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={state.flexibleDates}
                  onCheckedChange={(v) => set("flexibleDates", v === true)}
                />
                My dates are flexible by a few days
              </label>
            </>
          ) : null}

          {/* Step 2 — travellers & vehicle */}
          {step === 1 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Label htmlFor="ct-adults">Adults</Label>
                  <Input
                    id="ct-adults"
                    type="number"
                    min={1}
                    max={60}
                    className="mt-1.5"
                    value={state.adults}
                    onChange={(e) => set("adults", Number(e.target.value) || 0)}
                    aria-invalid={Boolean(errors.adults)}
                    aria-describedby={errors.adults ? "ct-adults-err" : undefined}
                  />
                  <FieldError id="ct-adults-err" message={errors.adults} />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="ct-children">Children</Label>
                  <Input
                    id="ct-children"
                    type="number"
                    min={0}
                    max={40}
                    className="mt-1.5"
                    value={state.children}
                    onChange={(e) => set("children", Number(e.target.value) || 0)}
                    aria-invalid={Boolean(errors.children)}
                    aria-describedby={errors.children ? "ct-children-err" : undefined}
                  />
                  <FieldError id="ct-children-err" message={errors.children} />
                </div>
              </div>

              {/* Conditional: ages only when children are travelling */}
              {state.children > 0 ? (
                <div className="min-w-0">
                  <Label htmlFor="ct-child-ages">Children's ages</Label>
                  <Input
                    id="ct-child-ages"
                    className="mt-1.5"
                    placeholder="e.g. 4, 9"
                    value={state.childAges}
                    onChange={(e) => set("childAges", e.target.value)}
                    aria-invalid={Boolean(errors.childAges)}
                    aria-describedby={errors.childAges ? "ct-child-ages-err" : undefined}
                  />
                  <FieldError id="ct-child-ages-err" message={errors.childAges} />
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                <Label htmlFor="ct-need-vehicle" className="text-sm font-semibold">
                  I need a vehicle with driver
                </Label>
                <Switch
                  id="ct-need-vehicle"
                  checked={state.needVehicle}
                  onCheckedChange={(v) => set("needVehicle", v)}
                />
              </div>

              {state.needVehicle ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <Label htmlFor="ct-vehicle">Vehicle preference</Label>
                    <Select
                      value={state.vehicleCategory}
                      onValueChange={(v) => set("vehicleCategory", v)}
                    >
                      <SelectTrigger id="ct-vehicle" className="mt-1.5">
                        <SelectValue placeholder="Choose a vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleOptions.map((o) => (
                          <SelectItem key={o.slug} value={o.slug}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError id="ct-vehicle-err" message={errors.vehicleCategory} />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="ct-pickup">Pickup city</Label>
                    <Input
                      id="ct-pickup"
                      className="mt-1.5"
                      placeholder="e.g. Chennai"
                      value={state.pickupCity}
                      onChange={(e) => set("pickupCity", e.target.value)}
                      aria-invalid={Boolean(errors.pickupCity)}
                      aria-describedby={errors.pickupCity ? "ct-pickup-err" : undefined}
                    />
                    <FieldError id="ct-pickup-err" message={errors.pickupCity} />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {/* Step 3 — stay & experiences */}
          {step === 2 ? (
            <>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                <Label htmlFor="ct-hotel" className="text-sm font-semibold">
                  I need hotels booked
                </Label>
                <Switch
                  id="ct-hotel"
                  checked={state.hotelRequired}
                  onCheckedChange={(v) => set("hotelRequired", v)}
                />
              </div>

              {state.hotelRequired ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <Label htmlFor="ct-hotel-category">Hotel category</Label>
                    <Select
                      value={state.hotelCategory}
                      onValueChange={(v) => set("hotelCategory", v)}
                    >
                      <SelectTrigger id="ct-hotel-category" className="mt-1.5">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {hotelCategoryOptions.map((o) => (
                          <SelectItem key={o.slug} value={o.slug}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError id="ct-hotel-category-err" message={errors.hotelCategory} />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="ct-room-type">Room type</Label>
                    <Select value={state.roomType} onValueChange={(v) => set("roomType", v)}>
                      <SelectTrigger id="ct-room-type" className="mt-1.5">
                        <SelectValue placeholder="Choose a room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypeChoices.map((o) => (
                          <SelectItem key={o.slug} value={o.slug}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="ct-rooms">Rooms needed</Label>
                    <Input
                      id="ct-rooms"
                      type="number"
                      min={1}
                      max={40}
                      className="mt-1.5"
                      value={state.rooms}
                      onChange={(e) => set("rooms", Number(e.target.value) || 0)}
                      aria-invalid={Boolean(errors.rooms)}
                      aria-describedby={errors.rooms ? "ct-rooms-err" : undefined}
                    />
                    <FieldError id="ct-rooms-err" message={errors.rooms} />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="ct-meals">Meal plan</Label>
                    <Select value={state.mealPlan} onValueChange={(v) => set("mealPlan", v)}>
                      <SelectTrigger id="ct-meals" className="mt-1.5">
                        <SelectValue placeholder="Choose a meal plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {mealPlanOptions.map((o) => (
                          <SelectItem key={o.slug} value={o.slug}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}

              <fieldset>
                <legend className="text-sm font-semibold">Sightseeing interests</legend>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional — helps us shortlist the right stops.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sightseeingOptions.map((o) => {
                    const checked = state.sightseeing.includes(o.slug);
                    return (
                      <label
                        key={o.slug}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          checked
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          className="h-3.5 w-3.5"
                          checked={checked}
                          onCheckedChange={(v) =>
                            set(
                              "sightseeing",
                              v === true
                                ? [...state.sightseeing, o.slug]
                                : state.sightseeing.filter((s) => s !== o.slug),
                            )
                          }
                          aria-label={o.label}
                        />
                        {o.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Conditional: guide question only when interests are chosen */}
              {state.sightseeing.length > 0 ? (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={state.guideRequired}
                    onCheckedChange={(v) => set("guideRequired", v === true)}
                  />
                  I'd like a local guide at these sights
                </label>
              ) : null}
            </>
          ) : null}

          {/* Step 4 — budget & contact */}
          {step === 3 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Label htmlFor="ct-budget">Budget range</Label>
                  <Select value={state.budgetBand} onValueChange={(v) => set("budgetBand", v)}>
                    <SelectTrigger id="ct-budget" className="mt-1.5">
                      <SelectValue placeholder="Choose a budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetBands.map((o) => (
                        <SelectItem key={o.slug} value={o.slug}>
                          {o.label}
                          {o.description ? ` — ${o.description}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError id="ct-budget-err" message={errors.budgetBand} />
                </div>

                {/* Conditional: exact amount only when a band is chosen */}
                {state.budgetBand && state.budgetBand !== "not-sure" ? (
                  <div className="min-w-0">
                    <Label htmlFor="ct-budget-amount">Approximate total budget (₹)</Label>
                    <Input
                      id="ct-budget-amount"
                      inputMode="numeric"
                      className="mt-1.5"
                      placeholder="e.g. 60000"
                      value={state.budgetAmount}
                      onChange={(e) => set("budgetAmount", e.target.value.replace(/[^\d]/g, ""))}
                      aria-invalid={Boolean(errors.budgetAmount)}
                      aria-describedby={errors.budgetAmount ? "ct-budget-amount-err" : undefined}
                    />
                    <FieldError id="ct-budget-amount-err" message={errors.budgetAmount} />
                  </div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="ct-requirements">Additional requirements</Label>
                <Textarea
                  id="ct-requirements"
                  className="mt-1.5"
                  rows={4}
                  maxLength={1000}
                  placeholder="Wheelchair access, veg-only meals, temple timings, anniversary surprise…"
                  value={state.requirements}
                  onChange={(e) => set("requirements", e.target.value)}
                />
                <FieldError id="ct-requirements-err" message={errors.requirements} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Label htmlFor="ct-name">Your name</Label>
                  <Input
                    id="ct-name"
                    className="mt-1.5"
                    autoComplete="name"
                    value={state.name}
                    onChange={(e) => set("name", e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "ct-name-err" : undefined}
                  />
                  <FieldError id="ct-name-err" message={errors.name} />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="ct-phone">Mobile number</Label>
                  <Input
                    id="ct-phone"
                    className="mt-1.5"
                    inputMode="tel"
                    autoComplete="tel"
                    value={state.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "ct-phone-err" : undefined}
                  />
                  <FieldError id="ct-phone-err" message={errors.phone} />
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <Label htmlFor="ct-email">Email (optional)</Label>
                  <Input
                    id="ct-email"
                    type="email"
                    className="mt-1.5"
                    autoComplete="email"
                    value={state.email}
                    onChange={(e) => set("email", e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "ct-email-err" : undefined}
                  />
                  <FieldError id="ct-email-err" message={errors.email} />
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    className="mt-0.5"
                    checked={state.consent}
                    onCheckedChange={(v) => set("consent", v === true)}
                    aria-describedby="ct-consent-err"
                  />
                  <span>
                    I agree to be contacted by phone, WhatsApp or email about this enquiry. See our{" "}
                    <AppLink href="/faqs" className="font-semibold text-primary hover:underline">
                      privacy &amp; booking policies
                    </AppLink>
                    .
                  </span>
                </label>
                <FieldError id="ct-consent-err" message={errors.consent} />
              </div>
            </>
          ) : null}

          {/* Review */}
          {step === REVIEW_STEP ? (
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Check everything below. Use Edit to change any section — nothing is submitted yet.
              </p>
              <div className="mt-3">
                <SummaryPanel rows={rows} onEdit={goTo} />
              </div>
              {state.requirements.trim() ? (
                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Additional requirements
                  </p>
                  <p className="mt-1 whitespace-pre-line break-words text-sm">
                    {state.requirements}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Nav */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            ) : null}

            {step === REVIEW_STEP ? (
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {submitting ? "Sending…" : "Submit enquiry"}
              </Button>
            ) : (
              <Button type="submit">
                Continue
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}

            <Button type="button" variant="ghost" onClick={saveDraft} disabled={!draftLoaded}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save &amp; continue later
            </Button>

            {/* Mobile summary — opens in a sheet so it never covers the form */}
            <Sheet open={mobileSummaryOpen} onOpenChange={setMobileSummaryOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="secondary" className="lg:hidden">
                  View summary
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
                <SheetHeader className="text-left">
                  <SheetTitle>Your trip so far</SheetTitle>
                  <SheetDescription>Updates as you fill in each step.</SheetDescription>
                </SheetHeader>
                <div className="mt-2">
                  <SummaryPanel
                    rows={rows}
                    compact
                    onEdit={(s) => {
                      setMobileSummaryOpen(false);
                      goTo(s);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </form>
      </div>

      {/* Desktop live summary */}
      <aside className="sticky top-24 hidden min-w-0 rounded-2xl border border-border bg-card p-4 lg:block">
        <h2 className="text-sm font-bold tracking-tight">Your trip so far</h2>
        <p className="mt-1 text-xs text-muted-foreground">Updates as you fill in each step.</p>
        <div className="mt-2">
          <SummaryPanel rows={rows} compact onEdit={goTo} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Need help? WhatsApp{" "}
          <a
            href={waLink("Hi South Zoom Tourism, I'm planning a custom tour and need help.")}
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-primary hover:underline"
          >
            {company.phone}
          </a>
        </p>
      </aside>
    </div>
  );
}
