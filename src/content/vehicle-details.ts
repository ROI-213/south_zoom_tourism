/**
 * Admin-managed vehicle detail data.
 *
 * Mirrors the future normalized tables:
 *   vehicle_gallery(vehicle_id, url, alt, kind, display_order)
 *   vehicle_features(vehicle_id, label, icon, display_order, visible)
 *   vehicle_pricing(vehicle_id, group, label, value, visible, enquiry_label)
 *   vehicle_specs(vehicle_id, label, value)
 *   vehicle_date_blocks(vehicle_id, from_date, to_date, reason)
 *
 * A price line with `visible: false` is never shown as a number — the
 * public page renders the admin's `enquiryLabel` instead.
 */

import heroFleet from "@/assets/hero-fleet.jpg";
import heroTours from "@/assets/hero-tours.jpg";
import serviceCorporate from "@/assets/service-corporate-new.png";
import serviceGroup from "@/assets/service-group.png";
import interiorInnovaSeats from "@/assets/interior-innova-seats.jpg";
import interiorTempoSeats from "@/assets/interior-tempo-seats.jpg";
import interiorUrbaniaSeats from "@/assets/interior-urbania-seats.svg";
import interiorBusSeats from "@/assets/interior-bus-seats.jpg";
import fleetBigSuv from "@/assets/fleet-innova-new.png";
import fleetTempo from "@/assets/fleet-tempo-new.png";
import fleetUrbania from "@/assets/fleet-urbania-ka.jpg";
import fleetBus from "@/assets/fleet-bus-ka.jpg";
import { getVehicleBySlug, type FleetVehicle } from "@/content/fleet";

export type GalleryKind = "exterior" | "interior" | "seating" | "luggage";

export type VehicleGalleryImage = {
  id: string;
  url: string;
  alt: string;
  kind: GalleryKind;
  order: number;
};

export type VehicleFeature = { id: string; label: string; icon: string; order: number; visible: boolean };

export type PriceGroup = "local" | "outstation" | "airport" | "extras";

export type VehiclePriceLine = {
  id: string;
  group: PriceGroup;
  label: string;
  /** Public rate. Hidden when `visible` is false. */
  value: string;
  note?: string;
  visible: boolean;
  /** Shown in place of the rate when the admin hides it. */
  enquiryLabel: string;
};

export type VehicleSpec = { label: string; value: string };

/** Inventory-held dates. Availability is never promised beyond this. */
export type DateBlock = { from: string; to: string; reason: string };

export type VehicleDetail = {
  vehicleSlug: string;
  summary: string;
  gallery: VehicleGalleryImage[];
  features: VehicleFeature[];
  specs: VehicleSpec[];
  pricing: VehiclePriceLine[];
  policies: string[];
  dateBlocks: DateBlock[];
};

export const priceGroupLabels: Record<PriceGroup, string> = {
  local: "Local package",
  outstation: "Outstation",
  airport: "Airport transfer",
  extras: "Extras & allowances",
};

const galleryFor = (
  slug: string,
  images: { url: string; alt: string; kind: GalleryKind }[],
): VehicleGalleryImage[] =>
  images.map((image, index) => ({
    id: `${slug}-img-${index + 1}`,
    order: index + 1,
    ...image,
  }));

const featuresFor = (slug: string, entries: [string, string][]): VehicleFeature[] =>
  entries.map(([label, icon], index) => ({
    id: `${slug}-feat-${index + 1}`,
    label,
    icon,
    order: index + 1,
    visible: true,
  }));

function basePricing(slug: string, perKm: number, showAll = true): VehiclePriceLine[] {
  const lines: Omit<VehiclePriceLine, "id">[] = [
    {
      group: "local",
      label: "8 hrs / 80 km package",
      value: `₹2300`,
      note: "City limits, fuel and driver included",
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "local",
      label: "4 hrs / 40 km package",
      value: `₹1200`,
      note: "Half-day city use",
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "local",
      label: "Ex per hour",
      value: `₹${perKm * 12}`,
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "local",
      label: "Ex per km",
      value: `₹${perKm} / km`,
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "local",
      label: "Driver allowance",
      value: `₹${perKm >= 24 ? 500 : 400}`,
      note: "Per day driver bata / allowance",
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "outstation",
      label: "Per-kilometre rate",
      value: `₹${perKm} / km`,
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "outstation",
      label: "Minimum km per day",
      value: "250 km",
      note: "Billed even if you travel less",
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "outstation",
      label: "Driver allowance (per day)",
      value: `₹${perKm >= 24 ? 800 : 500} / day`,
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "outstation",
      label: "Night charges (9:30 PM – 5:30 AM)",
      value: `₹${perKm >= 24 ? 600 : 400}`,
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "airport",
      label: "Airport pickup or drop",
      value: showAll ? `₹${perKm * 95}` : "",
      note: "Within 40 km of the terminal",
      visible: showAll,
      enquiryLabel: "Contact for airport rate",
    },
    {
      group: "airport",
      label: "Waiting after landing",
      value: "First 45 mins free",
      note: "Then charged per additional hour",
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "extras",
      label: "Toll, permit and parking",
      value: "At actuals",
      note: "Receipts shared with the invoice",
      visible: true,
      enquiryLabel: "Contact for price",
    },
    {
      group: "extras",
      label: "Interstate permit",
      value: "At actuals",
      visible: true,
      enquiryLabel: "Contact for price",
    },
  ];

  return lines.map((line, index) => ({ id: `${slug}-price-${index + 1}`, ...line }));
}

const commonPolicies = [
  "Rates include fuel, driver charges, vehicle maintenance and insurance.",
  "Tolls, permits, parking and state entry taxes are billed at actuals with receipts.",
  "Cancellations more than 2 hours before pickup are free of charge.",
  "The vehicle is sanitised and inspected before every dispatch.",
  "Smoking and alcohol consumption inside the vehicle are not permitted.",
];

function makeDetail(
  slug: string,
  summary: string,
  gallery: { url: string; alt: string; kind: GalleryKind }[],
  features: [string, string][],
  extraSpecs: VehicleSpec[],
  pricing: VehiclePriceLine[],
  dateBlocks: DateBlock[] = [],
): VehicleDetail {
  return {
    vehicleSlug: slug,
    summary,
    gallery: galleryFor(slug, gallery),
    features: featuresFor(slug, features),
    specs: extraSpecs,
    pricing,
    policies: commonPolicies,
    dateBlocks,
  };
}

const standardFeatures: [string, string][] = [
  ["Air conditioning", "Snowflake"],
  ["Music system with Bluetooth", "Music"],
  ["USB phone charging", "BatteryCharging"],
  ["First-aid kit", "BriefcaseMedical"],
  ["GPS tracked journey", "MapPin"],
  ["Drinking water on board", "Droplets"],
];

const largeVehicleFeatures: [string, string][] = [
  ...standardFeatures,
  ["Push-back reclining seats", "Armchair"],
  ["Overhead luggage racks", "Luggage"],
  ["Reading lights", "Lightbulb"],
];

export const vehicleDetails: VehicleDetail[] = [
  makeDetail(
    "maruti-swift",
    "A nimble hatchback for city runs, short airport hops and solo or couple travel where parking and fuel economy matter more than boot space.",
    [
      { url: heroFleet, alt: "Maruti Swift hatchback parked on a quiet city street", kind: "exterior" },
      { url: heroTours, alt: "Front cabin of the Maruti Swift with the dashboard and controls", kind: "interior" },
      { url: heroFleet, alt: "Rear bench seating of the vehicle", kind: "seating" },
      { url: heroFleet, alt: "Open boot of the Maruti Swift holding two cabin bags", kind: "luggage" },
    ],
    standardFeatures,
    [
      { label: "Best for", value: "City runs and short transfers" },
    ],
    basePricing("maruti-swift", 12),
  ),
  makeDetail(
    "maruti-dzire",
    "Our most-booked sedan. Comfortable for four adults with a boot that swallows two large suitcases, and equally at home on airport transfers and day-long outstation trips.",
    [
      { url: heroFleet, alt: "White Maruti Dzire sedan ready for an airport transfer", kind: "exterior" },
      { url: heroTours, alt: "Maruti Dzire interior showing the front seats and steering", kind: "interior" },
      { url: heroFleet, alt: "Rear passenger seating inside the Maruti Dzire", kind: "seating" },
      { url: heroFleet, alt: "Boot of the Maruti Dzire loaded with two suitcases", kind: "luggage" },
    ],
    standardFeatures,
    [
      { label: "Best for", value: "Airport transfers and outstation" },
    ],
    basePricing("maruti-dzire", 14),
  ),
  makeDetail(
    "toyota-etios",
    "A diesel sedan built for highway distance, with a bigger boot and a settled ride that makes six-hour drives feel shorter.",
    [
      { url: heroFleet, alt: "Toyota Etios sedan on a highway shoulder", kind: "exterior" },
      { url: heroTours, alt: "Toyota Etios cabin viewed from the passenger side", kind: "interior" },
      { url: heroFleet, alt: "Vehicle seating and interior", kind: "seating" },
      { url: heroFleet, alt: "Vehicle luggage space", kind: "luggage" },
    ],
    standardFeatures,
    [
      { label: "Best for", value: "Long highway journeys" },
    ],
    basePricing("toyota-etios", 15),
  ),
  makeDetail(
    "maruti-ertiga",
    "A three-row MPV for families and small groups — six seats, a roof carrier on request and efficient running costs that keep longer itineraries affordable.",
    [
      { url: heroTours, alt: "Maruti Ertiga MPV parked near a hill station viewpoint", kind: "exterior" },
      { url: heroFleet, alt: "Maruti Ertiga cabin with the second-row seats", kind: "interior" },
      { url: heroFleet, alt: "Third-row seating inside the vehicle", kind: "seating" },
      { url: heroFleet, alt: "Luggage loaded behind the Ertiga third row", kind: "luggage" },
    ],
    standardFeatures,
    [
      { label: "Rows", value: "3" },
      { label: "Best for", value: "Family trips and small groups" },
    ],
    basePricing("maruti-ertiga", 18),
  ),
  makeDetail(
    "innova-crysta",
    "The benchmark for multi-day South India tours: seven seats, genuine luggage room, captain-seat option and a ride quality that holds up over ghat roads.",
    [
      { url: fleetBigSuv, alt: "White Toyota Innova Crysta big SUV with KA yellow board & SZT sticker", kind: "exterior" },
      { url: interiorInnovaSeats, alt: "Executive plush leatherette captain seats in the Innova Crysta", kind: "seating" },
      { url: interiorInnovaSeats, alt: "Innova Crysta executive cabin with ambient roof lighting", kind: "interior" },
      { url: heroFleet, alt: "Rear luggage area of the Innova Crysta", kind: "luggage" },
    ],
    standardFeatures,
    [
      { label: "Rows", value: "3" },
      { label: "Best for", value: "Multi-day tour packages" },
    ],
    basePricing("innova-crysta", 21),
    [{ from: "2026-08-12", to: "2026-08-16", reason: "Held for a confirmed group tour" }],
  ),
  makeDetail(
    "innova-hycross",
    "Executive travel with ottoman captain seats and hybrid refinement — the vehicle we send when the guest list includes clients or visiting leadership.",
    [
      { url: serviceCorporate, alt: "Executive MPV used for corporate airport and employee transport", kind: "exterior" },
      { url: interiorInnovaSeats, alt: "Hycross cabin with ambient lighting and ottoman seats", kind: "interior" },
      { url: interiorInnovaSeats, alt: "Reclining captain seats inside the vehicle", kind: "seating" },
      { url: heroFleet, alt: "Boot space of the Innova Hycross with executive luggage", kind: "luggage" },
    ],
    [...standardFeatures, ["Ottoman captain seats", "Armchair"], ["Ambient cabin lighting", "Lightbulb"]],
    [
      { label: "Rows", value: "3" },
      { label: "Best for", value: "Corporate and executive travel" },
    ],
    basePricing("innova-hycross", 28, false),
    [{ from: "2026-07-29", to: "2026-07-31", reason: "Scheduled service and detailing" }],
  ),
  makeDetail(
    "tempo-traveller-12",
    "Twelve push-back seats with standing headroom and a dedicated luggage carrier — the workhorse for temple circuits and office offsites.",
    [
      { url: fleetTempo, alt: "Twelve-seater Force Tempo Traveller TT with KA yellow board & SZT sticker", kind: "exterior" },
      { url: interiorTempoSeats, alt: "2×1 Push-back luxury recliner seating inside Tempo Traveller", kind: "seating" },
      { url: interiorTempoSeats, alt: "High-roof interior with center aisle and ambient lighting", kind: "interior" },
      { url: serviceGroup, alt: "Rear luggage carrier of the tempo traveller loaded with bags", kind: "luggage" },
    ],
    largeVehicleFeatures,
    [
      { label: "Seat layout", value: "2 + 1 push-back" },
      { label: "Best for", value: "Group tours and offsites" },
    ],
    basePricing("tempo-traveller-12", 24),
  ),
  makeDetail(
    "force-urbania",
    "Fourteen individual luxury push-back recliner seats with aircraft-style ambient lighting, personal AC vents and panoramic windows — the premier choice for VIP group travel.",
    [
      { url: fleetUrbania, alt: "Force Urbania Luxury Van with KA yellow board & SZT sticker", kind: "exterior" },
      { url: interiorUrbaniaSeats, alt: "Plush diamond-quilted luxury recliner seats in Force Urbania", kind: "seating" },
      { url: interiorUrbaniaSeats, alt: "Aircraft-style luxury cabin and ambient LED roof strip", kind: "interior" },
      { url: serviceGroup, alt: "Dedicated rear luggage bay for group baggage", kind: "luggage" },
    ],
    largeVehicleFeatures,
    [
      { label: "Seat layout", value: "Individual luxury recliners" },
      { label: "Air conditioning", value: "Dual-zone individual vents" },
      { label: "Best for", value: "Executive corporate & VIP tours" },
    ],
    basePricing("force-urbania", 28),
  ),
  makeDetail(
    "tempo-traveller-17",
    "A seventeen seater for pilgrimage routes and group travel, with a high roof and generous luggage space.",
    [
      { url: fleetTempo, alt: "Seventeen-seater Force Tempo Traveller with KA yellow board & SZT sticker", kind: "exterior" },
      { url: interiorTempoSeats, alt: "Push-back seating rows inside the seventeen-seater tempo traveller", kind: "seating" },
      { url: interiorTempoSeats, alt: "High-roof interior of the seventeen-seater tempo traveller", kind: "interior" },
      { url: serviceGroup, alt: "Luggage stacked in the rear of the seventeen seater", kind: "luggage" },
    ],
    [
      ["Music system with Bluetooth", "Music"],
      ["USB phone charging", "BatteryCharging"],
      ["First-aid kit", "BriefcaseMedical"],
      ["GPS tracked journey", "MapPin"],
      ["Push-back reclining seats", "Armchair"],
      ["Overhead luggage racks", "Luggage"],
    ],
    [
      { label: "Air conditioning", value: "AC" },
      { label: "Best for", value: "Pilgrimage and group travel" },
    ],
    basePricing("tempo-traveller-17", 26),
  ),
  makeDetail(
    "mini-bus-27",
    "Twenty-seven seats with a PA system and a co-driver on long routes — sized for weddings, college trips and corporate movements.",
    [
      { url: fleetBus, alt: "Twenty-seven seater tourist bus coach with KA yellow board & SZT sticker", kind: "exterior" },
      { url: interiorBusSeats, alt: "2×2 High-back pushback coach seating with armrests", kind: "seating" },
      { url: interiorBusSeats, alt: "Spacious AC coach interior with overhead parcel racks", kind: "interior" },
      { url: serviceGroup, alt: "Luggage hold of the mini bus with group baggage", kind: "luggage" },
    ],
    largeVehicleFeatures,
    [
      { label: "Crew", value: "Driver + co-driver on long routes" },
      { label: "Best for", value: "Weddings and large groups" },
    ],
    basePricing("mini-bus-27", 38),
  ),
  makeDetail(
    "coach-45",
    "A forty-five seat air-conditioned coach with reclining seats and a full-width luggage hold for the largest movements we handle.",
    [
      { url: fleetBus, alt: "Forty-five seater air-conditioned coach with KA yellow board & SZT sticker", kind: "exterior" },
      { url: interiorBusSeats, alt: "2×2 Reclining coach seat rows inside the luxury bus", kind: "seating" },
      { url: interiorBusSeats, alt: "Interior of the forty-five seater coach looking down the aisle", kind: "interior" },
      { url: heroTours, alt: "Side luggage hold of the coach being loaded", kind: "luggage" },
    ],
    largeVehicleFeatures,
    [
      { label: "Crew", value: "Two drivers on long routes" },
      { label: "Best for", value: "Large group movements" },
    ],
    basePricing("coach-45", 52),
    [{ from: "2026-07-27", to: "2026-08-02", reason: "Fully booked — school excursion" }],
  ),
];

const STORAGE_KEY_VEHICLE_DETAILS = "szt_vehicle_details_overrides_v1";

const isBrowser = () => typeof window !== "undefined";

export function getVehicleDetailOverrides(): Record<string, VehicleDetail> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_VEHICLE_DETAILS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to read vehicle detail overrides:", e);
    return {};
  }
}

export function saveVehicleDetail(slug: string, detail: VehicleDetail): void {
  if (!isBrowser()) return;
  try {
    const overrides = getVehicleDetailOverrides();
    overrides[slug] = { ...detail, vehicleSlug: slug };
    window.localStorage.setItem(STORAGE_KEY_VEHICLE_DETAILS, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent("vehicleDetailUpdated", { detail: { slug } }));
  } catch (e) {
    console.error("Failed to save vehicle detail:", e);
  }
}

export function resetVehicleDetail(slug: string): void {
  if (!isBrowser()) return;
  try {
    const overrides = getVehicleDetailOverrides();
    delete overrides[slug];
    window.localStorage.setItem(STORAGE_KEY_VEHICLE_DETAILS, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent("vehicleDetailUpdated", { detail: { slug } }));
  } catch (e) {
    console.error("Failed to reset vehicle detail:", e);
  }
}

export function createDefaultVehicleDetail(vehicle: FleetVehicle): VehicleDetail {
  const perKm = vehicle.pricePerKm || 14;
  const standardFeatures: [string, string][] = [
    ["Chauffeur driven", "UserCheck"],
    ["GPS tracking", "ShieldCheck"],
    ["Mobile charging point", "Zap"],
    ["First aid kit", "HeartPulse"],
    ["Air conditioning", "Wind"],
    ["Ample luggage space", "Briefcase"],
  ];

  return {
    vehicleSlug: vehicle.slug,
    summary: `${vehicle.name} (${vehicle.brand} ${vehicle.model}) available for local city rides, outstation trips, and airport transfers with verified professional chauffeurs.`,
    gallery: [
      {
        id: `${vehicle.slug}-img-1`,
        url: vehicle.image,
        alt: `${vehicle.name} exterior view`,
        kind: "exterior",
        order: 1,
      },
    ],
    features: featuresFor(vehicle.slug, standardFeatures),
    specs: [
      { label: "Fuel Type", value: vehicle.fuel || "Petrol / Diesel" },
      { label: "Transmission", value: "Manual / Automatic" },
      { label: "Seating Capacity", value: `${vehicle.seats} Passengers + 1 Driver` },
      { label: "Luggage Capacity", value: `${vehicle.luggage} Standard Bags` },
    ],
    pricing: basePricing(vehicle.slug, perKm),
    policies: [...commonPolicies],
    dateBlocks: [],
  };
}

export function getVehicleDetail(slug: string): VehicleDetail | undefined {
  // 1. Check localStorage overrides
  const overrides = getVehicleDetailOverrides();
  if (overrides[slug]) {
    return overrides[slug];
  }

  // 2. Direct match in hardcoded vehicleDetails
  let detail = vehicleDetails.find((d) => d.vehicleSlug === slug);
  if (detail) return detail;

  // 3. Alias map: fleet.ts slug → vehicle-details.ts slug
  const slugAliases: Record<string, string> = {
    "hatchback-wagonr": "maruti-swift",
  };
  const aliased = slugAliases[slug];
  if (aliased) {
    if (overrides[aliased]) return overrides[aliased];
    detail = vehicleDetails.find((d) => d.vehicleSlug === aliased);
    if (detail) return detail;
  }

  // 4. If vehicle exists in fleet list, generate default detail
  const vehicle = getVehicleBySlug(slug);
  if (vehicle) {
    return createDefaultVehicleDetail(vehicle);
  }

  return undefined;
}

export function resolveVehicleWithDetail(slug: string) {
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return undefined;
  return { vehicle, detail: getVehicleDetail(slug) };
}

export function getVisibleFeatures(detail: VehicleDetail): VehicleFeature[] {
  return detail.features.filter((f) => f.visible).sort((a, b) => a.order - b.order);
}

export function getGallery(detail: VehicleDetail): VehicleGalleryImage[] {
  return [...detail.gallery].sort((a, b) => a.order - b.order);
}

export function getPricingGroups(detail: VehicleDetail): { group: PriceGroup; lines: VehiclePriceLine[] }[] {
  const groups: PriceGroup[] = ["local", "outstation", "airport", "extras"];
  return groups
    .map((group) => ({ group, lines: detail.pricing.filter((line) => line.group === group) }))
    .filter((entry) => entry.lines.length > 0);
}

/**
 * Inventory check against admin-held date blocks. Returns `unknown` when no
 * dates are supplied — we never promise availability that inventory has not
 * confirmed.
 */
export function checkAvailability(
  detail: VehicleDetail | undefined,
  vehicle: FleetVehicle,
  pickupDate: string,
  returnDate: string,
): { status: "unknown" | "blocked" | "likely"; message: string } {
  if (!pickupDate) {
    return {
      status: "unknown",
      message: "Add your travel dates and we'll check this vehicle against live inventory.",
    };
  }

  const start = new Date(pickupDate);
  const end = returnDate ? new Date(returnDate) : start;
  const blocked = (detail?.dateBlocks ?? []).find((block) => {
    const from = new Date(block.from);
    const to = new Date(block.to);
    return start <= to && end >= from;
  });

  if (blocked) {
    return {
      status: "blocked",
      message: `This vehicle is held between ${blocked.from} and ${blocked.to} (${blocked.reason}). Send the request and we'll offer a similar vehicle.`,
    };
  }

  return {
    status: "likely",
    message: vehicle.available
      ? "No holds on these dates. Our team confirms the exact vehicle by phone before your booking is final."
      : `${vehicle.availabilityText}. Send the request and we'll confirm availability with the operations team.`,
  };
}

/** Human-readable booking reference stored with the request. */
export function makeBookingReference(vehicle: FleetVehicle): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const prefix = vehicle.slug.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();
  return `SZT-${prefix}-${stamp}`;
}

/** Related vehicles: same category first, then closest capacity and price. */
export function getRelatedVehicles(vehicle: FleetVehicle, pool: FleetVehicle[], limit = 3): FleetVehicle[] {
  return pool
    .filter((candidate) => candidate.slug !== vehicle.slug)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.categorySlug === vehicle.categorySlug ? 0 : 30) +
        Math.abs(candidate.seats - vehicle.seats) * 2 +
        Math.abs(candidate.pricePerKm - vehicle.pricePerKm),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

