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
import carInnova from "@/assets/car-innova.png";
import carErtiga from "@/assets/car-ertiga.png";
import carDzire from "@/assets/car-dzire.png";
import fleetWagonr from "@/assets/fleet-wagonr-ka.jpg";
import fleetDzire from "@/assets/fleet-dzire-new.png";
import fleetErtiga from "@/assets/fleet-ertiga-new.png";
import fleetInnova from "@/assets/fleet-innova-new.png";
import fleetTempo from "@/assets/fleet-tempo-new.png";
import fleetUrbania from "@/assets/fleet-urbania-ka.jpg";
import fleetBus from "@/assets/fleet-bus-ka.jpg";
import fleetBmw from "@/assets/fleet-bmw-new.png";
import { resolveVehicleImage } from "@/lib/image-map";
import { matchVehicleToFareConfig } from "@/lib/fleet-matcher";

export type VehicleCategory = {
  id: string;
  slug: string;
  label: string;
  order: number;
  visible: boolean;
};

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

// Dynamic cache for admin-managed fleet vehicles
export let dynamicFleetVehicles: FleetVehicle[] = [];
export const setDynamicFleetVehicles = (vehicles: FleetVehicle[]) => {
  dynamicFleetVehicles = vehicles;
};

export function getStandardVehiclePrice(slugOrNameOrCategory: string, customPrice?: number): number {
  if (typeof customPrice === 'number' && customPrice > 0) return customPrice;
  const lower = (slugOrNameOrCategory || "").toLowerCase();
  if (lower.includes("hatchback") || lower.includes("wagonr")) return 12;
  if (lower.includes("dzire") || lower.includes("sedan") || lower.includes("etios")) return 14;
  if (lower.includes("ertiga") || lower.includes("small suv") || lower.includes("small-suv") || lower.includes("6-seater")) return 18;
  if (lower.includes("crysta") || lower.includes("innova") || lower.includes("big suv") || lower.includes("big-suv") || lower.includes("7-seater")) return 21;
  if (lower.includes("urbania") || lower.includes("14-seater")) return 28;
  if (lower.includes("tempo") || lower.includes("traveller") || lower.includes("12-seater") || lower.includes("17-seater")) return 24;
  if (lower.includes("bus") || lower.includes("coach") || lower.includes("27-seater") || lower.includes("45-seater")) return 38;
  if (lower.includes("bmw") || lower.includes("mercedes") || lower.includes("premium")) return 45;
  return 14;
}

export function mapDbFleetToRecord(row: any, index: number = 0): FleetVehicle {
  const existing = fleetVehicles.find(
    (v) => v.id === row.id || v.slug === row.slug || v.name?.toLowerCase() === (row.name || '').toLowerCase()
  );
  const resolvedImg = resolveVehicleImage(row.image || existing?.image, row.slug || row.name || existing?.slug || existing?.name);
  
  let liveRate: number | undefined;
  if (isBrowser()) {
    try {
      const fareRaw = window.localStorage.getItem(STORAGE_KEY_FLEET_PRICING);
      if (fareRaw) {
        const configs = JSON.parse(fareRaw);
        const match = matchVehicleToFareConfig(row.slug || row.id || row.name || existing?.slug || existing?.name, configs);
        if (match?.oneWayRatePerKm) liveRate = match.oneWayRatePerKm;
      }
    } catch {}
  }
  const rawPrice = typeof row.price_per_km === 'number' 
    ? row.price_per_km 
    : (row.price_per_km ? parseFloat(row.price_per_km) : NaN);
  const rate = !isNaN(rawPrice) && rawPrice > 0
    ? rawPrice
    : (liveRate || getStandardVehiclePrice(row.slug || row.name || row.category_slug || existing?.slug || existing?.name || '', existing?.pricePerKm));

  return {
    id: row.id || existing?.id || `fv-${row.slug || index}`,
    slug: row.slug || existing?.slug || (row.name || '').toLowerCase().replace(/\s+/g, '-'),
    name: row.name || existing?.name || '',
    brand: row.brand || existing?.brand || 'Toyota / Maruti',
    model: row.model || existing?.model || row.name || '',
    categorySlug: row.category_slug || existing?.categorySlug || 'sedan',
    seats: row.seats || existing?.seats || 4,
    luggage: row.luggage || existing?.luggage || 3,
    ac: row.ac !== false,
    fuel: row.fuel || existing?.fuel || 'Diesel',
    pricePerKm: rate,
    priceFromLabel: row.price_from_label || `₹${rate} / km`,
    available: row.is_available !== false,
    availabilityText: row.availability_text || 'Available today',
    allowEnquiryWhenUnavailable: row.allow_enquiry_when_unavailable !== false,
    tripTypes: Array.isArray(row.trip_types) && row.trip_types.length > 0
      ? row.trip_types
      : (existing?.tripTypes || ['local', 'outstation', 'airport']),
    features: Array.isArray(row.features) && row.features.length > 0
      ? row.features
      : (existing?.features || [
          'AC with individual vents',
          'KA registered yellow board',
          'SZT verified fleet sticker',
          'Professional chauffeur',
        ]),
    image: resolvedImg,
    imageAlt: row.image_alt || existing?.imageAlt || row.name || '',
    order: row.display_order ?? (existing?.order || index + 1),
    published: row.is_published !== false,
    featured: row.is_featured !== false,
    popular: row.popularity || existing?.popular || 80,
  };
}

export const vehicleCategories: VehicleCategory[] = [
  { id: "vc-hatchback", slug: "hatchback", label: "Hatchback", order: 1, visible: true },
  { id: "vc-sedan", slug: "sedan", label: "Sedan", order: 2, visible: true },
  { id: "vc-suv", slug: "suv", label: "SUV", order: 3, visible: true },
  { id: "vc-premium", slug: "premium", label: "Premium", order: 4, visible: true },
  {
    id: "vc-tempo",
    slug: "tempo-traveller",
    label: "Tempo Traveller (TT)",
    order: 5,
    visible: true,
  },
  { id: "vc-bus", slug: "bus", label: "Bus", order: 6, visible: true },
];

export const tripTypeOptions: { value: TripType; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "outstation", label: "Outstation" },
  { value: "airport", label: "Airport" },
  { value: "group", label: "Group" },
];

export const fleetVehicles: FleetVehicle[] = [
  {
    id: "fv-hatchback",
    slug: "hatchback-wagonr",
    name: "Hatchback (WagonR or similar)",
    brand: "Maruti Suzuki",
    model: "WagonR",
    categorySlug: "hatchback",
    seats: 4,
    luggage: 2,
    ac: true,
    fuel: "Petrol",
    pricePerKm: 12,
    priceFromLabel: "₹12 / km",
    available: true,
    availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true,
    tripTypes: ["local", "outstation", "airport"],
    features: [
      "Compact and city-friendly",
      "GPS tracked",
      "KA registered yellow board",
      "SZT verified fleet sticker",
      "Budget-friendly local rides",
    ],
    image: fleetWagonr,
    imageAlt: "White Maruti Suzuki WagonR hatchback cab with KA registered yellow board and SZT sticker",
    order: 1,
    published: true,
    featured: true,
    popular: 82,
  },
  {
    id: "fv-dzire",
    slug: "maruti-dzire",
    name: "Sedan (Swift Dzire or similar)",
    brand: "Maruti Suzuki / Toyota",
    model: "Swift Dzire ZXi",
    categorySlug: "sedan",
    seats: 4,
    luggage: 2,
    ac: true,
    fuel: "Petrol",
    pricePerKm: 14,
    priceFromLabel: "₹14 / km",
    available: true,
    availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true,
    tripTypes: ["local", "outstation", "airport"],
    features: [
      "Boot space for 2 bags",
      "GPS tracked",
      "KA registered yellow board",
      "SZT verified fleet sticker",
      "Ideal for small families",
    ],
    image: fleetDzire,
    imageAlt: "White Swift Dzire sedan taxi with KA registered yellow board and SZT sticker",
    order: 2,
    published: true,
    featured: true,
    popular: 96,
  },
  {
    id: "fv-ertiga",
    slug: "maruti-ertiga",
    name: "Small SUV (Ertiga or similar)",
    brand: "Maruti Suzuki",
    model: "Ertiga",
    categorySlug: "suv",
    seats: 6,
    luggage: 3,
    ac: true,
    fuel: "Diesel",
    pricePerKm: 18,
    priceFromLabel: "₹18 / km",
    available: true,
    availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true,
    tripTypes: ["local", "outstation", "airport", "group"],
    features: [
      "6-seater family seating",
      "Extra legroom",
      "KA registered yellow board",
      "SZT verified fleet sticker",
      "Great for outstation trips",
    ],
    image: fleetErtiga,
    imageAlt: "White Maruti Ertiga small SUV taxi with KA registered yellow board and SZT sticker",
    order: 3,
    published: true,
    featured: true,
    popular: 91,
  },
  {
    id: "fv-crysta",
    slug: "innova-crysta",
    name: "Big SUV (Innova Crysta or similar)",
    brand: "Toyota",
    model: "Innova Crysta",
    categorySlug: "suv",
    seats: 7,
    luggage: 4,
    ac: true,
    fuel: "Diesel",
    pricePerKm: 21,
    priceFromLabel: "₹21 / km",
    available: true,
    availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true,
    tripTypes: ["local", "outstation", "airport", "group"],
    features: [
      "7-seater luxury seating",
      "Captain seats available",
      "KA registered yellow board",
      "SZT verified fleet sticker",
      "Best for family outstation trips",
    ],
    image: fleetInnova,
    imageAlt: "White Toyota Innova Crysta big SUV taxi with KA registered yellow board and SZT sticker",
    order: 4,
    published: true,
    featured: true,
    popular: 100,
  },
  {
    id: "fv-tempo12",
    slug: "tempo-traveller-12",
    name: "Tempo Traveller (12-17 Seater)",
    brand: "Force Motors",
    model: "Traveller 3350",
    categorySlug: "tempo-traveller",
    seats: 12,
    luggage: 9,
    ac: true,
    fuel: "Diesel",
    pricePerKm: 24,
    priceFromLabel: "₹24 / km",
    available: true,
    availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true,
    tripTypes: ["local", "outstation", "group"],
    features: [
      "2×1 Push-back recliner seats",
      "KA registered yellow board",
      "SZT verified fleet sticker",
      "Overhead luggage rack",
      "Music system",
    ],
    image: fleetTempo,
    imageAlt: "White 12-17 Seater Force Tempo Traveller TT with KA registered yellow board and SZT sticker",
    order: 5,
    published: true,
    featured: true,
    popular: 89,
  },
  {
    id: "fv-urbania",
    slug: "force-urbania",
    name: "Force Urbania (10-17 Seater Luxury Van)",
    brand: "Force Motors",
    model: "Urbania Luxury",
    categorySlug: "tempo-traveller",
    seats: 14,
    luggage: 11,
    ac: true,
    fuel: "Diesel",
    pricePerKm: 28,
    priceFromLabel: "₹28 / km",
    available: true,
    availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true,
    tripTypes: ["local", "outstation", "group", "airport"],
    features: [
      "Luxury individual recliner seats",
      "KA registered yellow board",
      "SZT verified fleet sticker",
      "Personal AC vents & reading lights",
      "Panoramic tinted windows",
    ],
    image: fleetUrbania,
    imageAlt: "Force Urbania Luxury Van with KA registered yellow board and SZT sticker",
    order: 6,
    published: true,
    featured: true,
    popular: 95,
  },
  {
    id: "fv-bus27",
    slug: "mini-bus-27",
    name: "Tourist Bus (27-45 Seater)",
    brand: "Tata / Volvo",
    model: "Starbus 27 / Volvo",
    categorySlug: "bus",
    seats: 35,
    luggage: 24,
    ac: true,
    fuel: "Diesel",
    pricePerKm: 38,
    priceFromLabel: "₹38 / km",
    available: true,
    availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true,
    tripTypes: ["outstation", "group"],
    features: [
      "Air-conditioned luxury coach",
      "KA registered yellow board",
      "SZT verified fleet sticker",
      "2×2 Push-back seats",
      "Ample luggage bay",
    ],
    image: fleetBus,
    imageAlt: "White Tourist Bus coach with KA registered yellow board and SZT sticker",
    order: 7,
    published: true,
    featured: true,
    popular: 75,
  },
  {
    id: "fv-premium",
    slug: "premium-bmw",
    name: "Premium (BMW or similar)",
    brand: "BMW",
    model: "5 Series",
    categorySlug: "premium",
    seats: 4,
    luggage: 2,
    ac: true,
    fuel: "Petrol",
    pricePerKm: 45,
    priceFromLabel: "₹45 / km",
    available: true,
    availabilityText: "Available today",
    allowEnquiryWhenUnavailable: true,
    tripTypes: ["local", "outstation", "airport"],
    features: [
      "Luxury interiors",
      "Chauffeur service",
      "KA registered yellow board",
      "SZT verified fleet sticker",
      "Perfect for executive travel",
    ],
    image: fleetBmw,
    imageAlt: "White BMW premium luxury sedan with KA registered yellow board and SZT sticker",
    order: 8,
    published: true,
    featured: true,
    popular: 68,
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
  return getFleetVehicles().filter((v) => v.published).sort((a, b) => a.order - b.order);
}

export function getVisibleVehicleCategories(): VehicleCategory[] {
  const used = new Set(getPublishedVehicles().map((v) => v.categorySlug));
  return vehicleCategories
    .filter((c) => c.visible && used.has(c.slug))
    .sort((a, b) => a.order - b.order);
}

export function getVehicleCategoryLabel(slug: string): string {
  return vehicleCategories.find((c) => c.slug === slug)?.label ?? slug;
}

export function getVehicleBySlug(slug: string): FleetVehicle | undefined {
  return getPublishedVehicles().find((v) => v.slug === slug);
}

const STORAGE_KEY_FLEET_DATA = "szt_fleet_data_v2";
const STORAGE_KEY_FLEET_PRICING = "szt_fleet_fare_settings_v5";

let memoryFleetVehicles: FleetVehicle[] = [...fleetVehicles];

const isBrowser = () => typeof window !== "undefined";

export function getFleetVehicles(): FleetVehicle[] {
  // Start with dynamic or default vehicles
  let list = dynamicFleetVehicles.length > 0 ? [...dynamicFleetVehicles] : [...fleetVehicles];

  if (isBrowser()) {
    try {
      // Purge legacy storage keys
      try {
        window.localStorage.removeItem("szt_fleet_data_v1");
        window.localStorage.removeItem("szt_fleet_fare_settings_v4");
        window.localStorage.removeItem("szt_fleet_fare_settings_v3");
      } catch {}

      // 1. Merge vehicle listing data overrides (e.g. from Edit Vehicle dialog)
      const raw = window.localStorage.getItem(STORAGE_KEY_FLEET_DATA);
      if (raw) {
        const stored: Partial<FleetVehicle>[] = JSON.parse(raw);
        const storedIds = stored.map((s) => s.id).filter(Boolean);
        if (new Set(storedIds).size === storedIds.length) {
          list = list.map((def) => {
            const found = stored.find((s) => s.id === def.id || s.slug === def.slug);
            return found ? { ...def, ...found } : def;
          });
          // Include any newly created vehicles from admin
          for (const s of stored) {
            if (s.id && !list.some((item) => item.id === s.id || item.slug === s.slug)) {
              list.push(s as FleetVehicle);
            }
          }
        }
      }

      // 2. CRITICAL: Merge price from fleet fare settings (from All Fleet Pricing tab)
      // If admin changed rates in the tariff manager, it MUST reflect in getFleetVehicles()
      const fareRaw = window.localStorage.getItem(STORAGE_KEY_FLEET_PRICING);
      if (fareRaw) {
        const fareConfigs: any[] = JSON.parse(fareRaw);
        const fareIds = fareConfigs.map((f) => f.fleetId).filter(Boolean);
        if (new Set(fareIds).size === fareIds.length) {
          list = list.map((v) => {
            const fareMatch = matchVehicleToFareConfig(v.slug || v.id || v.name, fareConfigs);
            if (fareMatch && fareMatch.oneWayRatePerKm) {
              return {
                ...v,
                pricePerKm: fareMatch.oneWayRatePerKm,
                priceFromLabel: `₹${fareMatch.oneWayRatePerKm} / km`,
              };
            }
            return v;
          });
        }
      }
    } catch (err) {
      console.error("Error loading fleet overrides:", err);
    }
  }

  memoryFleetVehicles = list.sort((a, b) => a.order - b.order);
  return memoryFleetVehicles;
}

export function saveFleetVehicles(vehicles: FleetVehicle[]): void {
  memoryFleetVehicles = [...vehicles];
  dynamicFleetVehicles = [...vehicles];
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_FLEET_DATA, JSON.stringify(vehicles));
    window.dispatchEvent(new CustomEvent("fleetDataUpdated"));

    // Also sync to Supabase in background if available
    try {
      import("@/lib/supabase").then(({ default: supabase }) => {
        if (supabase) {
          for (const v of vehicles) {
            supabase
              .from("fleets")
              .upsert({
                id: v.id,
                slug: v.slug,
                name: v.name,
                brand: v.brand,
                model: v.model,
                category_slug: v.categorySlug,
                seats: v.seats,
                luggage: v.luggage,
                ac: v.ac,
                fuel: v.fuel,
                price_per_km: v.pricePerKm,
                price_from_label: v.priceFromLabel || `₹${v.pricePerKm} / km`,
                image: typeof v.image === 'string' ? v.image : undefined,
                image_alt: v.imageAlt || `${v.name} cab`,
                display_order: v.order,
                is_published: v.published,
                is_featured: v.featured,
                popularity: v.popular,
                features: v.features,
                trip_types: v.tripTypes,
                updated_at: new Date().toISOString(),
              }, { onConflict: "id" })
              .then(({ error }) => {
                if (error) console.error("Error upserting fleet vehicle to Supabase:", error);
              });
          }
        }
      });
    } catch {
      // ignore
    }
  } catch {
    // ignore storage errors
  }
}

export async function fetchFleetVehicles(): Promise<FleetVehicle[]> {
  try {
    const { default: supabase } = await import("@/lib/supabase");
    if (!supabase) return getFleetVehicles();
    const { data, error } = await supabase.from("fleets").select("*").order("display_order");
    if (!error && data && data.length > 0) {
      const mapped = data.map(mapDbFleetToRecord);
      setDynamicFleetVehicles(mapped);
      if (isBrowser()) {
        window.localStorage.setItem(STORAGE_KEY_FLEET_DATA, JSON.stringify(mapped));
        window.dispatchEvent(new CustomEvent("fleetDataUpdated"));
      }
      return mapped;
    }
  } catch (err) {
    console.error("fetchFleetVehicles error:", err);
  }
  return getFleetVehicles();
}

export function resetFleetVehicles(): FleetVehicle[] {
  memoryFleetVehicles = [...fleetVehicles];
  dynamicFleetVehicles = [];
  if (isBrowser()) {
    window.localStorage.removeItem(STORAGE_KEY_FLEET_DATA);
    window.dispatchEvent(new CustomEvent("fleetDataUpdated"));
  }
  return fleetVehicles;
}

export function getFleetVehicleById(id: string): FleetVehicle | undefined {
  return getFleetVehicles().find((v) => v.id === id);
}

export function updateFleetVehicle(
  id: string,
  updates: Partial<FleetVehicle>,
): FleetVehicle | undefined {
  const vehicles = getFleetVehicles();
  const index = vehicles.findIndex((v) => v.id === id);
  if (index === -1) return undefined;
  vehicles[index] = { ...vehicles[index], ...updates };

  // If pricePerKm was updated, also update fare settings so auto fare calculator and cards match
  if (updates.pricePerKm && isBrowser()) {
    try {
      const fareRaw = window.localStorage.getItem(STORAGE_KEY_FLEET_PRICING);
      if (fareRaw) {
        const fareConfigs: any[] = JSON.parse(fareRaw);
        const fareIdx = fareConfigs.findIndex(
          (f) => f.fleetId === id || f.vehicleSlug === vehicles[index].slug || f.id === `ffc-${vehicles[index].slug}`
        );
        if (fareIdx !== -1) {
          fareConfigs[fareIdx].oneWayRatePerKm = updates.pricePerKm;
          window.localStorage.setItem(STORAGE_KEY_FLEET_PRICING, JSON.stringify(fareConfigs));
          window.dispatchEvent(new CustomEvent("fleetFareSettingsUpdated", { detail: fareConfigs }));
        }
      }
    } catch {
      // ignore
    }
  }

  saveFleetVehicles(vehicles);
  return vehicles[index];
}

export function addFleetVehicle(vehicle: FleetVehicle): FleetVehicle[] {
  const vehicles = getFleetVehicles();
  vehicles.push(vehicle);
  saveFleetVehicles(vehicles);
  return vehicles;
}

export function deleteFleetVehicle(id: string): FleetVehicle[] {
  const vehicles = getFleetVehicles().filter((v) => v.id !== id);
  saveFleetVehicles(vehicles);
  if (isBrowser()) {
    try {
      import("@/lib/supabase").then(({ default: supabase }) => {
        if (supabase) {
          supabase.from("fleets").delete().eq("id", id).then(({ error }) => {
            if (error) console.error("Error deleting fleet vehicle from Supabase:", error);
          });
        }
      });
    } catch {}
  }
  return vehicles;
}

export const fleetPriceBounds = (() => {
  const prices = getFleetVehicles().map((v) => v.pricePerKm);
  return { min: Math.min(...prices), max: Math.max(...prices) };
})();
