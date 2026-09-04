/**
 * Centralized Fleet Pricing & Auto Fare Calculation System.
 *
 * Implements per-fleet configuration for:
 * - One Way Rate / KM & Minimum KM
 * - Round Trip Rate / KM & Minimum KM / Day
 * - Driver Allowance (One Way & Round Trip / Day)
 * - GST percentage
 * - Toll and State Tax modes
 *
 * Designed to mirror PostgreSQL tables:
 * `fleets`, `fleet_fare_settings`, `fare_calculations`
 */

export type TollCalculationMode = "calculated" | "actuals" | "included" | "extra";
export type StateTaxCalculationMode = "calculated" | "actuals" | "included" | "extra";

export type FleetFareConfig = {
  id: string; // e.g. "ffc-hatchback"
  fleetId: string; // matches fleetVehicles[i].id (e.g. "fv-hatchback")
  vehicleSlug: string; // matches fleetVehicles[i].slug
  vehicleName: string;
  category: string;
  oneWayRatePerKm: number;
  oneWayMinimumKm: number;
  oneWayDriverAllowance: number;
  roundTripRatePerKm: number;
  roundTripMinimumKmPerDay: number;
  roundTripDriverAllowancePerDay: number;
  tollRatePerKm: number; // e.g. 1.5 for hatchback/sedan/suv
  gstPercentage: number;
  tollMode: TollCalculationMode;
  stateTaxMode: StateTaxCalculationMode;
  isActive: boolean;
  displayOrder: number;
  // Local Package Configuration (Admin editable)
  localBasePrice: number; // Base rate for 4h / 40km (e.g. 2200 for Sedan)
  localBaseHours: number; // 4 hrs
  localBaseKm: number; // 40 km
  localExtraKmRate: number; // ₹/km
  localExtraHourRate: number; // ₹/hr
  localDriverAllowance: number; // e.g. 400
  // Airport Transfer Configuration (Admin editable)
  airportBasePrice: number; // Base rate for 3h / 30km (e.g. 1100 for Sedan)
  airportBaseHours: number; // 3 hrs
  airportBaseKm: number; // 30 km
  airportExtraKmRate: number; // ₹/km
  airportExtraHourRate: number; // ₹/hr
  updatedAt?: string;
};

export type FareCalculationInput = {
  fleetId: string;
  tripType: "one-way" | "round-trip" | "local" | "airport";
  pickup: string;
  destination: string;
  pickupDate: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  routeDistanceKm?: number;
  routeDuration?: string;
  estimatedTollAmount?: number | null;
  estimatedStateTaxAmount?: number | null;
  isInterstate?: boolean;
  // Choosing / Selection Add-on options
  luggageCarrier?: boolean; // ₹250
  petTravelling?: boolean; // ₹900
  // Package settings for Local / Airport
  localPackageHours?: number; // 4, 8, 12
  localPackageKm?: number; // 40, 80, 120
  airportTransferType?: "drop" | "pickup";
  flightNumber?: string;
};

export type FareCalculationResult = {
  fleet: FleetFareConfig;
  tripType: "one-way" | "round-trip" | "local" | "airport";
  pickup: string;
  destination: string;
  pickupDate: string;
  returnDate?: string;
  dayCount: number;
  routeDistanceKm: number; // Single route distance or package km
  effectiveTripDistanceKm: number; // Single distance for one-way, 2x for round-trip, package km for local/airport
  minimumBillingKm: number;
  billableDistanceKm: number;
  ratePerKm: number;
  baseFare: number;
  driverAllowance: number;
  tollAmount: number | null;
  tollDisplay: string;
  stateTaxAmount: number | null;
  stateTaxDisplay: string;
  // Add-on options
  luggageCarrier: boolean;
  luggageCarrierCost: number; // ₹250
  petTravelling: boolean;
  petTravellingCost: number; // ₹900
  addonsCost: number;
  packageName?: string;
  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  totalEstimatedFare: number;
  advanceAmount: number; // 15%
  balanceToDriver: number; // Remaining
  routeDuration?: string;
  isInterstate?: boolean;
  calculatedAt: string;
};

export type FareCalculationLog = FareCalculationResult & {
  id: string;
  customerName?: string;
  customerPhone?: string;
  source?: string;
};

/**
 * Initial standard configuration for all 8 vehicle types.
 * Editable by Admin at runtime and syncs with PostgreSQL.
 */
export const DEFAULT_FLEET_FARE_SETTINGS: FleetFareConfig[] = [
  {
    id: "ffc-hatchback",
    fleetId: "fv-hatchback",
    vehicleSlug: "hatchback-wagonr",
    vehicleName: "Hatchback (WagonR or similar)",
    category: "Hatchback",
    oneWayRatePerKm: 12,
    oneWayMinimumKm: 150,
    oneWayDriverAllowance: 300,
    roundTripRatePerKm: 11,
    roundTripMinimumKmPerDay: 300,
    roundTripDriverAllowancePerDay: 300,
    tollRatePerKm: 1.5,
    gstPercentage: 5,
    tollMode: "calculated",
    stateTaxMode: "extra",
    isActive: true,
    displayOrder: 1,
    localBasePrice: 1400,
    localBaseHours: 4,
    localBaseKm: 40,
    localExtraKmRate: 12,
    localExtraHourRate: 180,
    localDriverAllowance: 300,
    airportBasePrice: 899,
    airportBaseHours: 3,
    airportBaseKm: 30,
    airportExtraKmRate: 12,
    airportExtraHourRate: 180,
  },
  {
    id: "ffc-sedan",
    fleetId: "fv-dzire",
    vehicleSlug: "maruti-dzire",
    vehicleName: "Sedan (Swift Dzire or similar)",
    category: "Sedan",
    oneWayRatePerKm: 14,
    oneWayMinimumKm: 150,
    oneWayDriverAllowance: 300,
    roundTripRatePerKm: 13,
    roundTripMinimumKmPerDay: 300,
    roundTripDriverAllowancePerDay: 300,
    tollRatePerKm: 1.5,
    gstPercentage: 5,
    tollMode: "calculated",
    stateTaxMode: "extra",
    isActive: true,
    displayOrder: 2,
    localBasePrice: 2200,
    localBaseHours: 4,
    localBaseKm: 40,
    localExtraKmRate: 14,
    localExtraHourRate: 200,
    localDriverAllowance: 400,
    airportBasePrice: 1100,
    airportBaseHours: 3,
    airportBaseKm: 30,
    airportExtraKmRate: 14,
    airportExtraHourRate: 200,
  },
  {
    id: "ffc-small-suv",
    fleetId: "fv-ertiga",
    vehicleSlug: "maruti-ertiga",
    vehicleName: "Small SUV (Ertiga or similar)",
    category: "SUV",
    oneWayRatePerKm: 18,
    oneWayMinimumKm: 150,
    oneWayDriverAllowance: 350,
    roundTripRatePerKm: 16,
    roundTripMinimumKmPerDay: 300,
    roundTripDriverAllowancePerDay: 350,
    tollRatePerKm: 1.5,
    gstPercentage: 5,
    tollMode: "calculated",
    stateTaxMode: "extra",
    isActive: true,
    displayOrder: 3,
    localBasePrice: 2800,
    localBaseHours: 4,
    localBaseKm: 40,
    localExtraKmRate: 18,
    localExtraHourRate: 200,
    localDriverAllowance: 400,
    airportBasePrice: 1400,
    airportBaseHours: 3,
    airportBaseKm: 30,
    airportExtraKmRate: 18,
    airportExtraHourRate: 200,
  },
  {
    id: "ffc-big-suv",
    fleetId: "fv-crysta",
    vehicleSlug: "innova-crysta",
    vehicleName: "Big SUV (Innova Crysta or similar)",
    category: "SUV",
    oneWayRatePerKm: 21,
    oneWayMinimumKm: 150,
    oneWayDriverAllowance: 400,
    roundTripRatePerKm: 19,
    roundTripMinimumKmPerDay: 300,
    roundTripDriverAllowancePerDay: 400,
    tollRatePerKm: 1.5,
    gstPercentage: 5,
    tollMode: "calculated",
    stateTaxMode: "extra",
    isActive: true,
    displayOrder: 4,
    localBasePrice: 3500,
    localBaseHours: 4,
    localBaseKm: 40,
    localExtraKmRate: 21,
    localExtraHourRate: 250,
    localDriverAllowance: 400,
    airportBasePrice: 1800,
    airportBaseHours: 3,
    airportBaseKm: 30,
    airportExtraKmRate: 21,
    airportExtraHourRate: 250,
  },
  {
    id: "ffc-tempo",
    fleetId: "fv-tempo12",
    vehicleSlug: "tempo-traveller-12",
    vehicleName: "Tempo Traveller (12-17 Seater)",
    category: "Tempo Traveller",
    oneWayRatePerKm: 24,
    oneWayMinimumKm: 250,
    oneWayDriverAllowance: 500,
    roundTripRatePerKm: 22,
    roundTripMinimumKmPerDay: 300,
    roundTripDriverAllowancePerDay: 500,
    tollRatePerKm: 2.0,
    gstPercentage: 5,
    tollMode: "calculated",
    stateTaxMode: "extra",
    isActive: true,
    displayOrder: 5,
    localBasePrice: 4500,
    localBaseHours: 4,
    localBaseKm: 40,
    localExtraKmRate: 24,
    localExtraHourRate: 300,
    localDriverAllowance: 500,
    airportBasePrice: 2400,
    airportBaseHours: 3,
    airportBaseKm: 30,
    airportExtraKmRate: 24,
    airportExtraHourRate: 300,
  },
  {
    id: "ffc-urbania",
    fleetId: "fv-urbania",
    vehicleSlug: "force-urbania",
    vehicleName: "Force Urbania (10-17 Seater Luxury Van)",
    category: "Tempo Traveller",
    oneWayRatePerKm: 28,
    oneWayMinimumKm: 250,
    oneWayDriverAllowance: 600,
    roundTripRatePerKm: 25,
    roundTripMinimumKmPerDay: 300,
    roundTripDriverAllowancePerDay: 600,
    tollRatePerKm: 2.5,
    gstPercentage: 5,
    tollMode: "calculated",
    stateTaxMode: "extra",
    isActive: true,
    displayOrder: 6,
    localBasePrice: 5500,
    localBaseHours: 4,
    localBaseKm: 40,
    localExtraKmRate: 28,
    localExtraHourRate: 350,
    localDriverAllowance: 600,
    airportBasePrice: 3200,
    airportBaseHours: 3,
    airportBaseKm: 30,
    airportExtraKmRate: 28,
    airportExtraHourRate: 350,
  },
  {
    id: "ffc-bus",
    fleetId: "fv-bus27",
    vehicleSlug: "mini-bus-27",
    vehicleName: "Tourist Bus (27-45 Seater)",
    category: "Bus",
    oneWayRatePerKm: 38,
    oneWayMinimumKm: 300,
    oneWayDriverAllowance: 1000,
    roundTripRatePerKm: 35,
    roundTripMinimumKmPerDay: 350,
    roundTripDriverAllowancePerDay: 1000,
    tollRatePerKm: 3.5,
    gstPercentage: 5,
    tollMode: "calculated",
    stateTaxMode: "extra",
    isActive: true,
    displayOrder: 7,
    localBasePrice: 8000,
    localBaseHours: 4,
    localBaseKm: 40,
    localExtraKmRate: 38,
    localExtraHourRate: 500,
    localDriverAllowance: 1000,
    airportBasePrice: 4500,
    airportBaseHours: 3,
    airportBaseKm: 30,
    airportExtraKmRate: 38,
    airportExtraHourRate: 500,
  },
  {
    id: "ffc-premium",
    fleetId: "fv-premium",
    vehicleSlug: "premium-bmw",
    vehicleName: "Premium (BMW or similar)",
    category: "Premium",
    oneWayRatePerKm: 45,
    oneWayMinimumKm: 150,
    oneWayDriverAllowance: 500,
    roundTripRatePerKm: 42,
    roundTripMinimumKmPerDay: 300,
    roundTripDriverAllowancePerDay: 500,
    tollRatePerKm: 2.0,
    gstPercentage: 5,
    tollMode: "calculated",
    stateTaxMode: "extra",
    isActive: true,
    displayOrder: 8,
    localBasePrice: 6000,
    localBaseHours: 4,
    localBaseKm: 40,
    localExtraKmRate: 45,
    localExtraHourRate: 400,
    localDriverAllowance: 500,
    airportBasePrice: 3500,
    airportBaseHours: 3,
    airportBaseKm: 30,
    airportExtraKmRate: 45,
    airportExtraHourRate: 400,
  },
];

const STORAGE_KEY_FLEET_PRICING = "szt_fleet_fare_settings_v5";
const STORAGE_KEY_CALC_LOGS = "szt_fare_calculations_log_v1";

let memorySettings: FleetFareConfig[] = DEFAULT_FLEET_FARE_SETTINGS.map((d) => ({ ...d }));
let memoryLogs: FareCalculationLog[] = [];

const isBrowser = () => typeof window !== "undefined";

export { matchVehicleToFareConfig } from "@/lib/fleet-matcher";
import { matchVehicleToFareConfig } from "@/lib/fleet-matcher";

/**
 * Retrieve current fleet fare configuration.
 * Reads from localStorage if modified by Admin, falls back to in-memory/default settings.
 */
export function getFleetFareSettings(): FleetFareConfig[] {
  if (!isBrowser()) return memorySettings;
  try {
    // Purge old corrupted v4/v3 storage keys if present
    try {
      window.localStorage.removeItem("szt_fleet_fare_settings_v4");
      window.localStorage.removeItem("szt_fleet_fare_settings_v3");
      window.localStorage.removeItem("szt_fleet_fare_settings_v2");
    } catch {}

    const raw = window.localStorage.getItem(STORAGE_KEY_FLEET_PRICING);
    if (!raw) {
      memorySettings = DEFAULT_FLEET_FARE_SETTINGS.map((d) => ({ ...d }));
      return memorySettings;
    }
    const parsed: Partial<FleetFareConfig>[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      memorySettings = DEFAULT_FLEET_FARE_SETTINGS.map((d) => ({ ...d }));
      return memorySettings;
    }

    // Safety check: If parsed data contains duplicate fleetIds, discard corrupt data
    const fleetIds = parsed.map((p) => p.fleetId).filter(Boolean);
    if (new Set(fleetIds).size < fleetIds.length) {
      console.warn("Detected corrupted fare settings in localStorage with duplicate fleet IDs, resetting to clean defaults.");
      window.localStorage.removeItem(STORAGE_KEY_FLEET_PRICING);
      memorySettings = DEFAULT_FLEET_FARE_SETTINGS.map((d) => ({ ...d }));
      return memorySettings;
    }

    // Ensure each default vehicle maintains its distinct identity and rates
    const merged = DEFAULT_FLEET_FARE_SETTINGS.map((def) => {
      const found = parsed.find(
        (p) =>
          (p.fleetId && p.fleetId === def.fleetId) ||
          (p.id && p.id === def.id) ||
          (p.vehicleSlug && p.vehicleSlug === def.vehicleSlug) ||
          (p.vehicleName && def.vehicleName && p.vehicleName.toLowerCase() === def.vehicleName.toLowerCase())
      );
      if (!found) return { ...def };

      const oneWay = typeof found.oneWayRatePerKm === 'number' && found.oneWayRatePerKm > 0 ? found.oneWayRatePerKm : def.oneWayRatePerKm;
      const extraKm = typeof found.localExtraKmRate === 'number' && found.localExtraKmRate > 0 ? found.localExtraKmRate : oneWay;

      return {
        ...def,
        oneWayRatePerKm: oneWay,
        roundTripRatePerKm: typeof found.roundTripRatePerKm === 'number' && found.roundTripRatePerKm > 0 ? found.roundTripRatePerKm : def.roundTripRatePerKm,
        oneWayMinimumKm: typeof found.oneWayMinimumKm === 'number' && found.oneWayMinimumKm > 0 ? found.oneWayMinimumKm : def.oneWayMinimumKm,
        roundTripMinimumKmPerDay: typeof found.roundTripMinimumKmPerDay === 'number' && found.roundTripMinimumKmPerDay > 0 ? found.roundTripMinimumKmPerDay : def.roundTripMinimumKmPerDay,
        oneWayDriverAllowance: typeof found.oneWayDriverAllowance === 'number' ? found.oneWayDriverAllowance : def.oneWayDriverAllowance,
        roundTripDriverAllowancePerDay: typeof found.roundTripDriverAllowancePerDay === 'number' ? found.roundTripDriverAllowancePerDay : def.roundTripDriverAllowancePerDay,
        localBasePrice: typeof found.localBasePrice === 'number' && found.localBasePrice > 0 ? found.localBasePrice : def.localBasePrice,
        localBaseHours: typeof found.localBaseHours === 'number' ? found.localBaseHours : def.localBaseHours,
        localBaseKm: typeof found.localBaseKm === 'number' ? found.localBaseKm : def.localBaseKm,
        localExtraKmRate: extraKm,
        localExtraHourRate: typeof found.localExtraHourRate === 'number' ? found.localExtraHourRate : def.localExtraHourRate,
        localDriverAllowance: typeof found.localDriverAllowance === 'number' ? found.localDriverAllowance : def.localDriverAllowance,
        airportBasePrice: typeof found.airportBasePrice === 'number' && found.airportBasePrice > 0 ? found.airportBasePrice : def.airportBasePrice,
        airportBaseHours: typeof found.airportBaseHours === 'number' ? found.airportBaseHours : def.airportBaseHours,
        airportBaseKm: typeof found.airportBaseKm === 'number' ? found.airportBaseKm : def.airportBaseKm,
        airportExtraKmRate: typeof found.airportExtraKmRate === 'number' ? found.airportExtraKmRate : extraKm,
        airportExtraHourRate: typeof found.airportExtraHourRate === 'number' ? found.airportExtraHourRate : def.airportExtraHourRate,
        isActive: found.isActive !== undefined ? Boolean(found.isActive) : def.isActive,
      };
    });
    memorySettings = merged.sort((a, b) => a.displayOrder - b.displayOrder);
    return memorySettings;
  } catch (err) {
    console.error("Failed to load fleet fare settings:", err);
    memorySettings = DEFAULT_FLEET_FARE_SETTINGS.map((d) => ({ ...d }));
    return memorySettings;
  }
}

/**
 * Get fare configuration for a specific fleet by fleetId, slug, or name.
 */
export function getFleetFareConfig(fleetIdOrSlug: string, fallbackSlugOrName?: string): FleetFareConfig {
  const all = getFleetFareSettings();
  const matched =
    matchVehicleToFareConfig(fleetIdOrSlug, all) ||
    matchVehicleToFareConfig(fallbackSlugOrName, all);
  if (matched) return matched;
  return all[0];
}

/**
 * Update fleet fare settings (Admin function).
 */
export function saveFleetFareSettings(settings: FleetFareConfig[]): void {
  const stamped = settings.map((s) => ({
    ...s,
    updatedAt: new Date().toISOString(),
  }));
  memorySettings = stamped;

  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_FLEET_PRICING, JSON.stringify(stamped));
    window.dispatchEvent(new CustomEvent("fleetFareSettingsUpdated", { detail: stamped }));
    window.dispatchEvent(new CustomEvent("fleetDataUpdated"));

    // Synchronize pricePerKm and priceFromLabel across all frontend fleet vehicles using dynamic import
    import("@/content/fleet")
      .then(({ getFleetVehicles, saveFleetVehicles }) => {
        const vehicles = getFleetVehicles();
        let hasChanges = false;
        const updatedVehicles = vehicles.map((v) => {
          const match = matchVehicleToFareConfig(v.slug || v.id || v.name, stamped);
          if (match && match.oneWayRatePerKm) {
            hasChanges = true;
            return {
              ...v,
              pricePerKm: match.oneWayRatePerKm,
              priceFromLabel: `₹${match.oneWayRatePerKm} / km`,
            };
          }
          return v;
        });

        if (hasChanges) {
          saveFleetVehicles(updatedVehicles);
        }
      })
      .catch(() => {});
  } catch (err) {
    console.error("Failed to save fleet fare settings:", err);
  }
}

/**
 * Reset fleet fare settings back to factory defaults.
 */
export function resetFleetFareSettings(): FleetFareConfig[] {
  memorySettings = DEFAULT_FLEET_FARE_SETTINGS.map((d) => ({ ...d }));
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY_FLEET_PRICING);
      window.localStorage.removeItem("szt_fleet_fare_settings_v4");
      window.localStorage.removeItem("szt_fleet_fare_settings_v3");
      window.localStorage.removeItem("szt_fleet_fare_settings_v2");
    } catch {}
    window.dispatchEvent(
      new CustomEvent("fleetFareSettingsUpdated", { detail: memorySettings }),
    );
    window.dispatchEvent(new CustomEvent("fleetDataUpdated"));

    const vehicles = getFleetVehicles();
    const updatedVehicles = vehicles.map((v) => {
      const match = memorySettings.find(
        (s) => s.fleetId === v.id || s.vehicleSlug === v.slug || s.vehicleName.toLowerCase() === v.name.toLowerCase()
      );
      if (match && match.oneWayRatePerKm) {
        return {
          ...v,
          pricePerKm: match.oneWayRatePerKm,
          priceFromLabel: `₹${match.oneWayRatePerKm} / km`,
        };
      }
      return v;
    });
    saveFleetVehicles(updatedVehicles);
  }
  return memorySettings;
}

/**
 * Helper: Calculate billable calendar days between start and return dates.
 * Calendar-day rule:
 * - 25 Aug to 25 Aug = 1 Day
 * - 25 Aug to 26 Aug = 2 Days
 * - 25 Aug to 27 Aug = 3 Days
 */
export function calculateCalendarDays(startDateStr: string, returnDateStr?: string | null): number {
  if (!startDateStr) return 1;
  if (!returnDateStr || returnDateStr === startDateStr) return 1;

  const d1 = new Date(startDateStr);
  const d2 = new Date(returnDateStr);

  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 1;

  // UTC midnight comparison to prevent timezone drift
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor((utc2 - utc1) / msPerDay);

  return Math.max(1, diffDays + 1);
}

/**
 * Core Fare Calculation Engine.
 * Transparently calculates exact billable KM, base fare, allowances, toll (₹1.5/km), state tax, and GST.
 */
export function calculateFleetFare(input: FareCalculationInput): FareCalculationResult {
  const config = getFleetFareConfig(input.fleetId);
  const tollRate = config.tollRatePerKm ?? 1.5;

  // Add-on options: Luggage Carrier ₹250, Pet Traveling ₹900
  const luggageCarrier = Boolean(input.luggageCarrier);
  const luggageCarrierCost = luggageCarrier ? 250 : 0;
  const petTravelling = Boolean(input.petTravelling);
  const petTravellingCost = petTravelling ? 900 : 0;
  const addonsCost = luggageCarrierCost + petTravellingCost;

  // 1. LOCAL RENTAL CALCULATION
  if (input.tripType === "local") {
    const pkgHours = input.localPackageHours || 4;
    const pkgKm = input.localPackageKm || (pkgHours === 4 ? 40 : pkgHours === 8 ? 80 : 120);
    const base4hPrice = config.localBasePrice || 2200;
    
    // Scale package base price cleanly according to hours/km if 8h or 12h
    let baseFare = base4hPrice;
    if (pkgHours === 8) {
      baseFare = Math.round(base4hPrice * 1.6);
    } else if (pkgHours >= 12) {
      baseFare = Math.round(base4hPrice * 2.2);
    }

    const driverAllowance = config.localDriverAllowance || 400;
    const tollAmount = null;
    const tollDisplay = "Extra at actuals (Direct to Toll/Parking)";
    const stateTaxAmount = null;
    const stateTaxDisplay = "Extra at actuals where applicable";

    const subtotal = baseFare + driverAllowance + addonsCost;
    const gstPercentage = config.gstPercentage || 5;
    const gstAmount = Math.round((subtotal * gstPercentage) / 100);
    const totalEstimatedFare = subtotal + gstAmount;
    const advanceAmount = Math.round(totalEstimatedFare * 0.15);
    const balanceToDriver = totalEstimatedFare - advanceAmount;

    return {
      fleet: config,
      tripType: "local",
      pickup: input.pickup,
      destination: input.destination || "Local City Use",
      pickupDate: input.pickupDate,
      dayCount: 1,
      routeDistanceKm: pkgKm,
      effectiveTripDistanceKm: pkgKm,
      minimumBillingKm: pkgKm,
      billableDistanceKm: pkgKm,
      ratePerKm: config.oneWayRatePerKm || config.localExtraKmRate || 14,
      baseFare,
      driverAllowance,
      tollAmount,
      tollDisplay,
      stateTaxAmount,
      stateTaxDisplay,
      luggageCarrier,
      luggageCarrierCost,
      petTravelling,
      petTravellingCost,
      addonsCost,
      packageName: `Local ${pkgHours}h / ${pkgKm}km Package`,
      subtotal,
      gstPercentage,
      gstAmount,
      totalEstimatedFare,
      advanceAmount,
      balanceToDriver,
      routeDuration: `${pkgHours} hours package`,
      calculatedAt: new Date().toISOString(),
    };
  }

  // 2. AIRPORT TRANSFER CALCULATION
  if (input.tripType === "airport") {
    const pkgHours = 3;
    const pkgKm = 30;
    const baseFare = config.airportBasePrice || 1100;
    const driverAllowance = 0; // Included in airport fixed fare
    const tollAmount = null;
    const tollDisplay = "Extra at actuals (Airport toll/parking)";
    const stateTaxAmount = null;
    const stateTaxDisplay = "Extra at actuals if interstate";

    const subtotal = baseFare + addonsCost;
    const gstPercentage = config.gstPercentage || 5;
    const gstAmount = Math.round((subtotal * gstPercentage) / 100);
    const totalEstimatedFare = subtotal + gstAmount;
    const advanceAmount = Math.round(totalEstimatedFare * 0.15);
    const balanceToDriver = totalEstimatedFare - advanceAmount;

    return {
      fleet: config,
      tripType: "airport",
      pickup: input.pickup,
      destination: input.destination || "Airport",
      pickupDate: input.pickupDate,
      dayCount: 1,
      routeDistanceKm: pkgKm,
      effectiveTripDistanceKm: pkgKm,
      minimumBillingKm: pkgKm,
      billableDistanceKm: pkgKm,
      ratePerKm: config.oneWayRatePerKm || config.airportExtraKmRate || 14,
      baseFare,
      driverAllowance,
      tollAmount,
      tollDisplay,
      stateTaxAmount,
      stateTaxDisplay,
      luggageCarrier,
      luggageCarrierCost,
      petTravelling,
      petTravellingCost,
      addonsCost,
      packageName: `Airport Transfer (3h / 30km)`,
      subtotal,
      gstPercentage,
      gstAmount,
      totalEstimatedFare,
      advanceAmount,
      balanceToDriver,
      routeDuration: "Airport Transfer (3 Hours)",
      calculatedAt: new Date().toISOString(),
    };
  }

  // 3. ONE-WAY TRIP CALCULATION
  const routeDist = Math.max(1, Math.round(input.routeDistanceKm || 150));

  if (input.tripType === "one-way") {
    const minKm = config.oneWayMinimumKm;
    const billableKm = Math.max(routeDist, minKm);
    const rate = config.oneWayRatePerKm;
    const baseFare = billableKm * rate;
    const driverAllowance = config.oneWayDriverAllowance;

    // Toll calculation (included in fare & stored for admin)
    const tollAmount = Math.round(billableKm * tollRate);
    const tollDisplay = "Included";

    // State tax & parking - paid directly by customer at actuals
    const stateTaxAmount: number | null = null;
    const stateTaxDisplay = "Pay directly by customer (at actuals)";

    // Taxable Subtotal (Base Fare + Driver Allowance + Toll + Addons)
    const subtotal = baseFare + driverAllowance + tollAmount + addonsCost;

    const gstPercentage = config.gstPercentage;
    const gstAmount = Math.round((subtotal * gstPercentage) / 100);
    const totalEstimatedFare = subtotal + gstAmount;
    const advanceAmount = Math.round(totalEstimatedFare * 0.15);
    const balanceToDriver = totalEstimatedFare - advanceAmount;

    return {
      fleet: config,
      tripType: "one-way",
      pickup: input.pickup,
      destination: input.destination,
      pickupDate: input.pickupDate,
      dayCount: 1,
      routeDistanceKm: routeDist,
      effectiveTripDistanceKm: routeDist,
      minimumBillingKm: minKm,
      billableDistanceKm: billableKm,
      ratePerKm: rate,
      baseFare,
      driverAllowance,
      tollAmount,
      tollDisplay,
      stateTaxAmount,
      stateTaxDisplay,
      luggageCarrier,
      luggageCarrierCost,
      petTravelling,
      petTravellingCost,
      addonsCost,
      subtotal,
      gstPercentage,
      gstAmount,
      totalEstimatedFare,
      advanceAmount,
      balanceToDriver,
      routeDuration: input.routeDuration,
      isInterstate: input.isInterstate,
      calculatedAt: new Date().toISOString(),
    };
  }

  // 4. ROUND TRIP CALCULATION
  const dayCount = calculateCalendarDays(input.pickupDate, input.returnDate);
  const minKmPerDay = config.roundTripMinimumKmPerDay;
  const minimumBillingKm = dayCount * minKmPerDay;
  const roundTripRouteKm = routeDist * 2;
  const billableDistanceKm = Math.max(roundTripRouteKm, minimumBillingKm);

  const rate = config.roundTripRatePerKm;
  const baseFare = billableDistanceKm * rate;
  const driverAllowance = dayCount * config.roundTripDriverAllowancePerDay;

  // Toll calculation (included in fare & stored for admin)
  const tollAmount = Math.round(billableDistanceKm * tollRate);
  const tollDisplay = "Included";

  // State tax & parking - paid directly by customer at actuals
  const stateTaxAmount: number | null = null;
  const stateTaxDisplay = "Pay directly by customer (at actuals)";

  // Taxable Subtotal (Base Fare + Driver Allowance + Toll + Addons)
  const subtotal = baseFare + driverAllowance + tollAmount + addonsCost;

  const gstPercentage = config.gstPercentage;
  const gstAmount = Math.round((subtotal * gstPercentage) / 100);
  const totalEstimatedFare = subtotal + gstAmount;
  const advanceAmount = Math.round(totalEstimatedFare * 0.15);
  const balanceToDriver = totalEstimatedFare - advanceAmount;

  return {
    fleet: config,
    tripType: "round-trip",
    pickup: input.pickup,
    destination: input.destination,
    pickupDate: input.pickupDate,
    returnDate: input.returnDate,
    dayCount,
    routeDistanceKm: routeDist,
    effectiveTripDistanceKm: roundTripRouteKm,
    minimumBillingKm,
    billableDistanceKm,
    ratePerKm: rate,
    baseFare,
    driverAllowance,
    tollAmount,
    tollDisplay,
    stateTaxAmount,
    stateTaxDisplay,
    luggageCarrier,
    luggageCarrierCost,
    petTravelling,
    petTravellingCost,
    addonsCost,
    subtotal,
    gstPercentage,
    gstAmount,
    totalEstimatedFare,
    advanceAmount,
    balanceToDriver,
    routeDuration: input.routeDuration,
    isInterstate: input.isInterstate,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Log a fare calculation to history (for Admin review & analytics).
 */
export function logFareCalculation(
  result: FareCalculationResult,
  customer?: { name?: string; phone?: string; source?: string },
): FareCalculationLog {
  const logEntry: FareCalculationLog = {
    ...result,
    id: `calc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    customerName: customer?.name,
    customerPhone: customer?.phone,
    source: customer?.source ?? "calculator",
  };

  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_CALC_LOGS);
      const existing: FareCalculationLog[] = raw ? JSON.parse(raw) : [];
      const updated = [logEntry, ...existing].slice(0, 100); // keep last 100
      window.localStorage.setItem(STORAGE_KEY_CALC_LOGS, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to log fare calculation:", err);
    }
  }

  return logEntry;
}

/**
 * List recent fare calculations (Admin View).
 */
export function listFareCalculationLogs(): FareCalculationLog[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_CALC_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Generate formatted WhatsApp quotation text.
 */
export function formatWhatsAppQuoteMessage(calc: FareCalculationResult): string {
  const tripTypeLabel =
    calc.tripType === "one-way"
      ? "One Way"
      : calc.tripType === "round-trip"
      ? "Round Trip"
      : calc.tripType === "local"
      ? "Local Rental"
      : "Airport Transfer";

  const lines: string[] = [
    `*SOUTH ZOOM TOURISM — FARE ESTIMATE*`,
    `🚗 *Vehicle:* ${calc.fleet.vehicleName}`,
    `🛣 *Trip Type:* ${tripTypeLabel}`,
    `📍 *Pickup:* ${calc.pickup}`,
    calc.destination ? `🏁 *Drop:* ${calc.destination}` : "",
    `📅 *Pickup Date:* ${calc.pickupDate}${calc.returnDate ? ` → Return: ${calc.returnDate}` : ""}`,
    calc.tripType === "round-trip" ? `⏱ *Trip Duration:* ${calc.dayCount} Days` : "",
    calc.routeDuration ? `⏳ *Estimated Travel / Duration:* ${calc.routeDuration}` : "",
    `\n*--- FARE BREAKDOWN ---*`,
    calc.packageName ? `• *Package:* ${calc.packageName}` : "",
    calc.tripType === "one-way" || calc.tripType === "round-trip"
      ? `• *Billable Distance:* ${calc.billableDistanceKm} km (@ ₹${calc.ratePerKm}/km)`
      : `• *Base Allowance:* ${calc.billableDistanceKm} km`,
    `• *Base Fare:* ₹${calc.baseFare.toLocaleString("en-IN")}`,
    calc.driverAllowance > 0
      ? `• *Driver Allowance:* ₹${calc.driverAllowance.toLocaleString("en-IN")}`
      : "",
    `• *Toll:* ${calc.tollDisplay}`,
    calc.luggageCarrier ? `• *Luggage Carrier (+₹250):* Added` : "",
    calc.petTravelling ? `• *Pet Traveling (+₹900):* Added` : "",
    `• *Subtotal:* ₹${calc.subtotal.toLocaleString("en-IN")}`,
    `• *GST (${calc.gstPercentage}%):* ₹${calc.gstAmount.toLocaleString("en-IN")}`,
    `\n💰 *ESTIMATED TOTAL: ₹${calc.totalEstimatedFare.toLocaleString("en-IN")}*`,
    `💳 *15% Advance to Pay:* ₹${calc.advanceAmount.toLocaleString("en-IN")}`,
    `💵 *Balance (Pay to Driver):* ₹${calc.balanceToDriver.toLocaleString("en-IN")}`,
    `\n_Note: Toll, parking, state tax at actuals where applicable. Complete advance payment online to lock vehicle._`,
  ].filter(Boolean);

  return lines.join("\n");
}
