/**
 * Centralized Rate Card Data & Admin Management System for South Zoom Tourism.
 * 
 * Supports:
 * - Local Use Base Package & Additional Charges
 * - Outstation One Way Rates
 * - Outstation Round Trip Rates
 * - Interactive Local Rental Fare Calculator
 * - LocalStorage Persistence & Admin Editing
 */

export type LocalRateConfig = {
  baseHours: number;
  baseKm: number;
  basePrice: number;
  extraKmRate: number;
  extraHourRate: number;
  driverAllowance: number;
  tollPolicy: string;
  parkingPolicy: string;
};

export type OutstationOneWayConfig = {
  minKm: number;
  extraKmRate: number;
  extraHourRate: number;
  toll: number;
  tollFlaggedForReview?: boolean;
  stateTax: number;
  driverAllowance: number;
  hillCharges: number;
};

export type OutstationRoundTripConfig = {
  minKm: number;
  extraKmRate: number;
  perDayRate: string; // e.g. "Contact for Rate" or custom price
  toll: number;
  stateTax: number;
  driverAllowance: string; // e.g. "As applicable" or "—"
  hillCharges: number;
};

export type AirportRateConfig = {
  baseHours: number;
  baseKm: number;
  basePrice: number;
  extraKmRate: number;
  extraHourRate: number;
  tollPolicy: string;
  parkingPolicy: string;
};

export type RateCardConfig = {
  local: LocalRateConfig;
  airport: AirportRateConfig;
  outstationOneWay: OutstationOneWayConfig;
  outstationRoundTrip: OutstationRoundTripConfig;
  disclaimer: {
    gstNotice: string;
    additionalChargesNotice: string;
    variationNotice: string;
    quoteConfirmationNotice: string;
  };
  lastUpdated?: string;
};

export const DEFAULT_RATE_CARD_CONFIG: RateCardConfig = {
  local: {
    baseHours: 4,
    baseKm: 40,
    basePrice: 2200,
    extraKmRate: 18,
    extraHourRate: 200,
    driverAllowance: 400,
    tollPolicy: "Extra at actuals",
    parkingPolicy: "Extra at actuals",
  },
  airport: {
    baseHours: 3,
    baseKm: 30,
    basePrice: 1100,
    extraKmRate: 28,
    extraHourRate: 200,
    tollPolicy: "Extra at actuals",
    parkingPolicy: "Extra at actuals",
  },
  outstationOneWay: {
    minKm: 165,
    extraKmRate: 14,
    extraHourRate: 200,
    toll: 1000,
    tollFlaggedForReview: false,
    stateTax: 1000,
    driverAllowance: 500,
    hillCharges: 100,
  },
  outstationRoundTrip: {
    minKm: 300,
    extraKmRate: 12,
    perDayRate: "Contact for Rate",
    toll: 1000,
    stateTax: 100,
    driverAllowance: "Per Day",
    hillCharges: 47,
  },
  disclaimer: {
    gstNotice: "All Rates Are Exclusive of GST",
    additionalChargesNotice:
      "Toll, parking, permits, entry fees and other applicable charges may be charged separately unless specifically mentioned.",
    variationNotice:
      "Rates may vary depending on vehicle category, trip duration, route, season and availability.",
    quoteConfirmationNotice: "Please confirm the final quotation before booking.",
  },
};

const STORAGE_KEY = "south_zoom_rate_card_config_v2";

export function getRateCardConfig(): RateCardConfig {
  if (typeof window === "undefined") return DEFAULT_RATE_CARD_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_RATE_CARD_CONFIG;
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_RATE_CARD_CONFIG,
      ...parsed,
      local: { ...DEFAULT_RATE_CARD_CONFIG.local, ...(parsed.local || {}) },
      airport: { ...DEFAULT_RATE_CARD_CONFIG.airport, ...(parsed.airport || {}) },
      outstationOneWay: {
        ...DEFAULT_RATE_CARD_CONFIG.outstationOneWay,
        ...(parsed.outstationOneWay || {}),
      },
      outstationRoundTrip: {
        ...DEFAULT_RATE_CARD_CONFIG.outstationRoundTrip,
        ...(parsed.outstationRoundTrip || {}),
      },
    };
  } catch (error) {
    console.error("Failed to parse rate card config from localStorage:", error);
    return DEFAULT_RATE_CARD_CONFIG;
  }
}

export function saveRateCardConfig(config: RateCardConfig): void {
  if (typeof window === "undefined") return;
  try {
    const updated = { ...config, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("rateCardConfigUpdated", { detail: updated }));
  } catch (error) {
    console.error("Failed to save rate card config to localStorage:", error);
  }
}

export const updateRateCardConfig = saveRateCardConfig;

export function resetRateCardConfig(): RateCardConfig {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("rateCardConfigUpdated", { detail: DEFAULT_RATE_CARD_CONFIG }));
  }
  return DEFAULT_RATE_CARD_CONFIG;
}

/**
 * Calculates estimated fare for Local Rental given duration & distance.
 */
export function calculateLocalTripFare(
  hours: number,
  km: number,
  config: LocalRateConfig = DEFAULT_RATE_CARD_CONFIG.local,
) {
  const basePrice = config.basePrice;
  const extraHours = Math.max(0, hours - config.baseHours);
  const extraKm = Math.max(0, km - config.baseKm);

  const extraHoursCost = extraHours * config.extraHourRate;
  const extraKmCost = extraKm * config.extraKmRate;
  const driverAllowance = config.driverAllowance;

  const estimatedTotal = basePrice + extraHoursCost + extraKmCost + driverAllowance;

  return {
    basePrice,
    extraHours,
    extraHoursCost,
    extraKm,
    extraKmCost,
    driverAllowance,
    estimatedTotal,
  };
}
