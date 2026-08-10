import { z } from "zod";
import {
  budgetBands,
  getDestinationOptions,
  getHotelCategoryOptions,
  getRoomTypeChoices,
  getSightseeingOptions,
  getVehicleOptions,
  labelFor,
  mealPlanOptions,
  type CustomEnquiryStop,
} from "@/content/custom-tour";

export type Stop = { slug: string; nights: number };

export type CustomTourState = {
  stops: Stop[];
  startDate: string;
  days: number;
  flexibleDates: boolean;
  adults: number;
  children: number;
  childAges: string;
  needVehicle: boolean;
  vehicleCategory: string;
  pickupCity: string;
  hotelRequired: boolean;
  hotelCategory: string;
  roomType: string;
  rooms: number;
  mealPlan: string;
  sightseeing: string[];
  guideRequired: boolean;
  budgetBand: string;
  budgetAmount: string;
  requirements: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};

export const initialState: CustomTourState = {
  stops: [],
  startDate: "",
  days: 3,
  flexibleDates: false,
  adults: 2,
  children: 0,
  childAges: "",
  needVehicle: true,
  vehicleCategory: "",
  pickupCity: "",
  hotelRequired: true,
  hotelCategory: "",
  roomType: "any",
  rooms: 1,
  mealPlan: "breakfast",
  sightseeing: [],
  guideRequired: false,
  budgetBand: "",
  budgetAmount: "",
  requirements: "",
  name: "",
  phone: "",
  email: "",
  consent: false,
};

export const DRAFT_KEY = "szt:custom-tour:draft";

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/* Per-step validation                                                  */
/* ------------------------------------------------------------------ */

export type Errors = Partial<Record<keyof CustomTourState, string>>;

const phoneRe = /^[+]?[\d\s-]{10,15}$/;

export function validateStep(step: number, s: CustomTourState): Errors {
  const e: Errors = {};

  if (step === 0) {
    if (s.stops.length === 0) e.stops = "Add at least one destination.";
    if (!s.startDate) e.startDate = "Choose a travel start date.";
    else if (s.startDate < todayISO()) e.startDate = "Start date cannot be in the past.";
    if (!Number.isFinite(s.days) || s.days < 1 || s.days > 60)
      e.days = "Trip length must be between 1 and 60 days.";
  }

  if (step === 1) {
    if (s.adults < 1 || s.adults > 60) e.adults = "Enter between 1 and 60 adults.";
    if (s.children < 0 || s.children > 40) e.children = "Enter up to 40 children.";
    if (s.children > 0 && s.childAges.trim().length === 0)
      e.childAges = "Add children's ages so we can plan seating and hotel policies.";
    if (s.needVehicle && !s.vehicleCategory) e.vehicleCategory = "Choose a vehicle type.";
    if (s.needVehicle && s.pickupCity.trim().length < 2)
      e.pickupCity = "Tell us the pickup city.";
  }

  if (step === 2) {
    if (s.hotelRequired && !s.hotelCategory) e.hotelCategory = "Choose a hotel category.";
    if (s.hotelRequired && (s.rooms < 1 || s.rooms > 40))
      e.rooms = "Enter between 1 and 40 rooms.";
  }

  if (step === 3) {
    if (!s.budgetBand) e.budgetBand = "Pick a budget range.";
    if (s.budgetAmount && !/^\d{3,8}$/.test(s.budgetAmount))
      e.budgetAmount = "Enter the amount in numbers only.";
    if (s.name.trim().length < 2) e.name = "Please enter your name.";
    if (!phoneRe.test(s.phone.trim())) e.phone = "Enter a valid phone number (10–15 digits).";
    if (s.email.trim() && !z.string().email().safeParse(s.email.trim()).success)
      e.email = "Enter a valid email address.";
    if (s.requirements.length > 1000) e.requirements = "Please keep it under 1000 characters.";
    if (!s.consent) e.consent = "Please allow us to contact you about this enquiry.";
  }

  return e;
}

/* ------------------------------------------------------------------ */
/* Summary                                                              */
/* ------------------------------------------------------------------ */

export type SummaryRow = { label: string; value: string; step: number };

export function buildSummary(s: CustomTourState): SummaryRow[] {
  const destinations = getDestinationOptions();
  const rows: SummaryRow[] = [];

  rows.push({
    label: "Route",
    value: s.stops.length
      ? s.stops.map((st) => labelFor(destinations, st.slug)).join(" → ")
      : "Not chosen yet",
    step: 0,
  });
  rows.push({
    label: "Dates",
    value: s.startDate
      ? `${s.startDate}${s.flexibleDates ? " (flexible)" : ""} · ${s.days} day${s.days === 1 ? "" : "s"}`
      : "Not chosen yet",
    step: 0,
  });
  rows.push({
    label: "Travellers",
    value: `${s.adults} adult${s.adults === 1 ? "" : "s"}${s.children ? `, ${s.children} child${s.children === 1 ? "" : "ren"}` : ""}`,
    step: 1,
  });
  rows.push({
    label: "Vehicle",
    value: s.needVehicle
      ? `${labelFor(getVehicleOptions(), s.vehicleCategory) || "Not chosen yet"}${s.pickupCity ? ` · from ${s.pickupCity}` : ""}`
      : "Not required",
    step: 1,
  });
  rows.push({
    label: "Stay",
    value: s.hotelRequired
      ? [
          labelFor(getHotelCategoryOptions(), s.hotelCategory) || "Category not chosen",
          labelFor(getRoomTypeChoices(), s.roomType),
          `${s.rooms} room${s.rooms === 1 ? "" : "s"}`,
          labelFor(mealPlanOptions, s.mealPlan),
        ]
          .filter(Boolean)
          .join(" · ")
      : "Not required",
    step: 2,
  });
  rows.push({
    label: "Sightseeing",
    value: s.sightseeing.length
      ? s.sightseeing.map((x) => labelFor(getSightseeingOptions(), x)).join(", ") +
        (s.guideRequired ? " · guide needed" : "")
      : "No preference",
    step: 2,
  });
  rows.push({
    label: "Budget",
    value: s.budgetBand
      ? `${labelFor(budgetBands, s.budgetBand)}${s.budgetAmount ? ` · around ₹${Number(s.budgetAmount).toLocaleString("en-IN")}` : ""}`
      : "Not chosen yet",
    step: 3,
  });
  rows.push({
    label: "Contact",
    value: s.name ? `${s.name} · ${s.phone}${s.email ? ` · ${s.email}` : ""}` : "Not added yet",
    step: 3,
  });

  return rows;
}

export function toStops(s: CustomTourState): CustomEnquiryStop[] {
  const destinations = getDestinationOptions();
  return s.stops.map((st, i) => ({
    destination_slug: st.slug,
    label: labelFor(destinations, st.slug),
    position: i + 1,
    nights: st.nights,
  }));
}
