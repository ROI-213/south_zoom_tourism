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
  updatedAt?: string;
};

export type FareCalculationInput = {
  fleetId: string;
  tripType: "one-way" | "round-trip";
  pickup: string;
  destination: string;
  pickupDate: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  routeDistanceKm: number;
  routeDuration?: string;
  estimatedTollAmount?: number | null;
  estimatedStateTaxAmount?: number | null;
  isInterstate?: boolean;
};

export type FareCalculationResult = {
  fleet: FleetFareConfig;
  tripType: "one-way" | "round-trip";
  pickup: string;
  destination: string;
  pickupDate: string;
  returnDate?: string;
  dayCount: number;
  routeDistanceKm: number; // Single route distance
  effectiveTripDistanceKm: number; // Single distance for one-way, 2x for round-trip
  minimumBillingKm: number;
  billableDistanceKm: number;
  ratePerKm: number;
  baseFare: number;
  driverAllowance: number;
  tollAmount: number | null;
  tollDisplay: string;
  stateTaxAmount: number | null;
  stateTaxDisplay: string;
  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  totalEstimatedFare: number;
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
  },
];

const STORAGE_KEY_FLEET_PRICING = "szt_fleet_fare_settings_v3";
const STORAGE_KEY_CALC_LOGS = "szt_fare_calculations_log_v1";

let memorySettings: FleetFareConfig[] = DEFAULT_FLEET_FARE_SETTINGS;
let memoryLogs: FareCalculationLog[] = [];

const isBrowser = () => typeof window !== "undefined";

/**
 * Retrieve current fleet fare configuration.
 * Reads from localStorage if modified by Admin, falls back to in-memory/default settings.
 */
export function getFleetFareSettings(): FleetFareConfig[] {
  if (!isBrowser()) return memorySettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_FLEET_PRICING);
    if (!raw) return memorySettings;
    const parsed: FleetFareConfig[] = JSON.parse(raw);
    // Ensure all default fleets are present in case schema was updated
    const merged = DEFAULT_FLEET_FARE_SETTINGS.map((def) => {
      const found = parsed.find((p) => p.fleetId === def.fleetId || p.id === def.id);
      return found ? { ...def, ...found } : def;
    });
    memorySettings = merged.sort((a, b) => a.displayOrder - b.displayOrder);
    return memorySettings;
  } catch (err) {
    console.error("Failed to load fleet fare settings:", err);
    return memorySettings;
  }
}

/**
 * Get fare configuration for a specific fleet by fleetId or slug.
 */
export function getFleetFareConfig(fleetIdOrSlug: string): FleetFareConfig {
  const all = getFleetFareSettings();
  const match = all.find(
    (f) => f.fleetId === fleetIdOrSlug || f.vehicleSlug === fleetIdOrSlug || f.id === fleetIdOrSlug,
  );
  return match ?? all[0];
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
  } catch (err) {
    console.error("Failed to save fleet fare settings:", err);
  }
}

/**
 * Reset fleet fare settings back to factory defaults.
 */
export function resetFleetFareSettings(): FleetFareConfig[] {
  memorySettings = DEFAULT_FLEET_FARE_SETTINGS;
  if (isBrowser()) {
    window.localStorage.removeItem(STORAGE_KEY_FLEET_PRICING);
    window.dispatchEvent(
      new CustomEvent("fleetFareSettingsUpdated", { detail: DEFAULT_FLEET_FARE_SETTINGS }),
    );
  }
  return DEFAULT_FLEET_FARE_SETTINGS;
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
  const routeDist = Math.max(1, Math.round(input.routeDistanceKm));
  const tollRate = config.tollRatePerKm ?? 1.5;

  if (input.tripType === "one-way") {
    const minKm = config.oneWayMinimumKm;
    const billableKm = Math.max(routeDist, minKm);
    const rate = config.oneWayRatePerKm;
    const baseFare = billableKm * rate;
    const driverAllowance = config.oneWayDriverAllowance;

    // Toll calculation at ₹1.5 per KM (or vehicle tollRate)
    const tollAmount = Math.round(billableKm * tollRate);
    const tollDisplay = `₹${tollAmount.toLocaleString("en-IN")} (₹${tollRate}/km)`;

    // State tax & parking - paid directly by customer at actuals
    const stateTaxAmount: number | null = null;
    const stateTaxDisplay = "Pay directly by customer (at actuals)";

    // Taxable Subtotal (Base Fare + Driver Allowance + Toll)
    const subtotal = baseFare + driverAllowance + tollAmount;

    const gstPercentage = config.gstPercentage;
    const gstAmount = Math.round((subtotal * gstPercentage) / 100);
    const totalEstimatedFare = subtotal + gstAmount;

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
      subtotal,
      gstPercentage,
      gstAmount,
      totalEstimatedFare,
      routeDuration: input.routeDuration,
      isInterstate: input.isInterstate,
      calculatedAt: new Date().toISOString(),
    };
  }

  // ROUND TRIP CALCULATION
  const dayCount = calculateCalendarDays(input.pickupDate, input.returnDate);
  const minKmPerDay = config.roundTripMinimumKmPerDay;
  const minimumBillingKm = dayCount * minKmPerDay;
  const roundTripRouteKm = routeDist * 2;
  const billableDistanceKm = Math.max(roundTripRouteKm, minimumBillingKm);

  const rate = config.roundTripRatePerKm;
  const baseFare = billableDistanceKm * rate;
  const driverAllowance = dayCount * config.roundTripDriverAllowancePerDay;

  // Toll calculation at ₹1.5 per KM (or vehicle tollRate) for round-trip billable distance
  const tollAmount = Math.round(billableDistanceKm * tollRate);
  const tollDisplay = `₹${tollAmount.toLocaleString("en-IN")} (₹${tollRate}/km)`;

  // State tax & parking - paid directly by customer at actuals
  const stateTaxAmount: number | null = null;
  const stateTaxDisplay = "Pay directly by customer (at actuals)";

  // Taxable Subtotal (Base Fare + Driver Allowance + Toll)
  const subtotal = baseFare + driverAllowance + tollAmount;

  const gstPercentage = config.gstPercentage;
  const gstAmount = Math.round((subtotal * gstPercentage) / 100);
  const totalEstimatedFare = subtotal + gstAmount;

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
    billableDistanceKm: billableDistanceKm,
    ratePerKm: rate,
    baseFare,
    driverAllowance,
    tollAmount,
    tollDisplay,
    stateTaxAmount,
    stateTaxDisplay,
    subtotal,
    gstPercentage,
    gstAmount,
    totalEstimatedFare,
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
  const isOneWay = calc.tripType === "one-way";
  const lines: string[] = [
    `*SOUTH ZOOM TOURISM — FARE ESTIMATE*`,
    `🚗 *Vehicle:* ${calc.fleet.vehicleName}`,
    `🛣 *Trip Type:* ${isOneWay ? "One Way" : "Round Trip"}`,
    `📍 *From:* ${calc.pickup}`,
    `🏁 *To:* ${calc.destination}`,
    `📅 *Pickup Date:* ${calc.pickupDate}${calc.returnDate ? ` → Return: ${calc.returnDate}` : ""}`,
    !isOneWay ? `⏱ *Trip Duration:* ${calc.dayCount} Days` : "",
    calc.routeDuration ? `⏳ *Estimated Travel Time:* ${calc.routeDuration}` : "",
    `\n*--- FARE BREAKDOWN ---*`,
    `• *Actual Route Distance:* ${calc.effectiveTripDistanceKm} km ${!isOneWay ? `(${calc.routeDistanceKm} km × 2)` : ""}`,
    `• *Minimum Billing Rule:* ${calc.minimumBillingKm} km ${!isOneWay ? `(${calc.dayCount} days × ${calc.fleet.roundTripMinimumKmPerDay} km/day)` : `(Min ${calc.fleet.oneWayMinimumKm} km)`}`,
    `• *Billable Distance:* ${calc.billableDistanceKm} km`,
    `• *Rate per KM:* ₹${calc.ratePerKm}/km`,
    `• *Base Fare:* ₹${calc.baseFare.toLocaleString("en-IN")}`,
    `• *Driver Allowance:* ₹${calc.driverAllowance.toLocaleString("en-IN")} ${!isOneWay ? `(${calc.dayCount} days × ₹${calc.fleet.roundTripDriverAllowancePerDay})` : ""}`,
    `• *Toll:* ${calc.tollDisplay}`,
    calc.stateTaxDisplay !== "Included / As applicable" ? `• *State Tax:* ${calc.stateTaxDisplay}` : "",
    `• *Subtotal:* ₹${calc.subtotal.toLocaleString("en-IN")}`,
    `• *GST (${calc.gstPercentage}%):* ₹${calc.gstAmount.toLocaleString("en-IN")}`,
    `\n💰 *ESTIMATED TOTAL: ₹${calc.totalEstimatedFare.toLocaleString("en-IN")}*`,
    `\n_Note: Fare shown is an estimated fare based on the selected route and vehicle. Toll, parking, permit, and interstate taxes are billed at actuals where applicable._`,
  ].filter(Boolean);

  return lines.join("\n");
}
