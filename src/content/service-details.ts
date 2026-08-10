/**
 * Admin-managed service detail data.
 *
 * Mirrors the shape of the future detail tables so the template can switch to
 * live data with no component changes:
 *   service_features, service_pricing, service_gallery, service_modules,
 *   service_process, service_terms, service_faq_links, service_related.
 *
 * `sections` drives which optional blocks are enabled per service and in what
 * order — the template renders strictly from this list, so an admin can turn
 * any block off or reorder it without code changes.
 */

import { servicesFaqBlock, getPublishedServices, type Service } from "@/content/services";

import heroFleet from "@/assets/hero-fleet.jpg";
import heroTours from "@/assets/hero-tours.jpg";
import heroHotels from "@/assets/hero-hotels.jpg";
import servicesBanner from "@/assets/hero-fleet.jpg";
import serviceCorporate from "@/assets/service-corporate-new.png";
import serviceWedding from "@/assets/service-wedding-new.png";
import servicePilgrimage from "@/assets/service-pilgrimage-new.png";
import serviceGroup from "@/assets/service-group.png";
import office1 from "@/assets/office-1.jpg";

export type SectionKey =
  | "overview"
  | "modules"
  | "features"
  | "process"
  | "gallery"
  | "pricing"
  | "terms"
  | "faqs"
  | "related";

export type SectionToggle = { key: SectionKey; enabled: boolean; order: number };

export type ServiceModule = {
  id: string;
  title: string;
  description?: string;
  options: { id: string; label: string; detail: string }[];
};

export type PricingRow = { id: string; label: string; unit: string; price?: string; note?: string };

export type ServiceDetail = {
  serviceId: string;
  sections: SectionToggle[];
  modules: ServiceModule[];
  process: { id: string; title: string; description: string }[];
  gallery: { id: string; image: string; alt: string }[];
  pricing: { showRates: boolean; note: string; rows: PricingRow[] };
  terms: string[];
  faqIds: string[];
  faqs: { id: string; question: string; answer: string }[];
  relatedIds: string[];
};

const defaultSections: SectionToggle[] = [
  { key: "overview", enabled: true, order: 1 },
  { key: "modules", enabled: true, order: 2 },
  { key: "features", enabled: true, order: 3 },
  { key: "process", enabled: true, order: 4 },
  { key: "gallery", enabled: true, order: 5 },
  { key: "pricing", enabled: true, order: 6 },
  { key: "terms", enabled: true, order: 7 },
  { key: "faqs", enabled: true, order: 8 },
  { key: "related", enabled: true, order: 9 },
];

const commonProcess = [
  { id: "p1", title: "Share your plan", description: "Send dates, pickup point, passengers and anything special over the form, WhatsApp or a call." },
  { id: "p2", title: "Get a fixed quote", description: "We reply with vehicle or property options and a written quote with every charge itemised." },
  { id: "p3", title: "Confirm the booking", description: "Approve the quote and we lock the vehicle, driver or room and send a written confirmation." },
  { id: "p4", title: "Travel with support", description: "Driver details arrive before pickup and our control room stays reachable through the trip." },
];

const commonTerms = [
  "Quoted fares include fuel, driver charges and vehicle maintenance unless stated otherwise.",
  "Tolls, parking, permits and state entry fees are billed at actuals and shown in the quote.",
  "Night allowance applies for driving between 10:00 PM and 6:00 AM.",
  "Vehicle bookings can be cancelled free of charge up to 24 hours before pickup.",
  "GST is applicable as per prevailing rates and appears on every invoice.",
];

const commonGallery = [
  { id: "g1", image: heroFleet, alt: "South Zoom Tourism sedan and SUV ready for pickup" },
  { id: "g2", image: serviceGroup, alt: "South Zoom group tour fleet" },
  { id: "g3", image: office1, alt: "South Zoom Tourism travel desk handling a customer booking" },
  { id: "g4", image: servicesBanner, alt: "Fleet of taxis and a tempo traveller lined up at golden hour" },
];

const details: Record<string, Partial<ServiceDetail>> = {
  "local-taxi": {
    modules: [
      {
        id: "m-local-packages",
        title: "Hourly & full-day packages",
        description: "Pick the slab that fits your day — extra hours and kilometres are billed at the published rate.",
        options: [
          { id: "o1", label: "4 hours / 40 km", detail: "Short city errands, a shopping run or a half-day of meetings." },
          { id: "o2", label: "8 hours / 80 km", detail: "A full working day or a city sightseeing loop with the same driver." },
          { id: "o3", label: "12 hours / 120 km", detail: "Long days, multi-stop family functions and late returns." },
        ],
      },
    ],
    pricing: {
      showRates: true,
      note: "City rates for Chennai. Rates for other cities are shared on enquiry.",
      rows: [
        { id: "pr1", label: "Hatchback — 4h / 40 km", unit: "package", price: "₹1,400", note: "₹180 per extra hour" },
        { id: "pr2", label: "Sedan — 8h / 80 km", unit: "package", price: "₹2,600", note: "₹13 per extra km" },
        { id: "pr3", label: "SUV — 12h / 120 km", unit: "package", price: "₹4,600", note: "₹18 per extra km" },
      ],
    },
    gallery: [commonGallery[0], commonGallery[1], commonGallery[3]],
  },
  "outstation-trips": {
    modules: [
      {
        id: "m-trip-type",
        title: "Trip types",
        options: [
          { id: "o1", label: "One-way drop", detail: "Pay only for the distance you travel, with a fixed minimum of 130 km." },
          { id: "o2", label: "Round trip", detail: "250 km daily minimum, same driver and vehicle for the whole journey." },
          { id: "o3", label: "Multi-city itinerary", detail: "Several stops across states with permits and night halts arranged by us." },
        ],
      },
    ],
    pricing: {
      showRates: true,
      note: "Driver bata of ₹400 per day and ₹300 night allowance apply on outstation journeys.",
      rows: [
        { id: "pr1", label: "Sedan", unit: "per km", price: "₹14" },
        { id: "pr2", label: "SUV (6–7 seats)", unit: "per km", price: "₹19" },
        { id: "pr3", label: "Tempo traveller", unit: "per km", price: "₹24" },
      ],
    },
    gallery: [commonGallery[0], { id: "g-t", image: heroTours, alt: "Highway drive between South Indian hill stations" }, commonGallery[1]],
  },
  "airport-transfers": {
    modules: [
      {
        id: "m-transfer",
        title: "Pickup & drop options",
        options: [
          { id: "o1", label: "Arrival pickup", detail: "Flight tracked live, 60 minutes free waiting and a name board on request." },
          { id: "o2", label: "Departure drop", detail: "Pickup timed to your check-in cut-off with a live driver location link." },
          { id: "o3", label: "Flight details capture", detail: "Share flight number and terminal in the enquiry so delays adjust automatically." },
        ],
      },
    ],
    pricing: {
      showRates: true,
      note: "Fixed fares within city limits. Airport parking and toll charged at actuals.",
      rows: [
        { id: "pr1", label: "Sedan transfer", unit: "per trip", price: "₹899" },
        { id: "pr2", label: "SUV transfer", unit: "per trip", price: "₹1,499" },
        { id: "pr3", label: "Tempo traveller transfer", unit: "per trip", price: "₹2,900" },
      ],
    },
  },
  "corporate-travel": {
    modules: [
      {
        id: "m-corporate",
        title: "Contract & billing options",
        options: [
          { id: "o1", label: "Monthly contract", detail: "Dedicated vehicles and chauffeurs on a fixed monthly rate card." },
          { id: "o2", label: "Pay-per-trip account", detail: "On-demand bookings settled on one consolidated monthly GST invoice." },
          { id: "o3", label: "Employee transport", detail: "Shift-based pickup and drop routes with attendance and duty slips." },
        ],
      },
    ],
    pricing: { showRates: false, note: "Corporate rate cards are prepared per contract. Share your monthly volume for a proposal.", rows: [] },
    gallery: [{ id: "g-c", image: serviceCorporate, alt: "Toyota Innova Crysta executive MPV for corporate transport" }, commonGallery[1], commonGallery[2]],
  },
  "group-travel": {
    modules: [
      {
        id: "m-group",
        title: "Group vehicle options",
        options: [
          { id: "o1", label: "Tempo traveller — 12 to 17 seats", detail: "Push-back seats, AC and a roof luggage carrier." },
          { id: "o2", label: "Mini bus — 21 to 27 seats", detail: "Ideal for school trips, offsites and wedding guest shuttles." },
          { id: "o3", label: "Coach — 35 to 50 seats", detail: "Long-distance group travel with a co-driver on journeys over eight hours." },
        ],
      },
    ],
    pricing: {
      showRates: true,
      note: "Group rates depend on route and duration; the quote confirms the final figure.",
      rows: [
        { id: "pr1", label: "Tempo traveller", unit: "per km", price: "₹24" },
        { id: "pr2", label: "Mini bus", unit: "per km", price: "₹38" },
        { id: "pr3", label: "Coach", unit: "per km", price: "₹52" },
      ],
    },
  },
  "pilgrimage-tours": {
    modules: [
      {
        id: "m-pilgrim",
        title: "Circuits & accommodation",
        options: [
          { id: "o1", label: "Navagraha circuit", detail: "Nine temples around Kumbakonam, paced for elders across three days." },
          { id: "o2", label: "Arupadai Veedu", detail: "The six abodes of Lord Murugan with darshan-timed departures." },
          { id: "o3", label: "Temple-adjacent stays", detail: "Rooms booked within walking distance of each temple wherever available." },
        ],
      },
    ],
    pricing: { showRates: false, note: "Circuit pricing depends on group size, stay category and season.", rows: [] },
    gallery: [{ id: "g-p", image: servicePilgrimage, alt: "Pilgrims walking towards a temple gopuram at sunrise" }, commonGallery[0], commonGallery[2]],
  },
  "wedding-and-events": {
    modules: [
      {
        id: "m-wedding",
        title: "Wedding coordination",
        options: [
          { id: "o1", label: "Decorated bridal car", detail: "Floral decoration, uniformed chauffeur and a standby vehicle." },
          { id: "o2", label: "Guest shuttle loops", detail: "Timed loops between hotels, the venue and the airport or station." },
          { id: "o3", label: "On-site travel desk", detail: "A coordinator on the ground across all function days with one point of contact." },
        ],
      },
    ],
    pricing: { showRates: false, note: "Wedding fleets are quoted per function plan after a short planning call.", rows: [] },
    gallery: [{ id: "g-w", image: serviceWedding, alt: "White wedding car decorated with marigold garlands" }, commonGallery[0], commonGallery[1]],
  },
  "hotel-and-room-booking": {
    modules: [
      {
        id: "m-hotel",
        title: "Hotel categories",
        options: [
          { id: "o1", label: "Budget lodges", detail: "Clean, inspected rooms near temples, stations and city centres." },
          { id: "o2", label: "3–4 star hotels", detail: "Breakfast-inclusive rooms with parking and 24-hour reception." },
          { id: "o3", label: "Resorts & homestays", detail: "Hill and backwater properties with views, ideal for families." },
        ],
      },
    ],
    pricing: {
      showRates: true,
      note: "Partner rates vary by season and availability; the quote confirms the live rate.",
      rows: [
        { id: "pr1", label: "Budget room", unit: "per night", price: "₹1,800" },
        { id: "pr2", label: "3–4 star room", unit: "per night", price: "₹3,200" },
        { id: "pr3", label: "Resort / cottage", unit: "per night", price: "₹4,500" },
      ],
    },
    gallery: [{ id: "g-h", image: heroHotels, alt: "Partner hotel room with a balcony overlooking the hills" }, commonGallery[3], commonGallery[2]],
  },
  "custom-tour-planning": {
    modules: [
      {
        id: "m-custom",
        title: "Build your itinerary",
        description: "Choose as much or as little as you like — the planner fills in the rest.",
        options: [
          { id: "o1", label: "Destination & duration", detail: "Any combination of hills, backwaters, temples, beaches and heritage towns." },
          { id: "o2", label: "Vehicle & hotel class", detail: "Pick the vehicle size and stay category that matches your budget." },
          { id: "o3", label: "Meals & sightseeing", detail: "Add meal plans, entry tickets, guides and activity bookings to the same quote." },
        ],
      },
    ],
    pricing: { showRates: false, note: "Custom itineraries are quoted line by line; the quote stays valid for seven days.", rows: [] },
  },
  "ticket-booking": {
    modules: [
      {
        id: "m-tickets",
        title: "What we book",
        options: [
          { id: "o1", label: "Train & bus tickets", detail: "IRCTC and state bus bookings including tatkal attempts and seat choice." },
          { id: "o2", label: "Flight tickets", detail: "Domestic fares compared across airlines with reschedule support." },
          { id: "o3", label: "Monument & activity passes", detail: "Entry tickets timed to your sightseeing plan." },
        ],
      },
    ],
    pricing: { showRates: false, note: "A small service fee applies per ticket and is confirmed before booking.", rows: [] },
  },
  "travel-assistance": {
    modules: [
      {
        id: "m-assist",
        title: "How assistance works",
        options: [
          { id: "o1", label: "365-day control room", detail: "One number answered by a person, including nights and public holidays." },
          { id: "o2", label: "Replacement dispatch", detail: "A standby vehicle sent from the nearest hub if anything goes wrong." },
          { id: "o3", label: "Mid-trip changes", detail: "Any change of plan re-quoted in writing before it is applied." },
        ],
      },
    ],
    pricing: { showRates: false, note: "Assistance is included with every South Zoom booking at no extra cost.", rows: [] },
    sections: defaultSections.map((s) => (s.key === "pricing" ? { ...s, enabled: false } : s)),
  },
};

/** Returns the detail record for a service, filling admin-optional blocks with safe defaults. */
export function getServiceDetail(service: Service): ServiceDetail {
  const override = details[service.slug] ?? {};
  const related = getPublishedServices()
    .filter((s) => s.slug !== service.slug)
    .sort((a, b) => {
      const aSame = a.categorySlug === service.categorySlug ? 0 : 1;
      const bSame = b.categorySlug === service.categorySlug ? 0 : 1;
      return aSame - bSame || a.order - b.order;
    })
    .slice(0, 3)
    .map((s) => s.id);

  return {
    serviceId: service.id,
    sections: override.sections ?? defaultSections,
    modules: override.modules ?? [],
    process: override.process ?? commonProcess,
    gallery: override.gallery ?? commonGallery.slice(0, 3),
    pricing:
      override.pricing ??
      { showRates: false, note: "Rates for this service are shared on enquiry.", rows: [] },
    terms: override.terms ?? commonTerms,
    faqIds: override.faqIds ?? servicesFaqBlock.items.slice(0, 4).map((f) => f.id),
    faqs: override.faqs ?? [],
    relatedIds: override.relatedIds ?? related,
  };
}

/** Resolves linked shared FAQs plus any service-specific FAQs, in admin order. */
export function resolveServiceFaqs(detail: ServiceDetail) {
  const linked = detail.faqIds
    .map((id) => servicesFaqBlock.items.find((f) => f.id === id))
    .filter((f): f is (typeof servicesFaqBlock.items)[number] => Boolean(f));
  return [...detail.faqs, ...linked];
}

/** Enabled sections in admin-defined order. */
export function orderedSections(detail: ServiceDetail): SectionKey[] {
  return detail.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
    .map((s) => s.key);
}
