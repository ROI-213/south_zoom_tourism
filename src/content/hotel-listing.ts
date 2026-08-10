/**
 * Admin-managed listing attributes for the hotel results page.
 *
 * Mirrors the future `hotel_listing_attributes`, `hotel_meal_plans`,
 * `room_rate_plans` and `hotel_landmarks` tables. Kept beside the hotel
 * catalogue (`@/content/hotels`) and joined by `hotel_id` / `room_id` so the
 * base catalogue used by the home page and destination pages is untouched.
 *
 *   hotel_listing_attributes: hotel_id, locality, guest_rating,
 *     guest_review_count, meal_plan_slugs[], free_cancellation, pay_at_hotel,
 *     instant_confirmation, recommended, landmark_name, landmark_distance_km
 *   room_rate_plans: id, room_id, meal_plan_slug, price_delta, refundable,
 *     published
 */

import {
  getHotelRooms,
  getPublishedHotels,
  getRoomAvailability,
  nightsBetween,
  type HotelRecord,
  type RoomAvailability,
  type RoomRecord,
} from "@/content/hotels";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type MealPlan = {
  slug: string;
  label: string;
  order: number;
  visible: boolean;
};

export type HotelListingAttributes = {
  hotelId: string;
  locality: string;
  guestRating: number;
  guestReviewCount: number;
  mealPlanSlugs: string[];
  freeCancellation: boolean;
  payAtHotel: boolean;
  instantConfirmation: boolean;
  /** Admin-controlled "Recommended" ribbon. */
  recommended: boolean;
  landmarkName: string;
  landmarkDistanceKm: number;
};

export type RatePlan = {
  id: string;
  roomId: string;
  mealPlanSlug: string;
  /** Added to the room's nightly rate for this plan. */
  priceDelta: number;
  refundable: boolean;
  published: boolean;
};

export type AmenityFacet = { slug: string; label: string; order: number; visible: boolean };

/* ------------------------------------------------------------------ */
/* Admin records                                                        */
/* ------------------------------------------------------------------ */

export const mealPlans: MealPlan[] = [
  { slug: "room-only", label: "Room only", order: 1, visible: true },
  { slug: "breakfast", label: "Breakfast included", order: 2, visible: true },
  { slug: "half-board", label: "Breakfast + dinner", order: 3, visible: true },
  { slug: "full-board", label: "All meals", order: 4, visible: true },
];

export const amenityFacets: AmenityFacet[] = [
  { slug: "wifi", label: "Wi-Fi", order: 1, visible: true },
  { slug: "parking", label: "Parking", order: 2, visible: true },
  { slug: "pool", label: "Swimming pool", order: 3, visible: true },
  { slug: "spa", label: "Spa", order: 4, visible: true },
  { slug: "restaurant", label: "Restaurant", order: 5, visible: true },
  { slug: "pure-veg", label: "Pure-veg kitchen", order: 6, visible: true },
  { slug: "airport-transfer", label: "Airport transfer", order: 7, visible: true },
  { slug: "pet-friendly", label: "Pet friendly", order: 8, visible: true },
  { slug: "heater", label: "Room heater", order: 9, visible: true },
  { slug: "bus-parking", label: "Bus parking", order: 10, visible: true },
];

/** hotel_id -> amenity facet slugs (normalised amenity join table). */
export const hotelAmenityLinks: Record<string, string[]> = {
  "h-hillview": ["wifi", "parking", "heater", "restaurant"],
  "h-marina": ["wifi", "parking", "restaurant", "airport-transfer"],
  "h-backwater": ["wifi", "restaurant", "spa", "parking"],
  "h-templestay": ["wifi", "pure-veg", "restaurant"],
  "h-coorgestate": ["wifi", "parking", "pet-friendly", "restaurant"],
  "h-munnarmist": ["wifi", "parking", "spa", "heater", "restaurant"],
  "h-bluelagoon": ["wifi", "pool", "spa", "restaurant", "airport-transfer", "parking"],
  "h-cityapart": ["wifi", "parking", "restaurant"],
  "h-tirupatiyatri": ["pure-veg", "restaurant", "parking"],
  "h-groupcamp": ["parking", "bus-parking", "restaurant"],
};

export const hotelListingAttributes: HotelListingAttributes[] = [
  { hotelId: "h-hillview", locality: "Havelock Road", guestRating: 4.5, guestReviewCount: 412, mealPlanSlugs: ["breakfast", "half-board"], freeCancellation: true, payAtHotel: true, instantConfirmation: true, recommended: true, landmarkName: "Ooty Lake", landmarkDistanceKm: 2.4 },
  { hotelId: "h-marina", locality: "Meenambakkam", guestRating: 4.2, guestReviewCount: 986, mealPlanSlugs: ["room-only", "breakfast"], freeCancellation: true, payAtHotel: true, instantConfirmation: true, recommended: true, landmarkName: "Chennai Airport", landmarkDistanceKm: 3.1 },
  { hotelId: "h-backwater", locality: "Punnamada", guestRating: 4.4, guestReviewCount: 268, mealPlanSlugs: ["breakfast", "full-board"], freeCancellation: true, payAtHotel: false, instantConfirmation: true, recommended: false, landmarkName: "Finishing Point Jetty", landmarkDistanceKm: 1.2 },
  { hotelId: "h-templestay", locality: "East Chitrai Street", guestRating: 4.1, guestReviewCount: 731, mealPlanSlugs: ["room-only", "breakfast"], freeCancellation: true, payAtHotel: true, instantConfirmation: true, recommended: true, landmarkName: "Meenakshi Temple", landmarkDistanceKm: 0.4 },
  { hotelId: "h-coorgestate", locality: "Suntikoppa", guestRating: 4.7, guestReviewCount: 184, mealPlanSlugs: ["full-board"], freeCancellation: false, payAtHotel: true, instantConfirmation: false, recommended: true, landmarkName: "Madikeri Fort", landmarkDistanceKm: 14.6 },
  { hotelId: "h-munnarmist", locality: "Chithirapuram", guestRating: 4.3, guestReviewCount: 355, mealPlanSlugs: ["breakfast", "half-board"], freeCancellation: true, payAtHotel: false, instantConfirmation: true, recommended: false, landmarkName: "Munnar Town", landmarkDistanceKm: 8.2 },
  { hotelId: "h-bluelagoon", locality: "Candolim", guestRating: 4.6, guestReviewCount: 1204, mealPlanSlugs: ["breakfast", "half-board", "full-board"], freeCancellation: false, payAtHotel: false, instantConfirmation: true, recommended: true, landmarkName: "Candolim Beach", landmarkDistanceKm: 0.3 },
  { hotelId: "h-cityapart", locality: "Indiranagar", guestRating: 4.0, guestReviewCount: 219, mealPlanSlugs: ["room-only"], freeCancellation: true, payAtHotel: true, instantConfirmation: true, recommended: false, landmarkName: "Indiranagar Metro", landmarkDistanceKm: 1.1 },
  { hotelId: "h-tirupatiyatri", locality: "Alipiri Road", guestRating: 3.8, guestReviewCount: 640, mealPlanSlugs: ["room-only", "breakfast"], freeCancellation: true, payAtHotel: true, instantConfirmation: false, recommended: false, landmarkName: "Alipiri Footpath", landmarkDistanceKm: 1.8 },
  { hotelId: "h-groupcamp", locality: "Lady's Seat Road", guestRating: 4.0, guestReviewCount: 97, mealPlanSlugs: ["full-board"], freeCancellation: false, payAtHotel: true, instantConfirmation: false, recommended: false, landmarkName: "Yercaud Lake", landmarkDistanceKm: 2.9 },
];

export const roomRatePlans: RatePlan[] = [
  { id: "rp-hillview-deluxe-bb", roomId: "r-hillview-deluxe", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: true },
  { id: "rp-hillview-deluxe-hb", roomId: "r-hillview-deluxe", mealPlanSlug: "half-board", priceDelta: 900, refundable: true, published: true },
  { id: "rp-hillview-cottage-bb", roomId: "r-hillview-cottage", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: true },
  { id: "rp-marina-exec-ro", roomId: "r-marina-exec", mealPlanSlug: "room-only", priceDelta: -450, refundable: true, published: true },
  { id: "rp-marina-exec-bb", roomId: "r-marina-exec", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: true },
  { id: "rp-marina-suite-bb", roomId: "r-marina-suite", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: true },
  { id: "rp-backwater-cottage-bb", roomId: "r-backwater-cottage", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: true },
  { id: "rp-backwater-cottage-fb", roomId: "r-backwater-cottage", mealPlanSlug: "full-board", priceDelta: 1400, refundable: false, published: true },
  { id: "rp-backwater-family-bb", roomId: "r-backwater-family", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: true },
  { id: "rp-temple-family-ro", roomId: "r-temple-family", mealPlanSlug: "room-only", priceDelta: -300, refundable: true, published: true },
  { id: "rp-temple-family-bb", roomId: "r-temple-family", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: true },
  { id: "rp-temple-single-ro", roomId: "r-temple-single", mealPlanSlug: "room-only", priceDelta: 0, refundable: true, published: true },
  { id: "rp-coorg-planter-fb", roomId: "r-coorg-planter", mealPlanSlug: "full-board", priceDelta: 0, refundable: false, published: true },
  { id: "rp-munnar-glass-bb", roomId: "r-munnar-glass", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: true },
  { id: "rp-munnar-glass-hb", roomId: "r-munnar-glass", mealPlanSlug: "half-board", priceDelta: 1100, refundable: true, published: true },
  { id: "rp-goa-suite-bb", roomId: "r-goa-suite", mealPlanSlug: "breakfast", priceDelta: 0, refundable: false, published: true },
  { id: "rp-goa-suite-fb", roomId: "r-goa-suite", mealPlanSlug: "full-board", priceDelta: 2600, refundable: false, published: true },
  { id: "rp-goa-double-bb", roomId: "r-goa-double", mealPlanSlug: "breakfast", priceDelta: 0, refundable: false, published: true },
  { id: "rp-blr-1bhk-ro", roomId: "r-blr-1bhk", mealPlanSlug: "room-only", priceDelta: 0, refundable: true, published: true },
  { id: "rp-blr-2bhk-ro", roomId: "r-blr-2bhk", mealPlanSlug: "room-only", priceDelta: 0, refundable: true, published: true },
  { id: "rp-tirupati-twin-ro", roomId: "r-tirupati-twin", mealPlanSlug: "room-only", priceDelta: 0, refundable: true, published: true },
  { id: "rp-tirupati-twin-bb", roomId: "r-tirupati-twin", mealPlanSlug: "breakfast", priceDelta: 250, refundable: true, published: true },
  { id: "rp-tirupati-dorm-ro", roomId: "r-tirupati-dorm", mealPlanSlug: "room-only", priceDelta: 0, refundable: true, published: true },
  { id: "rp-yercaud-block-fb", roomId: "r-yercaud-block", mealPlanSlug: "full-board", priceDelta: 0, refundable: false, published: true },
  { id: "rp-yercaud-dorm-fb", roomId: "r-yercaud-dorm", mealPlanSlug: "full-board", priceDelta: 0, refundable: false, published: true },
  { id: "rp-kovalam-suite-bb", roomId: "r-kovalam-suite", mealPlanSlug: "breakfast", priceDelta: 0, refundable: true, published: false },
];

export const listingPageBlock = {
  visible: true,
  heading: "Available stays",
  taxNote: "Includes GST and service charges. Extra meals billed at the property.",
  /** Rooms left at or below this count show the "limited rooms" badge. */
  limitedRoomsThreshold: 3,
  perPage: 6,
};

export const listingSortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating-desc", label: "Guest rating" },
  { value: "distance-asc", label: "Distance from landmark" },
] as const;

export type ListingSortValue = (typeof listingSortOptions)[number]["value"];

/* ------------------------------------------------------------------ */
/* Reads                                                                */
/* ------------------------------------------------------------------ */

export const getVisibleMealPlans = () =>
  mealPlans.filter((m) => m.visible).sort((a, b) => a.order - b.order);

export const getVisibleAmenityFacets = () =>
  amenityFacets.filter((a) => a.visible).sort((a, b) => a.order - b.order);

export const getMealPlanLabel = (slug: string) =>
  mealPlans.find((m) => m.slug === slug)?.label ?? slug;

export const getListingAttributes = (hotelId: string) =>
  hotelListingAttributes.find((a) => a.hotelId === hotelId) ?? null;

export const getHotelAmenitySlugs = (hotelId: string) => hotelAmenityLinks[hotelId] ?? [];

export const getRoomRatePlans = (roomId: string) =>
  roomRatePlans.filter((p) => p.published && p.roomId === roomId);

/** Localities present in the current candidate set, for the filter list. */
export function getLocalityFacets(hotels: HotelRecord[]) {
  const map = new Map<string, number>();
  for (const hotel of hotels) {
    const attrs = getListingAttributes(hotel.id);
    if (!attrs) continue;
    map.set(attrs.locality, (map.get(attrs.locality) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([locality, count]) => ({ locality, count }))
    .sort((a, b) => a.locality.localeCompare(b.locality));
}

/* ------------------------------------------------------------------ */
/* Availability status                                                  */
/* ------------------------------------------------------------------ */

export type AvailabilityStatus = "available" | "limited" | "sold-out";

export function getAvailabilityStatus(unitsAvailable: number): AvailabilityStatus {
  if (unitsAvailable <= 0) return "sold-out";
  if (unitsAvailable <= listingPageBlock.limitedRoomsThreshold) return "limited";
  return "available";
}

export const availabilityLabel: Record<AvailabilityStatus, string> = {
  available: "Available",
  limited: "Limited rooms",
  "sold-out": "Sold out",
};

/* ------------------------------------------------------------------ */
/* Listing search                                                       */
/* ------------------------------------------------------------------ */

export type ListingStay = {
  destination: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  roomType: string;
};

export type ListingFilterState = {
  localities: string[];
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  starRatings: number[];
  minGuestRating: number | null;
  roomTypes: string[];
  mealPlans: string[];
  amenities: string[];
  freeCancellation: boolean;
  payAtHotel: boolean;
  instantConfirmation: boolean;
  minRoomsAvailable: number | null;
  maxDistanceKm: number | null;
};

export const emptyFilters: ListingFilterState = {
  localities: [],
  categories: [],
  minPrice: null,
  maxPrice: null,
  starRatings: [],
  minGuestRating: null,
  roomTypes: [],
  mealPlans: [],
  amenities: [],
  freeCancellation: false,
  payAtHotel: false,
  instantConfirmation: false,
  minRoomsAvailable: null,
  maxDistanceKm: null,
};

export type RoomOffer = {
  availability: RoomAvailability;
  room: RoomRecord;
  ratePlan: RatePlan;
  /** Nightly rate for this rate plan, including inventory peak pricing. */
  nightlyRate: number;
  stayTotal: number;
};

export type ListingResult = {
  hotel: HotelRecord;
  attributes: HotelListingAttributes;
  amenitySlugs: string[];
  offers: RoomOffer[];
  bestOffer: RoomOffer | null;
  startingPrice: number | null;
  unitsAvailable: number;
  status: AvailabilityStatus;
  nights: number;
  roomTypeSlugs: string[];
};

/**
 * Builds the candidate result set: every published hotel matching the text and
 * date query, with its date-wise room inventory resolved into rate-plan offers.
 * A hotel with no qualifying inventory is returned with status "sold-out" and
 * no offers — never as available.
 */
export function buildListingResults(stay: ListingStay): ListingResult[] {
  const destination = stay.destination.trim().toLowerCase();
  const name = stay.hotelName.trim().toLowerCase();
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const adultsPerRoom = Math.ceil(stay.adults / Math.max(1, stay.rooms));
  const childrenPerRoom = Math.ceil(stay.children / Math.max(1, stay.rooms));

  return getPublishedHotels()
    .filter((hotel) => {
      if (
        destination &&
        ![hotel.city, hotel.state, hotel.name].some((v) => v.toLowerCase().includes(destination))
      ) {
        return false;
      }
      if (name && !hotel.name.toLowerCase().includes(name)) return false;
      return Boolean(getListingAttributes(hotel.id));
    })
    .map((hotel) => {
      const attributes = getListingAttributes(hotel.id)!;
      const rooms = getHotelRooms(hotel.id).filter((room) => {
        if (stay.roomType && stay.roomType !== "any" && room.roomTypeSlug !== stay.roomType) {
          return false;
        }
        return room.maxAdults >= adultsPerRoom && room.maxChildren >= childrenPerRoom;
      });

      const offers: RoomOffer[] = [];
      let unitsAvailable = 0;

      for (const room of rooms) {
        const availability = getRoomAvailability(room, {
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          rooms: stay.rooms,
        });
        if (!availability.available) continue;
        unitsAvailable = Math.max(unitsAvailable, availability.unitsAvailable);

        for (const ratePlan of getRoomRatePlans(room.id)) {
          const nightlyRate = Math.max(0, availability.avgNightlyRate + ratePlan.priceDelta);
          offers.push({
            availability,
            room,
            ratePlan,
            nightlyRate,
            stayTotal: nightlyRate * Math.max(1, availability.nights) * Math.max(1, stay.rooms),
          });
        }
      }

      offers.sort((a, b) => a.nightlyRate - b.nightlyRate);

      // "Rooms left" reflects the room the guest would actually book (the
      // cheapest qualifying offer), not the largest block in the property.
      const unitsForBestOffer = offers[0]?.availability.unitsAvailable ?? 0;
      void unitsAvailable;

      return {
        hotel,
        attributes,
        amenitySlugs: getHotelAmenitySlugs(hotel.id),
        offers,
        bestOffer: offers[0] ?? null,
        startingPrice: offers[0]?.nightlyRate ?? null,
        unitsAvailable: unitsForBestOffer,
        status: getAvailabilityStatus(unitsForBestOffer),
        nights,
        roomTypeSlugs: Array.from(new Set(offers.map((o) => o.room.roomTypeSlug))),
      };
    });
}

export function applyListingFilters(
  results: ListingResult[],
  filters: ListingFilterState,
): ListingResult[] {
  return results.filter((r) => {
    if (filters.localities.length && !filters.localities.includes(r.attributes.locality)) return false;
    if (filters.categories.length && !filters.categories.includes(r.hotel.categorySlug)) return false;
    if (filters.starRatings.length && !filters.starRatings.includes(r.hotel.starRating)) return false;
    if (filters.minGuestRating !== null && r.attributes.guestRating < filters.minGuestRating) return false;
    if (filters.freeCancellation && !r.attributes.freeCancellation) return false;
    if (filters.payAtHotel && !r.attributes.payAtHotel) return false;
    if (filters.instantConfirmation && !r.attributes.instantConfirmation) return false;
    if (filters.maxDistanceKm !== null && r.attributes.landmarkDistanceKm > filters.maxDistanceKm) {
      return false;
    }
    if (filters.amenities.length && !filters.amenities.every((a) => r.amenitySlugs.includes(a))) {
      return false;
    }
    if (filters.minRoomsAvailable !== null && r.unitsAvailable < filters.minRoomsAvailable) {
      return false;
    }

    // Offer-level facets: at least one bookable offer must satisfy them all.
    const matchingOffers = r.offers.filter((o) => {
      if (filters.roomTypes.length && !filters.roomTypes.includes(o.room.roomTypeSlug)) return false;
      if (filters.mealPlans.length && !filters.mealPlans.includes(o.ratePlan.mealPlanSlug)) return false;
      if (filters.minPrice !== null && o.nightlyRate < filters.minPrice) return false;
      if (filters.maxPrice !== null && o.nightlyRate > filters.maxPrice) return false;
      return true;
    });

    return matchingOffers.length > 0;
  });
}

export function sortListingResults(
  results: ListingResult[],
  sort: ListingSortValue,
): ListingResult[] {
  const copy = [...results];
  const price = (r: ListingResult) => r.startingPrice ?? Number.POSITIVE_INFINITY;

  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => price(a) - price(b));
    case "price-desc":
      return copy.sort((a, b) => price(b) - price(a));
    case "rating-desc":
      return copy.sort((a, b) => b.attributes.guestRating - a.attributes.guestRating);
    case "distance-asc":
      return copy.sort(
        (a, b) => a.attributes.landmarkDistanceKm - b.attributes.landmarkDistanceKm,
      );
    default:
      return copy.sort((a, b) => {
        const rank = (r: ListingResult) =>
          (r.attributes.recommended ? 0 : 1) * 100 +
          (r.status === "available" ? 0 : r.status === "limited" ? 10 : 50) +
          (r.hotel.featured ? 0 : 1);
        return rank(a) - rank(b) || b.attributes.guestRating - a.attributes.guestRating;
      });
  }
}

/** Price bounds across a candidate set, used to seed the price filter. */
export function getPriceBounds(results: ListingResult[]) {
  const prices = results.map((r) => r.startingPrice).filter((p): p is number => p !== null);
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
