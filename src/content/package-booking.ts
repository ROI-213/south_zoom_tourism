/**
 * Admin-managed tour package booking configuration + estimate engine.
 *
 * Mirrors the future tables:
 *   booking_settings(id, advance_percent, booking_lead_days, min_seats_warning,
 *                    hold_hours, payment_modes[], terms_url)
 *   child_age_bands(id, label, min_age, max_age, rate_factor, needs_confirmation,
 *                   note, display_order)
 *   package_meal_plans(id, code, label, price_per_person_per_night, display_order)
 *   package_room_types(id, label, max_adults, display_order)
 *   package_addons(id, label, description, price, unit, display_order, visible)
 *   package_bookings(id, booking_number, package_slug, package_snapshot jsonb,
 *                    departure_snapshot jsonb, hotel_snapshot jsonb,
 *                    vehicle_snapshot jsonb, travellers jsonb, addons jsonb,
 *                    price_breakdown jsonb, estimated_total, final_total,
 *                    payment_mode, status, source, created_at,
 *                    assigned_to, follow_up_at)
 *
 * Every amount produced here is an ESTIMATE. Operations confirm the final total.
 */

import packagesBanner from "@/assets/hero-tours.jpg";
import {
  estimatePackageTotal,
  formatRupees,
  type EstimateLine,
  type PackageDeparture,
  type PackageDetail,
  type PackageHotelOption,
  type PackageVehicleOption,
} from "@/content/package-details";
import type { TourPackageRecord } from "@/content/tour-packages";

/* ------------------------------------------------------------------ */
/* Page blocks                                                         */
/* ------------------------------------------------------------------ */

export const bookingBannerBlock = {
  visible: true,
  title: "Request a tour package booking",
  subtitle:
    "Six short steps: departure, travellers, stay, transport, price review and submission. Nothing is charged online — we confirm seats and the final amount before any payment.",
  image: packagesBanner,
  imageAlt:
    "Travellers boarding a South Zoom Tourism coach at sunrise for a South India tour departure",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Tour Packages", href: "/tour-packages" },
    { label: "Book", href: "/book/tour-package" },
  ],
};

export type BookingStep = {
  id: string;
  title: string;
  hint: string;
};

export const bookingSteps: BookingStep[] = [
  { id: "package", title: "Package & date", hint: "Departure and travel date" },
  { id: "travellers", title: "Travellers", hint: "Adults, children, contact" },
  { id: "stay", title: "Stay", hint: "Hotel, rooms, meals" },
  { id: "transport", title: "Transport", hint: "Vehicle and pickup" },
  { id: "review", title: "Review", hint: "Price and terms" },
  { id: "submit", title: "Submit", hint: "Payment preference" },
];

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const bookingSettings = {
  /** A fixed departure closes for booking this many days before it starts. */
  bookingLeadDays: 3,
  /** Open-dated packages need at least this much notice. */
  minNoticeDays: 2,
  /** Warn (but still allow) when a departure has this many seats or fewer. */
  lowSeatThreshold: 6,
  /** Advance share of the estimate collected once operations confirm. */
  advancePercent: 25,
  /** Hours the requested seats are held after a booking request. */
  holdHours: 24,
  /** Rooms are quoted on twin sharing by default. */
  adultsPerRoom: 2,
  /** Charged per extra room per night when travellers ask for more rooms. */
  extraRoomSupplementPerNight: 1800,
};

export type PaymentMode = {
  id: string;
  label: string;
  description: string;
  visible: boolean;
  order: number;
};

export const paymentModes: PaymentMode[] = [
  {
    id: "advance-online",
    label: `Pay ${bookingSettings.advancePercent}% advance online`,
    description: "We send a secure payment link after confirming seats and the final amount.",
    visible: true,
    order: 1,
  },
  {
    id: "bank-transfer",
    label: "Bank transfer / UPI",
    description: "Account and UPI details arrive with the confirmation email.",
    visible: true,
    order: 2,
  },
  {
    id: "office",
    label: "Pay at the office",
    description: "Settle the advance in cash or card at our travel desk.",
    visible: true,
    order: 3,
  },
];

/* ------------------------------------------------------------------ */
/* Child policy                                                        */
/* ------------------------------------------------------------------ */

export type ChildAgeBand = {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
  /** Share of the adult rate charged for this band. */
  rateFactor: number;
  /** Operations must confirm the rate manually for this band. */
  needsConfirmation: boolean;
  note: string;
  order: number;
};

export const childAgeBands: ChildAgeBand[] = [
  {
    id: "cab-infant",
    label: "0–4 years",
    minAge: 0,
    maxAge: 4,
    rateFactor: 0,
    needsConfirmation: false,
    note: "Complimentary when sharing existing bedding and seating.",
    order: 1,
  },
  {
    id: "cab-child-no-bed",
    label: "5–11 years",
    minAge: 5,
    maxAge: 11,
    rateFactor: 0.6,
    needsConfirmation: false,
    note: "60% of the adult rate without an extra bed.",
    order: 2,
  },
  {
    id: "cab-teen",
    label: "12 years and above",
    minAge: 12,
    maxAge: 17,
    rateFactor: 1,
    needsConfirmation: false,
    note: "Charged as an adult with a separate bed and seat.",
    order: 3,
  },
];

export function getChildBand(age: number | null): ChildAgeBand | null {
  if (age === null || Number.isNaN(age)) return null;
  return childAgeBands.find((b) => age >= b.minAge && age <= b.maxAge) ?? null;
}

export const childPolicyNote =
  "Tell us each child's age so the correct band applies. Ages we cannot match to a band are quoted manually by our team.";

/* ------------------------------------------------------------------ */
/* Stay and transport options                                          */
/* ------------------------------------------------------------------ */

export type MealPlanOption = {
  id: string;
  code: string;
  label: string;
  /** Added per paying traveller, per night. 0 = already in the package. */
  pricePerPersonPerNight: number;
  order: number;
};

export const mealPlanOptions: MealPlanOption[] = [
  { id: "mp-cp", code: "CP", label: "Breakfast only (as per package)", pricePerPersonPerNight: 0, order: 1 },
  { id: "mp-map", code: "MAP", label: "Breakfast + dinner", pricePerPersonPerNight: 550, order: 2 },
  { id: "mp-ap", code: "AP", label: "All meals (breakfast, lunch, dinner)", pricePerPersonPerNight: 1050, order: 3 },
];

export type RoomTypeOption = {
  id: string;
  label: string;
  maxAdults: number;
  order: number;
};

export const roomTypeOptions: RoomTypeOption[] = [
  { id: "rt-twin", label: "Twin sharing (2 beds)", maxAdults: 2, order: 1 },
  { id: "rt-double", label: "Double bed", maxAdults: 2, order: 2 },
  { id: "rt-triple", label: "Triple sharing", maxAdults: 3, order: 3 },
  { id: "rt-family", label: "Family room", maxAdults: 4, order: 4 },
];

export type AddOnUnit = "per-trip" | "per-person" | "per-night";

export type BookingAddOn = {
  id: string;
  label: string;
  description: string;
  price: number;
  unit: AddOnUnit;
  order: number;
  visible: boolean;
};

export const bookingAddOns: BookingAddOn[] = [
  {
    id: "addon-guide",
    label: "Licensed local guide",
    description: "English or regional-language guide at the main sightseeing stops.",
    price: 1800,
    unit: "per-trip",
    order: 1,
    visible: true,
  },
  {
    id: "addon-airport",
    label: "Airport pickup & drop",
    description: "Meet-and-greet transfer at the arrival and departure airport.",
    price: 2400,
    unit: "per-trip",
    order: 2,
    visible: true,
  },
  {
    id: "addon-insurance",
    label: "Travel insurance",
    description: "Basic trip cover per traveller for the full duration.",
    price: 350,
    unit: "per-person",
    order: 3,
    visible: true,
  },
  {
    id: "addon-extra-bed",
    label: "Extra bed",
    description: "One additional bed in the room for each night of stay.",
    price: 900,
    unit: "per-night",
    order: 4,
    visible: true,
  },
];

export const getVisibleAddOns = (): BookingAddOn[] =>
  bookingAddOns.filter((a) => a.visible).sort((a, b) => a.order - b.order);

export const specialRequirementOptions = [
  "Wheelchair / limited mobility assistance",
  "Vegetarian or Jain meals",
  "Ground-floor rooms",
  "Child seat in the vehicle",
  "Senior-friendly pace",
];

/* ------------------------------------------------------------------ */
/* Departures                                                          */
/* ------------------------------------------------------------------ */

const dayMs = 24 * 60 * 60 * 1000;

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export function today(): string {
  return isoDay(new Date());
}

export function addDays(iso: string, days: number): string {
  return isoDay(new Date(new Date(`${iso}T00:00:00Z`).getTime() + days * dayMs));
}

/** Earliest travel date for an open-dated package. */
export function earliestOpenDate(): string {
  return addDays(today(), bookingSettings.minNoticeDays);
}

export type DepartureStatus = {
  departure: PackageDeparture;
  deadline: string;
  /** Booking window has closed (deadline passed). */
  closed: boolean;
  soldOut: boolean;
  lowSeats: boolean;
  bookable: boolean;
};

export function getDepartureStatus(departure: PackageDeparture): DepartureStatus {
  const deadline = addDays(departure.date, -bookingSettings.bookingLeadDays);
  const closed = deadline < today();
  const soldOut = departure.soldOut || departure.seatsLeft <= 0;
  return {
    departure,
    deadline,
    closed,
    soldOut,
    lowSeats: !soldOut && departure.seatsLeft <= bookingSettings.lowSeatThreshold,
    bookable: !closed && !soldOut,
  };
}

export function getDepartureStatuses(detail: PackageDetail): DepartureStatus[] {
  return [...detail.departures]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(getDepartureStatus);
}

/** Packages with published departures must use one; others take an open date. */
export function hasFixedDepartures(detail: PackageDetail): boolean {
  return detail.departures.length > 0;
}

export function formatDay(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ------------------------------------------------------------------ */
/* Estimate                                                            */
/* ------------------------------------------------------------------ */

export type ChildEntry = { id: string; age: number | null };

export type TravellerEntry = {
  id: string;
  name: string;
  kind: "adult" | "child";
  age: number | null;
  idProof: string;
};

export type BookingSelections = {
  adults: number;
  children: ChildEntry[];
  hotel?: PackageHotelOption;
  vehicle?: PackageVehicleOption;
  rooms: number;
  roomTypeId: string;
  mealPlanId: string;
  addOnIds: string[];
};

export type BookingEstimate = {
  available: boolean;
  lines: EstimateLine[];
  total: number;
  /** Children whose age has no configured band — quoted manually. */
  manualChildren: number;
  advance: number;
};

/**
 * Rebuilt on every traveller / upgrade change. Estimate only.
 * Adults use the package engine; children follow the configured age bands.
 */
export function estimateBooking(
  pkg: TourPackageRecord,
  detail: PackageDetail,
  sel: BookingSelections,
): BookingEstimate {
  const adults = Math.max(1, sel.adults);
  const base = estimatePackageTotal(pkg, {
    adults,
    children: 0,
    hotel: sel.hotel,
    vehicle: sel.vehicle,
  });

  if (!base.available) {
    return { available: false, lines: [], total: 0, manualChildren: 0, advance: 0 };
  }

  const lines: EstimateLine[] = [...base.lines];
  const perPerson = pkg.priceBasis === "per-person";
  const nights = Math.max(1, pkg.nights);

  // Children — grouped by configured age band.
  let manualChildren = 0;
  const bandCounts = new Map<string, number>();
  for (const child of sel.children) {
    const band = getChildBand(child.age);
    if (!band) {
      manualChildren += 1;
      continue;
    }
    bandCounts.set(band.id, (bandCounts.get(band.id) ?? 0) + 1);
  }
  for (const band of childAgeBands) {
    const count = bandCounts.get(band.id) ?? 0;
    if (count === 0) continue;
    const amount = perPerson ? Math.round(pkg.price * band.rateFactor * count) : 0;
    lines.push({
      label: `Children ${band.label} × ${count}`,
      amount,
      note: perPerson
        ? `${Math.round(band.rateFactor * 100)}% of the adult rate — ${band.note}`
        : `Included in the group rate — ${band.note}`,
    });
  }

  // Extra rooms beyond the default twin-sharing allocation.
  const includedRooms = Math.max(1, Math.ceil(adults / bookingSettings.adultsPerRoom));
  const extraRooms = Math.max(0, sel.rooms - includedRooms);
  if (extraRooms > 0 && pkg.includesHotel) {
    lines.push({
      label: `Extra room${extraRooms > 1 ? "s" : ""} × ${extraRooms}`,
      amount: extraRooms * bookingSettings.extraRoomSupplementPerNight * nights,
      note: `${formatRupees(bookingSettings.extraRoomSupplementPerNight)} per room per night × ${nights} night${nights > 1 ? "s" : ""}`,
    });
  }

  // Meal plan upgrade.
  const meal = mealPlanOptions.find((m) => m.id === sel.mealPlanId);
  const payingHeads = adults + sel.children.filter((c) => (getChildBand(c.age)?.rateFactor ?? 1) > 0).length;
  if (meal && meal.pricePerPersonPerNight > 0 && pkg.includesHotel) {
    lines.push({
      label: `Meal plan — ${meal.code}`,
      amount: meal.pricePerPersonPerNight * payingHeads * nights,
      note: `${formatRupees(meal.pricePerPersonPerNight)} per traveller per night`,
    });
  }

  // Add-ons.
  for (const addOn of getVisibleAddOns()) {
    if (!sel.addOnIds.includes(addOn.id)) continue;
    const amount =
      addOn.unit === "per-person"
        ? addOn.price * (adults + sel.children.length)
        : addOn.unit === "per-night"
          ? addOn.price * nights
          : addOn.price;
    lines.push({
      label: addOn.label,
      amount,
      note:
        addOn.unit === "per-person"
          ? "Per traveller"
          : addOn.unit === "per-night"
            ? `Per night × ${nights}`
            : "Once per trip",
    });
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return {
    available: true,
    lines,
    total,
    manualChildren,
    advance: Math.round((total * bookingSettings.advancePercent) / 100),
  };
}

/* ------------------------------------------------------------------ */
/* Booking record                                                      */
/* ------------------------------------------------------------------ */

export type PackageBookingRecord = {
  bookingNumber: string;
  createdAt: string;
  status: "requested";
  source: "web:/book/tour-package";
  packageSnapshot: {
    slug: string;
    title: string;
    nights: number;
    days: number;
    startingCity: string;
    price: number;
    priceBasis: string;
    hotelCategory: string;
    vehicleCategory: string;
  };
  departureSnapshot: {
    id: string | null;
    date: string;
    label: string;
    seatsLeft: number | null;
    deadline: string | null;
  };
  hotelSnapshot: {
    id: string;
    hotel: string;
    category: string;
    roomType: string;
    mealPlan: string;
    upgradePrice: number;
  } | null;
  vehicleSnapshot: {
    id: string;
    category: string;
    seating: number;
    ac: boolean;
    upgradePrice: number;
  } | null;
  stay: { rooms: number; roomType: string; mealPlan: string };
  transport: { pickup: string; drop: string; pickupTime: string };
  travellers: { adults: number; children: number; entries: TravellerEntry[] };
  addOns: { id: string; label: string; unit: AddOnUnit; price: number }[];
  contact: { name: string; phone: string; email: string; city: string };
  requirements: { tags: string[]; notes: string };
  priceBreakdown: EstimateLine[];
  estimatedTotal: number;
  advanceDue: number;
  finalTotal: null;
  manualChildren: number;
  paymentMode: string;
  assignedTo: null;
  followUpAt: null;
};

export function makeBookingNumber(): string {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SZT-TP-${stamp}-${rand}`;
}

const storeKey = (bookingNumber: string) => `szt:booking:${bookingNumber}`;

export function saveBookingRecord(record: PackageBookingRecord) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storeKey(record.bookingNumber), JSON.stringify(record));
  } catch {
    /* storage unavailable — the confirmation page falls back to a generic message */
  }
}

export function loadBookingRecord(bookingNumber: string): PackageBookingRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(storeKey(bookingNumber));
    return raw ? (JSON.parse(raw) as PackageBookingRecord) : null;
  } catch {
    return null;
  }
}

export const DRAFT_KEY = "szt:booking:tour-package:draft";

export function buildWhatsAppSummary(record: PackageBookingRecord): string {
  const lines = [
    `Tour package booking request ${record.bookingNumber}`,
    `Package: ${record.packageSnapshot.title} (${record.packageSnapshot.nights}N/${record.packageSnapshot.days}D)`,
    `Departure: ${record.departureSnapshot.label || formatDay(record.departureSnapshot.date)}`,
    `Travellers: ${record.travellers.adults} adult(s), ${record.travellers.children} child(ren)`,
    record.hotelSnapshot
      ? `Stay: ${record.hotelSnapshot.hotel} — ${record.hotelSnapshot.category}, ${record.stay.rooms} × ${record.stay.roomType}, ${record.stay.mealPlan}`
      : null,
    record.vehicleSnapshot
      ? `Vehicle: ${record.vehicleSnapshot.category} (${record.vehicleSnapshot.seating} seats)`
      : null,
    `Pickup: ${record.transport.pickup}${record.transport.pickupTime ? ` at ${record.transport.pickupTime}` : ""}`,
    record.addOns.length ? `Add-ons: ${record.addOns.map((a) => a.label).join(", ")}` : null,
    record.estimatedTotal > 0 ? `Estimated total: ${formatRupees(record.estimatedTotal)}` : null,
    `Payment preference: ${record.paymentMode}`,
    record.requirements.tags.length ? `Requirements: ${record.requirements.tags.join(", ")}` : null,
    record.requirements.notes ? `Notes: ${record.requirements.notes}` : null,
    `Contact: ${record.contact.name}, ${record.contact.phone}${record.contact.email ? `, ${record.contact.email}` : ""}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export const bookingNextSteps = [
  {
    id: "bns-1",
    title: "Seat check within a few hours",
    description:
      "Our team verifies live availability for the chosen departure and holds your seats for up to 24 hours.",
  },
  {
    id: "bns-2",
    title: "Confirmed quote and voucher",
    description:
      "You receive a written quote with the final amount, hotel names and the payment link or bank details.",
  },
  {
    id: "bns-3",
    title: "Advance and confirmation",
    description:
      "Pay the advance to lock the booking. Vouchers and driver details reach you before departure.",
  },
];
