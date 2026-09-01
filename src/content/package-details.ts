/**
 * Admin-managed tour package detail data.
 *
 * Mirrors the future normalized tables:
 *   package_gallery(package_id, url, alt, kind, display_order)
 *   package_itinerary_days(package_id, day_number, title, route, activities[],
 *                          sightseeing[], hotel, meals, distance_km, notes,
 *                          image, image_alt, display_order)
 *   package_hotel_options(package_id, hotel, category, room_type, nights,
 *                         occupancy, meal_plan, amenities[], upgrade_price,
 *                         is_default, display_order)
 *   package_vehicle_options(package_id, category, seating, ac, pickup, drop,
 *                           upgrade_price, is_default, display_order)
 *   package_departures(package_id, date, label, seats_left, sold_out)
 *   package_policies(package_id, key, title, items[], display_order, visible)
 *   package_sections(package_id, key, display_order, visible)
 *
 * Every price shown from this module is an ESTIMATE until the operations team
 * confirms it — the UI must label it as such.
 */

import heroTours from "@/assets/hero-tours.jpg";
import heroHotels from "@/assets/hero-hotels.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import servicePilgrimage from "@/assets/service-pilgrimage.jpg";
import serviceCorporate from "@/assets/service-corporate.jpg";
import servicesBanner from "@/assets/services-banner.jpg";
import aboutBanner from "@/assets/about-banner.jpg";
import { getPublishedPackages, type TourPackageRecord } from "@/content/tour-packages";

export type PackageGalleryKind = "destination" | "hotel" | "vehicle" | "attraction";

export type PackageGalleryImage = {
  id: string;
  url: string;
  alt: string;
  kind: PackageGalleryKind;
  order: number;
};

export type ItineraryDay = {
  id: string;
  day: number;
  title: string;
  route: string;
  activities: string[];
  sightseeing: string[];
  hotel: string;
  meals: string;
  distanceKm: number;
  notes?: string;
  image?: string;
  imageAlt?: string;
  order: number;
};

export type PackageHotelOption = {
  id: string;
  hotel: string;
  category: string;
  roomType: string;
  nights: number;
  occupancy: string;
  mealPlan: string;
  amenities: string[];
  /** Added to the estimate, per person, when selected. 0 = included in base. */
  upgradePrice: number;
  isDefault: boolean;
  order: number;
};

export type PackageVehicleOption = {
  id: string;
  category: string;
  seating: number;
  ac: boolean;
  pickup: string;
  drop: string;
  /** Added to the estimate once per trip when selected. */
  upgradePrice: number;
  isDefault: boolean;
  order: number;
};

export type PackageDeparture = {
  id: string;
  date: string;
  label: string;
  seatsLeft: number;
  soldOut: boolean;
};

export type PolicyKey =
  | "inclusions"
  | "exclusions"
  | "terms"
  | "child-policy"
  | "payment-policy"
  | "cancellation-policy";

export type PackagePolicy = {
  id: string;
  key: PolicyKey;
  title: string;
  items: string[];
  order: number;
  visible: boolean;
};

export type PackageSectionKey =
  | "gallery"
  | "overview"
  | "itinerary"
  | "hotels"
  | "vehicles"
  | "policies"
  | "related";

export type PackageDetail = {
  packageSlug: string;
  overview: string;
  bestTime: string;
  travellerTypes: string[];
  totalDistanceKm: number;
  gallery: PackageGalleryImage[];
  days: ItineraryDay[];
  hotelOptions: PackageHotelOption[];
  vehicleOptions: PackageVehicleOption[];
  departures: PackageDeparture[];
  policies: PackagePolicy[];
  /** Admin-controlled section order. Unlisted sections are hidden. */
  sectionOrder: PackageSectionKey[];
};

export const galleryKindLabels: Record<PackageGalleryKind, string> = {
  destination: "Destination",
  hotel: "Hotel",
  vehicle: "Vehicle",
  attraction: "Attraction",
};

export const policyTitles: Record<PolicyKey, string> = {
  inclusions: "Inclusions",
  exclusions: "Exclusions",
  terms: "Terms & conditions",
  "child-policy": "Child policy",
  "payment-policy": "Payment policy",
  "cancellation-policy": "Cancellation policy",
};

export const defaultSectionOrder: PackageSectionKey[] = [
  "gallery",
  "overview",
  "itinerary",
  "hotels",
  "vehicles",
  "policies",
  "related",
];

/* ------------------------------------------------------------------ */
/* Builders — keep the authored records below short and consistent.    */
/* ------------------------------------------------------------------ */

const gallery = (
  slug: string,
  images: { url: string; alt: string; kind: PackageGalleryKind }[],
): PackageGalleryImage[] =>
  images.map((image, index) => ({ id: `${slug}-img-${index + 1}`, order: index + 1, ...image }));

const days = (
  slug: string,
  list: Omit<ItineraryDay, "id" | "day" | "order">[],
): ItineraryDay[] =>
  list.map((day, index) => ({ id: `${slug}-day-${index + 1}`, day: index + 1, order: index + 1, ...day }));

const policies = (
  slug: string,
  map: Partial<Record<PolicyKey, string[]>>,
): PackagePolicy[] =>
  (Object.keys(policyTitles) as PolicyKey[])
    .filter((key) => (map[key]?.length ?? 0) > 0)
    .map((key, index) => ({
      id: `${slug}-policy-${key}`,
      key,
      title: policyTitles[key],
      items: map[key] as string[],
      order: index + 1,
      visible: true,
    }));

const departures = (
  slug: string,
  list: { date: string; label: string; seatsLeft: number; soldOut?: boolean }[],
): PackageDeparture[] =>
  list.map((d, index) => ({
    id: `${slug}-dep-${index + 1}`,
    soldOut: false,
    ...d,
  }));

const sharedPolicies = (pkg: {
  hotelCategory: string;
  vehicleCategory: string;
  nights: number;
}): Partial<Record<PolicyKey, string[]>> => ({
  inclusions: [
    `${pkg.nights} nights accommodation in a handpicked ${pkg.hotelCategory} property (Twin/Triple Sharing)`,
    "Daily complimentary breakfast at the hotel",
    `Dedicated sanitised AC ${pkg.vehicleCategory} (Sedan / SUV / Tempo Traveller / Bus) for complete sightseeing & transfers`,
    "All vehicle fuel, maintenance, driver allowance (Per Day), toll plaza fees, interstate entry permits and parking charges",
    "Commercial KA registered yellow-board fleet with verified, background-checked professional chauffeur",
    "GPS live tracked vehicle with 24/7 on-trip assistance from South Zoom Tourism",
    "All applicable travel taxes and standard itinerary inclusions (zero hidden costs)",
    "Dedicated travel coordinator available on WhatsApp & Call (+91 6366357757)",
  ],
  exclusions: [
    "Lunch, dinner, room service, alcoholic beverages and personal food orders",
    "Monument, wildlife safari, botanical garden, boating, museum and temple entry tickets",
    "Local guide charges, camera/videography permits at heritage spots",
    "Night driving charges (applicable only between 9:30 PM to 5:30 AM if traveling outside planned schedule)",
    "Airfare, train tickets, or intercity bus tickets to/from trip starting point",
    "Personal expenses, laundry, telephone calls, tips and travel insurance",
    "Unforeseen costs arising from road blockages, strikes, landslides or extreme weather delays",
  ],
  terms: [
    "100% Transparent Billing: No hidden extra km costs or unlisted surcharges.",
    "Driver Allowance is included on a Per Day basis for regular daytime itinerary.",
    "Night Charges (9:30 PM – 5:30 AM) apply for overnight travel or late-night driving outside standard schedule.",
    "Vehicle Air Conditioning runs continuously during transit; switched off when vehicle is parked or on steep hairpin ghat ascents.",
    "All fleet vehicles maintain valid commercial permits, passenger insurance, and fitness certificates.",
    "Valid Government Photo ID (Aadhaar / Passport / Voter ID) is mandatory for all travelers during hotel check-in.",
  ],
  "child-policy": [
    "Children below 5 years travel complimentary without a separate bed or vehicle seat.",
    "Children between 5 and 11 years are charged 60% of the adult tariff with a shared bed/mattress.",
    "Children 12 years and above are charged as adults.",
    "An extra rollaway bed or separate room is quoted on request.",
  ],
  "payment-policy": [
    "25% advance token to confirm tour booking, block hotel rooms and reserve the dedicated fleet vehicle.",
    "50% due 7 days before commencement of the trip.",
    "Remaining balance payable on Day 1 of journey prior to departure.",
    "Official GST invoice and instant payment confirmation receipt generated for every payment.",
  ],
  "cancellation-policy": [
    "Cancelled 15 days or more before travel — full refund (less standard transaction fee).",
    "Cancelled 7 to 14 days before travel — 75% refund (25% cancellation charge retained).",
    "Cancelled 3 to 6 days before travel — 50% refund.",
    "Cancelled within 48 hours or a no-show — non-refundable.",
    "Approved refunds are processed to the original payment method within 5–7 working days.",
  ],
});

/* ------------------------------------------------------------------ */
/* Authored detail records                                             */
/* ------------------------------------------------------------------ */

const authoredDetails: PackageDetail[] = [
  {
    packageSlug: "ooty-coonoor-escape",
    overview:
      "Three unhurried days in the Nilgiris built around tea country. You are picked up in Coimbatore, climb through the Coonoor ghat with photo stops, and settle into Ooty for two nights of gardens, lake time and a sunrise run to Doddabetta. The drive load is deliberately light so families with older parents or small children are comfortable.",
    bestTime: "October to May. April and May are peak season, so book at least three weeks ahead.",
    travellerTypes: ["Families", "First-time hill visitors", "Senior citizens", "Weekend couples"],
    totalDistanceKm: 320,
    gallery: gallery("ooty", [
      { url: heroTours, alt: "Tea estates terraced across the hills near Coonoor", kind: "destination" },
      { url: heroHotels, alt: "Deluxe hotel room with a valley view in Ooty", kind: "hotel" },
      { url: heroFleet, alt: "Air-conditioned sedan used for the Nilgiris transfer", kind: "vehicle" },
      { url: servicesBanner, alt: "Botanical Garden flower beds in Ooty", kind: "attraction" },
    ]),
    days: days("ooty", [
      {
        title: "Coimbatore pickup and the Coonoor ghat",
        route: "Coimbatore → Coonoor → Ooty",
        activities: ["Airport or railway station pickup", "Tea factory visit with tasting", "Hotel check-in and evening at leisure"],
        sightseeing: ["Sim's Park", "Dolphin's Nose viewpoint", "Ketti valley view"],
        hotel: "Ooty — 3 Star hotel, deluxe room",
        meals: "Dinner",
        distanceKm: 90,
        notes: "The ghat road has 14 hairpin bends; carry motion-sickness tablets if you are prone to it.",
        image: heroTours,
        imageAlt: "Hairpin bends on the road climbing to Coonoor",
      },
      {
        title: "Ooty gardens, lake and Doddabetta",
        route: "Ooty local sightseeing",
        activities: ["Early start for Doddabetta before the cloud sets in", "Boating at Ooty lake", "Evening at the local market"],
        sightseeing: ["Government Botanical Garden", "Doddabetta peak", "Ooty lake", "Thread Garden"],
        hotel: "Ooty — 3 Star hotel, deluxe room",
        meals: "Breakfast, dinner",
        distanceKm: 60,
        image: servicesBanner,
        imageAlt: "Flower beds at the Government Botanical Garden in Ooty",
      },
      {
        title: "Rose Garden and drop",
        route: "Ooty → Coimbatore",
        activities: ["Hotel check-out after breakfast", "Shopping for homemade chocolate and tea", "Drop at Coimbatore airport or station"],
        sightseeing: ["Rose Garden", "Pykara falls (optional, adds 2 hours)"],
        hotel: "Not applicable — departure day",
        meals: "Breakfast",
        distanceKm: 100,
        notes: "Keep at least four hours between the Ooty check-out and your flight.",
      },
    ]),
    hotelOptions: [
      {
        id: "ooty-hotel-1",
        hotel: "Nilgiri Comfort Inn",
        category: "3 Star",
        roomType: "Deluxe room",
        nights: 2,
        occupancy: "2 adults",
        mealPlan: "Breakfast + dinner",
        amenities: ["Room heater", "Hot water", "Free parking", "In-house restaurant"],
        upgradePrice: 0,
        isDefault: true,
        order: 1,
      },
      {
        id: "ooty-hotel-2",
        hotel: "Lake View Residency",
        category: "4 Star",
        roomType: "Premium room with balcony",
        nights: 2,
        occupancy: "2 adults",
        mealPlan: "Breakfast + dinner",
        amenities: ["Lake-facing balcony", "Room heater", "Bonfire on request", "Kids play area"],
        upgradePrice: 1800,
        isDefault: false,
        order: 2,
      },
      {
        id: "ooty-hotel-3",
        hotel: "Tea Country Resort",
        category: "Resort",
        roomType: "Estate cottage",
        nights: 2,
        occupancy: "2 adults",
        mealPlan: "All meals",
        amenities: ["Private estate walk", "Fireplace", "Spa", "Indoor games"],
        upgradePrice: 3600,
        isDefault: false,
        order: 3,
      },
    ],
    vehicleOptions: [
      {
        id: "ooty-veh-1",
        category: "Sedan",
        seating: 4,
        ac: true,
        pickup: "Coimbatore airport or railway station",
        drop: "Coimbatore airport or railway station",
        upgradePrice: 0,
        isDefault: true,
        order: 1,
      },
      {
        id: "ooty-veh-2",
        category: "SUV",
        seating: 6,
        ac: true,
        pickup: "Coimbatore airport, station or city hotel",
        drop: "Coimbatore airport, station or city hotel",
        upgradePrice: 3500,
        isDefault: false,
        order: 2,
      },
    ],
    departures: departures("ooty", [
      { date: "2026-08-14", label: "Independence weekend", seatsLeft: 4 },
      { date: "2026-09-11", label: "September departure", seatsLeft: 8 },
      { date: "2026-10-02", label: "Gandhi Jayanti weekend", seatsLeft: 0, soldOut: true },
      { date: "2026-11-06", label: "Post-monsoon departure", seatsLeft: 10 },
    ]),
    policies: policies("ooty", sharedPolicies({ hotelCategory: "3 Star", vehicleCategory: "Sedan", nights: 2 })),
    sectionOrder: defaultSectionOrder,
  },
  {
    packageSlug: "munnar-alleppey-honeymoon",
    overview:
      "A five-day Kerala circuit made for two — plantation air in Munnar, then a private houseboat on the Alleppey backwaters. Transfers are private throughout, and the houseboat night includes a candlelit dinner prepared on board.",
    bestTime: "September to March. Avoid mid-June to August if you want dry plantation walks.",
    travellerTypes: ["Honeymooners", "Couples", "Anniversary trips"],
    totalDistanceKm: 420,
    gallery: gallery("munnar", [
      { url: heroHotels, alt: "Houseboat moored on the Alleppey backwaters at sunset", kind: "destination" },
      { url: heroTours, alt: "Tea plantations rolling across the Munnar hills", kind: "attraction" },
      { url: aboutBanner, alt: "Resort room with plantation views in Munnar", kind: "hotel" },
      { url: heroFleet, alt: "Air-conditioned sedan used for Kerala transfers", kind: "vehicle" },
    ]),
    days: days("munnar", [
      {
        title: "Kochi arrival and drive to Munnar",
        route: "Kochi → Munnar",
        activities: ["Airport pickup with a welcome kit", "Waterfall stops en route", "Resort check-in"],
        sightseeing: ["Cheeyappara falls", "Valara falls", "Spice plantation stop"],
        hotel: "Munnar — resort, plantation-view room",
        meals: "Dinner",
        distanceKm: 130,
        image: heroTours,
        imageAlt: "Waterfall beside the Kochi to Munnar highway",
      },
      {
        title: "Munnar sightseeing day",
        route: "Munnar local",
        activities: ["Tea museum tour", "Boating at Mattupetty dam", "Evening bonfire at the resort"],
        sightseeing: ["Tea museum", "Mattupetty dam", "Echo point", "Kundala lake"],
        hotel: "Munnar — resort, plantation-view room",
        meals: "Breakfast, dinner",
        distanceKm: 55,
      },
      {
        title: "Eravikulam and transfer to Alleppey",
        route: "Munnar → Alleppey",
        activities: ["Morning park visit", "Scenic drive to the backwaters", "Hotel check-in at Alleppey"],
        sightseeing: ["Eravikulam National Park", "Rajamalai viewpoint"],
        hotel: "Alleppey — 4 Star lake-facing hotel",
        meals: "Breakfast",
        distanceKm: 175,
        notes: "Eravikulam closes during the calving season each February to March.",
      },
      {
        title: "Private houseboat with sunset cruise",
        route: "Alleppey backwaters",
        activities: ["Board the private houseboat at noon", "Village and paddy-field cruise", "Candlelit dinner on deck"],
        sightseeing: ["Punnamada lake", "Backwater villages", "Kayaking on request"],
        hotel: "Private houseboat, one bedroom with AC at night",
        meals: "Breakfast, lunch, dinner",
        distanceKm: 20,
        image: heroHotels,
        imageAlt: "Candlelit dinner set up on a Kerala houseboat deck",
      },
      {
        title: "Disembark and Kochi drop",
        route: "Alleppey → Kochi",
        activities: ["Breakfast on board", "Disembark at 9 AM", "Drop at Kochi airport or station"],
        sightseeing: ["Marari beach stop (optional)"],
        hotel: "Not applicable — departure day",
        meals: "Breakfast",
        distanceKm: 60,
      },
    ]),
    hotelOptions: [
      {
        id: "munnar-hotel-1",
        hotel: "Plantation Retreat Munnar + Backwater Grand",
        category: "Resort",
        roomType: "Plantation-view room + lake-facing room",
        nights: 4,
        occupancy: "2 adults",
        mealPlan: "Breakfast + dinner",
        amenities: ["Plantation walk", "Bonfire", "Spa", "Honeymoon room décor"],
        upgradePrice: 0,
        isDefault: true,
        order: 1,
      },
      {
        id: "munnar-hotel-2",
        hotel: "Cloud Valley Luxury + Premium Houseboat",
        category: "5 Star",
        roomType: "Suite + premium houseboat",
        nights: 4,
        occupancy: "2 adults",
        mealPlan: "All meals",
        amenities: ["Private jacuzzi", "Butler service", "Upper-deck houseboat", "Couple spa session"],
        upgradePrice: 9500,
        isDefault: false,
        order: 2,
      },
    ],
    vehicleOptions: [
      {
        id: "munnar-veh-1",
        category: "Sedan",
        seating: 4,
        ac: true,
        pickup: "Kochi airport",
        drop: "Kochi airport or railway station",
        upgradePrice: 0,
        isDefault: true,
        order: 1,
      },
      {
        id: "munnar-veh-2",
        category: "SUV",
        seating: 6,
        ac: true,
        pickup: "Kochi airport",
        drop: "Kochi airport or railway station",
        upgradePrice: 4200,
        isDefault: false,
        order: 2,
      },
    ],
    departures: departures("munnar", [
      { date: "2026-08-22", label: "August departure", seatsLeft: 2 },
      { date: "2026-09-19", label: "Onam season", seatsLeft: 2 },
      { date: "2026-10-17", label: "October departure", seatsLeft: 2 },
    ]),
    policies: policies("munnar", sharedPolicies({ hotelCategory: "Resort", vehicleCategory: "Sedan", nights: 4 })),
    sectionOrder: defaultSectionOrder,
  },
  {
    packageSlug: "tirupati-darshan-package",
    overview:
      "An overnight Tirupati run from Chennai with a special-entry darshan slot, a clean budget stay near the bus stand and a return the next afternoon. Suitable for first-time pilgrims who want the logistics handled.",
    bestTime: "All year. Brahmotsavam and long weekends are far busier, so darshan slots take longer.",
    travellerTypes: ["Pilgrims", "Families", "Senior citizens", "Small groups"],
    totalDistanceKm: 280,
    gallery: gallery("tirupati", [
      { url: servicePilgrimage, alt: "Temple gopuram at dawn on the Tirumala hills", kind: "destination" },
      { url: heroFleet, alt: "SUV used for the Chennai to Tirupati transfer", kind: "vehicle" },
      { url: heroHotels, alt: "Budget hotel room booked near Tirupati bus stand", kind: "hotel" },
    ]),
    days: days("tirupati", [
      {
        title: "Chennai pickup and Tirupati check-in",
        route: "Chennai → Tirupati",
        activities: ["Morning pickup from your Chennai address", "Hotel check-in", "Evening local temple visit"],
        sightseeing: ["Padmavathi Ammavari temple", "ISKCON Tirupati"],
        hotel: "Tirupati — budget hotel, standard room",
        meals: "Not included",
        distanceKm: 140,
        notes: "Carry original photo ID for every traveller — it is mandatory for darshan tickets.",
        image: servicePilgrimage,
        imageAlt: "Pilgrims walking towards the Tirumala temple entrance",
      },
      {
        title: "Tirumala darshan and return",
        route: "Tirupati → Tirumala → Chennai",
        activities: ["Early drive up to Tirumala", "Special-entry darshan", "Prasadam collection and return drive"],
        sightseeing: ["Sri Venkateswara Swamy temple", "Papavinasanam (subject to time)"],
        hotel: "Not applicable — departure day",
        meals: "Not included",
        distanceKm: 140,
      },
    ]),
    hotelOptions: [
      {
        id: "tirupati-hotel-1",
        hotel: "Sri Balaji Residency",
        category: "Budget",
        roomType: "Standard double room",
        nights: 1,
        occupancy: "2 adults",
        mealPlan: "Room only",
        amenities: ["Hot water", "Locker facility", "Walk to bus stand"],
        upgradePrice: 0,
        isDefault: true,
        order: 1,
      },
      {
        id: "tirupati-hotel-2",
        hotel: "Hotel Tirumala Grand",
        category: "3 Star",
        roomType: "Deluxe room",
        nights: 1,
        occupancy: "2 adults",
        mealPlan: "Breakfast",
        amenities: ["Air conditioning", "Restaurant", "Lift", "Free parking"],
        upgradePrice: 900,
        isDefault: false,
        order: 2,
      },
    ],
    vehicleOptions: [
      {
        id: "tirupati-veh-1",
        category: "SUV",
        seating: 6,
        ac: true,
        pickup: "Any Chennai city address",
        drop: "Same Chennai address",
        upgradePrice: 0,
        isDefault: true,
        order: 1,
      },
      {
        id: "tirupati-veh-2",
        category: "Tempo Traveller",
        seating: 12,
        ac: true,
        pickup: "Any Chennai city address",
        drop: "Same Chennai address",
        upgradePrice: 4800,
        isDefault: false,
        order: 2,
      },
    ],
    departures: departures("tirupati", [
      { date: "2026-08-08", label: "Weekend departure", seatsLeft: 6 },
      { date: "2026-08-29", label: "Weekend departure", seatsLeft: 0, soldOut: true },
      { date: "2026-09-12", label: "Weekend departure", seatsLeft: 6 },
      { date: "2026-09-26", label: "Weekend departure", seatsLeft: 12 },
    ]),
    policies: policies("tirupati", {
      ...sharedPolicies({ hotelCategory: "Budget", vehicleCategory: "SUV", nights: 1 }),
      inclusions: [
        "One night accommodation in a budget hotel on twin sharing",
        "Air-conditioned SUV from Chennai with a professional driver",
        "Toll, parking, fuel, driver bata and hill permits",
        "Darshan ticket assistance and queue guidance",
        "24/7 trip coordinator on WhatsApp during travel",
      ],
      exclusions: [
        "Darshan ticket cost, sevas and donations",
        "All meals and prasadam purchases",
        "Locker, tonsure and porter charges",
        "Personal expenses and tips",
      ],
    }),
    sectionOrder: defaultSectionOrder,
  },
  {
    packageSlug: "goa-beach-break",
    overview:
      "Four days on the North Goa strip with an overnight drive out of Bengaluru, a beachside stay in Calangute and a full free day for water sports or a cruise. Current departures are fully booked — we can quote an equivalent private departure on any date.",
    bestTime: "November to February for dry beach weather; monsoon departures run at lower rates.",
    travellerTypes: ["Friend groups", "Young couples", "Weekend travellers"],
    totalDistanceKm: 1180,
    gallery: gallery("goa", [
      { url: servicesBanner, alt: "Palm-lined beach shack on the North Goa coast", kind: "destination" },
      { url: heroHotels, alt: "Beachside resort room in Calangute", kind: "hotel" },
      { url: serviceCorporate, alt: "Tempo traveller used for the Bengaluru to Goa run", kind: "vehicle" },
    ]),
    days: days("goa", [
      {
        title: "Bengaluru departure and overnight drive",
        route: "Bengaluru → Goa",
        activities: ["Evening pickup in Bengaluru", "Overnight drive with dinner and rest stops"],
        sightseeing: [],
        hotel: "Overnight in transit",
        meals: "Not included",
        distanceKm: 560,
      },
      {
        title: "North Goa beaches",
        route: "Calangute and around",
        activities: ["Morning check-in", "Beach time at Calangute and Baga", "Evening at the night market"],
        sightseeing: ["Calangute beach", "Baga beach", "Anjuna beach"],
        hotel: "Calangute — 3 Star hotel",
        meals: "Breakfast",
        distanceKm: 40,
      },
      {
        title: "Forts, churches and a free evening",
        route: "North Goa heritage loop",
        activities: ["Fort and church circuit", "Optional water sports", "Free evening"],
        sightseeing: ["Fort Aguada", "Chapora fort", "Basilica of Bom Jesus", "Se Cathedral"],
        hotel: "Calangute — 3 Star hotel",
        meals: "Breakfast",
        distanceKm: 80,
      },
      {
        title: "Check-out and return",
        route: "Goa → Bengaluru",
        activities: ["Late-morning check-out", "Return drive with dinner stop"],
        sightseeing: [],
        hotel: "Not applicable — departure day",
        meals: "Breakfast",
        distanceKm: 500,
      },
    ]),
    hotelOptions: [
      {
        id: "goa-hotel-1",
        hotel: "Calangute Sands",
        category: "3 Star",
        roomType: "Standard room",
        nights: 3,
        occupancy: "2 adults",
        mealPlan: "Breakfast",
        amenities: ["Pool", "Walk to beach", "Restaurant", "Free parking"],
        upgradePrice: 0,
        isDefault: true,
        order: 1,
      },
      {
        id: "goa-hotel-2",
        hotel: "Beachfront Blu Resort",
        category: "4 Star",
        roomType: "Sea-view room",
        nights: 3,
        occupancy: "2 adults",
        mealPlan: "Breakfast",
        amenities: ["Sea view", "Infinity pool", "Beach access", "Gym"],
        upgradePrice: 2600,
        isDefault: false,
        order: 2,
      },
    ],
    vehicleOptions: [
      {
        id: "goa-veh-1",
        category: "Tempo Traveller",
        seating: 12,
        ac: true,
        pickup: "Bengaluru city pickup point",
        drop: "Same Bengaluru pickup point",
        upgradePrice: 0,
        isDefault: true,
        order: 1,
      },
      {
        id: "goa-veh-2",
        category: "Mini Bus",
        seating: 20,
        ac: true,
        pickup: "Bengaluru city pickup point",
        drop: "Same Bengaluru pickup point",
        upgradePrice: 7500,
        isDefault: false,
        order: 2,
      },
    ],
    departures: departures("goa", [
      { date: "2026-08-13", label: "Long weekend", seatsLeft: 0, soldOut: true },
      { date: "2026-09-04", label: "September departure", seatsLeft: 0, soldOut: true },
    ]),
    policies: policies("goa", sharedPolicies({ hotelCategory: "3 Star", vehicleCategory: "Tempo Traveller", nights: 3 })),
    sectionOrder: defaultSectionOrder,
  },
];

/* ------------------------------------------------------------------ */
/* Fallback detail derived from the package master record              */
/* ------------------------------------------------------------------ */

function derivedDetail(pkg: TourPackageRecord): PackageDetail {
  const summary = pkg.itinerarySummary.length
    ? pkg.itinerarySummary
    : Array.from({ length: pkg.days }, (_, i) => `Day ${i + 1} — itinerary shared on confirmation`);

  return {
    packageSlug: pkg.slug,
    overview: `${pkg.nights} nights and ${pkg.days} days across ${pkg.destination}, ${pkg.state}, starting and ending at ${pkg.startingCity}. ${
      pkg.includesHotel ? `Stay is in a ${pkg.hotelCategory} property.` : "Accommodation is quoted separately."
    } ${pkg.includesVehicle ? `Travel is by ${pkg.vehicleCategory} with a professional driver.` : "Transport is quoted separately."}`,
    bestTime: "Runs all year. Ask us for the quietest weeks on your dates.",
    travellerTypes: pkg.categorySlugs.includes("pilgrimage")
      ? ["Pilgrims", "Families", "Groups"]
      : pkg.categorySlugs.includes("honeymoon")
        ? ["Couples", "Honeymooners"]
        : ["Families", "Friend groups", "Couples"],
    totalDistanceKm: pkg.days * 120,
    gallery: gallery(pkg.slug, [
      { url: pkg.image, alt: pkg.imageAlt, kind: "destination" },
      { url: heroHotels, alt: `Sample ${pkg.hotelCategory} room used on the ${pkg.title} itinerary`, kind: "hotel" },
      { url: heroFleet, alt: `${pkg.vehicleCategory} used on the ${pkg.title} itinerary`, kind: "vehicle" },
    ]),
    days: days(
      pkg.slug,
      summary.map((line, index) => ({
        title: line.replace(/^Day\s*\d+\s*—\s*/i, "") || `Day ${index + 1}`,
        route: index === 0 ? `${pkg.startingCity} → ${pkg.destination}` : `${pkg.destination} local`,
        activities: [line.replace(/^Day\s*\d+\s*—\s*/i, "")].filter(Boolean),
        sightseeing: [],
        hotel:
          index === summary.length - 1
            ? "Not applicable — departure day"
            : `${pkg.destination} — ${pkg.hotelCategory} property`,
        meals: index === 0 ? "Dinner" : "Breakfast",
        distanceKm: index === 0 ? 150 : 80,
      })),
    ),
    hotelOptions: pkg.includesHotel
      ? [
          {
            id: `${pkg.slug}-hotel-1`,
            hotel: `${pkg.destination} partner hotel`,
            category: pkg.hotelCategory,
            roomType: "Standard double room",
            nights: pkg.nights,
            occupancy: "2 adults",
            mealPlan: "Breakfast",
            amenities: ["Hot water", "Free parking", "In-house restaurant"],
            upgradePrice: 0,
            isDefault: true,
            order: 1,
          },
          {
            id: `${pkg.slug}-hotel-2`,
            hotel: `${pkg.destination} premium partner`,
            category: "4 Star",
            roomType: "Premium room",
            nights: pkg.nights,
            occupancy: "2 adults",
            mealPlan: "Breakfast + dinner",
            amenities: ["Air conditioning", "Pool", "Restaurant", "Room service"],
            upgradePrice: 1500 * pkg.nights,
            isDefault: false,
            order: 2,
          },
        ]
      : [],
    vehicleOptions: pkg.includesVehicle
      ? [
          {
            id: `${pkg.slug}-veh-1`,
            category: pkg.vehicleCategory,
            seating: pkg.maxTravellers,
            ac: true,
            pickup: `${pkg.startingCity} pickup point`,
            drop: `${pkg.startingCity} pickup point`,
            upgradePrice: 0,
            isDefault: true,
            order: 1,
          },
        ]
      : [],
    departures: [],
    policies: policies(
      pkg.slug,
      sharedPolicies({
        hotelCategory: pkg.hotelCategory,
        vehicleCategory: pkg.vehicleCategory,
        nights: pkg.nights,
      }),
    ),
    sectionOrder: defaultSectionOrder,
  };
}

export function getPackageDetail(pkg: TourPackageRecord): PackageDetail {
  return authoredDetails.find((d) => d.packageSlug === pkg.slug) ?? derivedDetail(pkg);
}

/** Same state or shared category, never the package itself. */
export function getRelatedPackages(pkg: TourPackageRecord, limit = 3): TourPackageRecord[] {
  const others = getPublishedPackages().filter((p) => p.slug !== pkg.slug);
  const scored = others
    .map((p) => ({
      p,
      score:
        (p.state === pkg.state ? 2 : 0) +
        p.categorySlugs.filter((c) => pkg.categorySlugs.includes(c)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.p.order - b.p.order);
  const picked = scored.map((entry) => entry.p);
  return (picked.length ? picked : others).slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Estimate                                                            */
/* ------------------------------------------------------------------ */

export const CHILD_RATE_FACTOR = 0.6;

export type EstimateLine = { label: string; amount: number; note?: string };

export type PackageEstimate = {
  available: boolean;
  lines: EstimateLine[];
  total: number;
};

/**
 * Estimate only — never presented as a confirmed price.
 * Hotel upgrades are charged per paying traveller; vehicle upgrades once per trip.
 */
export function estimatePackageTotal(
  pkg: TourPackageRecord,
  opts: {
    adults: number;
    children: number;
    hotel?: PackageHotelOption;
    vehicle?: PackageVehicleOption;
  },
): PackageEstimate {
  if (!pkg.showPrice || pkg.price <= 0) {
    return { available: false, lines: [], total: 0 };
  }

  const adults = Math.max(1, opts.adults);
  const children = Math.max(0, opts.children);
  const lines: EstimateLine[] = [];

  if (pkg.priceBasis === "per-person") {
    lines.push({ label: `Adults × ${adults}`, amount: pkg.price * adults });
    if (children > 0) {
      lines.push({
        label: `Children × ${children}`,
        amount: Math.round(pkg.price * CHILD_RATE_FACTOR * children),
        note: `${Math.round(CHILD_RATE_FACTOR * 100)}% of the adult rate (5–11 years)`,
      });
    }
  } else {
    lines.push({
      label: pkg.priceBasis === "per-group" ? "Package (whole group)" : "Package base",
      amount: pkg.price,
      note: `Covers up to ${pkg.maxTravellers} travellers`,
    });
  }

  if (opts.hotel && opts.hotel.upgradePrice > 0) {
    const payingHeads = pkg.priceBasis === "per-person" ? adults + children : 1;
    lines.push({
      label: `Hotel upgrade — ${opts.hotel.hotel}`,
      amount: opts.hotel.upgradePrice * payingHeads,
      note: pkg.priceBasis === "per-person" ? "Per traveller" : "Flat for the group",
    });
  }

  if (opts.vehicle && opts.vehicle.upgradePrice > 0) {
    lines.push({
      label: `Vehicle upgrade — ${opts.vehicle.category}`,
      amount: opts.vehicle.upgradePrice,
      note: "Once per trip",
    });
  }

  return {
    available: true,
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
  };
}

export function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Reference for the enquiry/booking request record. */
export function makePackageReference(slug: string): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const prefix = slug.replace(/[^a-z]/g, "").slice(0, 3).toUpperCase() || "PKG";
  return `SZP-${prefix}-${stamp}`;
}
