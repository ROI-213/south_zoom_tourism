/**
 * Admin-managed tour package data.
 *
 * Mirrors the future `tour_packages`, `package_categories`, `package_destinations`,
 * `package_starting_cities` and `package_pricing` tables:
 *   id, slug, title, state, destination, category_slugs[], nights, days,
 *   starting_city, price, price_basis, hotel_category, vehicle_category,
 *   includes_hotel, includes_vehicle, itinerary_summary[], badges[],
 *   available_from, available_to, max_travellers, status (available/sold-out),
 *   image, image_alt, display_order, published, featured, best_seller.
 *
 * Only `published` packages are rendered publicly.
 */

import heroTours from "@/assets/hero-tours.jpg";
import heroHotels from "@/assets/hero-hotels.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import servicePilgrimage from "@/assets/service-pilgrimage.jpg";
import serviceWedding from "@/assets/service-wedding.jpg";
import servicesBanner from "@/assets/services-banner.jpg";
import pkgOoty from "@/assets/pkg-ooty.png";
import pkgAlleppey from "@/assets/pkg-alleppey.png";
import pkgNavagraha from "@/assets/pkg-navagraha.png";
import tourNavagraha from "@/assets/tour-navagraha.png";
import tourTirupati from "@/assets/tour-tirupati.png";
import tourCoorg from "@/assets/tour-coorg.png";
import destGoa from "@/assets/destinations/dest-goa.jpg";
import destHampi from "@/assets/destinations/dest_hampi_1786683714278.jpg";
import { resolvePackageImage } from "@/lib/image-map";

export type PackageCategory = {
  id: string;
  slug: string;
  label: string;
  order: number;
  visible: boolean;
};

// Dynamic cache for admin-managed packages
export let dynamicPackageRecords: TourPackageRecord[] = [];
export const setDynamicPackages = (packages: TourPackageRecord[]) => {
  dynamicPackageRecords = packages;
};

export type PriceBasis = "per-person" | "per-group" | "starting";

export type TourPackageRecord = {
  id: string;
  slug: string;
  title: string;
  state: string;
  destination: string;
  categorySlugs: string[];
  nights: number;
  days: number;
  startingCity: string;
  price: number;
  priceBasis: PriceBasis;
  /** Admin can hide public rates and show an enquiry label instead. */
  showPrice: boolean;
  hotelCategory: string;
  vehicleCategory: string;
  includesHotel: boolean;
  includesVehicle: boolean;
  maxTravellers: number;
  itinerarySummary: string[];
  badges: string[];
  availableFrom: string;
  availableTo: string;
  soldOut: boolean;
  image: string;
  imageAlt: string;
  order: number;
  published: boolean;
  featured: boolean;
  bestSeller: boolean;
};

export const packageCategories: PackageCategory[] = [
  { id: "pc-karnataka", slug: "karnataka", label: "Karnataka", order: 1, visible: true },
  { id: "pc-kerala", slug: "kerala", label: "Kerala", order: 2, visible: true },
  { id: "pc-tamil-nadu", slug: "tamil-nadu", label: "Tamil Nadu", order: 3, visible: true },
  { id: "pc-andhra", slug: "andhra-pradesh", label: "Andhra Pradesh", order: 4, visible: true },
  { id: "pc-goa", slug: "goa", label: "Goa", order: 5, visible: true },
  { id: "pc-pilgrimage", slug: "pilgrimage", label: "Pilgrimage", order: 6, visible: true },
  { id: "pc-honeymoon", slug: "honeymoon", label: "Honeymoon", order: 7, visible: true },
  { id: "pc-family", slug: "family", label: "Family", order: 8, visible: true },
  { id: "pc-group", slug: "group", label: "Group", order: 9, visible: true },
  { id: "pc-weekend", slug: "weekend", label: "Weekend", order: 10, visible: true },
  { id: "pc-customised", slug: "customised", label: "Customised", order: 11, visible: true },
];

export const packageStates = [
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Goa",
] as const;

export const hotelCategoryOptions = ["Budget", "3 Star", "4 Star", "5 Star", "Resort"];
export const vehicleCategoryOptions = ["Sedan", "SUV", "Tempo Traveller", "Mini Bus", "Bus"];

export const tourPackageRecords: TourPackageRecord[] = [
  {
    id: "tp-ooty-coonoor",
    slug: "ooty-coonoor-escape",
    title: "Ooty & Coonoor Hill Escape",
    state: "Tamil Nadu",
    destination: "Ooty",
    categorySlugs: ["tamil-nadu", "family", "weekend"],
    nights: 2,
    days: 3,
    startingCity: "Coimbatore",
    price: 8999,
    priceBasis: "per-person",
    showPrice: true,
    hotelCategory: "3 Star",
    vehicleCategory: "Sedan",
    includesHotel: true,
    includesVehicle: true,
    maxTravellers: 6,
    itinerarySummary: [
      "Day 1 — Coimbatore pickup, Coonoor tea estates, check-in",
      "Day 2 — Botanical Garden, Ooty lake, Doddabetta peak",
      "Day 3 — Rose Garden, shopping, drop at Coimbatore",
    ],
    badges: ["Best seller"],
    availableFrom: "2026-01-01",
    availableTo: "2026-12-20",
    soldOut: false,
    image: pkgOoty,
    imageAlt: "Rolling tea estates and misty hills of Ooty and Coonoor in the Nilgiris",
    order: 1,
    published: true,
    featured: true,
    bestSeller: true,
  },
  {
    id: "tp-munnar-alleppey",
    slug: "munnar-alleppey-honeymoon",
    title: "Munnar & Alleppey Honeymoon",
    state: "Kerala",
    destination: "Munnar",
    categorySlugs: ["kerala", "honeymoon"],
    nights: 4,
    days: 5,
    startingCity: "Kochi",
    price: 24999,
    priceBasis: "per-group",
    showPrice: true,
    hotelCategory: "Resort",
    vehicleCategory: "Sedan",
    includesHotel: true,
    includesVehicle: true,
    maxTravellers: 2,
    itinerarySummary: [
      "Day 1 — Kochi airport pickup, drive to Munnar",
      "Day 2 — Tea museum, Mattupetty dam, Echo point",
      "Day 3 — Eravikulam park, drive to Alleppey",
      "Day 4 — Private houseboat with sunset cruise",
      "Day 5 — Drop at Kochi",
    ],
    badges: ["Couple special"],
    availableFrom: "2026-01-01",
    availableTo: "2026-11-30",
    soldOut: false,
    image: pkgAlleppey,
    imageAlt: "Traditional Kerala houseboat on the Alleppey backwaters at golden sunset",
    order: 2,
    published: true,
    featured: true,
    bestSeller: false,
  },
  {
    id: "tp-navagraha",
    slug: "navagraha-temple-circuit",
    title: "Navagraha Temple Circuit",
    state: "Tamil Nadu",
    destination: "Kumbakonam",
    categorySlugs: ["tamil-nadu", "pilgrimage", "group"],
    nights: 2,
    days: 3,
    startingCity: "Chennai",
    price: 7499,
    priceBasis: "per-person",
    showPrice: true,
    hotelCategory: "Budget",
    vehicleCategory: "Tempo Traveller",
    includesHotel: true,
    includesVehicle: true,
    maxTravellers: 14,
    itinerarySummary: [
      "Day 1 — Chennai pickup, first four temples, check-in",
      "Day 2 — Remaining five temples with guided darshan",
      "Day 3 — Swamimalai, return to Chennai",
    ],
    badges: ["Guided darshan"],
    availableFrom: "2026-01-01",
    availableTo: "2026-12-31",
    soldOut: false,
    image: tourNavagraha,
    imageAlt: "Navagraha temple gopuram with Dravidian carvings at Kumbakonam at dawn",
    order: 3,
    published: true,
    featured: false,
    bestSeller: true,
  },
  {
    id: "tp-coorg",
    slug: "coorg-weekend-getaway",
    title: "Coorg Coffee Country Weekend",
    state: "Karnataka",
    destination: "Coorg",
    categorySlugs: ["karnataka", "weekend", "family"],
    nights: 2,
    days: 3,
    startingCity: "Bengaluru",
    price: 9499,
    priceBasis: "per-person",
    showPrice: true,
    hotelCategory: "4 Star",
    vehicleCategory: "SUV",
    includesHotel: true,
    includesVehicle: true,
    maxTravellers: 6,
    itinerarySummary: [
      "Day 1 — Bengaluru pickup, coffee estate walk",
      "Day 2 — Abbey falls, Raja's seat, Dubare elephant camp",
      "Day 3 — Talacauvery, drive back to Bengaluru",
    ],
    badges: [],
    availableFrom: "2026-01-01",
    availableTo: "2026-12-15",
    soldOut: false,
    image: tourCoorg,
    imageAlt: "Coffee estate and misty valley morning in Coorg Karnataka",
    order: 4,
    published: true,
    featured: false,
    bestSeller: false,
  },
  {
    id: "tp-goa-beach",
    slug: "goa-beach-break",
    title: "North Goa Beach Break",
    state: "Goa",
    destination: "North Goa",
    categorySlugs: ["goa", "group", "weekend"],
    nights: 3,
    days: 4,
    startingCity: "Bengaluru",
    price: 13999,
    priceBasis: "per-person",
    showPrice: true,
    hotelCategory: "3 Star",
    vehicleCategory: "Tempo Traveller",
    includesHotel: true,
    includesVehicle: true,
    maxTravellers: 12,
    itinerarySummary: [
      "Day 1 — Arrival, Baga and Calangute beaches",
      "Day 2 — Fort Aguada, Sinquerim, cruise",
      "Day 3 — Dudhsagar day trip",
      "Day 4 — Departure transfer",
    ],
    badges: ["Group friendly"],
    availableFrom: "2026-01-01",
    availableTo: "2026-05-31",
    soldOut: true,
    image: destGoa,
    imageAlt: "Tropical palm beach with turquoise sea on the North Goa coastline",
    order: 5,
    published: true,
    featured: false,
    bestSeller: false,
  },
  {
    id: "tp-tirupati",
    slug: "tirupati-darshan-package",
    title: "Tirupati Darshan Package",
    state: "Andhra Pradesh",
    destination: "Tirupati",
    categorySlugs: ["andhra-pradesh", "pilgrimage", "family"],
    nights: 1,
    days: 2,
    startingCity: "Chennai",
    price: 5499,
    priceBasis: "per-person",
    showPrice: true,
    hotelCategory: "Budget",
    vehicleCategory: "SUV",
    includesHotel: true,
    includesVehicle: true,
    maxTravellers: 7,
    itinerarySummary: [
      "Day 1 — Chennai pickup, Tirupati check-in, local temples",
      "Day 2 — Tirumala darshan, return to Chennai",
    ],
    badges: [],
    availableFrom: "2026-01-01",
    availableTo: "2026-12-31",
    soldOut: false,
    image: tourTirupati,
    imageAlt: "Tirumala Venkateswara temple gopuram at sunrise with pilgrims",
    order: 6,
    published: true,
    featured: false,
    bestSeller: true,
  },
  {
    id: "tp-hampi",
    slug: "hampi-heritage-trail",
    title: "Hampi Heritage Trail",
    state: "Karnataka",
    destination: "Hampi",
    categorySlugs: ["karnataka", "group"],
    nights: 2,
    days: 3,
    startingCity: "Bengaluru",
    price: 10999,
    priceBasis: "per-person",
    showPrice: false,
    hotelCategory: "3 Star",
    vehicleCategory: "Tempo Traveller",
    includesHotel: true,
    includesVehicle: true,
    maxTravellers: 12,
    itinerarySummary: [
      "Day 1 — Overnight drive from Bengaluru",
      "Day 2 — Virupaksha temple, Vittala complex, coracle ride",
      "Day 3 — Anegundi, Hemakuta hill, return",
    ],
    badges: ["Heritage guide"],
    availableFrom: "2026-06-01",
    availableTo: "2026-12-31",
    soldOut: false,
    image: destHampi,
    imageAlt: "Ancient stone chariot at the Vittala temple complex at sunset in Hampi",
    order: 7,
    published: true,
    featured: false,
    bestSeller: false,
  },
  {
    id: "tp-custom",
    slug: "customised-south-india-tour",
    title: "Customised South India Tour",
    state: "Tamil Nadu",
    destination: "Multi-city",
    categorySlugs: ["customised", "family", "group"],
    nights: 5,
    days: 6,
    startingCity: "Chennai",
    price: 0,
    priceBasis: "starting",
    showPrice: false,
    hotelCategory: "4 Star",
    vehicleCategory: "SUV",
    includesHotel: true,
    includesVehicle: true,
    maxTravellers: 20,
    itinerarySummary: [
      "Pick your destinations, nights and hotel category",
      "We build the route, vehicle and sightseeing plan",
      "Confirm once the quote and inclusions look right",
    ],
    badges: ["Built for you"],
    availableFrom: "2026-01-01",
    availableTo: "2026-12-31",
    soldOut: false,
    image: serviceWedding,
    imageAlt: "Travel desk planning a customised South India itinerary",
    order: 8,
    published: true,
    featured: true,
    bestSeller: false,
  },
  {
    id: "tp-draft",
    slug: "andaman-add-on",
    title: "Andaman Add-on (draft)",
    state: "Andhra Pradesh",
    destination: "Port Blair",
    categorySlugs: ["family"],
    nights: 3,
    days: 4,
    startingCity: "Chennai",
    price: 21999,
    priceBasis: "per-person",
    showPrice: true,
    hotelCategory: "4 Star",
    vehicleCategory: "Sedan",
    includesHotel: true,
    includesVehicle: false,
    maxTravellers: 6,
    itinerarySummary: [],
    badges: [],
    availableFrom: "2026-01-01",
    availableTo: "2026-12-31",
    soldOut: false,
    image: heroFleet,
    imageAlt: "Draft package placeholder image",
    order: 9,
    published: false,
    featured: false,
    bestSeller: false,
  },
];

export const packagesBannerBlock = {
  visible: true,
  title: "Tour Packages",
  subtitle:
    "Ready-to-book itineraries across Tamil Nadu, Kerala, Karnataka, Andhra Pradesh and Goa — stays, transfers and sightseeing planned end to end.",
  image: heroTours,
  imageAlt: "Winding hill road through South Indian tea country",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Tour Packages", href: "/tour-packages" },
  ],
};

export const packagesIntroBlock = {
  visible: true,
  heading: "Pick a route, or let us build one",
  body: "Every package below lists its starting city, duration, hotel category and the vehicle you travel in. Prices marked per person are for the stated group size; per-group prices cover the whole party. Nothing is locked — swap a hotel, add a night or change the pickup city and we will requote the same day.",
};

export const packageSortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "duration-asc", label: "Duration: shortest" },
  { value: "duration-desc", label: "Duration: longest" },
] as const;

export type PackageSortValue = (typeof packageSortOptions)[number]["value"];

export const packagesPerPage = 6;

export function getPublishedPackages(): TourPackageRecord[] {
  if (dynamicPackageRecords.length) {
    return dynamicPackageRecords.filter((p) => p.published);
  }
  return tourPackageRecords.filter((p) => p.published);
}

export function getPackageCategoryLabel(slug: string): string {
  return packageCategories.find((c) => c.slug === slug)?.label ?? slug;
}

export function getPackageDestinations(): string[] {
  return Array.from(new Set(getPublishedPackages().map((p) => p.destination))).sort();
}

export function getPackageStartingCities(): string[] {
  return Array.from(new Set(getPublishedPackages().map((p) => p.startingCity))).sort();
}

export function getPackageStates(): string[] {
  return Array.from(new Set(getPublishedPackages().map((p) => p.state))).sort();
}

export const packageBudgetBounds = {
  min: 0,
  max: Math.max(...getPublishedPackages().map((p) => p.price), 25000),
};

export function formatPackagePrice(pkg: TourPackageRecord): {
  amount: string;
  basis: string;
} {
  if (!pkg.showPrice || pkg.price <= 0) {
    return { amount: "On request", basis: "Contact for a quote" };
  }
  const amount = `₹${pkg.price.toLocaleString("en-IN")}`;
  const basis =
    pkg.priceBasis === "per-person"
      ? "per person"
      : pkg.priceBasis === "per-group"
        ? "per group"
        : "starting from";
  return { amount, basis };
}

/** A package is bookable when it is not sold out and today falls in its window. */
export function isPackageAvailableOn(pkg: TourPackageRecord, date: string): boolean {
  if (pkg.soldOut) return false;
  if (!date) return true;
  return date >= pkg.availableFrom && date <= pkg.availableTo;
}

/** Map a Supabase `tour_packages` row to the front-end TourPackageRecord shape. */
export function mapDbPackageToRecord(row: any, index: number = 0): TourPackageRecord {
  return {
    id: row.id ?? `tp-${index}`,
    slug: row.slug ?? "",
    title: row.title ?? "",
    state: row.state ?? "",
    destination: row.destination ?? row.category ?? "",
    categorySlugs: Array.isArray(row.category_slugs)
      ? row.category_slugs
      : row.category
        ? [row.category.toLowerCase().replace(/\s+/g, "-")]
        : [],
    nights: row.nights ?? 0,
    days: row.days ?? (row.nights ? row.nights + 1 : 0),
    startingCity: row.starting_city ?? "",
    price: row.price_from ?? row.price ?? 0,
    priceBasis: (row.price_basis as PriceBasis) ?? "per-person",
    showPrice: row.show_price !== false,
    hotelCategory: row.hotel_category ?? "3 Star",
    vehicleCategory: row.vehicle_category ?? "Sedan",
    includesHotel: row.includes_hotel !== false,
    includesVehicle: row.includes_vehicle !== false,
    maxTravellers: row.max_travellers ?? 20,
    itinerarySummary: Array.isArray(row.highlights)
      ? row.highlights
      : Array.isArray(row.itinerary_summary)
        ? row.itinerary_summary
        : [],
    badges: Array.isArray(row.badges) ? row.badges : [],
    availableFrom: row.available_from ?? "2024-01-01",
    availableTo: row.available_to ?? "2030-12-31",
    soldOut: row.sold_out ?? false,
    image: resolvePackageImage(row.main_image ?? row.image, `${row.slug} ${row.title} ${row.category}`),
    imageAlt: row.image_alt ?? row.title ?? "",
    order: row.display_order ?? index + 1,
    published: row.active !== false,
    featured: row.featured ?? false,
    bestSeller: row.best_seller ?? false,
  };
}
