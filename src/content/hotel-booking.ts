/**
 * Admin-managed configuration and the booking engine for the hotel booking
 * flow at /book/hotel.
 *
 * Mirrors the future tables:
 *   hotel_booking_settings: advance_percent, hold_hours, max_rooms,
 *     allow_pay_at_hotel, allow_partial_advance
 *   hotel_payment_methods: id, label, description, instructions, visible, order
 *   hotel_meal_preferences / hotel_arrival_slots / hotel_request_tags
 *   hotel_bookings: booking_number, status, hotel/room/rate-plan snapshot,
 *     price snapshot, guests, payment, invoice
 *   room_inventory_holds: room_id, date, units (transactional reserve)
 *
 * Pricing always comes from the shared quote engine in `@/content/room-details`
 * so the summary, the confirmation and the invoice use one stored snapshot.
 */

import {
  addDaysISO,
  getHotelBySlug,
  getHotelRooms,
  getStayInventory,
  nightsBetween,
  todayISO,
  type HotelRecord,
  type RoomRecord,
} from "@/content/hotels";
import { getListingAttributes, getMealPlanLabel, getRoomRatePlans } from "@/content/hotel-listing";
import { getHotelProfile, type RoomStay } from "@/content/hotel-details";
import {
  buildRoomQuote,
  buildRoomQuotes,
  getRoomSlug,
  type RoomQuote,
} from "@/content/room-details";

/* ------------------------------------------------------------------ */
/* Admin-managed content                                                */
/* ------------------------------------------------------------------ */

export const hotelBookingBanner = {
  visible: true,
  title: "Book your hotel stay",
  subtitle:
    "Seven short steps: dates, hotel, room and rate plan, guest details, summary, payment preference and confirmation. Rooms are held against live date-wise inventory.",
  image:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=70",
  imageAlt: "Hotel reception desk with warm evening lighting and a guest checking in",
};

export type HotelBookingStep = { id: string; label: string; hint: string };

export const hotelBookingSteps: HotelBookingStep[] = [
  { id: "stay", label: "Stay", hint: "Destination, dates, guests" },
  { id: "hotel", label: "Hotel", hint: "Confirm the property" },
  { id: "room", label: "Room & rate", hint: "Room, meal plan, quantity" },
  { id: "guests", label: "Guests", hint: "Guest details, requests" },
  { id: "summary", label: "Summary", hint: "Nights, taxes, total" },
  { id: "payment", label: "Payment", hint: "How you want to pay" },
  { id: "confirm", label: "Confirm", hint: "Booking number, documents" },
];

export const hotelBookingSettings = {
  advancePercent: 30,
  /** How long a confirmed hold is kept before it is released. */
  holdHours: 24,
  maxRooms: 6,
  maxAdults: 12,
  maxChildren: 8,
  /** Guests that may be listed in addition to the primary guest. */
  maxAdditionalGuests: 8,
  allowPayAtHotel: true,
  allowPartialAdvance: true,
  currency: "INR",
  gstin: "33AASZS1234K1ZP",
  invoicePrefix: "SZT-INV",
};

export type HotelPaymentMethod = {
  id: string;
  label: string;
  description: string;
  instructions: string;
  /** Only offered when the hotel allows pay-at-hotel. */
  requiresPayAtHotel?: boolean;
  visible: boolean;
  order: number;
};

export const hotelPaymentMethods: HotelPaymentMethod[] = [
  {
    id: "qr",
    label: "Scan & pay (QR)",
    description: "A payment QR is sent with your confirmation message.",
    instructions:
      "We share a dynamic QR on WhatsApp once the room is held. Scan, pay the advance and send the screenshot.",
    visible: true,
    order: 1,
  },
  {
    id: "upi",
    label: "UPI transfer",
    description: "Pay to our verified UPI ID from any UPI app.",
    instructions: "UPI ID and the exact amount are shared with your booking confirmation.",
    visible: true,
    order: 2,
  },
  {
    id: "bank",
    label: "Bank transfer / NEFT",
    description: "Company current account, best for corporate bookings.",
    instructions:
      "Account details are sent on the invoice. Quote your booking number in the transfer remarks.",
    visible: true,
    order: 3,
  },
  {
    id: "office",
    label: "Pay at our office",
    description: "Cash or card at the South Zoom Tourism counter.",
    instructions: "Visit during business hours with your booking number.",
    visible: true,
    order: 4,
  },
  {
    id: "pay-at-hotel",
    label: "Pay at the hotel",
    description: "Settle the full amount at check-in, where the partner allows it.",
    instructions:
      "The property holds the room against your ID. Carry the same ID used in this booking.",
    requiresPayAtHotel: true,
    visible: true,
    order: 5,
  },
];

export const getHotelPaymentMethods = (payAtHotel: boolean) =>
  hotelPaymentMethods
    .filter((m) => m.visible && (!m.requiresPayAtHotel || payAtHotel))
    .sort((a, b) => a.order - b.order);

export type PaymentSplit = "advance" | "full";

export const mealPreferences = [
  { id: "no-preference", label: "No preference", visible: true, order: 1 },
  { id: "veg", label: "Vegetarian", visible: true, order: 2 },
  { id: "jain", label: "Jain / satvik", visible: true, order: 3 },
  { id: "non-veg", label: "Non-vegetarian", visible: true, order: 4 },
  { id: "vegan", label: "Vegan", visible: true, order: 5 },
];

export const arrivalSlots = [
  { id: "before-noon", label: "Before 12:00 PM", visible: true, order: 1 },
  { id: "noon-3", label: "12:00 PM – 3:00 PM", visible: true, order: 2 },
  { id: "3-6", label: "3:00 PM – 6:00 PM", visible: true, order: 3 },
  { id: "6-9", label: "6:00 PM – 9:00 PM", visible: true, order: 4 },
  { id: "late", label: "After 9:00 PM (late arrival)", visible: true, order: 5 },
];

export const specialRequestTags = [
  { id: "early-checkin", label: "Early check-in" },
  { id: "late-checkout", label: "Late check-out" },
  { id: "high-floor", label: "High floor" },
  { id: "adjoining", label: "Adjoining rooms" },
  { id: "ground-floor", label: "Ground floor / accessible" },
  { id: "airport-pickup", label: "Airport pickup" },
  { id: "honeymoon", label: "Honeymoon setup" },
  { id: "extra-bed", label: "Extra bed" },
];

export const hotelBookingNextSteps = [
  {
    id: "hbn-1",
    title: "Room held on live inventory",
    description:
      "Instant-confirmation properties hold your room straight away. Partner-approval properties are confirmed by our team, usually within a few hours.",
  },
  {
    id: "hbn-2",
    title: "Advance and voucher",
    description:
      "Pay the advance using your chosen method. Your hotel voucher and GST invoice follow on WhatsApp and email.",
  },
  {
    id: "hbn-3",
    title: "Check-in support",
    description:
      "Carry the same ID used here. Our 24×7 desk handles early check-in, room changes and any on-ground issue.",
  },
];

export const visibleMealPreferences = () =>
  mealPreferences.filter((m) => m.visible).sort((a, b) => a.order - b.order);

export const visibleArrivalSlots = () =>
  arrivalSlots.filter((a) => a.visible).sort((a, b) => a.order - b.order);

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                   */
/* ------------------------------------------------------------------ */

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function formatStayDay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const defaultCheckIn = () => addDaysISO(todayISO(), 1);
export const defaultCheckOut = () => addDaysISO(todayISO(), 3);

/* ------------------------------------------------------------------ */
/* Inventory holds (transactional reserve)                              */
/* ------------------------------------------------------------------ */

const HOLDS_KEY = "szt:hotel:room-inventory-holds";

type HoldLedger = Record<string, number>;

const holdKey = (roomId: string, date: string) => `${roomId}|${date}`;

function readLedger(): HoldLedger {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(HOLDS_KEY);
    return raw ? (JSON.parse(raw) as HoldLedger) : {};
  } catch {
    return {};
  }
}

function writeLedger(ledger: HoldLedger) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HOLDS_KEY, JSON.stringify(ledger));
  } catch {
    /* storage unavailable — holds fall back to the catalogue inventory */
  }
}

export const getHeldUnits = (roomId: string, date: string) => readLedger()[holdKey(roomId, date)] ?? 0;

export type AvailabilityCheck = {
  ok: boolean;
  /** Lowest number of bookable units across the stay, after existing holds. */
  unitsAvailable: number;
  nights: number;
  /** Nights that cannot serve the requested quantity. */
  shortNights: { date: string; unitsAvailable: number }[];
  reason: string | null;
};

/** Re-reads date-wise inventory minus current holds. Used before submission. */
export function checkRoomAvailability(
  room: RoomRecord,
  stay: RoomStay,
  quantity: number,
): AvailabilityCheck {
  const nightsInv = getStayInventory(room, stay.checkIn, stay.checkOut);
  const ledger = readLedger();
  const nights = nightsInv.length;

  if (nights === 0) {
    return {
      ok: false,
      unitsAvailable: 0,
      nights: 0,
      shortNights: [],
      reason: "Choose a check-out date after the check-in date.",
    };
  }

  const perNight = nightsInv.map((night) => ({
    date: night.date,
    unitsAvailable: Math.max(0, night.units - (ledger[holdKey(room.id, night.date)] ?? 0)),
  }));
  const unitsAvailable = Math.min(...perNight.map((n) => n.unitsAvailable));
  const shortNights = perNight.filter((n) => n.unitsAvailable < quantity);

  return {
    ok: shortNights.length === 0,
    unitsAvailable,
    nights,
    shortNights,
    reason: shortNights.length
      ? unitsAvailable === 0
        ? `This room is now sold out on ${formatStayDay(shortNights[0].date)}.`
        : `Only ${unitsAvailable} room${unitsAvailable === 1 ? "" : "s"} remain for every night of this stay.`
      : null,
  };
}

/**
 * Reserves the requested quantity for every night, all-or-nothing: the ledger
 * is only written when each night still has capacity at commit time.
 */
export function reserveRoomInventory(
  room: RoomRecord,
  stay: RoomStay,
  quantity: number,
): AvailabilityCheck {
  const check = checkRoomAvailability(room, stay, quantity);
  if (!check.ok) return check;

  const ledger = readLedger();
  const nightsInv = getStayInventory(room, stay.checkIn, stay.checkOut);
  for (const night of nightsInv) {
    const key = holdKey(room.id, night.date);
    const held = ledger[key] ?? 0;
    if (night.units - held < quantity) {
      // Lost the race between check and commit — nothing is written.
      return checkRoomAvailability(room, stay, quantity);
    }
    ledger[key] = held + quantity;
  }
  writeLedger(ledger);
  return check;
}

export function releaseRoomInventory(roomId: string, stay: RoomStay, quantity: number) {
  const ledger = readLedger();
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  for (let i = 0; i < nights; i += 1) {
    const key = holdKey(roomId, addDaysISO(stay.checkIn, i));
    const held = ledger[key] ?? 0;
    if (held <= quantity) delete ledger[key];
    else ledger[key] = held - quantity;
  }
  writeLedger(ledger);
}

/* ------------------------------------------------------------------ */
/* Selection helpers                                                    */
/* ------------------------------------------------------------------ */

export const citySlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export type BookableRoomOption = {
  room: RoomRecord;
  roomSlug: string;
  quotes: RoomQuote[];
  bestQuote: RoomQuote | null;
  availability: AvailabilityCheck;
};

/** Every room of a hotel, quoted for the stay and checked against holds. */
export function getBookableRooms(hotel: HotelRecord, stay: RoomStay): BookableRoomOption[] {
  return getHotelRooms(hotel.id)
    .map((room) => {
      const quotes = buildRoomQuotes(hotel.id, room, stay);
      return {
        room,
        roomSlug: getRoomSlug(room),
        quotes,
        bestQuote: quotes.find((q) => q.selectable) ?? quotes[0] ?? null,
        availability: checkRoomAvailability(room, stay, Math.max(1, stay.rooms)),
      };
    })
    .sort((a, b) => {
      const ap = a.bestQuote?.total ?? Number.POSITIVE_INFINITY;
      const bp = b.bestQuote?.total ?? Number.POSITIVE_INFINITY;
      return ap - bp || a.room.order - b.room.order;
    });
}

export function quoteFor(
  hotel: HotelRecord,
  room: RoomRecord,
  ratePlanId: string,
  stay: RoomStay,
): RoomQuote | null {
  const plan = getRoomRatePlans(room.id).find((p) => p.id === ratePlanId);
  if (!plan) return null;
  return buildRoomQuote(hotel.id, room, plan, stay);
}

export const hotelNeedsPartnerApproval = (hotelId: string) =>
  !(getListingAttributes(hotelId)?.instantConfirmation ?? true);

export const hotelAllowsPayAtHotel = (hotelId: string) =>
  getListingAttributes(hotelId)?.payAtHotel ?? false;

/* ------------------------------------------------------------------ */
/* Booking record                                                       */
/* ------------------------------------------------------------------ */

export type GuestEntry = { id: string; name: string; age: number | null; type: "adult" | "child" };

export type HotelBookingStatus = "confirmed" | "pending-hotel-confirmation";

export type PriceSnapshotLine = { label: string; amount: number; note?: string };

export type HotelBookingRecord = {
  bookingNumber: string;
  invoiceNumber: string;
  createdAt: string;
  status: HotelBookingStatus;
  source: "web:/book/hotel";
  stay: {
    destination: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    rooms: number;
    adults: number;
    children: number;
  };
  hotelSnapshot: {
    id: string;
    slug: string;
    name: string;
    city: string;
    state: string;
    address: string;
    starRating: number;
    checkInTime: string;
    checkOutTime: string;
  };
  roomSnapshot: {
    id: string;
    slug: string;
    name: string;
    bedType: string;
    maxAdults: number;
    maxChildren: number;
    quantity: number;
  };
  ratePlanSnapshot: {
    id: string;
    mealPlan: string;
    refundable: boolean;
    cancellationPolicy: string;
  };
  priceSnapshot: {
    nights: { date: string; rate: number }[];
    lines: PriceSnapshotLine[];
    subtotal: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    advanceDue: number;
    balanceDue: number;
    currency: string;
  };
  primaryGuest: { name: string; phone: string; email: string; city: string; idType: string };
  additionalGuests: GuestEntry[];
  preferences: {
    mealPreference: string;
    arrivalSlot: string;
    requestTags: string[];
    notes: string;
  };
  payment: { methodId: string; methodLabel: string; split: PaymentSplit; amountNow: number };
  inventoryReserved: boolean;
  assignedTo: null;
  followUpAt: null;
};

export function makeHotelBookingNumber(): string {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `SZT-HB-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const makeInvoiceNumber = (bookingNumber: string) =>
  `${hotelBookingSettings.invoicePrefix}-${bookingNumber.split("-").slice(2).join("")}`;

/** Turns the live quote into the immutable price snapshot stored on the booking. */
export function buildPriceSnapshot(
  quote: RoomQuote,
  split: PaymentSplit,
): HotelBookingRecord["priceSnapshot"] {
  const lines: PriceSnapshotLine[] = [
    {
      label: `Room tariff — ${quote.rooms} room${quote.rooms === 1 ? "" : "s"} × ${quote.nightCount} night${quote.nightCount === 1 ? "" : "s"}`,
      amount: quote.roomSubtotal,
      note: `Average ${inr(quote.perNightAverage)} per room per night`,
    },
  ];
  if (quote.discountAmount > 0)
    lines.push({
      label: `Rate plan discount (${quote.discountPercent}%)`,
      amount: -quote.discountAmount,
    });
  if (quote.extraAdultTotal > 0)
    lines.push({ label: "Extra adult charges", amount: quote.extraAdultTotal });
  if (quote.extraChildTotal > 0)
    lines.push({ label: "Child charges", amount: quote.extraChildTotal });
  if (quote.serviceCharge > 0)
    lines.push({ label: "Service charge", amount: quote.serviceCharge });
  lines.push({
    label: `GST & taxes (${quote.taxPercent}%)`,
    amount: quote.taxAmount,
    note: "Charged on the taxable stay value",
  });

  const advance = Math.round((quote.total * hotelBookingSettings.advancePercent) / 100);
  const amountNow = split === "full" ? quote.total : advance;

  return {
    nights: quote.nights.map((n) => ({ date: n.date, rate: n.planRate * quote.rooms })),
    lines,
    subtotal: quote.taxableAmount,
    taxPercent: quote.taxPercent,
    taxAmount: quote.taxAmount,
    total: quote.total,
    advanceDue: amountNow,
    balanceDue: Math.max(0, quote.total - amountNow),
    currency: hotelBookingSettings.currency,
  };
}

export function buildHotelSnapshot(hotel: HotelRecord): HotelBookingRecord["hotelSnapshot"] {
  const profile = getHotelProfile(hotel.id);
  return {
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    city: hotel.city,
    state: hotel.state,
    address: hotel.address,
    starRating: hotel.starRating,
    checkInTime: profile?.checkInTime ?? "2:00 PM",
    checkOutTime: profile?.checkOutTime ?? "11:00 AM",
  };
}

export const ratePlanSnapshotOf = (quote: RoomQuote): HotelBookingRecord["ratePlanSnapshot"] => ({
  id: quote.ratePlan.id,
  mealPlan: getMealPlanLabel(quote.ratePlan.mealPlanSlug),
  refundable: quote.refundable,
  cancellationPolicy: quote.cancellationTerms,
});

/* ------------------------------------------------------------------ */
/* Persistence                                                          */
/* ------------------------------------------------------------------ */

const recordKey = (bookingNumber: string) => `szt:hotel-booking:${bookingNumber}`;

export function saveHotelBooking(record: HotelBookingRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(recordKey(record.bookingNumber), JSON.stringify(record));
  } catch {
    /* storage unavailable — the confirmation page shows a fallback */
  }
}

export function loadHotelBooking(bookingNumber: string): HotelBookingRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(recordKey(bookingNumber));
    return raw ? (JSON.parse(raw) as HotelBookingRecord) : null;
  } catch {
    return null;
  }
}

export const HOTEL_BOOKING_DRAFT_KEY = "szt:hotel-booking:draft";

export function hotelBookingWhatsApp(record: HotelBookingRecord): string {
  return [
    `Hotel booking ${record.bookingNumber} (${record.status === "confirmed" ? "confirmed" : "awaiting hotel confirmation"})`,
    `${record.hotelSnapshot.name}, ${record.hotelSnapshot.city}`,
    `${formatStayDay(record.stay.checkIn)} → ${formatStayDay(record.stay.checkOut)} (${record.stay.nights} night${record.stay.nights === 1 ? "" : "s"})`,
    `${record.roomSnapshot.quantity} × ${record.roomSnapshot.name} · ${record.ratePlanSnapshot.mealPlan}`,
    `Guests: ${record.stay.adults} adult(s), ${record.stay.children} child(ren)`,
    `Total ${inr(record.priceSnapshot.total)} · payable now ${inr(record.priceSnapshot.advanceDue)} via ${record.payment.methodLabel}`,
    `Guest: ${record.primaryGuest.name}, ${record.primaryGuest.phone}`,
  ].join("\n");
}

/** Resolve a hotel from either slug or id, for deep links into the flow. */
export function resolveHotelParam(value: string | undefined): HotelRecord | null {
  if (!value) return null;
  return getHotelBySlug(value) ?? null;
}
