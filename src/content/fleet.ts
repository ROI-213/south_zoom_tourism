/**
 * Admin-managed fleet data.
 *
 * Mirrors the future `vehicles`, `vehicle_categories`, `vehicle_media` and
 * `vehicle_pricing` tables:
 *   id, slug, name, brand, model, category_slug, seats, luggage, ac, fuel,
 *   price_per_km, price_from_label, availability, availability_text,
 *   allow_enquiry_when_unavailable, features[], image, image_alt,
 *   display_order, published, featured, popular.
 *
 * Only `published` vehicles are rendered publicly.
 */

import heroFleet from "@/assets/hero-fleet.jpg";
import heroTours from "@/assets/hero-tours.jpg";
import serviceCorporate from "@/assets/service-corporate-new.png";
import serviceGroup from "@/assets/service-group.png";
import carInnova from "@/assets/car-innova.png";
import carErtiga from "@/assets/car-ertiga.png";
import carDzire from "@/assets/car-dzire.png";
import fleetSedan from "@/assets/fleet-sedan.png";
import fleetSuv from "@/assets/fleet-suv.png";
import fleetTempo from "@/assets/fleet-tempo.png";
import fleetBus from "@/assets/fleet-bus.png";

export type VehicleCategory = { id: string; slug: string; label: string; order: number; visible: boolean };

export type TripType = "local" | "outstation" | "airport" | "group";

export type FleetVehicle = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  categorySlug: string;
  seats: number;
  luggage: number;
  ac: boolean;
  fuel?: string;
  pricePerKm: number;
  priceFromLabel: string;
  available: boolean;
  availabilityText: string;
  allowEnquiryWhenUnavailable: boolean;
  tripTypes: TripType[];
  features: string[];
  image: string;
  imageAlt: string;
  order: number;
  published: boolean;
  featured: boolean;
  popular: number;
};

export const vehicleCategories: VehicleCategory[] = [
  { id: "vc-sedan", slug: "sedan", label: "Sedan", order: 1, visible: true },
  { id: "vc-suv", slug: "suv", label: "SUV", order: 2, visible: true },
  { id: "vc-tempo", slug: "tempo-traveller", label: "Tempo Traveller (TT)", order: 3, visible: true },
  { id: "vc-bus", slug: "bus", label: "Bus", order: 4, visible: true },
];

export const tripTypeOptions: { value: TripType; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "outstation", label: "Outstation" },
  { value: "airport", label: "Airport" },
  { value: "group", label: "Group" },
];

export const fleetVehicles: FleetVehicle[] = [
  {
    id: "fv-dzire", slug: "maruti-dzire", name: "Maruti Dzire / Etios (Sedan)", brand: "Maruti Suzuki / Toyota", model: "Dzire ZXi",
    categorySlug: "sedan", seats: 4, luggage: 2, ac: true, fuel: "Petrol",
    pricePerKm: 14, priceFromLabel: "₹14 / km", available: true, availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true, tripTypes: ["local", "outstation", "airport"],
    features: ["Boot space for 2-3 bags", "GPS tracked", "Yellow South Zoom Tourism board", "Ideal for small families"],
    image: fleetSedan, imageAlt: "White Maruti Dzire sedan taxi with yellow South Zoom Tourism board",
    order: 1, published: true, featured: true, popular: 96,
  },
  {
    id: "fv-ertiga", slug: "maruti-ertiga", name: "Maruti Ertiga / Innova Crysta (SUV)", brand: "Toyota / Maruti", model: "Innova Crysta / Ertiga",
    categorySlug: "suv", seats: 7, luggage: 4, ac: true, fuel: "Diesel",
    pricePerKm: 20, priceFromLabel: "₹20 / km", available: true, availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true, tripTypes: ["local", "outstation", "airport", "group"],
    features: ["7-seater luxury seating", "Extra legroom", "Yellow South Zoom Tourism board", "Best for family outstation trips"],
    image: fleetSuv, imageAlt: "White Toyota Innova Crysta SUV taxi with yellow South Zoom Tourism board",
    order: 2, published: true, featured: true, popular: 100,
  },
  {
    id: "fv-tempo12", slug: "tempo-traveller-12", name: "Tempo Traveller (12-17 Seater)", brand: "Force Motors", model: "Traveller 3350",
    categorySlug: "tempo-traveller", seats: 12, luggage: 10, ac: true, fuel: "Diesel",
    pricePerKm: 24, priceFromLabel: "₹24 / km", available: true, availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true, tripTypes: ["local", "outstation", "group"],
    features: ["Push-back recliner seats", "Yellow South Zoom Tourism board", "Overhead luggage rack", "Music system"],
    image: fleetTempo, imageAlt: "White 12-seater Tempo Traveller with yellow South Zoom Tourism board",
    order: 3, published: true, featured: true, popular: 89,
  },
  {
    id: "fv-bus27", slug: "mini-bus-27", name: "Tourist Bus (27-45 Seater)", brand: "Tata / Volvo", model: "Starbus 27 / Volvo",
    categorySlug: "bus", seats: 35, luggage: 25, ac: true, fuel: "Diesel",
    pricePerKm: 38, priceFromLabel: "₹38 / km", available: true, availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true, tripTypes: ["outstation", "group"],
    features: ["Air-conditioned luxury coach", "Yellow South Zoom Tourism board", "Push-back seats", "Ample luggage bay"],
    image: fleetBus, imageAlt: "White Tourist Bus coach with yellow South Zoom Tourism board",
    order: 4, published: true, featured: true, popular: 75,
  },
];

export const fleetBannerBlock = {
  id: "fleet-banner",
  order: 1,
  visible: true,
  title: "Our Fleet",
  subtitle:
    "Hatchbacks to 45-seater coaches — sanitised, insured, GPS-tracked and driven by verified chauffeurs, at published per-kilometre rates.",
  image: heroFleet,
  imageAlt: "South Zoom Tourism fleet of sedans, SUVs and tempo travellers ready for travel",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Fleet", href: "/fleet" },
  ],
};

export const fleetIntroBlock = {
  id: "fleet-intro",
  order: 2,
  visible: true,
  heading: "Compare vehicles and pick what fits your trip",
  body: "Filter by size, comfort, luggage space and trip type. Every rate below includes fuel, driver charges and maintenance — tolls, permits and parking are billed at actuals and always shown before you confirm.",
};

export const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "capacity", label: "Passenger capacity" },
  { value: "popularity", label: "Popularity" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

export function getPublishedVehicles(): FleetVehicle[] {
  return fleetVehicles.filter((v) => v.published).sort((a, b) => a.order - b.order);
}

export function getVisibleVehicleCategories(): VehicleCategory[] {
  const used = new Set(getPublishedVehicles().map((v) => v.categorySlug));
  return vehicleCategories.filter((c) => c.visible && used.has(c.slug)).sort((a, b) => a.order - b.order);
}

export function getVehicleCategoryLabel(slug: string): string {
  return vehicleCategories.find((c) => c.slug === slug)?.label ?? slug;
}

export function getVehicleBySlug(slug: string): FleetVehicle | undefined {
  return getPublishedVehicles().find((v) => v.slug === slug);
}

export const fleetPriceBounds = (() => {
  const prices = getPublishedVehicles().map((v) => v.pricePerKm);
  return { min: Math.min(...prices), max: Math.max(...prices) };
})();
