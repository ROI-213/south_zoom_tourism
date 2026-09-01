/**
 * Admin-managed accommodation data.
 *
 * Mirrors the future `hotel_categories`, `hotels`, `hotel_rooms`,
 * `room_inventory`, `hotel_destinations`, `hotel_faqs` and
 * `hotel_page_blocks` tables:
 *   hotels: id, slug, name, city, state, category_slug, star_rating,
 *           short_description, address, amenities[], image, image_alt,
 *           verified_partner, published, featured, display_order, seo_*
 *   hotel_rooms: id, hotel_id, name, room_type_slug, max_adults, max_children,
 *           base_price_per_night, bed_type, size, amenities[], image,
 *           image_alt, published, featured, display_order
 *   room_inventory: room_id, date, units_available, price_override
 *
 * Availability is resolved per night from the inventory rules below — never
 * from a hotel-level "available" flag. Unpublished hotels and rooms are
 * excluded from every public read.
 */

import heroHotels from "@/assets/hero-hotels.jpg";
import heroTours from "@/assets/hero-tours.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import serviceCorporate from "@/assets/service-corporate.jpg";
import servicePilgrimage from "@/assets/service-pilgrimage.jpg";
import serviceWedding from "@/assets/service-wedding.jpg";
import aboutBanner from "@/assets/about-banner.jpg";
import servicesBanner from "@/assets/services-banner.jpg";
import office1 from "@/assets/office-1.jpg";
import pkgAlleppey from "@/assets/pkg-alleppey.png";
import pkgNavagraha from "@/assets/pkg-navagraha.png";
import pkgOoty from "@/assets/pkg-ooty.png";
import roomOotyDeluxe from "@/assets/rooms/room-ooty-deluxe.jpg";
import roomChennaiExec from "@/assets/rooms/room-chennai-executive.jpg";
import roomAlleppeyCottage from "@/assets/rooms/room-alleppey-cottage.jpg";
import roomMaduraiFamily from "@/assets/rooms/room-madurai-family.jpg";
import roomCoorgPlanter from "@/assets/rooms/room-coorg-planter.jpg";
import roomMunnarDeluxe from "@/assets/rooms/room-munnar-deluxe.jpg";
import destOoty from "@/assets/destinations/dest-ooty.jpg";
import destMunnar from "@/assets/destinations/dest-munnar.jpg";
import destCoorg from "@/assets/destinations/dest-coorg.jpg";
import destChennai from "@/assets/destinations/dest-chennai.jpg";
import destMadurai from "@/assets/destinations/dest-madurai.jpg";
import destGoa from "@/assets/destinations/dest-goa.jpg";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type HotelCategory = {
  id: string;
  slug: string;
  label: string;
  description: string;
  order: number;
  visible: boolean;
};

export type RoomTypeOption = {
  slug: string;
  label: string;
  order: number;
  visible: boolean;
};

/**
 * Inventory rule for a room. Expanded per night into the equivalent of a
 * `room_inventory` row so availability is always date-wise.
 */
export type RoomInventoryRule = {
  /** Units bookable on a normal weekday night. */
  weekdayUnits: number;
  /** Units bookable on Friday/Saturday nights. */
  weekendUnits: number;
  /** Day offsets from today that are fully blocked (maintenance / group hold). */
  blockedDayOffsets: number[];
  /** Day offsets from today that carry a seasonal surcharge multiplier. */
  peakDayOffsets: number[];
  /** Multiplier applied to the base rate on peak nights. */
  peakMultiplier: number;
  /** Inventory is only loaded this many days ahead. */
  bookingWindowDays: number;
};

export type RoomRecord = {
  id: string;
  hotelId: string;
  name: string;
  roomTypeSlug: string;
  maxAdults: number;
  maxChildren: number;
  basePricePerNight: number;
  bedType: string;
  sizeSqft: number;
  amenities: string[];
  image: string;
  imageAlt: string;
  published: boolean;
  featured: boolean;
  order: number;
  inventory: RoomInventoryRule;
};

export type HotelRecord = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  categorySlug: string;
  starRating: number;
  shortDescription: string;
  address: string;
  amenities: string[];
  image: string;
  imageAlt: string;
  verifiedPartner: boolean;
  published: boolean;
  featured: boolean;
  order: number;
};

export type HotelDestinationRecord = {
  id: string;
  city: string;
  state: string;
  destinationSlug: string;
  blurb: string;
  image: string;
  imageAlt: string;
  order: number;
  visible: boolean;
};

export type HotelFaq = {
  id: string;
  question: string;
  answer: string;
  order: number;
  visible: boolean;
};

export type HotelProcessStep = {
  id: string;
  title: string;
  description: string;
  order: number;
  visible: boolean;
};

export type HotelTrustPoint = {
  id: string;
  title: string;
  description: string;
  order: number;
  visible: boolean;
};

/* ------------------------------------------------------------------ */
/* Page blocks (admin editable)                                         */
/* ------------------------------------------------------------------ */

export const hotelsBannerBlock = {
  visible: true,
  title: "Hotels, resorts & homestays across South India",
  subtitle:
    "Search partner-rate stays with live room inventory — from budget rooms near temples to hill resorts, service apartments and group accommodation for 40+ travellers.",
  image: heroHotels,
  imageAlt: "Resort room with a balcony overlooking South Indian hills at sunrise",
};

export const hotelsSearchDefaults = {
  /** Nights pre-filled between check-in and check-out. */
  nights: 1,
  rooms: 1,
  adults: 2,
  children: 0,
  roomTypeSlug: "any",
  maxRooms: 20,
  maxAdults: 40,
  maxChildren: 20,
  /** How many days ahead a stay can be searched. */
  bookingWindowDays: 180,
};

export const hotelsSupportBlock = {
  visible: true,
  heading: "Not sure which stay fits?",
  body: "Our stay desk holds rooms on request, matches group budgets and arranges temple-adjacent or wheelchair-friendly properties. Tell us the city and dates — we reply with three options the same day.",
  primaryCta: { label: "Talk to the stay desk", href: "/contact-us" },
  whatsappMessage:
    "Hi South Zoom Tourism, I need help choosing a hotel. Could you share a few options?",
};

export const hotelsTrustBlock = {
  visible: true,
  heading: "Verified partner properties only",
  subheading:
    "Every property on this page is inspected by our team before it goes live, and re-checked each season.",
};

export const hotelsProcessBlock = {
  visible: true,
  heading: "How hotel booking works",
  subheading: "Four steps from search to confirmed voucher.",
};

/* ------------------------------------------------------------------ */
/* Categories & room types                                              */
/* ------------------------------------------------------------------ */

export const hotelCategories: HotelCategory[] = [
  { id: "hc-budget", slug: "budget", label: "Budget", description: "Clean, no-frills rooms under ₹2,500 a night.", order: 1, visible: true },
  { id: "hc-standard", slug: "standard", label: "Standard", description: "Three-star comfort with breakfast included.", order: 2, visible: true },
  { id: "hc-premium", slug: "premium", label: "Premium", description: "Four-star city and hill properties.", order: 3, visible: true },
  { id: "hc-luxury", slug: "luxury", label: "Luxury", description: "Five-star suites, spas and fine dining.", order: 4, visible: true },
  { id: "hc-resorts", slug: "resorts", label: "Resorts", description: "Sprawling hill, beach and backwater resorts.", order: 5, visible: true },
  { id: "hc-homestays", slug: "homestays", label: "Homestays", description: "Family-run plantation and heritage homes.", order: 6, visible: true },
  { id: "hc-apartments", slug: "service-apartments", label: "Service apartments", description: "Kitchen-equipped stays for long visits.", order: 7, visible: true },
  { id: "hc-pilgrimage", slug: "pilgrimage", label: "Pilgrimage stays", description: "Walkable-to-temple rooms with veg kitchens.", order: 8, visible: true },
  { id: "hc-group", slug: "group", label: "Group accommodation", description: "Dorms and room blocks for 20–120 guests.", order: 9, visible: true },
];

export const roomTypeOptions: RoomTypeOption[] = [
  { slug: "any", label: "Any room type", order: 0, visible: true },
  { slug: "single", label: "Single", order: 1, visible: true },
  { slug: "double", label: "Double", order: 2, visible: true },
  { slug: "deluxe", label: "Deluxe", order: 3, visible: true },
  { slug: "suite", label: "Suite", order: 4, visible: true },
  { slug: "family", label: "Family room", order: 5, visible: true },
  { slug: "cottage", label: "Cottage / villa", order: 6, visible: true },
  { slug: "dormitory", label: "Dormitory", order: 7, visible: true },
];

/* ------------------------------------------------------------------ */
/* Hotels                                                               */
/* ------------------------------------------------------------------ */

export const hotelRecords: HotelRecord[] = [
  {
    id: "h-hillview",
    slug: "hillview-resort-ooty",
    name: "Hillview Resort",
    city: "Ooty",
    state: "Tamil Nadu",
    categorySlug: "resorts",
    starRating: 4,
    shortDescription:
      "Valley-facing resort on the Coonoor road with bonfire lawns, an indoor play area and heated rooms.",
    address: "Havelock Road, Ooty, The Nilgiris",
    amenities: ["Free breakfast", "Room heater", "Bonfire lawn", "Parking", "Wi-Fi"],
    image: roomOotyDeluxe,
    imageAlt: "Deluxe resort room with a valley view in Ooty",
    verifiedPartner: true,
    published: true,
    featured: true,
    order: 1,
  },
  {
    id: "h-marina",
    slug: "marina-grand-chennai",
    name: "Marina Grand",
    city: "Chennai",
    state: "Tamil Nadu",
    categorySlug: "premium",
    starRating: 4,
    shortDescription:
      "Business hotel ten minutes from the airport with 24-hour check-in and complimentary transfers.",
    address: "GST Road, Meenambakkam, Chennai",
    amenities: ["Airport pickup", "Gym", "Restaurant", "Wi-Fi", "24hr check-in"],
    image: roomChennaiExec,
    imageAlt: "Executive twin-bed hotel room in Chennai",
    verifiedPartner: true,
    published: true,
    featured: true,
    order: 2,
  },
  {
    id: "h-backwater",
    slug: "backwater-retreat-alleppey",
    name: "Backwater Retreat",
    city: "Alleppey",
    state: "Kerala",
    categorySlug: "resorts",
    starRating: 3,
    shortDescription:
      "Lake-facing cottages with a private jetty, sunset boat ride and Kerala breakfast spread.",
    address: "Punnamada Finishing Point, Alappuzha",
    amenities: ["Lake view", "Breakfast", "Boat ride", "Ayurveda spa"],
    image: roomAlleppeyCottage,
    imageAlt: "Lake facing cottage beside the Alleppey backwaters",
    verifiedPartner: true,
    published: true,
    featured: true,
    order: 3,
  },
  {
    id: "h-templestay",
    slug: "temple-stay-residency-madurai",
    name: "Temple Stay Residency",
    city: "Madurai",
    state: "Tamil Nadu",
    categorySlug: "pilgrimage",
    starRating: 3,
    shortDescription:
      "Four hundred metres from the Meenakshi temple east tower, with a pure-veg kitchen and early darshan wake-up calls.",
    address: "East Chitrai Street, Madurai",
    amenities: ["Near temple", "Veg restaurant", "Wi-Fi", "Locker"],
    image: roomMaduraiFamily,
    imageAlt: "Family room at a pilgrimage hotel near the Madurai temple",
    verifiedPartner: true,
    published: true,
    featured: true,
    order: 4,
  },
  {
    id: "h-coorgestate",
    slug: "coffee-estate-homestay-coorg",
    name: "Coffee Estate Homestay",
    city: "Coorg",
    state: "Karnataka",
    categorySlug: "homestays",
    starRating: 3,
    shortDescription:
      "Six-room planter's bungalow inside a working coffee estate, with guided plantation walks at dawn.",
    address: "Suntikoppa, Kodagu",
    amenities: ["Home-cooked meals", "Estate walk", "Bonfire", "Pet friendly"],
    image: roomCoorgPlanter,
    imageAlt: "Verandah of a coffee estate homestay in Coorg",
    verifiedPartner: true,
    published: true,
    featured: false,
    order: 5,
  },
  {
    id: "h-munnarmist",
    slug: "mist-valley-resort-munnar",
    name: "Mist Valley Resort",
    city: "Munnar",
    state: "Kerala",
    categorySlug: "premium",
    starRating: 4,
    shortDescription:
      "Tea-garden resort at 5,200 ft with glass-front rooms, an infinity deck and a naturalist on call.",
    address: "Chithirapuram, Munnar",
    amenities: ["Tea garden view", "Breakfast", "Spa", "Heater", "Parking"],
    image: roomMunnarDeluxe,
    imageAlt: "Glass-front resort room facing Munnar tea gardens",
    verifiedPartner: true,
    published: true,
    featured: false,
    order: 6,
  },
  {
    id: "h-bluelagoon",
    slug: "blue-lagoon-beach-resort-goa",
    name: "Blue Lagoon Beach Resort",
    city: "Goa",
    state: "Goa",
    categorySlug: "luxury",
    starRating: 5,
    shortDescription:
      "Beachfront five-star with two pools, a shack-style grill and airport limousine transfers.",
    address: "Candolim Beach Road, North Goa",
    amenities: ["Beachfront", "Two pools", "Spa", "Bar", "Airport transfer"],
    image: roomChennaiExec,
    imageAlt: "Luxury beachfront resort suite with sea view in Goa",
    verifiedPartner: true,
    published: true,
    featured: false,
    order: 7,
  },
  {
    id: "h-cityapart",
    slug: "city-square-service-apartments-bengaluru",
    name: "City Square Service Apartments",
    city: "Bengaluru",
    state: "Karnataka",
    categorySlug: "service-apartments",
    starRating: 3,
    shortDescription:
      "One and two-bedroom apartments near Indiranagar with kitchenettes, laundry and weekly housekeeping.",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    amenities: ["Kitchenette", "Laundry", "Wi-Fi", "Housekeeping", "Parking"],
    image: roomChennaiExec,
    imageAlt: "Living area of a service apartment in Bengaluru",
    verifiedPartner: true,
    published: true,
    featured: false,
    order: 8,
  },
  {
    id: "h-tirupatiyatri",
    slug: "yatri-nivas-tirupati",
    name: "Yatri Nivas",
    city: "Tirupati",
    state: "Andhra Pradesh",
    categorySlug: "budget",
    starRating: 2,
    shortDescription:
      "Budget rooms and dormitories a short drive from the Alipiri footpath, with luggage rooms and early breakfast.",
    address: "Alipiri Road, Tirupati",
    amenities: ["Luggage room", "Veg canteen", "Hot water", "Darshan help desk"],
    image: roomMaduraiFamily,
    imageAlt: "Simple budget twin room at a pilgrimage lodge in Tirupati",
    verifiedPartner: true,
    published: true,
    featured: false,
    order: 9,
  },
  {
    id: "h-groupcamp",
    slug: "yercaud-group-lodge",
    name: "Yercaud Group Lodge",
    city: "Yercaud",
    state: "Tamil Nadu",
    categorySlug: "group",
    starRating: 3,
    shortDescription:
      "Room blocks and dormitories for school trips, offsites and wedding parties, with a 120-seat dining hall.",
    address: "Lady's Seat Road, Yercaud, Salem",
    amenities: ["Dining hall", "Bonfire ground", "Bus parking", "Projector hall"],
    image: roomCoorgPlanter,
    imageAlt: "Group accommodation block with dining hall in Yercaud",
    verifiedPartner: true,
    published: true,
    featured: false,
    order: 10,
  },
  {
    id: "h-draft-kovalam",
    slug: "kovalam-cliff-suites",
    name: "Kovalam Cliff Suites",
    city: "Kovalam",
    state: "Kerala",
    categorySlug: "luxury",
    starRating: 4,
    shortDescription: "Contract under renewal — not bookable yet.",
    address: "Lighthouse Beach, Kovalam",
    amenities: ["Sea view"],
    image: roomOotyDeluxe,
    imageAlt: "Cliffside suite overlooking Kovalam beach",
    verifiedPartner: false,
    published: false,
    featured: false,
    order: 11,
  },
];

/* ------------------------------------------------------------------ */
/* Rooms + date-wise inventory rules                                    */
/* ------------------------------------------------------------------ */

const rule = (
  weekdayUnits: number,
  weekendUnits: number,
  blockedDayOffsets: number[] = [],
  peakDayOffsets: number[] = [],
  peakMultiplier = 1.25,
  bookingWindowDays = 180,
): RoomInventoryRule => ({
  weekdayUnits,
  weekendUnits,
  blockedDayOffsets,
  peakDayOffsets,
  peakMultiplier,
  bookingWindowDays,
});

export const roomRecords: RoomRecord[] = [
  {
    id: "r-hillview-deluxe", hotelId: "h-hillview", name: "Deluxe Valley Room", roomTypeSlug: "deluxe",
    maxAdults: 2, maxChildren: 2, basePricePerNight: 4200, bedType: "1 king bed", sizeSqft: 320,
    amenities: ["Valley view", "Heater", "Breakfast"], image: roomOotyDeluxe,
    imageAlt: "Deluxe valley-view room with a king bed at Hillview Resort, Ooty",
    published: true, featured: true, order: 1, inventory: rule(6, 3, [4], [12, 13]),
  },
  {
    id: "r-hillview-cottage", hotelId: "h-hillview", name: "Garden Cottage", roomTypeSlug: "cottage",
    maxAdults: 4, maxChildren: 2, basePricePerNight: 6400, bedType: "2 queen beds", sizeSqft: 540,
    amenities: ["Private lawn", "Fireplace", "Breakfast"], image: roomOotyDeluxe,
    imageAlt: "Two-bedroom garden cottage with a fireplace at Hillview Resort, Ooty",
    published: true, featured: false, order: 2, inventory: rule(3, 2, [], [12, 13]),
  },
  {
    id: "r-marina-exec", hotelId: "h-marina", name: "Executive Room", roomTypeSlug: "double",
    maxAdults: 2, maxChildren: 1, basePricePerNight: 3800, bedType: "1 queen bed", sizeSqft: 280,
    amenities: ["Airport pickup", "Work desk", "Breakfast"], image: roomChennaiExec,
    imageAlt: "Executive room with a work desk at Marina Grand, Chennai",
    published: true, featured: true, order: 1, inventory: rule(10, 8),
  },
  {
    id: "r-marina-suite", hotelId: "h-marina", name: "Business Suite", roomTypeSlug: "suite",
    maxAdults: 3, maxChildren: 2, basePricePerNight: 7200, bedType: "1 king bed + sofa", sizeSqft: 520,
    amenities: ["Lounge access", "Late checkout", "Breakfast"], image: roomChennaiExec,
    imageAlt: "Business suite living area at Marina Grand, Chennai",
    published: true, featured: false, order: 2, inventory: rule(2, 2, [2, 3]),
  },
  {
    id: "r-backwater-cottage", hotelId: "h-backwater", name: "Lake Facing Cottage", roomTypeSlug: "cottage",
    maxAdults: 2, maxChildren: 2, basePricePerNight: 3300, bedType: "1 king bed", sizeSqft: 360,
    amenities: ["Lake view", "Boat ride", "Breakfast"], image: roomAlleppeyCottage,
    imageAlt: "Lake facing cottage bedroom at Backwater Retreat, Alleppey",
    published: true, featured: true, order: 1, inventory: rule(5, 3, [], [20, 21, 22]),
  },
  {
    id: "r-backwater-family", hotelId: "h-backwater", name: "Family Suite", roomTypeSlug: "family",
    maxAdults: 4, maxChildren: 3, basePricePerNight: 5200, bedType: "2 queen beds", sizeSqft: 600,
    amenities: ["Lake view", "Living area", "Breakfast"], image: roomAlleppeyCottage,
    imageAlt: "Family suite with two queen beds at Backwater Retreat, Alleppey",
    published: true, featured: false, order: 2, inventory: rule(2, 1),
  },
  {
    id: "r-temple-family", hotelId: "h-templestay", name: "Family Room", roomTypeSlug: "family",
    maxAdults: 4, maxChildren: 2, basePricePerNight: 2600, bedType: "1 king + 1 single", sizeSqft: 300,
    amenities: ["Temple view", "Veg meals", "Hot water"], image: roomMaduraiFamily,
    imageAlt: "Family room with temple view at Temple Stay Residency, Madurai",
    published: true, featured: true, order: 1, inventory: rule(8, 5, [], [30, 31]),
  },
  {
    id: "r-temple-single", hotelId: "h-templestay", name: "Pilgrim Single", roomTypeSlug: "single",
    maxAdults: 1, maxChildren: 1, basePricePerNight: 1400, bedType: "1 single bed", sizeSqft: 140,
    amenities: ["Hot water", "Locker", "Veg canteen"], image: roomMaduraiFamily,
    imageAlt: "Single pilgrim room at Temple Stay Residency, Madurai",
    published: true, featured: false, order: 2, inventory: rule(12, 10),
  },
  {
    id: "r-coorg-planter", hotelId: "h-coorgestate", name: "Planter's Room", roomTypeSlug: "double",
    maxAdults: 2, maxChildren: 1, basePricePerNight: 3900, bedType: "1 queen bed", sizeSqft: 300,
    amenities: ["Estate view", "All meals", "Bonfire"], image: roomCoorgPlanter,
    imageAlt: "Planter's room with estate view at a Coorg coffee homestay",
    published: true, featured: true, order: 1, inventory: rule(4, 2, [6, 7]),
  },
  {
    id: "r-munnar-glass", hotelId: "h-munnarmist", name: "Tea Garden Deluxe", roomTypeSlug: "deluxe",
    maxAdults: 2, maxChildren: 2, basePricePerNight: 5600, bedType: "1 king bed", sizeSqft: 380,
    amenities: ["Tea garden view", "Heater", "Breakfast"], image: roomMunnarDeluxe,
    imageAlt: "Deluxe room facing the tea gardens at Mist Valley Resort, Munnar",
    published: true, featured: true, order: 1, inventory: rule(6, 4, [], [14, 15]),
  },
  {
    id: "r-goa-suite", hotelId: "h-bluelagoon", name: "Sea View Suite", roomTypeSlug: "suite",
    maxAdults: 3, maxChildren: 2, basePricePerNight: 12500, bedType: "1 king bed + daybed", sizeSqft: 720,
    amenities: ["Sea view", "Pool access", "Butler", "Breakfast"], image: roomChennaiExec,
    imageAlt: "Sea view suite with a daybed at Blue Lagoon Beach Resort, Goa",
    published: true, featured: false, order: 1, inventory: rule(4, 2, [], [25, 26, 27], 1.4),
  },
  {
    id: "r-goa-double", hotelId: "h-bluelagoon", name: "Garden Double", roomTypeSlug: "double",
    maxAdults: 2, maxChildren: 1, basePricePerNight: 8200, bedType: "1 queen bed", sizeSqft: 340,
    amenities: ["Garden view", "Pool access", "Breakfast"], image: roomChennaiExec,
    imageAlt: "Garden-view double room at Blue Lagoon Beach Resort, Goa",
    published: true, featured: false, order: 2, inventory: rule(8, 5),
  },
  {
    id: "r-blr-1bhk", hotelId: "h-cityapart", name: "1 BHK Apartment", roomTypeSlug: "double",
    maxAdults: 2, maxChildren: 2, basePricePerNight: 4400, bedType: "1 queen bed", sizeSqft: 620,
    amenities: ["Kitchenette", "Washing machine", "Wi-Fi"], image: roomChennaiExec,
    imageAlt: "One bedroom service apartment living room in Bengaluru",
    published: true, featured: false, order: 1, inventory: rule(6, 6),
  },
  {
    id: "r-blr-2bhk", hotelId: "h-cityapart", name: "2 BHK Apartment", roomTypeSlug: "family",
    maxAdults: 4, maxChildren: 3, basePricePerNight: 6800, bedType: "2 queen beds", sizeSqft: 980,
    amenities: ["Kitchen", "Laundry", "Balcony"], image: roomChennaiExec,
    imageAlt: "Two bedroom service apartment in Bengaluru with a balcony",
    published: true, featured: false, order: 2, inventory: rule(3, 3),
  },
  {
    id: "r-tirupati-twin", hotelId: "h-tirupatiyatri", name: "Standard Twin", roomTypeSlug: "double",
    maxAdults: 2, maxChildren: 2, basePricePerNight: 1650, bedType: "2 single beds", sizeSqft: 200,
    amenities: ["Hot water", "Luggage room", "Veg canteen"], image: roomMaduraiFamily,
    imageAlt: "Standard twin room at Yatri Nivas, Tirupati",
    published: true, featured: false, order: 1, inventory: rule(14, 10, [9]),
  },
  {
    id: "r-tirupati-dorm", hotelId: "h-tirupatiyatri", name: "8-Bed Dormitory", roomTypeSlug: "dormitory",
    maxAdults: 8, maxChildren: 4, basePricePerNight: 2400, bedType: "8 bunk beds", sizeSqft: 480,
    amenities: ["Lockers", "Shared bath", "Veg canteen"], image: roomMaduraiFamily,
    imageAlt: "Eight bed dormitory room at Yatri Nivas, Tirupati",
    published: true, featured: false, order: 2, inventory: rule(6, 6),
  },
  {
    id: "r-yercaud-block", hotelId: "h-groupcamp", name: "Group Room Block (4 sharing)", roomTypeSlug: "family",
    maxAdults: 4, maxChildren: 4, basePricePerNight: 3200, bedType: "4 single beds", sizeSqft: 420,
    amenities: ["Dining hall", "Bonfire", "Bus parking"], image: roomCoorgPlanter,
    imageAlt: "Four sharing group room block at Yercaud Group Lodge",
    published: true, featured: false, order: 1, inventory: rule(20, 16, [], [40, 41]),
  },
  {
    id: "r-yercaud-dorm", hotelId: "h-groupcamp", name: "20-Bed Dormitory", roomTypeSlug: "dormitory",
    maxAdults: 20, maxChildren: 10, basePricePerNight: 5600, bedType: "20 bunk beds", sizeSqft: 1200,
    amenities: ["Dining hall", "Projector hall", "Lockers"], image: roomCoorgPlanter,
    imageAlt: "Twenty bed dormitory at Yercaud Group Lodge",
    published: true, featured: false, order: 2, inventory: rule(4, 4),
  },
  {
    id: "r-kovalam-suite", hotelId: "h-draft-kovalam", name: "Cliff Suite", roomTypeSlug: "suite",
    maxAdults: 2, maxChildren: 1, basePricePerNight: 9800, bedType: "1 king bed", sizeSqft: 500,
    amenities: ["Sea view"], image: roomOotyDeluxe,
    imageAlt: "Cliff suite with sea view in Kovalam",
    published: false, featured: false, order: 1, inventory: rule(0, 0),
  },
];

/* ------------------------------------------------------------------ */
/* Popular destinations, trust, process, FAQs                           */
/* ------------------------------------------------------------------ */

export const hotelDestinations: HotelDestinationRecord[] = [
  { id: "hd-ooty", city: "Ooty", state: "Tamil Nadu", destinationSlug: "ooty", blurb: "Hill resorts and heated rooms", image: destOoty, imageAlt: "Lush green Nilgiri hill slopes of Ooty", order: 1, visible: true },
  { id: "hd-munnar", city: "Munnar", state: "Kerala", destinationSlug: "munnar", blurb: "Tea-garden view stays", image: destMunnar, imageAlt: "Sprawling tea garden plantations in Munnar", order: 2, visible: true },
  { id: "hd-coorg", city: "Coorg", state: "Karnataka", destinationSlug: "coorg", blurb: "Plantation homestays", image: destCoorg, imageAlt: "Coffee plantations and misty hills of Coorg", order: 3, visible: true },
  { id: "hd-chennai", city: "Chennai", state: "Tamil Nadu", destinationSlug: "", blurb: "Airport and business hotels", image: destChennai, imageAlt: "Coastal city skyline and beach of Chennai", order: 4, visible: true },
  { id: "hd-madurai", city: "Madurai", state: "Tamil Nadu", destinationSlug: "", blurb: "Walk-to-temple rooms", image: destMadurai, imageAlt: "Meenakshi Amman temple towers in Madurai", order: 5, visible: true },
  { id: "hd-goa", city: "Goa", state: "Goa", destinationSlug: "goa", blurb: "Beachfront resorts", image: destGoa, imageAlt: "Palm-fringed beach coast in North Goa", order: 6, visible: true },
];

export const hotelTrustPoints: HotelTrustPoint[] = [
  { id: "ht-1", title: "Inspected before listing", description: "Our team stays a night at every property before it goes live, and re-inspects each season.", order: 1, visible: true },
  { id: "ht-2", title: "Contracted partner rates", description: "Rates are negotiated annually, so what you see includes taxes and the standard breakfast plan.", order: 2, visible: true },
  { id: "ht-3", title: "Live room inventory", description: "Availability is checked night by night against the room block we hold, not a generic in-stock flag.", order: 3, visible: true },
  { id: "ht-4", title: "One number for everything", description: "Stay, cab and sightseeing sit on one voucher with a single coordinator through your trip.", order: 4, visible: true },
];

export const hotelProcessSteps: HotelProcessStep[] = [
  { id: "hp-1", title: "Search your dates", description: "Enter the city, nights, rooms and guests. We check each night against held inventory.", order: 1, visible: true },
  { id: "hp-2", title: "Compare shortlisted rooms", description: "See the room types that fit your party with all-in per-night rates.", order: 2, visible: true },
  { id: "hp-3", title: "Confirm with a part payment", description: "Hold the room with 25% advance; the balance is due at check-in.", order: 3, visible: true },
  { id: "hp-4", title: "Get your voucher", description: "A voucher with the property contact, check-in time and cancellation window reaches you within an hour.", order: 4, visible: true },
];

export const hotelFaqs: HotelFaq[] = [
  { id: "hf-1", question: "How is availability calculated?", answer: "Every room has a night-by-night inventory record. When you search, we check each night between check-in and check-out and only show rooms that have enough units free for all of them.", order: 1, visible: true },
  { id: "hf-2", question: "Are taxes and breakfast included in the rate?", answer: "The per-night rate shown includes GST and the property's standard breakfast plan wherever breakfast is listed in the amenities. Extra meals and activities are billed at the property.", order: 2, visible: true },
  { id: "hf-3", question: "Can I book rooms for a group of 40 or more?", answer: "Yes. Use the group accommodation category or simply enter the number of rooms you need — anything above eight rooms is routed to our group desk, who confirm a block within a day.", order: 3, visible: true },
  { id: "hf-4", question: "What is the cancellation policy?", answer: "Most partner properties allow free cancellation up to 72 hours before check-in. Peak-season and group blocks carry longer windows, which are printed on your voucher before you pay.", order: 4, visible: true },
  { id: "hf-5", question: "Do you arrange a cab along with the stay?", answer: "We do. Add a vehicle from the fleet page and both bookings ride on one itinerary with a single coordinator.", order: 5, visible: true },
  { id: "hf-6", question: "Can I request temple-adjacent or accessible rooms?", answer: "Mention it in the enquiry. We hold ground-floor, wheelchair-friendly and walk-to-temple rooms at most partner hotels, subject to availability on your dates.", order: 6, visible: true },
];

/* ------------------------------------------------------------------ */
/* Date helpers                                                         */
/* ------------------------------------------------------------------ */

export const toISODate = (d: Date) => {
  const copy = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return copy.toISOString().slice(0, 10);
};

export const todayISO = () => toISODate(new Date());

export const addDaysISO = (iso: string, days: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const diffDays = (fromISO: string, toISOStr: string) => {
  const a = Date.parse(`${fromISO}T00:00:00Z`);
  const b = Date.parse(`${toISOStr}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
};

export const isValidISODate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/** Nights between check-in and check-out (exclusive of check-out day). */
export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.max(0, diffDays(checkIn, checkOut));

const isWeekendNight = (iso: string) => {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return day === 5 || day === 6; // Friday & Saturday nights
};

/* ------------------------------------------------------------------ */
/* Inventory resolution (equivalent of a room_inventory row read)       */
/* ------------------------------------------------------------------ */

export type NightInventory = { date: string; units: number; price: number };

export function getNightInventory(room: RoomRecord, dateISO: string): NightInventory {
  const offset = diffDays(todayISO(), dateISO);
  const { inventory } = room;

  if (!room.published || offset < 0 || offset > inventory.bookingWindowDays) {
    return { date: dateISO, units: 0, price: room.basePricePerNight };
  }
  if (inventory.blockedDayOffsets.includes(offset)) {
    return { date: dateISO, units: 0, price: room.basePricePerNight };
  }

  const units = isWeekendNight(dateISO) ? inventory.weekendUnits : inventory.weekdayUnits;
  const peak = inventory.peakDayOffsets.includes(offset);
  const price = Math.round(room.basePricePerNight * (peak ? inventory.peakMultiplier : 1));
  return { date: dateISO, units, price };
}

export function getStayInventory(
  room: RoomRecord,
  checkIn: string,
  checkOut: string,
): NightInventory[] {
  const nights = nightsBetween(checkIn, checkOut);
  return Array.from({ length: nights }, (_, i) => getNightInventory(room, addDaysISO(checkIn, i)));
}

export type RoomAvailability = {
  room: RoomRecord;
  /** Lowest number of units free across every night of the stay. */
  unitsAvailable: number;
  available: boolean;
  nights: number;
  /** Average per-night rate across the stay, including peak nights. */
  avgNightlyRate: number;
  /** Total for the requested number of rooms across the whole stay. */
  stayTotal: number;
};

export function getRoomAvailability(
  room: RoomRecord,
  params: { checkIn: string; checkOut: string; rooms: number },
): RoomAvailability {
  const nights = nightsBetween(params.checkIn, params.checkOut);
  const stay = getStayInventory(room, params.checkIn, params.checkOut);
  const unitsAvailable = stay.length ? Math.min(...stay.map((n) => n.units)) : 0;
  const total = stay.reduce((sum, n) => sum + n.price, 0);
  const avg = stay.length ? Math.round(total / stay.length) : room.basePricePerNight;

  return {
    room,
    unitsAvailable,
    available: nights > 0 && unitsAvailable >= params.rooms,
    nights,
    avgNightlyRate: avg,
    stayTotal: total * Math.max(1, params.rooms),
  };
}

let dynamicHotelRecords: HotelRecord[] | null = null;
let dynamicRoomRecords: RoomRecord[] | null = null;

export function setDynamicHotelsAndRooms(hotels: HotelRecord[], rooms: RoomRecord[]) {
  dynamicHotelRecords = hotels;
  dynamicRoomRecords = rooms;
}

export function mapDbHotelToHotelRecord(h: any, index: number = 0): HotelRecord {
  const slug = (h.name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    id: h.id,
    slug: slug,
    name: h.name,
    city: h.city,
    state: h.destinations?.state || "South India",
    categorySlug: "standard",
    starRating: h.star_rating || 3,
    shortDescription: h.description || `${h.name} in ${h.city}`,
    address: `${h.name}, ${h.city}`,
    amenities: ["Wi-Fi", "Free breakfast", "Parking"],
    image: h.main_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    imageAlt: `${h.name} in ${h.city}`,
    verifiedPartner: true,
    published: h.active !== false,
    featured: h.featured || false,
    order: index + 1,
  };
}

export function mapDbRoomToRoomRecord(r: any, index: number = 0): RoomRecord {
  return {
    id: r.id,
    hotelId: r.hotel_id,
    name: r.room_type,
    roomTypeSlug: (r.room_type || "deluxe").toLowerCase().includes("deluxe") ? "deluxe" : "double",
    maxAdults: r.capacity_adults || 2,
    maxChildren: r.capacity_children || 1,
    basePricePerNight: Number(r.price_per_night) || 2500,
    bedType: "1 Queen Bed",
    sizeSqft: 280,
    amenities: Array.isArray(r.amenities) ? r.amenities : ["Wi-Fi", "AC", "Hot Water"],
    image: r.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    imageAlt: r.room_type,
    published: r.active !== false,
    featured: index === 0,
    order: index + 1,
    inventory: rule(8, 6),
  };
}

/* ------------------------------------------------------------------ */
/* Public reads                                                         */
/* ------------------------------------------------------------------ */

export const getPublishedHotels = () => {
  if (dynamicHotelRecords && dynamicHotelRecords.length > 0) {
    return dynamicHotelRecords.filter((h) => h.published).sort((a, b) => a.order - b.order);
  }
  return hotelRecords.filter((h) => h.published).sort((a, b) => a.order - b.order);
};

export const getHotelRooms = (hotelId: string) => {
  if (dynamicRoomRecords && dynamicRoomRecords.length > 0) {
    const list = dynamicRoomRecords.filter((r) => r.published && r.hotelId === hotelId);
    if (list.length > 0) return list.sort((a, b) => a.order - b.order);
  }
  return roomRecords
    .filter((r) => r.published && r.hotelId === hotelId)
    .sort((a, b) => a.order - b.order);
};

export const getVisibleCategories = () =>
  hotelCategories.filter((c) => c.visible).sort((a, b) => a.order - b.order);

export const getRoomTypeOptions = () =>
  roomTypeOptions.filter((r) => r.visible).sort((a, b) => a.order - b.order);

export const getVisibleHotelDestinations = () =>
  hotelDestinations.filter((d) => d.visible).sort((a, b) => a.order - b.order);

export const getVisibleFaqs = () =>
  hotelFaqs.filter((f) => f.visible).sort((a, b) => a.order - b.order);

export const getVisibleProcessSteps = () =>
  hotelProcessSteps.filter((s) => s.visible).sort((a, b) => a.order - b.order);

export const getVisibleTrustPoints = () =>
  hotelTrustPoints.filter((t) => t.visible).sort((a, b) => a.order - b.order);

export const getHotelBySlug = (slug: string) =>
  getPublishedHotels().find((h) => h.slug === slug);

export const getCategoryLabel = (slug: string) =>
  hotelCategories.find((c) => c.slug === slug)?.label ?? slug;

export const getRoomTypeLabel = (slug: string) =>
  roomTypeOptions.find((r) => r.slug === slug)?.label ?? slug;

/** Lowest published nightly rate for a hotel; null when it has no live rooms. */
export function getHotelPriceFrom(hotelId: string): number | null {
  const rooms = getHotelRooms(hotelId);
  if (rooms.length === 0) return null;
  return Math.min(...rooms.map((r) => r.basePricePerNight));
}

export const getFeaturedHotels = () => getPublishedHotels().filter((h) => h.featured);

export type FeaturedRoom = { room: RoomRecord; hotel: HotelRecord };

export function getFeaturedRooms(limit = 6): FeaturedRoom[] {
  const published = getPublishedHotels();
  return roomRecords
    .filter((r) => r.published && r.featured)
    .map((room) => ({ room, hotel: published.find((h) => h.id === room.hotelId) }))
    .filter((entry): entry is FeaturedRoom => Boolean(entry.hotel))
    .sort((a, b) => a.hotel.order - b.hotel.order || a.room.order - b.room.order)
    .slice(0, limit);
}

export const countHotelsInCategory = (slug: string) =>
  getPublishedHotels().filter((h) => h.categorySlug === slug).length;

export const countHotelsInCity = (city: string) =>
  getPublishedHotels().filter((h) => h.city.toLowerCase() === city.toLowerCase()).length;

/* ------------------------------------------------------------------ */
/* Search                                                               */
/* ------------------------------------------------------------------ */

export type HotelSearchParams = {
  destination: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  roomTypeSlug: string;
  category: string;
};

export type HotelSearchResult = {
  hotel: HotelRecord;
  matchingRooms: RoomAvailability[];
  /** Cheapest bookable room for the stay. */
  bestRate: RoomAvailability | null;
  priceFrom: number | null;
};

export function searchHotels(params: HotelSearchParams): HotelSearchResult[] {
  const destination = params.destination.trim().toLowerCase();
  const name = params.hotelName.trim().toLowerCase();
  const guestsPerRoomAdults = Math.ceil(params.adults / Math.max(1, params.rooms));
  const guestsPerRoomChildren = Math.ceil(params.children / Math.max(1, params.rooms));

  return getPublishedHotels()
    .filter((hotel) => {
      if (destination && ![hotel.city, hotel.state].some((v) => v.toLowerCase().includes(destination))) {
        return false;
      }
      if (name && !hotel.name.toLowerCase().includes(name)) return false;
      if (params.category && params.category !== "all" && hotel.categorySlug !== params.category) {
        return false;
      }
      return true;
    })
    .map((hotel) => {
      const rooms = getHotelRooms(hotel.id)
        .filter((room) =>
          params.roomTypeSlug === "any" || !params.roomTypeSlug
            ? true
            : room.roomTypeSlug === params.roomTypeSlug,
        )
        .filter(
          (room) =>
            room.maxAdults >= guestsPerRoomAdults &&
            room.maxChildren >= guestsPerRoomChildren,
        )
        .map((room) =>
          getRoomAvailability(room, {
            checkIn: params.checkIn,
            checkOut: params.checkOut,
            rooms: params.rooms,
          }),
        )
        .filter((entry) => entry.available)
        .sort((a, b) => a.avgNightlyRate - b.avgNightlyRate);

      return {
        hotel,
        matchingRooms: rooms,
        bestRate: rooms[0] ?? null,
        priceFrom: getHotelPriceFrom(hotel.id),
      };
    })
    .filter((result) => result.matchingRooms.length > 0);
}

/** Suggestion list for the destination datalist. */
export const getDestinationSuggestions = () =>
  Array.from(new Set(getPublishedHotels().map((h) => h.city))).sort();
