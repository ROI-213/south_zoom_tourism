/**
 * URL <-> state helpers for the hotel listing/search results page.
 * Every filter lives in the URL so results survive a refresh or a shared link.
 */

import {
  addDaysISO,
  hotelsSearchDefaults,
  isValidISODate,
  todayISO,
} from "@/content/hotels";
import {
  emptyFilters,
  listingSortOptions,
  type ListingFilterState,
  type ListingSortValue,
  type ListingStay,
} from "@/content/hotel-listing";

export type ListingSearch = {
  destination?: string;
  hotelName?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  roomType?: string;
  sort?: string;
  page?: number;
  localities?: string;
  categories?: string;
  minPrice?: number;
  maxPrice?: number;
  stars?: string;
  guestRating?: number;
  roomTypes?: string;
  meals?: string;
  amenities?: string;
  freeCancellation?: boolean;
  payAtHotel?: boolean;
  instantConfirmation?: boolean;
  minRooms?: number;
  maxDistance?: number;
};

const str = (v: unknown, max = 120) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

const date = (v: unknown) => (typeof v === "string" && isValidISODate(v) ? v : undefined);

const int = (v: unknown, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), max) : undefined;
};

const num = (v: unknown, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : undefined;
};

const bool = (v: unknown) => (v === true || v === "true" || v === 1 || v === "1" ? true : undefined);

export function validateListingSearch(search: Record<string, unknown>): ListingSearch {
  return {
    destination: str(search.destination) ?? str(search.city),
    hotelName: str(search.hotelName),
    checkIn: date(search.checkIn),
    checkOut: date(search.checkOut),
    rooms: int(search.rooms, hotelsSearchDefaults.maxRooms),
    adults: int(search.adults, hotelsSearchDefaults.maxAdults),
    children: int(search.children, hotelsSearchDefaults.maxChildren),
    roomType: str(search.roomType, 40),
    sort: str(search.sort, 20),
    page: int(search.page, 50),
    localities: str(search.localities, 400),
    categories: str(search.categories, 300),
    minPrice: int(search.minPrice, 1_000_000),
    maxPrice: int(search.maxPrice, 1_000_000),
    stars: str(search.stars, 20),
    guestRating: num(search.guestRating, 5),
    roomTypes: str(search.roomTypes, 300),
    meals: str(search.meals, 300),
    amenities: str(search.amenities, 400),
    freeCancellation: bool(search.freeCancellation),
    payAtHotel: bool(search.payAtHotel),
    instantConfirmation: bool(search.instantConfirmation),
    minRooms: int(search.minRooms, 50),
    maxDistance: num(search.maxDistance, 100),
  };
}

export const splitList = (value?: string) =>
  value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

export const joinList = (values: string[]) => (values.length ? values.join(",") : undefined);

export function resolveStay(search: ListingSearch, lockedDestination?: string): ListingStay {
  const checkIn = search.checkIn ?? todayISO();
  const fallbackOut = addDaysISO(checkIn, hotelsSearchDefaults.nights || 1);
  const checkOut =
    search.checkOut && search.checkOut > checkIn ? search.checkOut : fallbackOut;

  return {
    destination: lockedDestination ?? search.destination ?? "",
    hotelName: search.hotelName ?? "",
    checkIn,
    checkOut,
    rooms: Math.max(1, search.rooms ?? hotelsSearchDefaults.rooms ?? 1),
    adults: Math.max(1, search.adults ?? hotelsSearchDefaults.adults ?? 2),
    children: search.children ?? 0,
    roomType: search.roomType ?? "any",
  };
}

export function resolveFilters(search: ListingSearch): ListingFilterState {
  return {
    ...emptyFilters,
    localities: splitList(search.localities),
    categories: splitList(search.categories),
    minPrice: search.minPrice ?? null,
    maxPrice: search.maxPrice ?? null,
    starRatings: splitList(search.stars)
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n)),
    minGuestRating: search.guestRating ?? null,
    roomTypes: splitList(search.roomTypes),
    mealPlans: splitList(search.meals),
    amenities: splitList(search.amenities),
    freeCancellation: search.freeCancellation === true,
    payAtHotel: search.payAtHotel === true,
    instantConfirmation: search.instantConfirmation === true,
    minRoomsAvailable: search.minRooms ?? null,
    maxDistanceKm: search.maxDistance ?? null,
  };
}

export function resolveSort(value?: string): ListingSortValue {
  const match = listingSortOptions.find((o) => o.value === value);
  return (match?.value ?? "recommended") as ListingSortValue;
}

export function countActiveFilters(filters: ListingFilterState) {
  return (
    filters.localities.length +
    filters.categories.length +
    filters.starRatings.length +
    filters.roomTypes.length +
    filters.mealPlans.length +
    filters.amenities.length +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.minGuestRating !== null ? 1 : 0) +
    (filters.freeCancellation ? 1 : 0) +
    (filters.payAtHotel ? 1 : 0) +
    (filters.instantConfirmation ? 1 : 0) +
    (filters.minRoomsAvailable !== null ? 1 : 0) +
    (filters.maxDistanceKm !== null ? 1 : 0)
  );
}

/** Query string carrying the stay context onwards to detail/booking pages. */
export function stayQuery(stay: ListingStay) {
  const params = new URLSearchParams({
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: String(stay.rooms),
    adults: String(stay.adults),
    children: String(stay.children),
  });
  if (stay.destination) params.set("destination", stay.destination);
  if (stay.roomType && stay.roomType !== "any") params.set("roomType", stay.roomType);
  return params.toString();
}
