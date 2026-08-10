/**
 * Admin-managed content for the customised package enquiry builder.
 *
 * Mirrors the future tables:
 *   custom_enquiry_settings : banner, steps copy, budget bands, meal plans,
 *                             sightseeing interests, duplicate window
 *   custom_enquiries        : reference, source, status, assigned_to,
 *                             follow_up_at, customer fields
 *   custom_enquiry_items    : enquiry_id, destination_slug, position, nights
 *
 * Every option list below is derived from existing admin records
 * (destinations, vehicle categories, hotel categories, room types) so nothing
 * has to be re-entered when the CMS goes live.
 */

import packagesBanner from "@/assets/hero-tours.jpg";
import { getPublishedDestinations, destinationTripTypes } from "@/content/destinations";
import { getVisibleVehicleCategories } from "@/content/fleet";
import { hotelCategories, roomTypeOptions } from "@/content/hotels";

export type Option = { slug: string; label: string; description?: string };

export type CustomEnquiryStop = {
  destination_slug: string;
  label: string;
  position: number;
  nights: number;
};

export type CustomEnquiryPayload = {
  reference: string;
  source: "custom-tour";
  page_url: string;
  status: "new";
  assigned_to: null;
  follow_up_at: null;
  created_at: string;
  /** Structured selections — searchable, not a single free-text blob. */
  stops: CustomEnquiryStop[];
  start_date: string;
  days: number;
  adults: number;
  children: number;
  child_ages: string | null;
  vehicle_category: string | null;
  self_drive_pickup: string | null;
  hotel_required: boolean;
  hotel_category: string | null;
  room_type: string | null;
  rooms: number | null;
  meal_plan: string | null;
  sightseeing: string[];
  guide_required: boolean;
  budget_band: string;
  budget_amount: number | null;
  requirements: string | null;
  name: string;
  phone: string;
  email: string | null;
  contact_consent: boolean;
};

/* ------------------------------------------------------------------ */
/* Page blocks                                                          */
/* ------------------------------------------------------------------ */

export const customTourBannerBlock = {
  visible: true,
  title: "Build your custom tour",
  subtitle:
    "Pick your destinations, dates and comfort level. Our planners send a day-wise itinerary with vehicle, stay and a fixed quote — usually within a few hours.",
  image: packagesBanner,
  imageAlt: "Traveller looking out over the Western Ghats on a South India custom tour",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Tour Packages", href: "/tour-packages" },
    { label: "Custom Tour", href: "/custom-tour" },
  ],
};

export const customTourIntroBlock = {
  heading: "Four short steps, one tailored itinerary",
  description:
    "Nothing is booked here — you're asking for a personalised plan. Change anything before you submit; the summary updates as you go.",
};

export const customTourSteps: { id: string; title: string; hint: string }[] = [
  { id: "route", title: "Route & dates", hint: "Where you're going and when" },
  { id: "travellers", title: "Travellers & vehicle", hint: "Group size and transport" },
  { id: "stay", title: "Stay & experiences", hint: "Hotels, meals, sightseeing" },
  { id: "contact", title: "Budget & contact", hint: "How we reach you" },
];

export const customTourNextSteps: { id: string; title: string; description: string }[] = [
  {
    id: "ns1",
    title: "We review your plan",
    description: "A planner checks distances, drive times and stay availability for your dates.",
  },
  {
    id: "ns2",
    title: "You get a day-wise quote",
    description: "Itinerary, vehicle, hotel options and a fixed price — by WhatsApp or email.",
  },
  {
    id: "ns3",
    title: "Adjust, then confirm",
    description: "Swap hotels or days as you like. Booking happens only after you approve.",
  },
];

export const budgetBands: Option[] = [
  { slug: "economy", label: "Economy", description: "Budget stays, shared sightseeing" },
  { slug: "comfort", label: "Comfort", description: "3-star stays, private vehicle" },
  { slug: "premium", label: "Premium", description: "4-star stays, curated experiences" },
  { slug: "luxury", label: "Luxury", description: "5-star stays and resorts" },
  { slug: "not-sure", label: "Not sure yet", description: "Send me a few options" },
];

export const mealPlanOptions: Option[] = [
  { slug: "room-only", label: "Room only" },
  { slug: "breakfast", label: "Breakfast included" },
  { slug: "half-board", label: "Breakfast + dinner" },
  { slug: "full-board", label: "All meals" },
];

export const customTourFormBlock = {
  /** Blocks identical resubmissions within this window (ms). */
  duplicateWindowMs: 60_000,
  maxStops: 8,
  successNote:
    "Save your reference number — quote it when you call or WhatsApp us and we'll pull up your plan instantly.",
};

/* ------------------------------------------------------------------ */
/* Derived option helpers                                               */
/* ------------------------------------------------------------------ */

export function getDestinationOptions(): Option[] {
  return getPublishedDestinations().map((d) => ({
    slug: d.slug,
    label: d.name,
    description: d.state,
  }));
}

export function getSightseeingOptions(): Option[] {
  return destinationTripTypes
    .filter((t) => t.visible)
    .sort((a, b) => a.order - b.order)
    .map((t) => ({ slug: t.slug, label: t.label }));
}

export function getVehicleOptions(): Option[] {
  return getVisibleVehicleCategories().map((v) => ({ slug: v.slug, label: v.label }));
}

export function getHotelCategoryOptions(): Option[] {
  return hotelCategories
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ slug: c.slug, label: c.label, description: c.description }));
}

export function getRoomTypeChoices(): Option[] {
  return roomTypeOptions
    .filter((r) => r.visible)
    .sort((a, b) => a.order - b.order)
    .map((r) => ({ slug: r.slug, label: r.label }));
}

export function labelFor(options: Option[], slug: string | null | undefined): string {
  if (!slug) return "";
  return options.find((o) => o.slug === slug)?.label ?? slug;
}

/** SZT-CT-YYMMDD-XXXX reference shown to the customer after submission. */
export function generateCustomTourReference(now = new Date()): string {
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SZT-CT-${y}${m}${d}-${rand}`;
}
