/**
 * Admin-managed hotel profile content for the hotel detail page.
 *
 * Mirrors the future `hotel_profiles`, `hotel_media`, `hotel_amenities`,
 * `hotel_policies`, `hotel_nearby_places`, `hotel_faqs` and
 * `room_detail_attributes` tables. Joined to the base catalogue
 * (`@/content/hotels`) and the listing attributes (`@/content/hotel-listing`)
 * by `hotel_id` / `room_id` so no existing page changes behaviour.
 *
 *   hotel_profiles: hotel_id, overview[], check_in_time, check_out_time,
 *     latitude, longitude, maps_query, traveller_types[], tax_percent,
 *     tax_note, child_policy, cancellation_summary, published
 *   hotel_media: id, hotel_id, category_slug, image, image_alt, caption,
 *     display_order, visible
 *   hotel_amenities: hotel_id, amenity_slug (join table)
 *   hotel_policies: id, hotel_id, title, body, display_order, visible
 *   hotel_nearby_places: id, hotel_id, name, kind, distance_km, note
 *   room_detail_attributes: room_id, extra_bed_charge, cancellation_terms,
 *     highlights[]
 *
 * Nothing here decides availability — rooms, rate plans and date-wise
 * inventory continue to come from `@/content/hotels` + `@/content/hotel-listing`.
 */

import heroHotels from "@/assets/hero-hotels.jpg";
import heroTours from "@/assets/hero-tours.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import serviceCorporate from "@/assets/service-corporate.jpg";
import servicePilgrimage from "@/assets/service-pilgrimage.jpg";
import serviceWedding from "@/assets/service-wedding.jpg";
import office1 from "@/assets/office-1.jpg";
import {
  getHotelRooms,
  getPublishedHotels,
  getRoomAvailability,
  type HotelRecord,
  type RoomRecord,
} from "@/content/hotels";
import {
  getAvailabilityStatus,
  getMealPlanLabel,
  getRoomRatePlans,
  type AvailabilityStatus,
  type RatePlan,
} from "@/content/hotel-listing";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type GalleryCategory = {
  slug: string;
  label: string;
  order: number;
  visible: boolean;
};

export type HotelMediaItem = {
  id: string;
  hotelId: string;
  categorySlug: string;
  image: string;
  imageAlt: string;
  caption: string;
  order: number;
  visible: boolean;
};

/** Master amenity list rendered as the detail-page amenity grid. */
export type DetailAmenity = {
  slug: string;
  label: string;
  /** lucide-react icon name resolved by the amenity grid component. */
  icon: string;
  order: number;
  visible: boolean;
};

export type HotelDistance = {
  id: string;
  label: string;
  km: number;
  driveMinutes: number;
};

export type HotelPolicy = {
  id: string;
  title: string;
  body: string;
  order: number;
  visible: boolean;
};

export type NearbyPlace = {
  id: string;
  name: string;
  kind: string;
  distanceKm: number;
  note: string;
};

export type HotelProfileFaq = {
  id: string;
  question: string;
  answer: string;
  order: number;
  visible: boolean;
};

export type HotelProfile = {
  hotelId: string;
  overview: string[];
  checkInTime: string;
  checkOutTime: string;
  latitude: number;
  longitude: number;
  /** Free-text search used for the Google Maps action when coords are absent. */
  mapsQuery: string;
  travellerTypes: string[];
  distances: HotelDistance[];
  policies: HotelPolicy[];
  nearbyPlaces: NearbyPlace[];
  faqs: HotelProfileFaq[];
  taxPercent: number;
  taxNote: string;
  childPolicy: string;
  cancellationSummary: string;
  published: boolean;
};

export type RoomDetailAttributes = {
  roomId: string;
  extraBedCharge: number;
  extraBedNote: string;
  cancellationTerms: string;
  highlights: string[];
};

/* ------------------------------------------------------------------ */
/* Page blocks (admin editable)                                         */
/* ------------------------------------------------------------------ */

export const hotelDetailBlock = {
  visible: true,
  roomsHeading: "Choose your room",
  roomsSubheading:
    "Prices are for your selected dates and include date-wise inventory pricing. Taxes are shown before you select.",
  emptyRoomsTitle: "No rooms match these dates",
  emptyRoomsBody:
    "Every room at this property is either blocked or too small for this occupancy on the nights you picked. Change the dates or guest count, or ask our stay desk to hold an alternative.",
  relatedHeading: "Similar stays nearby",
  supportHeading: "Need this property held for a group?",
  supportBody:
    "We hold room blocks on request for weddings, offsites and pilgrimage groups. Share your dates and headcount and we confirm within the day.",
  whatsappMessage: "Hi South Zoom Tourism, I would like to check availability at",
};

/* ------------------------------------------------------------------ */
/* Gallery categories & media                                           */
/* ------------------------------------------------------------------ */

export const galleryCategories: GalleryCategory[] = [
  { slug: "exterior", label: "Exterior", order: 1, visible: true },
  { slug: "lobby", label: "Lobby", order: 2, visible: true },
  { slug: "rooms", label: "Rooms", order: 3, visible: true },
  { slug: "bathroom", label: "Bathroom", order: 4, visible: true },
  { slug: "restaurant", label: "Restaurant", order: 5, visible: true },
  { slug: "parking", label: "Parking", order: 6, visible: true },
  { slug: "amenities", label: "Amenities", order: 7, visible: true },
  { slug: "nearby", label: "Nearby attractions", order: 8, visible: true },
];

type MediaSeed = [categorySlug: string, image: string, caption: string];

/**
 * Expands compact admin rows into `hotel_media` records. Alt text is generated
 * from the property name so every image stays descriptive.
 */
function media(hotelId: string, hotelName: string, city: string, seeds: MediaSeed[]): HotelMediaItem[] {
  return seeds.map((seed, index) => {
    const [categorySlug, image, caption] = seed;
    const categoryLabel =
      galleryCategories.find((c) => c.slug === categorySlug)?.label.toLowerCase() ?? categorySlug;
    return {
      id: `${hotelId}-media-${index + 1}`,
      hotelId,
      categorySlug,
      image,
      imageAlt: `${caption} — ${categoryLabel} at ${hotelName}, ${city}`,
      caption,
      order: index + 1,
      visible: true,
    };
  });
}

export const hotelMedia: HotelMediaItem[] = [
  ...media("h-hillview", "Hillview Resort", "Ooty", [
    ["exterior", heroHotels, "Valley-facing block at sunrise"],
    ["rooms", heroHotels, "Deluxe valley room with king bed"],
    ["rooms", heroTours, "Garden cottage bedroom"],
    ["lobby", office1, "Reception with fireplace seating"],
    ["bathroom", heroHotels, "Bathroom with 24-hour hot water"],
    ["restaurant", serviceCorporate, "Multi-cuisine dining hall"],
    ["parking", heroFleet, "Covered guest parking"],
    ["amenities", heroTours, "Bonfire lawn and play area"],
    ["nearby", heroTours, "Ooty Lake, 2.4 km away"],
  ]),
  ...media("h-marina", "Marina Grand", "Chennai", [
    ["exterior", serviceCorporate, "Hotel façade on GST Road"],
    ["rooms", serviceCorporate, "Executive room with work desk"],
    ["rooms", heroHotels, "Suite living area"],
    ["lobby", office1, "24-hour reception desk"],
    ["bathroom", heroHotels, "Rain shower bathroom"],
    ["restaurant", serviceCorporate, "All-day coffee shop"],
    ["parking", heroFleet, "Basement parking with valet"],
    ["amenities", heroFleet, "Airport transfer vehicles"],
    ["nearby", heroFleet, "Chennai airport, 3.1 km away"],
  ]),
  ...media("h-backwater", "Backwater Retreat", "Alleppey", [
    ["exterior", heroTours, "Lake-facing cottage row"],
    ["rooms", heroTours, "Cottage bedroom with lake view"],
    ["lobby", office1, "Open reception pavilion"],
    ["bathroom", heroHotels, "Cottage bathroom"],
    ["restaurant", serviceWedding, "Kerala breakfast spread"],
    ["parking", heroFleet, "Shaded car park by the jetty"],
    ["amenities", serviceWedding, "Ayurveda treatment room"],
    ["nearby", heroTours, "Punnamada finishing point jetty"],
  ]),
  ...media("h-templestay", "Temple Stay Residency", "Madurai", [
    ["exterior", servicePilgrimage, "Entrance on East Chitrai Street"],
    ["rooms", servicePilgrimage, "Family room with four beds"],
    ["lobby", office1, "Reception with darshan help desk"],
    ["bathroom", heroHotels, "Bathroom with hot water"],
    ["restaurant", serviceCorporate, "Pure-veg dining hall"],
    ["parking", heroFleet, "Street-side guest parking"],
    ["amenities", office1, "Luggage and locker room"],
    ["nearby", servicePilgrimage, "Meenakshi temple east tower"],
  ]),
  ...media("h-coorgestate", "Coffee Estate Homestay", "Coorg", [
    ["exterior", heroTours, "Planter's bungalow verandah"],
    ["rooms", heroTours, "Planter's room with estate view"],
    ["lobby", office1, "Living room with board games"],
    ["bathroom", heroHotels, "Bathroom with solar hot water"],
    ["restaurant", serviceWedding, "Family dining table"],
    ["parking", heroFleet, "Open parking under the canopy"],
    ["amenities", heroTours, "Bonfire pit and estate walk trail"],
    ["nearby", heroTours, "Coffee plantation trail"],
  ]),
  ...media("h-munnarmist", "Mist Valley Resort", "Munnar", [
    ["exterior", heroTours, "Resort block above the tea gardens"],
    ["rooms", heroTours, "Glass-front room facing the valley"],
    ["lobby", office1, "Lobby lounge with tea counter"],
    ["bathroom", heroHotels, "Bathroom with heater and bathtub"],
    ["restaurant", serviceCorporate, "Restaurant with valley seating"],
    ["parking", heroFleet, "Terraced parking bay"],
    ["amenities", serviceWedding, "Spa treatment room"],
    ["nearby", heroTours, "Tea estate viewpoint"],
  ]),
  ...media("h-bluelagoon", "Blue Lagoon Beach Resort", "Goa", [
    ["exterior", serviceWedding, "Beachfront resort frontage"],
    ["rooms", serviceWedding, "Sea-view suite"],
    ["rooms", heroHotels, "Deluxe double room"],
    ["lobby", office1, "Open-air lobby"],
    ["bathroom", heroHotels, "Suite bathroom with twin basins"],
    ["restaurant", serviceWedding, "Beach grill and bar"],
    ["parking", heroFleet, "Gated resort parking"],
    ["amenities", serviceWedding, "Main swimming pool"],
    ["nearby", serviceWedding, "Candolim beach, 300 m away"],
  ]),
  ...media("h-cityapart", "City Square Service Apartments", "Bengaluru", [
    ["exterior", serviceCorporate, "Apartment block on 100 Feet Road"],
    ["rooms", serviceCorporate, "One-bedroom apartment living area"],
    ["lobby", office1, "Reception and mail desk"],
    ["bathroom", heroHotels, "Apartment bathroom"],
    ["restaurant", serviceCorporate, "In-house kitchenette"],
    ["parking", heroFleet, "Stack parking for residents"],
    ["amenities", office1, "Laundry room"],
    ["nearby", serviceCorporate, "Indiranagar metro station"],
  ]),
  ...media("h-tirupatiyatri", "Yatri Nivas", "Tirupati", [
    ["exterior", servicePilgrimage, "Lodge entrance on Alipiri Road"],
    ["rooms", servicePilgrimage, "Twin-bed budget room"],
    ["lobby", office1, "Reception with darshan help desk"],
    ["bathroom", heroHotels, "Bathroom with hot water"],
    ["restaurant", serviceCorporate, "Veg canteen"],
    ["parking", heroFleet, "Open parking yard"],
    ["amenities", office1, "Luggage room"],
    ["nearby", servicePilgrimage, "Alipiri footpath entrance"],
  ]),
  ...media("h-groupcamp", "Yercaud Group Lodge", "Yercaud", [
    ["exterior", heroFleet, "Room blocks around the lawn"],
    ["rooms", heroFleet, "Six-bed room block"],
    ["lobby", office1, "Group check-in counter"],
    ["bathroom", heroHotels, "Shared bathroom block"],
    ["restaurant", serviceCorporate, "120-seat dining hall"],
    ["parking", heroFleet, "Bus and coach parking"],
    ["amenities", office1, "Projector and conference hall"],
    ["nearby", heroTours, "Yercaud lake, 2.9 km away"],
  ]),
];

/* ------------------------------------------------------------------ */
/* Amenity grid                                                         */
/* ------------------------------------------------------------------ */

export const detailAmenities: DetailAmenity[] = [
  { slug: "wifi", label: "Free Wi-Fi", icon: "Wifi", order: 1, visible: true },
  { slug: "parking", label: "Parking", icon: "CircleParking", order: 2, visible: true },
  { slug: "restaurant", label: "Restaurant", icon: "UtensilsCrossed", order: 3, visible: true },
  { slug: "room-service", label: "Room service", icon: "ConciergeBell", order: 4, visible: true },
  { slug: "ac", label: "Air conditioning", icon: "AirVent", order: 5, visible: true },
  { slug: "hot-water", label: "Hot water", icon: "ShowerHead", order: 6, visible: true },
  { slug: "tv", label: "Television", icon: "Tv", order: 7, visible: true },
  { slug: "power-backup", label: "Power backup", icon: "BatteryCharging", order: 8, visible: true },
  { slug: "lift", label: "Lift", icon: "MoveVertical", order: 9, visible: true },
  { slug: "pool", label: "Swimming pool", icon: "Waves", order: 10, visible: true },
  { slug: "gym", label: "Gym", icon: "Dumbbell", order: 11, visible: true },
  { slug: "conference-hall", label: "Conference hall", icon: "Presentation", order: 12, visible: true },
  { slug: "travel-desk", label: "Travel desk", icon: "MapPinned", order: 13, visible: true },
  { slug: "laundry", label: "Laundry", icon: "WashingMachine", order: 14, visible: true },
  { slug: "airport-pickup", label: "Airport pickup", icon: "PlaneLanding", order: 15, visible: true },
];

/** hotel_id -> amenity slugs actually available at the property. */
export const hotelDetailAmenityLinks: Record<string, string[]> = {
  "h-hillview": ["wifi", "parking", "restaurant", "room-service", "hot-water", "tv", "power-backup", "travel-desk", "laundry"],
  "h-marina": ["wifi", "parking", "restaurant", "room-service", "ac", "hot-water", "tv", "power-backup", "lift", "gym", "conference-hall", "travel-desk", "laundry", "airport-pickup"],
  "h-backwater": ["wifi", "parking", "restaurant", "room-service", "ac", "hot-water", "tv", "power-backup", "travel-desk", "laundry"],
  "h-templestay": ["wifi", "parking", "restaurant", "ac", "hot-water", "tv", "power-backup", "lift", "travel-desk"],
  "h-coorgestate": ["wifi", "parking", "restaurant", "hot-water", "power-backup", "travel-desk"],
  "h-munnarmist": ["wifi", "parking", "restaurant", "room-service", "hot-water", "tv", "power-backup", "travel-desk", "laundry"],
  "h-bluelagoon": ["wifi", "parking", "restaurant", "room-service", "ac", "hot-water", "tv", "power-backup", "lift", "pool", "gym", "conference-hall", "travel-desk", "laundry", "airport-pickup"],
  "h-cityapart": ["wifi", "parking", "ac", "hot-water", "tv", "power-backup", "lift", "laundry"],
  "h-tirupatiyatri": ["parking", "restaurant", "ac", "hot-water", "tv", "power-backup", "lift", "travel-desk"],
  "h-groupcamp": ["parking", "restaurant", "hot-water", "power-backup", "conference-hall", "travel-desk"],
};

/* ------------------------------------------------------------------ */
/* Profiles                                                             */
/* ------------------------------------------------------------------ */

type PolicySeed = [title: string, body: string];

const policies = (hotelId: string, seeds: PolicySeed[]): HotelPolicy[] =>
  seeds.map(([title, body], index) => ({
    id: `${hotelId}-policy-${index + 1}`,
    title,
    body,
    order: index + 1,
    visible: true,
  }));

/** Policies every contracted property carries unless the admin overrides them. */
const standardPolicies = (hotelId: string): HotelPolicy[] =>
  policies(hotelId, [
    ["Identification", "A government photo ID is required for every adult guest at check-in. Local IDs are accepted."],
    ["Payment", "Pay the advance online to confirm; the balance is settled at the property unless your rate plan says otherwise."],
    ["Damage & conduct", "Guests are liable for damage to property. Smoking is only allowed in marked outdoor areas."],
  ]);

type ProfileSeed = Omit<HotelProfile, "published" | "policies" | "faqs"> & {
  policies?: HotelPolicy[];
  faqs?: HotelProfileFaq[];
  published?: boolean;
};

const faq = (hotelId: string, seeds: [string, string][]): HotelProfileFaq[] =>
  seeds.map(([question, answer], index) => ({
    id: `${hotelId}-faq-${index + 1}`,
    question,
    answer,
    order: index + 1,
    visible: true,
  }));

const distance = (id: string, label: string, km: number, driveMinutes: number): HotelDistance => ({
  id,
  label,
  km,
  driveMinutes,
});

const nearby = (
  hotelId: string,
  seeds: [name: string, kind: string, km: number, note: string][],
): NearbyPlace[] =>
  seeds.map(([name, kind, distanceKm, note], index) => ({
    id: `${hotelId}-near-${index + 1}`,
    name,
    kind,
    distanceKm,
    note,
  }));

const seeds: ProfileSeed[] = [
  {
    hotelId: "h-hillview",
    overview: [
      "Hillview Resort sits on the Coonoor road just outside Ooty town, with every block angled towards the valley so the rooms stay quiet even when the resort is full. The property runs on a single-level layout with ramps between blocks, which suits older travellers and families with prams.",
      "Rates include breakfast, the bonfire lawn is lit nightly in season, and the front desk arranges Nilgiri sightseeing with our own vehicles. Heaters are fitted in every room from October to February.",
    ],
    checkInTime: "1:00 PM",
    checkOutTime: "11:00 AM",
    latitude: 11.4102,
    longitude: 76.695,
    mapsQuery: "Havelock Road, Ooty, The Nilgiris, Tamil Nadu",
    travellerTypes: ["Families", "Couples", "Senior travellers", "Small groups"],
    distances: [
      distance("hillview-lake", "Ooty Lake", 2.4, 8),
      distance("hillview-botanical", "Botanical Garden", 4.1, 14),
      distance("hillview-bus", "Ooty bus stand", 3, 10),
      distance("hillview-rail", "Ooty railway station", 3.2, 11),
      distance("hillview-airport", "Coimbatore airport", 88, 165),
    ],
    nearbyPlaces: nearby("h-hillview", [
      ["Ooty Lake", "Attraction", 2.4, "Boating from 9 AM; busiest after 11 AM."],
      ["Doddabetta Peak", "Viewpoint", 9.5, "Go before 9 AM to beat the mist."],
      ["Rose Garden", "Garden", 4.6, "Best in bloom from May to July."],
      ["Tea Factory & Museum", "Experience", 6.8, "Free tasting at the end of the tour."],
    ]),
    faqs: faq("h-hillview", [
      ["Are heaters provided in the rooms?", "Yes — every room has a fitted heater at no extra cost, and extra blankets are available at the front desk."],
      ["Is the bonfire included?", "The common bonfire lawn is complimentary in season. A private bonfire with seating is charged separately at the property."],
      ["Can we park a tempo traveller?", "Yes, the resort has open parking that fits two tempo travellers alongside guest cars."],
    ]),
    taxPercent: 12,
    taxNote: "GST at 12% applies to tariffs under ₹7,500 per night and 18% above that; the exact tax is shown on your confirmation.",
    childPolicy: "Children under 5 stay free using existing bedding. Ages 5–11 are charged as a child with breakfast.",
    cancellationSummary: "Free cancellation up to 72 hours before check-in on refundable rate plans.",
  },
  {
    hotelId: "h-marina",
    overview: [
      "Marina Grand is a business hotel on GST Road, ten minutes from Chennai airport, built for late arrivals and early departures. Reception is staffed around the clock and the airport shuttle runs on request rather than a fixed timetable.",
      "Rooms are soundproofed towards the highway side, and the executive floor has a work desk, fast Wi-Fi and a 24-hour coffee shop downstairs.",
    ],
    checkInTime: "12:00 PM",
    checkOutTime: "12:00 PM",
    latitude: 12.9822,
    longitude: 80.1636,
    mapsQuery: "GST Road, Meenambakkam, Chennai, Tamil Nadu",
    travellerTypes: ["Business travellers", "Transit guests", "Couples", "Corporate groups"],
    distances: [
      distance("marina-airport", "Chennai international airport", 3.1, 12),
      distance("marina-rail", "Tambaram railway station", 8.4, 22),
      distance("marina-central", "Chennai Central", 17.5, 45),
      distance("marina-beach", "Marina Beach", 16.2, 40),
    ],
    nearbyPlaces: nearby("h-marina", [
      ["Chennai airport", "Transport", 3.1, "Complimentary transfer on request."],
      ["Guindy National Park", "Attraction", 6.9, "Closed on Tuesdays."],
      ["Phoenix Marketcity", "Shopping", 7.4, "Open till 10 PM."],
      ["St. Thomas Mount", "Heritage", 4.2, "Short climb to the summit church."],
    ]),
    faqs: faq("h-marina", [
      ["Is the airport transfer free?", "Yes, on request for arrivals and departures between 5 AM and 11 PM. Late-night pickups carry a small charge."],
      ["Can I check in at 4 AM?", "Yes. Reception is staffed 24 hours; an early check-in before 8 AM is charged at half a night when the room is held overnight."],
      ["Is there a conference room?", "A 40-seat conference hall with projector is available and can be added to your booking."],
    ]),
    taxPercent: 12,
    taxNote: "GST at 12% is added to tariffs under ₹7,500 per night. Corporate GST invoices are issued at checkout.",
    childPolicy: "One child under 6 stays free with existing bedding. Extra beds are charged per night.",
    cancellationSummary: "Free cancellation up to 24 hours before check-in on refundable rate plans.",
  },
  {
    hotelId: "h-backwater",
    overview: [
      "Backwater Retreat is a row of lake-facing cottages at Punnamada, a few minutes from the finishing point jetty where the snake-boat race ends. Each cottage opens to the water, and the sunset boat ride leaves from the property's own jetty.",
      "Meals lean Kerala-traditional — appam and stew at breakfast, karimeen at dinner — and the Ayurveda room takes appointments a day ahead.",
    ],
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    latitude: 9.5312,
    longitude: 76.3502,
    mapsQuery: "Punnamada Finishing Point, Alappuzha, Kerala",
    travellerTypes: ["Couples", "Families", "Honeymooners", "Slow travellers"],
    distances: [
      distance("bw-jetty", "Finishing Point jetty", 1.2, 5),
      distance("bw-rail", "Alappuzha railway station", 5.6, 16),
      distance("bw-beach", "Alappuzha beach", 6.1, 18),
      distance("bw-airport", "Cochin airport", 78, 135),
    ],
    nearbyPlaces: nearby("h-backwater", [
      ["Punnamada Lake", "Attraction", 0.3, "Sunset cruise leaves at 4:30 PM."],
      ["Alappuzha Beach & pier", "Beach", 6.1, "Evening market along the promenade."],
      ["Marari Beach", "Beach", 14.8, "Quieter than Alappuzha beach."],
      ["Pathiramanal Island", "Nature", 12.5, "Bird watching, reachable only by boat."],
    ]),
    faqs: faq("h-backwater", [
      ["Is the sunset boat ride included?", "One shared sunset ride per cottage is included with the breakfast plan. Private houseboat cruises are booked separately."],
      ["Are the cottages air conditioned?", "Yes, all cottages have AC along with mosquito screens on every window."],
      ["Do you arrange houseboat check-in?", "Yes — the front desk transfers your luggage and coordinates timing with the houseboat operator."],
    ]),
    taxPercent: 12,
    taxNote: "GST at 12% applies. Boat rides and spa treatments are taxed separately at the property.",
    childPolicy: "Children under 5 stay free. Life jackets are provided for all children on boat rides.",
    cancellationSummary: "Free cancellation up to 7 days before check-in; peak-season bookings are non-refundable.",
  },
  {
    hotelId: "h-templestay",
    overview: [
      "Temple Stay Residency is four hundred metres from the Meenakshi temple east tower, close enough to walk to the 5 AM darshan and back before breakfast. The kitchen is strictly vegetarian and opens at 4:30 AM on festival days.",
      "The help desk books darshan slots, arranges priests for special poojas and stores luggage after check-out for guests catching night trains.",
    ],
    checkInTime: "12:00 PM",
    checkOutTime: "10:00 AM",
    latitude: 9.9199,
    longitude: 78.1196,
    mapsQuery: "East Chitrai Street, Madurai, Tamil Nadu",
    travellerTypes: ["Pilgrims", "Families", "Senior travellers", "Temple tour groups"],
    distances: [
      distance("temple-meenakshi", "Meenakshi Amman Temple", 0.4, 2),
      distance("temple-rail", "Madurai Junction", 1.8, 8),
      distance("temple-bus", "Mattuthavani bus stand", 6.2, 20),
      distance("temple-airport", "Madurai airport", 12.4, 30),
    ],
    nearbyPlaces: nearby("h-templestay", [
      ["Meenakshi Amman Temple", "Temple", 0.4, "Walkable; darshan queues shortest before 6 AM."],
      ["Thirumalai Nayakkar Mahal", "Heritage", 1.5, "Light and sound show at 6:45 PM."],
      ["Gandhi Memorial Museum", "Museum", 4.3, "Closed on Fridays."],
      ["Azhagar Kovil", "Temple", 21, "Half-day trip with our cab desk."],
    ]),
    faqs: faq("h-templestay", [
      ["Can you arrange darshan tickets?", "The help desk assists with online darshan slots and special-entry passes, subject to temple availability."],
      ["Is non-vegetarian food allowed?", "No. The property is pure vegetarian and outside non-veg food is not permitted in the rooms."],
      ["Do you offer early check-in for night trains?", "Yes, subject to room availability; luggage storage is free even when a room is not ready."],
    ]),
    taxPercent: 12,
    taxNote: "GST at 12% applies to all room tariffs. Pooja arrangements are billed by the temple, not by us.",
    childPolicy: "Two children under 8 stay free with existing bedding in a family room.",
    cancellationSummary: "Free cancellation up to 48 hours before check-in; festival dates are non-refundable.",
  },
  {
    hotelId: "h-coorgestate",
    overview: [
      "This is a six-room planter's bungalow inside a working coffee estate at Suntikoppa, not a hotel — meals are served at a shared table and the owners guide the dawn plantation walk themselves.",
      "The tariff is full board because there are no restaurants within walking distance. Nights are quiet, phone signal is patchy in parts of the estate, and the bonfire is lit whenever the weather allows.",
    ],
    checkInTime: "1:00 PM",
    checkOutTime: "10:00 AM",
    latitude: 12.4632,
    longitude: 75.8281,
    mapsQuery: "Suntikoppa, Kodagu, Karnataka",
    travellerTypes: ["Couples", "Nature lovers", "Small families", "Pet owners"],
    distances: [
      distance("coorg-madikeri", "Madikeri Fort", 14.6, 30),
      distance("coorg-falls", "Abbey Falls", 19.2, 40),
      distance("coorg-bus", "Kushalnagar bus stand", 9.4, 22),
      distance("coorg-airport", "Mangalore airport", 138, 225),
    ],
    nearbyPlaces: nearby("h-coorgestate", [
      ["Coffee plantation trail", "Experience", 0.2, "Guided walk at 7 AM, included in the stay."],
      ["Dubare Elephant Camp", "Wildlife", 16.5, "Morning interaction session only."],
      ["Namdroling Monastery", "Heritage", 12.8, "Golden Temple at Bylakuppe."],
      ["Abbey Falls", "Nature", 19.2, "Best flow between July and October."],
    ]),
    faqs: faq("h-coorgestate", [
      ["Are pets allowed?", "Yes, well-behaved pets are welcome in the estate rooms with prior notice. There is a resident dog on the property."],
      ["Is all food included?", "Yes — breakfast, lunch and dinner are included, home-cooked Kodava style. Tell us about dietary needs when you book."],
      ["Is there mobile network?", "Jio and Airtel work near the bungalow; the deeper estate has no signal. Wi-Fi covers the main house."],
    ]),
    taxPercent: 12,
    taxNote: "GST at 12% applies to the room component. Estate activities are complimentary.",
    childPolicy: "Children of all ages are welcome; one child under 8 stays free with existing bedding.",
    cancellationSummary: "Non-refundable. Dates can be moved once, up to 14 days before arrival, subject to availability.",
  },
  {
    hotelId: "h-munnarmist",
    overview: [
      "Mist Valley Resort sits at 5,200 ft in Chithirapuram, above the tea gardens on the Munnar–Kochi road. The glass-front rooms face the valley, and the infinity deck is the property's main draw at sunrise.",
      "A resident naturalist takes guests on tea-trail walks, and the spa runs Ayurveda treatments by appointment. Roads within the resort are steep, so buggy transfers are provided between the reception and the far blocks.",
    ],
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    latitude: 10.0435,
    longitude: 77.0455,
    mapsQuery: "Chithirapuram, Munnar, Idukki, Kerala",
    travellerTypes: ["Couples", "Honeymooners", "Families", "Photographers"],
    distances: [
      distance("munnar-town", "Munnar town", 8.2, 20),
      distance("munnar-tea", "Tea Museum", 10.4, 25),
      distance("munnar-eravikulam", "Eravikulam National Park", 21, 45),
      distance("munnar-airport", "Cochin airport", 110, 210),
    ],
    nearbyPlaces: nearby("h-munnarmist", [
      ["Tea estate viewpoint", "Viewpoint", 1.1, "Five-minute walk from the deck."],
      ["Attukad Waterfalls", "Nature", 6.4, "Strong flow in monsoon."],
      ["Tea Museum", "Museum", 10.4, "Closed on Mondays."],
      ["Eravikulam National Park", "Wildlife", 21, "Book entry slots online in advance."],
    ]),
    faqs: faq("h-munnarmist", [
      ["Do the rooms have heaters?", "Yes, all glass-front rooms have heaters and thick curtains for cold nights."],
      ["Is the resort reachable by car?", "Yes, but the last 400 m is a steep climb. Larger coaches park at the entrance and guests are shuttled up."],
      ["Are spa treatments included?", "No, spa treatments are booked separately and billed at the property."],
    ]),
    taxPercent: 18,
    taxNote: "GST at 18% applies to tariffs above ₹7,500 per night; lower tariffs are taxed at 12%.",
    childPolicy: "Children under 6 stay free. Extra mattresses are available in the valley rooms.",
    cancellationSummary: "Free cancellation up to 5 days before check-in on refundable rate plans.",
  },
  {
    hotelId: "h-bluelagoon",
    overview: [
      "Blue Lagoon is a beachfront five-star at Candolim with two pools, a shack-style grill on the sand and limousine transfers from Goa airport. The sea-view suites open onto a private deck; the deluxe doubles face the garden and pool.",
      "The resort runs a kids' club in season, and the beach shack stays open until midnight. Airport transfers must be booked at least 12 hours ahead.",
    ],
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    latitude: 15.5177,
    longitude: 73.7625,
    mapsQuery: "Candolim Beach Road, North Goa",
    travellerTypes: ["Couples", "Families", "Honeymooners", "Wedding parties"],
    distances: [
      distance("goa-beach", "Candolim Beach", 0.3, 2),
      distance("goa-fort", "Fort Aguada", 3.8, 12),
      distance("goa-panjim", "Panjim city", 13.5, 30),
      distance("goa-airport", "Dabolim airport", 42, 75),
    ],
    nearbyPlaces: nearby("h-bluelagoon", [
      ["Candolim Beach", "Beach", 0.3, "Direct beach access through the resort gate."],
      ["Fort Aguada", "Heritage", 3.8, "Sunset views over the Mandovi."],
      ["Calangute market", "Shopping", 4.6, "Busiest after 6 PM."],
      ["Anjuna flea market", "Market", 11.2, "Wednesdays only, in season."],
    ]),
    faqs: faq("h-bluelagoon", [
      ["Is the beach private?", "The resort has direct gated access to a serviced stretch of Candolim beach; the beach itself is public."],
      ["Are airport transfers included?", "Limousine transfers are chargeable and must be booked at least 12 hours before arrival."],
      ["Can we host a wedding function?", "Yes, the lawn and beach deck host events up to 250 guests. Our events desk shares the package on request."],
    ]),
    taxPercent: 18,
    taxNote: "GST at 18% applies to tariffs above ₹7,500 per night. A 5% service charge applies to food and beverage bills.",
    childPolicy: "Two children under 12 stay free with existing bedding in the sea-view suite.",
    cancellationSummary: "Non-refundable on peak dates; other dates allow free cancellation up to 10 days before arrival.",
  },
  {
    hotelId: "h-cityapart",
    overview: [
      "City Square offers one and two-bedroom serviced apartments off 100 Feet Road in Indiranagar, aimed at week-plus stays. Each apartment has a kitchenette with an induction hob, fridge and basic utensils.",
      "Housekeeping runs weekly, laundry is on site, and long-stay guests get discounted monthly rates through our corporate desk.",
    ],
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
    latitude: 12.9719,
    longitude: 77.6412,
    mapsQuery: "100 Feet Road, Indiranagar, Bengaluru, Karnataka",
    travellerTypes: ["Long-stay guests", "Relocating families", "Business travellers"],
    distances: [
      distance("blr-metro", "Indiranagar metro", 1.1, 5),
      distance("blr-mg", "MG Road", 5.4, 18),
      distance("blr-rail", "Bengaluru Cantonment", 6.8, 22),
      distance("blr-airport", "Kempegowda airport", 36, 70),
    ],
    nearbyPlaces: nearby("h-cityapart", [
      ["Indiranagar metro station", "Transport", 1.1, "Purple line, direct to MG Road."],
      ["100 Feet Road restaurants", "Dining", 0.4, "Walkable strip of cafés and bars."],
      ["Ulsoor Lake", "Attraction", 3.2, "Morning walking track."],
      ["Phoenix Mall of Asia", "Shopping", 17.5, "About 45 minutes in traffic."],
    ]),
    faqs: faq("h-cityapart", [
      ["Is cooking allowed in the apartment?", "Yes, each apartment has an induction hob and basic utensils. Deep-fry cooking is discouraged."],
      ["How often is housekeeping done?", "Weekly, included in the tariff. Daily housekeeping can be added for a small charge."],
      ["Do you offer monthly rates?", "Yes — stays over 21 nights get corporate monthly pricing. Ask our desk for a quote."],
    ]),
    taxPercent: 12,
    taxNote: "GST at 12% applies. Stays of 30 nights or longer are invoiced monthly with GST included.",
    childPolicy: "Children of all ages stay free using existing bedding in the two-bedroom apartments.",
    cancellationSummary: "Free cancellation up to 48 hours before check-in.",
  },
  {
    hotelId: "h-tirupatiyatri",
    overview: [
      "Yatri Nivas is a plain, well-kept budget lodge on Alipiri Road, a short drive from the footpath entrance to Tirumala. It is built for pilgrims: early breakfast, luggage rooms, hot water from 3 AM and a darshan help desk.",
      "Rooms are simple twin-bed units, and separate male and female dormitories take groups up to sixty. There is no lift beyond the third floor block.",
    ],
    checkInTime: "24-hour check-in",
    checkOutTime: "24 hours from check-in",
    latitude: 13.6238,
    longitude: 79.4192,
    mapsQuery: "Alipiri Road, Tirupati, Andhra Pradesh",
    travellerTypes: ["Pilgrims", "Budget travellers", "Large groups", "Senior travellers"],
    distances: [
      distance("tpt-alipiri", "Alipiri footpath", 1.8, 7),
      distance("tpt-rail", "Tirupati railway station", 4.2, 14),
      distance("tpt-bus", "Tirupati bus stand", 3.6, 12),
      distance("tpt-tirumala", "Tirumala temple", 21, 45),
    ],
    nearbyPlaces: nearby("h-tirupatiyatri", [
      ["Alipiri footpath entrance", "Temple route", 1.8, "Steps open 24 hours; start before 5 AM."],
      ["Sri Kapileswara Swamy Temple", "Temple", 2.4, "Quiet early-morning darshan."],
      ["ISKCON Tirupati", "Temple", 5.1, "Free prasadam at noon."],
      ["Srivari Museum", "Museum", 20.5, "Near the Tirumala temple complex."],
    ]),
    faqs: faq("h-tirupatiyatri", [
      ["Is check-in on a 24-hour basis?", "Yes. Your room is held for 24 hours from the time you check in, which suits overnight darshan trips."],
      ["Can you book Tirumala darshan?", "The help desk guides you through the TTD online slot booking; we cannot guarantee tickets."],
      ["Is there a dormitory for groups?", "Yes, separate male and female dormitories with lockers, bookable as whole blocks."],
    ]),
    taxPercent: 12,
    taxNote: "GST at 12% applies. Dormitory beds under ₹1,000 per night are exempt.",
    childPolicy: "Children under 10 stay free with existing bedding. Dormitory beds are charged per person.",
    cancellationSummary: "Free cancellation up to 24 hours before check-in.",
  },
  {
    hotelId: "h-groupcamp",
    overview: [
      "Yercaud Group Lodge is built for volume: room blocks, dormitories, a 120-seat dining hall and a bonfire ground, on the Lady's Seat road above Salem. School trips, college offsites and wedding parties take the property whole.",
      "Meals are served buffet-style at fixed sittings, and the projector hall doubles as an indoor activity room on rainy days. Bus and coach parking is on site.",
    ],
    checkInTime: "11:00 AM",
    checkOutTime: "9:00 AM",
    latitude: 11.7749,
    longitude: 78.2095,
    mapsQuery: "Lady's Seat Road, Yercaud, Salem, Tamil Nadu",
    travellerTypes: ["School groups", "Corporate offsites", "Wedding parties", "Large families"],
    distances: [
      distance("yer-lake", "Yercaud Lake", 2.9, 9),
      distance("yer-seat", "Lady's Seat viewpoint", 1.4, 6),
      distance("yer-salem", "Salem Junction", 28, 60),
      distance("yer-airport", "Salem airport", 34, 70),
    ],
    nearbyPlaces: nearby("h-groupcamp", [
      ["Lady's Seat viewpoint", "Viewpoint", 1.4, "Sunset point, five minutes by bus."],
      ["Yercaud Lake", "Attraction", 2.9, "Boating and evening market."],
      ["Pagoda Point", "Viewpoint", 5.6, "Sunrise views over the plains."],
      ["Botanical Garden", "Garden", 4.1, "Rose garden and orchidarium."],
    ]),
    faqs: faq("h-groupcamp", [
      ["Can we book the whole property?", "Yes. Exclusive buyouts for 60+ guests are quoted by our group desk with meals and activities included."],
      ["Is there parking for buses?", "Yes, the lodge parks up to four buses on site."],
      ["Are meals compulsory?", "Group bookings are quoted on full board because there are no restaurants nearby."],
    ]),
    taxPercent: 12,
    taxNote: "GST at 12% applies. Group invoices are issued with the organisation's GSTIN on request.",
    childPolicy: "Children are charged per head on group bookings, with a reduced rate under 10.",
    cancellationSummary: "Group bookings need 30 days' notice for a full refund; later cancellations forfeit the advance.",
  },
];

export const hotelProfiles: HotelProfile[] = seeds.map((seed) => ({
  ...seed,
  policies: seed.policies ?? standardPolicies(seed.hotelId),
  faqs: seed.faqs ?? [],
  published: seed.published ?? true,
}));

/* ------------------------------------------------------------------ */
/* Room detail attributes                                              */
/* ------------------------------------------------------------------ */

export const roomDetailAttributes: RoomDetailAttributes[] = [
  { roomId: "r-hillview-deluxe", extraBedCharge: 900, extraBedNote: "Rollaway bed with breakfast", cancellationTerms: "Free cancellation up to 72 hours before check-in.", highlights: ["Valley-facing window", "Room heater", "24-hour hot water"] },
  { roomId: "r-hillview-cottage", extraBedCharge: 1100, extraBedNote: "Extra mattress in the living area", cancellationTerms: "Free cancellation up to 72 hours before check-in.", highlights: ["Private lawn", "Fireplace", "Two bedrooms"] },
  { roomId: "r-marina-exec", extraBedCharge: 850, extraBedNote: "Rollaway bed on request", cancellationTerms: "Free cancellation up to 24 hours before check-in.", highlights: ["Work desk", "Soundproof window", "Airport pickup"] },
  { roomId: "r-marina-suite", extraBedCharge: 1200, extraBedNote: "Sofa-bed in the living room", cancellationTerms: "Free cancellation up to 24 hours before check-in.", highlights: ["Separate living room", "Lounge access", "Bathtub"] },
  { roomId: "r-backwater-cottage", extraBedCharge: 1000, extraBedNote: "Extra bed with breakfast", cancellationTerms: "Free cancellation up to 7 days before check-in.", highlights: ["Lake-facing deck", "AC", "Mosquito screens"] },
  { roomId: "r-backwater-family", extraBedCharge: 1000, extraBedNote: "Extra bed with breakfast", cancellationTerms: "Free cancellation up to 7 days before check-in.", highlights: ["Two bedrooms", "Lake view", "AC"] },
  { roomId: "r-temple-family", extraBedCharge: 500, extraBedNote: "Floor mattress with linen", cancellationTerms: "Free cancellation up to 48 hours before check-in.", highlights: ["Four beds", "Hot water from 4 AM", "Walk to temple"] },
  { roomId: "r-temple-single", extraBedCharge: 0, extraBedNote: "Extra beds not available", cancellationTerms: "Free cancellation up to 48 hours before check-in.", highlights: ["Single occupancy", "Locker", "AC"] },
  { roomId: "r-coorg-planter", extraBedCharge: 1500, extraBedNote: "Extra bed with all meals", cancellationTerms: "Non-refundable; one date change allowed 14 days ahead.", highlights: ["Estate view", "All meals included", "Guided plantation walk"] },
  { roomId: "r-munnar-glass", extraBedCharge: 1300, extraBedNote: "Extra mattress with breakfast", cancellationTerms: "Free cancellation up to 5 days before check-in.", highlights: ["Glass front", "Valley view", "Heater"] },
  { roomId: "r-goa-suite", extraBedCharge: 2500, extraBedNote: "Day bed converts to an extra bed", cancellationTerms: "Non-refundable on peak dates.", highlights: ["Sea view", "Private deck", "Pool access"] },
  { roomId: "r-goa-double", extraBedCharge: 1800, extraBedNote: "Rollaway bed on request", cancellationTerms: "Non-refundable on peak dates.", highlights: ["Garden view", "Pool access", "Balcony"] },
  { roomId: "r-blr-1bhk", extraBedCharge: 700, extraBedNote: "Folding bed in the living room", cancellationTerms: "Free cancellation up to 48 hours before check-in.", highlights: ["Kitchenette", "Washing machine", "Work desk"] },
  { roomId: "r-blr-2bhk", extraBedCharge: 700, extraBedNote: "Folding bed in the living room", cancellationTerms: "Free cancellation up to 48 hours before check-in.", highlights: ["Two bedrooms", "Kitchenette", "Weekly housekeeping"] },
  { roomId: "r-tirupati-twin", extraBedCharge: 350, extraBedNote: "Floor mattress with linen", cancellationTerms: "Free cancellation up to 24 hours before check-in.", highlights: ["24-hour check-in", "Hot water from 3 AM", "Luggage room"] },
  { roomId: "r-tirupati-dorm", extraBedCharge: 0, extraBedNote: "Charged per bed, not per room", cancellationTerms: "Free cancellation up to 24 hours before check-in.", highlights: ["Lockers", "Separate male and female halls", "Charged per bed"] },
  { roomId: "r-yercaud-block", extraBedCharge: 400, extraBedNote: "Extra mattress per guest", cancellationTerms: "Group terms: 30 days' notice for a full refund.", highlights: ["Six beds", "Full board", "Bus parking"] },
  { roomId: "r-yercaud-dorm", extraBedCharge: 0, extraBedNote: "Charged per bed, not per room", cancellationTerms: "Group terms: 30 days' notice for a full refund.", highlights: ["Charged per bed", "Dining hall access", "Bonfire ground"] },
];

/* ------------------------------------------------------------------ */
/* Public reads                                                         */
/* ------------------------------------------------------------------ */

export const getHotelProfile = (hotelId: string): HotelProfile | undefined => {
  const existing = hotelProfiles.find((p) => p.published && p.hotelId === hotelId);
  if (existing) return existing;

  const hotel = getPublishedHotels().find((h) => h.id === hotelId);
  if (!hotel) return undefined;

  return {
    hotelId: hotel.id,
    overview: [
      hotel.shortDescription || `${hotel.name} is a verified partner hotel in ${hotel.city}.`,
      "Enjoy transparent pricing, comfortable amenities, and instant booking confirmation.",
    ],
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
    latitude: 12.9716,
    longitude: 77.5946,
    mapsQuery: `${hotel.name}, ${hotel.city}`,
    travellerTypes: ["Families", "Couples", "Solo Travellers", "Corporate"],
    distances: [],
    nearbyPlaces: [],
    faqs: [
      {
        id: `faq-${hotel.id}-1`,
        hotelId: hotel.id,
        question: "What are the standard check-in and check-out timings?",
        answer: "Standard check-in is at 12:00 PM and check-out is at 11:00 AM. Early check-in or late check-out is subject to room availability.",
        order: 1,
        visible: true,
      },
      {
        id: `faq-${hotel.id}-2`,
        hotelId: hotel.id,
        question: "Is vehicle parking available at this property?",
        answer: "Yes, complimentary secure parking is available for guest vehicles and cabs.",
        order: 2,
        visible: true,
      },
    ],
    policies: standardPolicies(hotel.id),
    taxPercent: 12,
    taxNote: "GST at 12% is included in the shown tariffs.",
    childPolicy: "Children under 6 stay free using existing bedding.",
    cancellationSummary: "Free cancellation up to 48 hours before check-in.",
    published: true,
  };
};

export const getHotelGallery = (hotelId: string): HotelMediaItem[] =>
  hotelMedia
    .filter((m) => m.visible && m.hotelId === hotelId)
    .sort((a, b) => a.order - b.order);

export const getGalleryCategories = () =>
  galleryCategories.filter((c) => c.visible).sort((a, b) => a.order - b.order);

/** Gallery categories that actually have images for this hotel. */
export function getUsedGalleryCategories(hotelId: string) {
  const used = new Set(getHotelGallery(hotelId).map((m) => m.categorySlug));
  return getGalleryCategories().filter((c) => used.has(c.slug));
}

export const getDetailAmenities = () =>
  detailAmenities.filter((a) => a.visible).sort((a, b) => a.order - b.order);

/** Full amenity grid with an available flag, so absent amenities stay visible. */
export function getHotelAmenityGrid(hotelId: string) {
  const available = new Set(hotelDetailAmenityLinks[hotelId] ?? []);
  return getDetailAmenities().map((amenity) => ({
    ...amenity,
    available: available.has(amenity.slug),
  }));
}

export const getHotelPolicies = (hotelId: string) =>
  (getHotelProfile(hotelId)?.policies ?? [])
    .filter((p) => p.visible)
    .sort((a, b) => a.order - b.order);

export const getHotelProfileFaqs = (hotelId: string) =>
  (getHotelProfile(hotelId)?.faqs ?? [])
    .filter((f) => f.visible)
    .sort((a, b) => a.order - b.order);

export const getRoomDetailAttributes = (roomId: string) =>
  roomDetailAttributes.find((r) => r.roomId === roomId);

/** Google Maps deep link built from stored coordinates, with a text fallback. */
export function mapsLink(profile: HotelProfile | undefined, fallbackQuery: string) {
  if (profile && Number.isFinite(profile.latitude) && Number.isFinite(profile.longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${profile.latitude},${profile.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    profile?.mapsQuery ?? fallbackQuery,
  )}`;
}

/** Embeddable map frame source for the stored coordinates. */
export function mapsEmbedSrc(profile: HotelProfile | undefined, fallbackQuery: string) {
  if (profile && Number.isFinite(profile.latitude) && Number.isFinite(profile.longitude)) {
    const d = 0.01;
    const bbox = [
      profile.longitude - d,
      profile.latitude - d,
      profile.longitude + d,
      profile.latitude + d,
    ].join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${profile.latitude}%2C${profile.longitude}`;
  }
  return `https://www.openstreetmap.org/export/embed.html?bbox=68%2C8%2C90%2C24&layer=mapnik&query=${encodeURIComponent(
    fallbackQuery,
  )}`;
}

/** Hotels in the same city (then same category) used for the related strip. */
export function getRelatedHotels(hotel: HotelRecord, limit = 3): HotelRecord[] {
  const others = getPublishedHotels().filter((h) => h.id !== hotel.id);
  const sameCity = others.filter((h) => h.city === hotel.city);
  const sameCategory = others.filter(
    (h) => h.city !== hotel.city && h.categorySlug === hotel.categorySlug,
  );
  const rest = others.filter((h) => !sameCity.includes(h) && !sameCategory.includes(h));
  return [...sameCity, ...sameCategory, ...rest].slice(0, limit);
}

/** Rooms of a hotel with their admin-managed detail attributes attached. */
export type RoomWithDetails = { room: RoomRecord; details: RoomDetailAttributes | undefined };

export const getHotelRoomsWithDetails = (hotelId: string): RoomWithDetails[] =>
  getHotelRooms(hotelId).map((room) => ({
    room,
    details: getRoomDetailAttributes(room.id),
  }));

/* ------------------------------------------------------------------ */
/* Room selection for a stay                                            */
/* ------------------------------------------------------------------ */

/** Stay context carried over from the search/listing pages. */
export type RoomStay = {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
};

export type RoomPlanOffer = {
  ratePlan: RatePlan;
  mealPlanLabel: string;
  /** All-in nightly rate for one room on this plan, before tax. */
  nightlyRate: number;
  /** Rate x nights x rooms, before tax. */
  stayTotal: number;
  taxAmount: number;
  totalWithTax: number;
  refundable: boolean;
  cancellationTerms: string;
};

export type RoomSelection = {
  room: RoomRecord;
  details: RoomDetailAttributes | undefined;
  nights: number;
  unitsAvailable: number;
  status: AvailabilityStatus;
  plans: RoomPlanOffer[];
  bestPlan: RoomPlanOffer | null;
};

/**
 * Resolves every occupancy-compatible room of a hotel against date-wise
 * inventory and its published rate plans. Rooms that cannot host the requested
 * occupancy are dropped; rooms without inventory are returned as "sold-out"
 * so the guest sees why they cannot book instead of an empty list.
 */
export function buildRoomSelections(hotelId: string, stay: RoomStay): RoomSelection[] {
  const roomsRequested = Math.max(1, stay.rooms);
  const adultsPerRoom = Math.ceil(Math.max(1, stay.adults) / roomsRequested);
  const childrenPerRoom = Math.ceil(Math.max(0, stay.children) / roomsRequested);
  const taxPercent = getHotelProfile(hotelId)?.taxPercent ?? 12;
  const fallbackTerms = getHotelProfile(hotelId)?.cancellationSummary ?? "";

  return getHotelRoomsWithDetails(hotelId)
    .filter(
      ({ room }) => room.maxAdults >= adultsPerRoom && room.maxChildren >= childrenPerRoom,
    )
    .map(({ room, details }) => {
      const availability = getRoomAvailability(room, {
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        rooms: roomsRequested,
      });
      const bookable = availability.available ? availability.unitsAvailable : 0;
      const nights = Math.max(1, availability.nights);

      const plans: RoomPlanOffer[] = availability.available
        ? getRoomRatePlans(room.id).map((ratePlan) => {
            const nightlyRate = Math.max(0, availability.avgNightlyRate + ratePlan.priceDelta);
            const stayTotal = nightlyRate * nights * roomsRequested;
            const taxAmount = Math.round((stayTotal * taxPercent) / 100);
            return {
              ratePlan,
              mealPlanLabel: getMealPlanLabel(ratePlan.mealPlanSlug),
              nightlyRate,
              stayTotal,
              taxAmount,
              totalWithTax: stayTotal + taxAmount,
              refundable: ratePlan.refundable,
              cancellationTerms: ratePlan.refundable
                ? details?.cancellationTerms || fallbackTerms
                : "Non-refundable rate — the advance is not returned on cancellation.",
            };
          })
        : [];

      plans.sort((a, b) => a.nightlyRate - b.nightlyRate);

      return {
        room,
        details,
        nights,
        unitsAvailable: bookable,
        status: getAvailabilityStatus(bookable),
        plans,
        bestPlan: plans[0] ?? null,
      };
    })
    .sort((a, b) => {
      const aPrice = a.bestPlan?.nightlyRate ?? Number.POSITIVE_INFINITY;
      const bPrice = b.bestPlan?.nightlyRate ?? Number.POSITIVE_INFINITY;
      return aPrice - bPrice || a.room.order - b.room.order;
    });
}

/** Cheapest bookable nightly rate across a hotel's rooms for this stay. */
export function getStayStartingPrice(hotelId: string, stay: RoomStay): number | null {
  const prices = buildRoomSelections(hotelId, stay)
    .map((s) => s.bestPlan?.nightlyRate)
    .filter((p): p is number => typeof p === "number");
  return prices.length ? Math.min(...prices) : null;
}
