/**
 * Admin-managed destination data.
 *
 * Mirrors the future `destinations`, `destination_trip_types`,
 * `destination_packages`, `destination_hotels` and
 * `destination_recommended_services` tables:
 *   id, slug, name, state, region, short_description, best_time,
 *   trip_type_slugs[], highlights[], package_slugs[], hotel_ids[],
 *   recommended_vehicles[], recommended_service_slugs[],
 *   image, image_alt, display_order, published, popular, featured.
 *
 * Only `published` destinations are rendered publicly. Package and hotel
 * counts are derived relationally from the linked records so the numbers on a
 * card can never drift from the catalogue.
 */

import heroTours from "@/assets/hero-tours.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import servicesBanner from "@/assets/services-banner.jpg";
import destKodaikanal from "@/assets/destinations/dest-kodaikanal-new.png";
import destTirupati from "@/assets/destinations/dest-tirupati-new.png";
import destChikkamagaluru from "@/assets/destinations/dest-chikkamagaluru-new.png";
import destMunnarNew from "@/assets/destinations/dest-munnar-new2.png";
import destBengaluruNew from "@/assets/destinations/dest-bengaluru-new.jpg";
import destMysuruNew from "@/assets/destinations/dest-mysuru-new.jpg";
import destOotyNew2 from "@/assets/destinations/dest-ooty-new2.jpg";
import destGoaNew2 from "@/assets/destinations/dest-goa-new2.jpg";
import { hotels } from "@/content/site";
import { getPublishedPackages } from "@/content/tour-packages";

export type DestinationTripType = {
  id: string;
  slug: string;
  label: string;
  order: number;
  visible: boolean;
};

export type DestinationRecord = {
  id: string;
  slug: string;
  name: string;
  state: string;
  region: string;
  shortDescription: string;
  bestTime: string;
  /** Ideal trip length shown on the card. */
  idealDuration: string;
  tripTypeSlugs: string[];
  highlights: string[];
  /** Relational links into the package catalogue. */
  packageSlugs: string[];
  /** Relational links into the hotel catalogue. */
  hotelIds: string[];
  recommendedVehicles: string[];
  recommendedServiceSlugs: string[];
  image: string;
  imageAlt: string;
  order: number;
  published: boolean;
  popular: boolean;
  featured: boolean;
};

export const destinationTripTypes: DestinationTripType[] = [
  { id: "dt-hill", slug: "hill-station", label: "Hill station", order: 1, visible: true },
  { id: "dt-beach", slug: "beach", label: "Beach", order: 2, visible: true },
  { id: "dt-pilgrimage", slug: "pilgrimage", label: "Pilgrimage", order: 3, visible: true },
  { id: "dt-heritage", slug: "heritage", label: "Heritage", order: 4, visible: true },
  { id: "dt-wildlife", slug: "wildlife", label: "Wildlife", order: 5, visible: true },
  { id: "dt-city", slug: "city-break", label: "City break", order: 6, visible: true },
  { id: "dt-honeymoon", slug: "honeymoon", label: "Honeymoon", order: 7, visible: true },
  { id: "dt-weekend", slug: "weekend", label: "Weekend", order: 8, visible: true },
];

export const destinationRecords: DestinationRecord[] = [
  {
    id: "dest-bengaluru",
    slug: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    region: "South India",
    shortDescription:
      "Karnataka's garden capital and the easiest launch point for Coorg, Mysuru and Chikkamagaluru road trips.",
    bestTime: "October to February",
    idealDuration: "1 – 2 days",
    tripTypeSlugs: ["city-break", "weekend"],
    highlights: ["Lalbagh & Cubbon Park", "Bangalore Palace", "Nandi Hills sunrise"],
    packageSlugs: ["coorg-weekend-getaway"],
    hotelIds: ["h-marina"],
    recommendedVehicles: ["Sedan", "SUV", "Tempo Traveller"],
    recommendedServiceSlugs: ["airport-transfers", "corporate-travel", "local-taxi"],
    image: destBengaluruNew,
    imageAlt: "Vidhana Soudha, the seat of the Karnataka government in Bengaluru",
    order: 1,
    published: true,
    popular: true,
    featured: false,
  },
  {
    id: "dest-mysuru",
    slug: "mysuru",
    name: "Mysuru",
    state: "Karnataka",
    region: "South India",
    shortDescription:
      "Palace city of Karnataka with Chamundi Hill, Brindavan Gardens and a heritage core made for slow sightseeing.",
    bestTime: "September to February",
    idealDuration: "1 – 2 days",
    tripTypeSlugs: ["heritage", "weekend", "city-break"],
    highlights: ["Mysore Palace", "Chamundeshwari Temple", "Brindavan Gardens"],
    packageSlugs: ["coorg-weekend-getaway"],
    hotelIds: ["h-templestay"],
    recommendedVehicles: ["Sedan", "SUV"],
    recommendedServiceSlugs: ["outstation-trips", "custom-tour-planning"],
    image: destMysuruNew,
    imageAlt: "Illuminated Mysuru Palace glowing against the night sky",
    order: 2,
    published: true,
    popular: true,
    featured: true,
  },
  {
    id: "dest-coorg",
    slug: "coorg",
    name: "Coorg",
    state: "Karnataka",
    region: "Western Ghats",
    shortDescription:
      "Coffee estates, misty valleys and waterfalls — Karnataka's favourite two-night escape from Bengaluru.",
    bestTime: "October to March",
    idealDuration: "2 – 3 days",
    tripTypeSlugs: ["hill-station", "weekend", "honeymoon"],
    highlights: ["Abbey Falls", "Raja's Seat", "Dubare elephant camp"],
    packageSlugs: ["coorg-weekend-getaway"],
    hotelIds: ["h-hillview"],
    recommendedVehicles: ["SUV", "Tempo Traveller"],
    recommendedServiceSlugs: ["custom-tour-planning", "outstation-trips"],
    image: heroTours,
    imageAlt: "Coffee plantations under morning mist in Coorg",
    order: 3,
    published: true,
    popular: true,
    featured: true,
  },
  {
    id: "dest-chikkamagaluru",
    slug: "chikkamagaluru",
    name: "Chikkamagaluru",
    state: "Karnataka",
    region: "Western Ghats",
    shortDescription:
      "Mullayanagiri peaks, coffee country homestays and quiet ghat roads for travellers who want fewer crowds.",
    bestTime: "September to February",
    idealDuration: "2 – 3 days",
    tripTypeSlugs: ["hill-station", "wildlife", "weekend"],
    highlights: ["Mullayanagiri summit", "Baba Budangiri", "Hebbe Falls"],
    packageSlugs: [],
    hotelIds: ["h-hillview"],
    recommendedVehicles: ["SUV"],
    recommendedServiceSlugs: ["outstation-trips", "custom-tour-planning"],
    image: destChikkamagaluru,
    imageAlt: "Green coffee estate hills and Mullayanagiri peak in Chikkamagaluru",
    order: 4,
    published: true,
    popular: false,
    featured: false,
  },
  {
    id: "dest-ooty",
    slug: "ooty",
    name: "Ooty",
    state: "Tamil Nadu",
    region: "Nilgiris",
    shortDescription:
      "The Nilgiri queen of hill stations — tea gardens, the toy train and Coonoor's viewpoints in one loop.",
    bestTime: "October to June",
    idealDuration: "2 – 3 days",
    tripTypeSlugs: ["hill-station", "honeymoon", "weekend"],
    highlights: ["Botanical Garden", "Nilgiri toy train", "Doddabetta peak"],
    packageSlugs: ["ooty-coonoor-escape"],
    hotelIds: ["h-hillview"],
    recommendedVehicles: ["Sedan", "SUV", "Tempo Traveller"],
    recommendedServiceSlugs: ["custom-tour-planning", "outstation-trips", "hotel-and-room-booking"],
    image: destOotyNew2,
    imageAlt: "Boats on the serene lake at Ooty in the Nilgiris",
    order: 5,
    published: true,
    popular: true,
    featured: true,
  },
  {
    id: "dest-kodaikanal",
    slug: "kodaikanal",
    name: "Kodaikanal",
    state: "Tamil Nadu",
    region: "Palani Hills",
    shortDescription:
      "Pine forests, a star-shaped lake and cool weather all year — an easy hill break from Madurai and Coimbatore.",
    bestTime: "September to May",
    idealDuration: "2 days",
    tripTypeSlugs: ["hill-station", "honeymoon", "weekend"],
    highlights: ["Kodai Lake", "Coaker's Walk", "Pillar Rocks"],
    packageSlugs: [],
    hotelIds: ["h-hillview"],
    recommendedVehicles: ["Sedan", "SUV"],
    recommendedServiceSlugs: ["custom-tour-planning", "outstation-trips"],
    image: destKodaikanal,
    imageAlt: "Kodai Lake surrounded by pine forests in Kodaikanal",
    order: 6,
    published: true,
    popular: true,
    featured: false,
  },
  {
    id: "dest-munnar",
    slug: "munnar",
    name: "Munnar",
    state: "Kerala",
    region: "Western Ghats",
    shortDescription:
      "Kerala's tea capital, layered with plantations, Eravikulam National Park and cottage stays above the clouds.",
    bestTime: "September to March",
    idealDuration: "3 – 4 days",
    tripTypeSlugs: ["hill-station", "honeymoon", "wildlife"],
    highlights: ["Tea museum", "Eravikulam park", "Mattupetty dam"],
    packageSlugs: ["munnar-alleppey-honeymoon"],
    hotelIds: ["h-hillview", "h-backwater"],
    recommendedVehicles: ["SUV", "Tempo Traveller"],
    recommendedServiceSlugs: ["custom-tour-planning", "hotel-and-room-booking"],
    image: destMunnarNew,
    imageAlt: "Tea plantations stretching across misty hills of Munnar Kerala",
    order: 7,
    published: true,
    popular: true,
    featured: true,
  },
  {
    id: "dest-wayanad",
    slug: "wayanad",
    name: "Wayanad",
    state: "Kerala",
    region: "Western Ghats",
    shortDescription:
      "Spice plantations, Edakkal caves and wildlife sanctuaries — Kerala's greenest touring district.",
    bestTime: "October to May",
    idealDuration: "2 – 3 days",
    tripTypeSlugs: ["hill-station", "wildlife", "weekend"],
    highlights: ["Edakkal caves", "Banasura Sagar dam", "Wildlife sanctuary safari"],
    packageSlugs: [],
    hotelIds: ["h-hillview"],
    recommendedVehicles: ["SUV", "Tempo Traveller"],
    recommendedServiceSlugs: ["outstation-trips", "custom-tour-planning"],
    image: heroTours,
    imageAlt: "Misty forest and paddy fields in Wayanad",
    order: 8,
    published: true,
    popular: false,
    featured: false,
  },
  {
    id: "dest-goa",
    slug: "goa",
    name: "Goa",
    state: "Goa",
    region: "Konkan coast",
    shortDescription:
      "North and South Goa beaches, Portuguese churches and sunset cruises with airport transfers arranged.",
    bestTime: "November to February",
    idealDuration: "3 – 4 days",
    tripTypeSlugs: ["beach", "honeymoon", "weekend"],
    highlights: ["Baga & Calangute", "Old Goa churches", "Mandovi sunset cruise"],
    packageSlugs: ["goa-beach-break"],
    hotelIds: ["h-marina"],
    recommendedVehicles: ["Sedan", "SUV", "Tempo Traveller"],
    recommendedServiceSlugs: ["airport-transfers", "custom-tour-planning"],
    image: destGoaNew2,
    imageAlt: "Palm-lined Palolem beach with golden sand on the Goa coast",
    order: 9,
    published: true,
    popular: true,
    featured: true,
  },
  {
    id: "dest-tirupati",
    slug: "tirupati",
    name: "Tirupati",
    state: "Andhra Pradesh",
    region: "Rayalaseema",
    shortDescription:
      "Tirumala darshan with planned slot timings, local temple circuits and same-day return options.",
    bestTime: "September to March",
    idealDuration: "1 – 2 days",
    tripTypeSlugs: ["pilgrimage", "weekend"],
    highlights: ["Tirumala darshan", "Padmavathi temple", "Kapila Theertham"],
    packageSlugs: ["tirupati-darshan-package"],
    hotelIds: ["h-templestay"],
    recommendedVehicles: ["Sedan", "SUV", "Tempo Traveller", "Mini Bus"],
    recommendedServiceSlugs: ["pilgrimage-tours", "outstation-trips"],
    image: destTirupati,
    imageAlt: "Tirumala Venkateswara Temple gopuram with pilgrims at Tirupati",
    order: 10,
    published: true,
    popular: true,
    featured: false,
  },
  {
    id: "dest-hampi",
    slug: "hampi",
    name: "Hampi",
    state: "Karnataka",
    region: "Deccan plateau",
    shortDescription:
      "A UNESCO ruin field of temples, boulders and river ghats best explored with a guide across two full days.",
    bestTime: "October to February",
    idealDuration: "2 days",
    tripTypeSlugs: ["heritage", "weekend"],
    highlights: ["Virupaksha temple", "Vittala stone chariot", "Matanga Hill sunset"],
    packageSlugs: ["hampi-heritage-trail"],
    hotelIds: ["h-templestay"],
    recommendedVehicles: ["SUV", "Tempo Traveller"],
    recommendedServiceSlugs: ["custom-tour-planning", "outstation-trips"],
    image: servicesBanner,
    imageAlt: "Stone temple ruins and boulders at Hampi",
    order: 11,
    published: true,
    popular: false,
    featured: false,
  },
  {
    id: "dest-gokarna",
    slug: "gokarna",
    name: "Gokarna",
    state: "Karnataka",
    region: "Konkan coast",
    shortDescription:
      "Quiet beach coves and the Mahabaleshwar temple town — a calmer coastal alternative to Goa.",
    bestTime: "October to February",
    idealDuration: "2 days",
    tripTypeSlugs: ["beach", "pilgrimage", "weekend"],
    highlights: ["Om Beach", "Mahabaleshwar temple", "Half Moon beach trek"],
    packageSlugs: [],
    hotelIds: ["h-backwater"],
    recommendedVehicles: ["Sedan", "SUV"],
    recommendedServiceSlugs: ["outstation-trips", "custom-tour-planning"],
    image: heroFleet,
    imageAlt: "Crescent beach and headland at Gokarna",
    order: 12,
    published: true,
    popular: false,
    featured: false,
  },
];

/* ------------------------------------------------------------------ */
/* Editable page blocks                                                 */
/* ------------------------------------------------------------------ */

export const destinationsBannerBlock = {
  visible: true,
  title: "Destinations We Cover",
  subtitle:
    "Hill stations, beaches, temple towns and heritage circuits across South India — each one connected to ready packages, partner hotels and the right vehicle for the route.",
  image: heroTours,
  imageAlt: "Winding ghat road through South Indian hills",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
  ],
};

export const destinationsIntroBlock = {
  visible: true,
  heading: "Start with a place, we'll handle the rest",
  body: "Every destination below is linked to the packages, partner hotels and vehicle categories we actually operate there. Pick one to see its trips, stays and recommended services, or send us your dates and we will build a route around it.",
};

export const destinationsCtaBlock = {
  visible: true,
  heading: "Don't see the place you have in mind?",
  body: "We run custom routes across South India — multi-state circuits, temple trails, corporate offsites and family holidays. Share your dates, group size and budget and we will send a costed itinerary the same day.",
  primary: { label: "Plan a custom trip", href: "/contact-us" },
  secondary: { label: "Browse tour packages", href: "/tour-packages" },
};

export const destinationSortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "name-asc", label: "Name (A – Z)" },
  { value: "packages-desc", label: "Most packages" },
] as const;

export type DestinationSortValue = (typeof destinationSortOptions)[number]["value"];

export const destinationsPerPage = 9;

/* ------------------------------------------------------------------ */
/* Derived helpers                                                      */
/* ------------------------------------------------------------------ */

export function getPublishedDestinations(): DestinationRecord[] {
  return destinationRecords
    .filter((d) => d.published)
    .slice()
    .sort((a, b) => a.order - b.order);
}

export function getDestinationBySlug(slug: string): DestinationRecord | undefined {
  return destinationRecords.find((d) => d.slug === slug && d.published);
}

export function getDestinationStates(): string[] {
  return Array.from(new Set(getPublishedDestinations().map((d) => d.state))).sort();
}

export function getTripTypeLabel(slug: string): string {
  return destinationTripTypes.find((t) => t.slug === slug)?.label ?? slug;
}

/** Packages linked to a destination, matched relationally then by name/state. */
export function getDestinationPackages(destination: DestinationRecord) {
  const published = getPublishedPackages();
  const linked = published.filter((pkg) => destination.packageSlugs.includes(pkg.slug));
  const byName = published.filter(
    (pkg) =>
      !linked.includes(pkg) &&
      (pkg.destination.toLowerCase().includes(destination.name.toLowerCase()) ||
        destination.name.toLowerCase().includes(pkg.destination.toLowerCase())),
  );
  return [...linked, ...byName];
}

export function getDestinationHotels(destination: DestinationRecord) {
  return hotels.filter((hotel) => destination.hotelIds.includes(hotel.id));
}

export function getDestinationPackageCount(destination: DestinationRecord): number {
  return getDestinationPackages(destination).length;
}

export function getDestinationHotelCount(destination: DestinationRecord): number {
  return getDestinationHotels(destination).length;
}

export function getFeaturedDestinations(): DestinationRecord[] {
  return getPublishedDestinations().filter((d) => d.featured);
}

export function getPopularDestinations(): DestinationRecord[] {
  return getPublishedDestinations().filter((d) => d.popular);
}

export type DestinationFilterState = {
  query: string;
  state: string;
  tripType: string;
  popularity: string; // "all" | "popular" | "featured"
};

export const defaultDestinationFilters: DestinationFilterState = {
  query: "",
  state: "all",
  tripType: "all",
  popularity: "all",
};

export function filterDestinations(
  filters: DestinationFilterState,
  sort: DestinationSortValue,
): DestinationRecord[] {
  const q = filters.query.trim().toLowerCase();
  const list = getPublishedDestinations().filter((d) => {
    if (
      q &&
      ![d.name, d.state, d.region, d.shortDescription, ...d.highlights]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
      return false;
    if (filters.state !== "all" && d.state !== filters.state) return false;
    if (filters.tripType !== "all" && !d.tripTypeSlugs.includes(filters.tripType)) return false;
    if (filters.popularity === "popular" && !d.popular) return false;
    if (filters.popularity === "featured" && !d.featured) return false;
    return true;
  });

  switch (sort) {
    case "name-asc":
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    case "packages-desc":
      return [...list].sort(
        (a, b) =>
          getDestinationPackageCount(b) - getDestinationPackageCount(a) || a.order - b.order,
      );
    default:
      return [...list].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.popular) - Number(a.popular) ||
          a.order - b.order,
      );
  }
}
