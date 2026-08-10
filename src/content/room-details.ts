/**
 * Admin-managed room profile content for the room detail page.
 *
 * Mirrors the future `room_profiles`, `room_media`, `room_rate_plan_rules`
 * and `room_charges` tables. Joined to the base catalogue
 * (`@/content/hotels`) and rate plans (`@/content/hotel-listing`) by
 * `room_id` / `rate_plan_id`, so nothing here changes existing pages.
 *
 *   room_profiles: room_id, slug, bed_count, view_type, floor, smoking,
 *     air_conditioned, extra_bed_available, base_occupancy,
 *     recommended_adults, recommended_children, service_charge_percent,
 *     extra_adult_charge, extra_child_charge, description, published
 *   room_media: id, room_id, image, image_alt, caption, display_order, visible
 *   room_rate_plan_rules: room_id, rate_plan_id, max_adults, max_children,
 *     min_nights, discount_percent
 *
 * Nightly pricing, weekend/peak multipliers and inventory continue to come
 * from `@/content/hotels` (`getStayInventory`), never from this file.
 */

import {
  getHotelRooms,
  getPublishedHotels,
  getRoomTypeLabel,
  getStayInventory,
  type HotelRecord,
  type RoomRecord,
} from "@/content/hotels";
import { getMealPlanLabel, getRoomRatePlans, type RatePlan } from "@/content/hotel-listing";
import {
  getHotelGallery,
  getHotelProfile,
  getRoomDetailAttributes,
  type RoomStay,
} from "@/content/hotel-details";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type RoomProfile = {
  roomId: string;
  slug: string;
  description: string;
  bedCount: number;
  viewType: string;
  floor: string;
  smokingAllowed: boolean;
  airConditioned: boolean;
  extraBedAvailable: boolean;
  /** Guests included in the base nightly rate. */
  baseOccupancy: number;
  recommendedAdults: number;
  recommendedChildren: number;
  serviceChargePercent: number;
  extraAdultCharge: number;
  extraChildCharge: number;
  published: boolean;
};

export type RoomRatePlanRule = {
  roomId: string;
  ratePlanId: string;
  maxAdults: number;
  maxChildren: number;
  minNights: number;
  /** Percentage taken off the room subtotal for this plan. */
  discountPercent: number;
};

export type RoomMediaItem = {
  id: string;
  roomId: string;
  image: string;
  imageAlt: string;
  caption: string;
  order: number;
  visible: boolean;
};

/** Admin-editable copy for the room detail page. */
export const roomDetailBlock = {
  visible: true,
  ratesHeading: "Rate plans for your dates",
  ratesSubheading:
    "Every plan below is priced night-by-night from live inventory, including weekend and peak-season rates.",
  breakdownHeading: "Price breakdown",
  unavailableTitle: "Not available for these dates",
  unavailableBody:
    "This room is blocked or fully booked on at least one night of your stay. Change the dates or browse the other rooms in this property.",
  occupancyTitle: "Occupancy exceeds this room's limit",
  occupancyBody:
    "Reduce the guest count, add another room, or pick a larger room type to continue.",
  otherRoomsHeading: "Other rooms in this hotel",
};

/* ------------------------------------------------------------------ */
/* Records                                                              */
/* ------------------------------------------------------------------ */

export const slugifyRoom = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type ProfileSeed = Omit<RoomProfile, "slug" | "published"> &
  Partial<Pick<RoomProfile, "slug" | "published">>;

const seeds: ProfileSeed[] = [
  { roomId: "r-hillview-deluxe", description: "Valley-facing deluxe room with a king bed, room heater and a private sit-out over the tea slopes.", bedCount: 1, viewType: "Valley view", floor: "1st floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 1, serviceChargePercent: 5, extraAdultCharge: 900, extraChildCharge: 450 },
  { roomId: "r-hillview-cottage", description: "Two-bedroom cottage with a fireplace, living area and a private lawn — built for families travelling together.", bedCount: 2, viewType: "Garden view", floor: "Ground floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 4, recommendedAdults: 4, recommendedChildren: 2, serviceChargePercent: 5, extraAdultCharge: 1100, extraChildCharge: 550 },
  { roomId: "r-marina-exec", description: "Executive city room with a work desk, soundproof windows and complimentary airport pickup on request.", bedCount: 1, viewType: "City view", floor: "5th to 9th floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 1, serviceChargePercent: 8, extraAdultCharge: 850, extraChildCharge: 400 },
  { roomId: "r-marina-suite", description: "Suite with a separate living room, bathtub and executive lounge access through the stay.", bedCount: 2, viewType: "Sea-facing", floor: "10th floor and above", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 3, recommendedChildren: 2, serviceChargePercent: 8, extraAdultCharge: 1200, extraChildCharge: 600 },
  { roomId: "r-backwater-cottage", description: "Lake-facing cottage with a private deck, mosquito-screened windows and canoe access at the jetty.", bedCount: 1, viewType: "Lake view", floor: "Ground floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 1, serviceChargePercent: 5, extraAdultCharge: 1000, extraChildCharge: 500 },
  { roomId: "r-backwater-family", description: "Two-bedroom family cottage facing the backwaters, with a shared verandah and AC in both rooms.", bedCount: 2, viewType: "Lake view", floor: "Ground floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 4, recommendedAdults: 4, recommendedChildren: 2, serviceChargePercent: 5, extraAdultCharge: 1000, extraChildCharge: 500 },
  { roomId: "r-temple-family", description: "Four-bed pilgrim family room a short walk from the temple, with hot water from 4 AM and a luggage locker.", bedCount: 4, viewType: "Street view", floor: "2nd floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 4, recommendedAdults: 4, recommendedChildren: 2, serviceChargePercent: 0, extraAdultCharge: 500, extraChildCharge: 250 },
  { roomId: "r-temple-single", description: "Compact single room for solo pilgrims, with a locker, AC and 24-hour hot water.", bedCount: 1, viewType: "Interior", floor: "2nd floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: false, baseOccupancy: 1, recommendedAdults: 1, recommendedChildren: 0, serviceChargePercent: 0, extraAdultCharge: 0, extraChildCharge: 250 },
  { roomId: "r-coorg-planter", description: "Planter's room inside the coffee estate, with all meals, a guided plantation walk and an estate-facing balcony.", bedCount: 1, viewType: "Estate view", floor: "Ground floor", smokingAllowed: false, airConditioned: false, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 2, serviceChargePercent: 5, extraAdultCharge: 1500, extraChildCharge: 750 },
  { roomId: "r-munnar-glass", description: "Glass-fronted room facing the Munnar valley, with a heater, blackout curtains and a private balcony.", bedCount: 1, viewType: "Valley view", floor: "1st floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 1, serviceChargePercent: 5, extraAdultCharge: 1300, extraChildCharge: 650 },
  { roomId: "r-goa-suite", description: "Sea-view suite with a private deck, day bed and direct pool access from the garden path.", bedCount: 1, viewType: "Sea-facing", floor: "1st floor", smokingAllowed: true, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 2, serviceChargePercent: 10, extraAdultCharge: 2500, extraChildCharge: 1200 },
  { roomId: "r-goa-double", description: "Garden-view double with a balcony, pool access and beach towels included.", bedCount: 1, viewType: "Garden view", floor: "Ground floor", smokingAllowed: true, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 1, serviceChargePercent: 10, extraAdultCharge: 1800, extraChildCharge: 900 },
  { roomId: "r-blr-1bhk", description: "Serviced 1BHK apartment with a kitchenette, washing machine and weekly housekeeping — ideal for long stays.", bedCount: 1, viewType: "City view", floor: "3rd to 7th floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 1, serviceChargePercent: 5, extraAdultCharge: 700, extraChildCharge: 350 },
  { roomId: "r-blr-2bhk", description: "Serviced 2BHK apartment with two bedrooms, a full kitchenette and a shared work area.", bedCount: 2, viewType: "City view", floor: "3rd to 7th floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 4, recommendedAdults: 4, recommendedChildren: 2, serviceChargePercent: 5, extraAdultCharge: 700, extraChildCharge: 350 },
  { roomId: "r-tirupati-twin", description: "Twin-bed pilgrim room with 24-hour check-in, hot water from 3 AM and a supervised luggage room.", bedCount: 2, viewType: "Interior", floor: "1st floor", smokingAllowed: false, airConditioned: true, extraBedAvailable: true, baseOccupancy: 2, recommendedAdults: 2, recommendedChildren: 2, serviceChargePercent: 0, extraAdultCharge: 350, extraChildCharge: 200 },
  { roomId: "r-tirupati-dorm", description: "Dormitory bed in separate male and female halls, with lockers and shared bathrooms.", bedCount: 1, viewType: "Interior", floor: "Ground floor", smokingAllowed: false, airConditioned: false, extraBedAvailable: false, baseOccupancy: 1, recommendedAdults: 1, recommendedChildren: 0, serviceChargePercent: 0, extraAdultCharge: 0, extraChildCharge: 0 },
  { roomId: "r-yercaud-block", description: "Six-bed group block with full board and coach parking at the door — built for school and offsite groups.", bedCount: 6, viewType: "Hill view", floor: "Ground and 1st floor", smokingAllowed: false, airConditioned: false, extraBedAvailable: true, baseOccupancy: 6, recommendedAdults: 6, recommendedChildren: 4, serviceChargePercent: 0, extraAdultCharge: 400, extraChildCharge: 200 },
  { roomId: "r-yercaud-dorm", description: "Dormitory bed with dining-hall access and use of the bonfire ground, charged per bed.", bedCount: 1, viewType: "Hill view", floor: "Ground floor", smokingAllowed: false, airConditioned: false, extraBedAvailable: false, baseOccupancy: 1, recommendedAdults: 1, recommendedChildren: 0, serviceChargePercent: 0, extraAdultCharge: 0, extraChildCharge: 0 },
];

export const roomProfiles: RoomProfile[] = seeds.map((seed) => ({
  ...seed,
  slug: seed.slug ?? "",
  published: seed.published ?? true,
}));

/** Rate-plan level occupancy / stay rules and plan discounts. */
export const roomRatePlanRules: RoomRatePlanRule[] = [
  { roomId: "r-tirupati-dorm", ratePlanId: "rp-tirupati-dorm-ro", maxAdults: 1, maxChildren: 0, minNights: 1, discountPercent: 0 },
  { roomId: "r-yercaud-dorm", ratePlanId: "rp-yercaud-dorm-fb", maxAdults: 1, maxChildren: 0, minNights: 1, discountPercent: 0 },
  { roomId: "r-temple-single", ratePlanId: "rp-temple-single-ro", maxAdults: 1, maxChildren: 0, minNights: 1, discountPercent: 0 },
  { roomId: "r-coorg-planter", ratePlanId: "rp-coorg-planter-fb", maxAdults: 2, maxChildren: 2, minNights: 2, discountPercent: 5 },
  { roomId: "r-goa-suite", ratePlanId: "rp-goa-suite-fb", maxAdults: 2, maxChildren: 2, minNights: 2, discountPercent: 8 },
  { roomId: "r-hillview-deluxe", ratePlanId: "rp-hillview-deluxe-hb", maxAdults: 3, maxChildren: 1, minNights: 1, discountPercent: 5 },
  { roomId: "r-munnar-glass", ratePlanId: "rp-munnar-glass-hb", maxAdults: 3, maxChildren: 1, minNights: 1, discountPercent: 5 },
  { roomId: "r-blr-1bhk", ratePlanId: "rp-blr-1bhk-ro", maxAdults: 3, maxChildren: 2, minNights: 2, discountPercent: 10 },
];


/* ------------------------------------------------------------------ */
/* Reads                                                                */
/* ------------------------------------------------------------------ */

const roomsById = () => {
  const map = new Map<string, RoomRecord>();
  for (const hotel of getPublishedHotels()) {
    for (const room of getHotelRooms(hotel.id)) map.set(room.id, room);
  }
  return map;
};

/** Room slug is admin-set when provided, otherwise derived from the name. */
export function getRoomSlug(room: RoomRecord): string {
  const profile = roomProfiles.find((p) => p.roomId === room.id);
  return profile?.slug || slugifyRoom(room.name);
}

export const getRoomProfile = (roomId: string): RoomProfile | undefined =>
  roomProfiles.find((p) => p.published && p.roomId === roomId);

/** Resolves a published room that belongs to the given published hotel. */
export function resolveRoom(hotel: HotelRecord, roomSlug: string): RoomRecord | null {
  return getHotelRooms(hotel.id).find((room) => getRoomSlug(room) === roomSlug) ?? null;
}

/** Room-level gallery: the room image plus this hotel's "rooms" media. */
export function getRoomGallery(hotel: HotelRecord, room: RoomRecord): RoomMediaItem[] {
  const hotelRoomShots = getHotelGallery(hotel.id)
    .filter((media) => media.categorySlug === "rooms" || media.categorySlug === "bathroom")
    .map<RoomMediaItem>((media, index) => ({
      id: `${room.id}-${media.id}`,
      roomId: room.id,
      image: media.image,
      imageAlt: `${room.name} at ${hotel.name} — ${media.imageAlt}`,
      caption: media.caption,
      order: index + 2,
      visible: media.visible,
    }));

  return [
    {
      id: `${room.id}-primary`,
      roomId: room.id,
      image: room.image,
      imageAlt: room.imageAlt,
      caption: room.name,
      order: 1,
      visible: true,
    },
    ...hotelRoomShots,
  ].filter((item) => item.visible);
}

export function getRatePlanRule(roomId: string, ratePlanId: string): RoomRatePlanRule | undefined {
  return roomRatePlanRules.find((r) => r.roomId === roomId && r.ratePlanId === ratePlanId);
}

/* ------------------------------------------------------------------ */
/* Quoting                                                              */
/* ------------------------------------------------------------------ */

export type QuoteNight = {
  date: string;
  /** Inventory rate for one room on this night, before the plan delta. */
  baseRate: number;
  planRate: number;
  unitsLeft: number;
  peak: boolean;
};

export type OccupancyCheck = {
  ok: boolean;
  /** Human-readable reason when the requested occupancy is not allowed. */
  reason: string | null;
  maxAdults: number;
  maxChildren: number;
  extraAdults: number;
  extraChildren: number;
};

export type RoomQuote = {
  ratePlan: RatePlan;
  mealPlanLabel: string;
  nights: QuoteNight[];
  nightCount: number;
  rooms: number;
  unitsAvailable: number;
  available: boolean;
  /** Nightly rates x rooms, before discount. */
  roomSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  extraAdultTotal: number;
  extraChildTotal: number;
  serviceCharge: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  perNightAverage: number;
  occupancy: OccupancyCheck;
  minNights: number;
  meetsMinNights: boolean;
  refundable: boolean;
  cancellationTerms: string;
  selectable: boolean;
};

function checkOccupancy(
  room: RoomRecord,
  profile: RoomProfile | undefined,
  rule: RoomRatePlanRule | undefined,
  stay: RoomStay,
): OccupancyCheck {
  const rooms = Math.max(1, stay.rooms);
  const maxAdults = Math.min(room.maxAdults, rule?.maxAdults ?? room.maxAdults);
  const maxChildren = Math.min(room.maxChildren, rule?.maxChildren ?? room.maxChildren);
  const adultsPerRoom = Math.ceil(Math.max(1, stay.adults) / rooms);
  const childrenPerRoom = Math.ceil(Math.max(0, stay.children) / rooms);

  const base = profile?.baseOccupancy ?? Math.min(2, room.maxAdults);
  const extraAdults = Math.max(0, adultsPerRoom - base) * rooms;
  const extraChildren = childrenPerRoom * rooms;

  if (adultsPerRoom > maxAdults) {
    return {
      ok: false,
      reason: `This rate allows up to ${maxAdults} adult${maxAdults === 1 ? "" : "s"} per room. You selected ${adultsPerRoom}.`,
      maxAdults,
      maxChildren,
      extraAdults,
      extraChildren,
    };
  }
  if (childrenPerRoom > maxChildren) {
    return {
      ok: false,
      reason:
        maxChildren === 0
          ? "This rate does not allow children in the room."
          : `This rate allows up to ${maxChildren} child${maxChildren === 1 ? "" : "ren"} per room. You selected ${childrenPerRoom}.`,
      maxAdults,
      maxChildren,
      extraAdults,
      extraChildren,
    };
  }
  if (extraAdults > 0 && !(profile?.extraBedAvailable ?? true)) {
    return {
      ok: false,
      reason: "Extra beds are not available in this room, so it sleeps only the base occupancy.",
      maxAdults,
      maxChildren,
      extraAdults,
      extraChildren,
    };
  }

  return { ok: true, reason: null, maxAdults, maxChildren, extraAdults, extraChildren };
}

/**
 * Builds the full, itemised quote for one rate plan and the requested stay.
 * Nightly rates, peak multipliers and inventory all come from the catalogue,
 * so the breakdown always matches the totals shown in the booking summary.
 */
export function buildRoomQuote(
  hotelId: string,
  room: RoomRecord,
  ratePlan: RatePlan,
  stay: RoomStay,
): RoomQuote {
  const profile = getRoomProfile(room.id);
  const attributes = getRoomDetailAttributes(room.id);
  const rule = getRatePlanRule(room.id, ratePlan.id);
  const hotelProfile = getHotelProfile(hotelId);
  const taxPercent = hotelProfile?.taxPercent ?? 12;
  const rooms = Math.max(1, stay.rooms);

  const inventory = getStayInventory(room, stay.checkIn, stay.checkOut);
  const nights: QuoteNight[] = inventory.map((night) => ({
    date: night.date,
    baseRate: night.price,
    planRate: Math.max(0, night.price + ratePlan.priceDelta),
    unitsLeft: night.units,
    peak: night.price > room.basePricePerNight,
  }));

  const unitsAvailable = nights.length ? Math.min(...nights.map((n) => n.unitsLeft)) : 0;
  const available = nights.length > 0 && unitsAvailable >= rooms;

  const roomSubtotal = nights.reduce((sum, n) => sum + n.planRate, 0) * rooms;
  const discountPercent = rule?.discountPercent ?? 0;
  const discountAmount = Math.round((roomSubtotal * discountPercent) / 100);

  const occupancy = checkOccupancy(room, profile, rule, stay);
  const nightCount = nights.length;
  const extraAdultTotal =
    occupancy.extraAdults * (profile?.extraAdultCharge ?? 0) * Math.max(1, nightCount);
  const extraChildTotal =
    occupancy.extraChildren * (profile?.extraChildCharge ?? 0) * Math.max(1, nightCount);

  const beforeService = roomSubtotal - discountAmount + extraAdultTotal + extraChildTotal;
  const serviceCharge = Math.round((beforeService * (profile?.serviceChargePercent ?? 0)) / 100);
  const taxableAmount = beforeService + serviceCharge;
  const taxAmount = Math.round((taxableAmount * taxPercent) / 100);
  const total = taxableAmount + taxAmount;

  const minNights = rule?.minNights ?? 1;
  const meetsMinNights = nightCount >= minNights;

  return {
    ratePlan,
    mealPlanLabel: getMealPlanLabel(ratePlan.mealPlanSlug),
    nights,
    nightCount,
    rooms,
    unitsAvailable,
    available,
    roomSubtotal,
    discountPercent,
    discountAmount,
    extraAdultTotal,
    extraChildTotal,
    serviceCharge,
    taxableAmount,
    taxPercent,
    taxAmount,
    total,
    perNightAverage: nightCount ? Math.round(roomSubtotal / nightCount / rooms) : 0,
    occupancy,
    minNights,
    meetsMinNights,
    refundable: ratePlan.refundable,
    cancellationTerms: ratePlan.refundable
      ? attributes?.cancellationTerms || hotelProfile?.cancellationSummary || ""
      : "Non-refundable rate — the advance is not returned on cancellation.",
    selectable: available && occupancy.ok && meetsMinNights,
  };
}

/** Every published rate plan for a room, quoted against the requested stay. */
export function buildRoomQuotes(hotelId: string, room: RoomRecord, stay: RoomStay): RoomQuote[] {
  return getRoomRatePlans(room.id)
    .map((plan) => buildRoomQuote(hotelId, room, plan, stay))
    .sort((a, b) => a.total - b.total);
}

/** Sibling rooms of the same hotel, for the "other rooms" strip. */
export function getSiblingRooms(hotelId: string, roomId: string): RoomRecord[] {
  return getHotelRooms(hotelId).filter((room) => room.id !== roomId);
}

export const roomTypeLabel = (room: RoomRecord) => getRoomTypeLabel(room.roomTypeSlug);
