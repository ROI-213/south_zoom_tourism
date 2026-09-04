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

export type PricingRow = {
  id: string;
  label: string;
  unit: string;
  price?: string;
  note?: string;
  vehicleSlug?: string;
  tripType?: "one-way" | "round-trip" | "local" | "airport";
};

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
  "Night allowance applies for driving between 9:30 PM and 5:30 AM.",
  "Vehicle bookings can be cancelled free of charge up to 2 hours before pickup.",
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
          { id: "o1", label: "4 hours / 40 km", detail: "Short city errands, shopping run, clinic visit or a half-day of meetings." },
          { id: "o2", label: "8 hours / 80 km", detail: "A full working day or city sightseeing loop with dedicated chauffeur." },
          { id: "o3", label: "12 hours / 120 km", detail: "Long days, multi-stop family functions, shopping tours and late returns." },
        ],
      },
    ],
    pricing: {
      showRates: true,
      note: "Quoted packages include fuel and driver charges. Extra hours and extra kilometres billed at published rates.",
      rows: [
        { id: "pr1", label: "Hatchback (WagonR) — 4h / 40 km", unit: "package", price: "₹1,800", note: "₹12 per extra km · ₹180 per extra hour", vehicleSlug: "hatchback-wagonr", tripType: "local" },
        { id: "pr2", label: "Sedan (Swift Dzire) — 4h / 40 km", unit: "package", price: "₹2,200", note: "₹14 per extra km · ₹200 per extra hour", vehicleSlug: "maruti-dzire", tripType: "local" },
        { id: "pr3", label: "Small SUV (Ertiga) — 4h / 40 km", unit: "package", price: "₹2,800", note: "₹18 per extra km · ₹200 per extra hour", vehicleSlug: "maruti-ertiga", tripType: "local" },
        { id: "pr4", label: "Big SUV (Innova Crysta) — 4h / 40 km", unit: "package", price: "₹3,500", note: "₹21 per extra km · ₹250 per extra hour", vehicleSlug: "innova-crysta", tripType: "local" },
        { id: "pr5", label: "Sedan (Swift Dzire) — 8h / 80 km", unit: "package", price: "₹2,800", note: "₹14 per extra km · ₹200 per extra hour", vehicleSlug: "maruti-dzire", tripType: "local" },
        { id: "pr6", label: "Small SUV (Ertiga) — 8h / 80 km", unit: "package", price: "₹3,500", note: "₹18 per extra km · ₹200 per extra hour", vehicleSlug: "maruti-ertiga", tripType: "local" },
        { id: "pr7", label: "Big SUV (Innova Crysta) — 8h / 80 km", unit: "package", price: "₹4,200", note: "₹21 per extra km · ₹250 per extra hour", vehicleSlug: "innova-crysta", tripType: "local" },
        { id: "pr8", label: "Tempo Traveller (12-17s) — 8h / 80 km", unit: "package", price: "₹5,500", note: "₹24 per extra km · ₹300 per extra hour", vehicleSlug: "tempo-traveller-12", tripType: "local" },
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
          { id: "o1", label: "One-way drop", detail: "Pay only for the distance you travel with flat 150 km minimum billing." },
          { id: "o2", label: "Round trip", detail: "300 km daily minimum with verified chauffeur and clean vehicle for the entire tour." },
          { id: "o3", label: "Multi-city itinerary", detail: "Several stops across states with permits, night halts and route assistance." },
        ],
      },
    ],
    pricing: {
      showRates: true,
      note: "One-Way min: 150 km. Round-Trip min: 300 km/day. Driver allowance: ₹300–₹400/day. Tolls & interstate permits at actuals.",
      rows: [
        { id: "pr1", label: "Hatchback (WagonR / Celerio)", unit: "per km", price: "₹12", note: "One-Way: ₹12/km · Round-Trip: ₹11/km (300 km/day min)", vehicleSlug: "hatchback-wagonr", tripType: "one-way" },
        { id: "pr2", label: "Sedan (Swift Dzire / Etios)", unit: "per km", price: "₹14", note: "One-Way: ₹14/km · Round-Trip: ₹13/km (300 km/day min)", vehicleSlug: "maruti-dzire", tripType: "one-way" },
        { id: "pr3", label: "Small SUV (Maruti Ertiga — 6 seats)", unit: "per km", price: "₹18", note: "One-Way: ₹18/km · Round-Trip: ₹16/km (300 km/day min)", vehicleSlug: "maruti-ertiga", tripType: "one-way" },
        { id: "pr4", label: "Big SUV (Innova Crysta — 7 seats)", unit: "per km", price: "₹21", note: "One-Way: ₹21/km · Round-Trip: ₹19/km (300 km/day min)", vehicleSlug: "innova-crysta", tripType: "one-way" },
        { id: "pr5", label: "Tempo Traveller (12–17 seats)", unit: "per km", price: "₹24", note: "Round-Trip: ₹24/km · 300 km/day min · Push-back AC seats", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
        { id: "pr6", label: "Mini Bus (21–27 seats)", unit: "per km", price: "₹38", note: "Outstation group tours, family outings & weddings", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
        { id: "pr7", label: "Luxury Coach (35–50 seats)", unit: "per km", price: "₹52", note: "Long distance journeys with air suspension & co-driver", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
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
          { id: "o1", label: "Arrival pickup", detail: "Flight tracked live, 60 minutes complimentary waiting and terminal name board on request." },
          { id: "o2", label: "Departure drop", detail: "Timed accurately to your check-in schedule with live driver location update." },
          { id: "o3", label: "Flight details capture", detail: "Share flight number & terminal in the booking for automatic delay tracking." },
        ],
      },
    ],
    pricing: {
      showRates: true,
      note: "Fixed transparent fares with 60 minutes complimentary waiting and verified chauffeurs. Airport parking and toll charged at actuals.",
      rows: [
        { id: "pr0", label: "Hatchback (WagonR / Celerio — 4 seats)", unit: "per trip", price: "₹950", note: "3h / 30km package · Extra km ₹12 · Extra hr ₹150", vehicleSlug: "hatchback-wagonr", tripType: "airport" },
        { id: "pr1", label: "Sedan (Swift Dzire / Etios — 4 seats)", unit: "per trip", price: "₹1,100", note: "3h / 30km package · Extra km ₹14 · Extra hr ₹180", vehicleSlug: "maruti-dzire", tripType: "airport" },
        { id: "pr2", label: "Small SUV (Maruti Ertiga — 6 seats)", unit: "per trip", price: "₹1,400", note: "3h / 30km package · Extra km ₹18 · Extra hr ₹200", vehicleSlug: "maruti-ertiga", tripType: "airport" },
        { id: "pr3", label: "Big SUV (Toyota Innova Crysta — 7 seats)", unit: "per trip", price: "₹1,800", note: "3h / 30km package · Extra km ₹21 · Extra hr ₹250", vehicleSlug: "innova-crysta", tripType: "airport" },
        { id: "pr4", label: "Tempo Traveller (12–17 seats)", unit: "per trip", price: "₹2,800", note: "Group airport transfer · Extra km ₹24 · Extra hr ₹300", vehicleSlug: "tempo-traveller-12", tripType: "airport" },
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
    pricing: {
      showRates: true,
      note: "Corporate rate contracts include GST invoicing and monthly billing credit terms. Select your fleet to calculate fare.",
      rows: [
        { id: "pr1", label: "Executive Sedan (Dzire / Etios)", unit: "per km", price: "₹14", note: "Daily: ₹2,200 (4h/40km) · Clean white cabs with AC", vehicleSlug: "maruti-dzire", tripType: "local" },
        { id: "pr2", label: "Premium MPV (Innova Crysta)", unit: "per km", price: "₹21", note: "Daily: ₹3,500 (4h/40km) · Chauffeur in uniform", vehicleSlug: "innova-crysta", tripType: "local" },
        { id: "pr3", label: "Employee Shuttle (Tempo Traveller 12-17s)", unit: "per km", price: "₹24", note: "Shift-based fixed routes & monthly contracts", vehicleSlug: "tempo-traveller-12", tripType: "local" },
        { id: "pr4", label: "Corporate Bus (27–45 seats)", unit: "per km", price: "₹38", note: "Team offsites & conference shuttles", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
      ],
    },
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
      note: "Group fleet comes with commercial yellow-board, push-back seats, luggage carrier and experienced drivers.",
      rows: [
        { id: "pr1", label: "Tempo Traveller (12-Seater TT)", unit: "per km", price: "₹24", note: "Round-trip min 300 km/day · 2×1 push-back seats", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
        { id: "pr2", label: "Tempo Traveller (17-Seater TT)", unit: "per km", price: "₹26", note: "Round-trip min 300 km/day · Overhead luggage carrier", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
        { id: "pr3", label: "Mini Bus (21–27 Seater)", unit: "per km", price: "₹38", note: "Family functions, school excursions and pilgrimages", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
        { id: "pr4", label: "Deluxe Coach (35–50 Seater)", unit: "per km", price: "₹52", note: "Air suspension, mic system & co-driver on long trips", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
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
    pricing: {
      showRates: true,
      note: "Specially curated temple tours across South India with senior-friendly driving and darshan timings.",
      rows: [
        { id: "pr1", label: "Family Sedan (Dzire / Etios — 4 seats)", unit: "per km", price: "₹14", note: "Round-trip min 300 km/day · Clean AC vehicle", vehicleSlug: "maruti-dzire", tripType: "round-trip" },
        { id: "pr2", label: "Comfort SUV (Ertiga — 6 seats)", unit: "per km", price: "₹18", note: "Round-trip min 300 km/day · Senior-friendly seating", vehicleSlug: "maruti-ertiga", tripType: "round-trip" },
        { id: "pr3", label: "Premium SUV (Innova Crysta — 7 seats)", unit: "per km", price: "₹21", note: "Smooth ride for elderly on long temple circuits", vehicleSlug: "innova-crysta", tripType: "round-trip" },
        { id: "pr4", label: "Group Tempo Traveller (12–17 seats)", unit: "per km", price: "₹24", note: "Complete family & group temple pilgrimage", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
      ],
    },
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
    pricing: {
      showRates: true,
      note: "Punctual event transportation with decorated bridal cars, guest shuttles and on-site coordination.",
      rows: [
        { id: "pr1", label: "Decorated Bridal Sedan (Dzire / Etios)", unit: "per day", price: "₹4,500", note: "Fresh floral decoration & chauffeur in uniform", vehicleSlug: "maruti-dzire", tripType: "local" },
        { id: "pr2", label: "VIP MPV (Toyota Innova Crysta)", unit: "per day", price: "₹4,200", note: "For groom, bride and VIP guests", vehicleSlug: "innova-crysta", tripType: "local" },
        { id: "pr3", label: "Guest Shuttle (Tempo Traveller 12-17s)", unit: "per day", price: "₹5,500", note: "Continuous loops between hotel & venue", vehicleSlug: "tempo-traveller-12", tripType: "local" },
        { id: "pr4", label: "Guest Coach (35-Seater Bus)", unit: "per day", price: "₹12,000", note: "Group pickup and drop for wedding guests", vehicleSlug: "tempo-traveller-12", tripType: "local" },
      ],
    },
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
      note: "Partner rates vary by season and availability. No advance payment required for inquiry.",
      rows: [
        { id: "pr1", label: "Budget Hotel Room", unit: "per night", price: "₹1,800", note: "Clean inspected rooms near transit hubs" },
        { id: "pr2", label: "3–4 Star Deluxe Room", unit: "per night", price: "₹3,200", note: "Complimentary breakfast & premium amenities" },
        { id: "pr3", label: "Luxury Heritage Resort / Cottage", unit: "per night", price: "₹4,500", note: "Scenic stays in Coorg, Ooty, Munnar & Kabini" },
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
    pricing: {
      showRates: true,
      note: "Tailor-made itineraries with private verified vehicles and drivers for your complete South India trip.",
      rows: [
        { id: "pr1", label: "Private Sedan Tour (4 seats)", unit: "per km", price: "₹14", note: "Dzire / Etios · 300 km/day min · Ideal for couples", vehicleSlug: "maruti-dzire", tripType: "round-trip" },
        { id: "pr2", label: "Private SUV Tour (Ertiga — 6 seats)", unit: "per km", price: "₹18", note: "300 km/day min · Great for hill stations", vehicleSlug: "maruti-ertiga", tripType: "round-trip" },
        { id: "pr3", label: "Luxury SUV Tour (Innova Crysta — 7 seats)", unit: "per km", price: "₹21", note: "300 km/day min · Maximum long-distance comfort", vehicleSlug: "innova-crysta", tripType: "round-trip" },
        { id: "pr4", label: "Group Tempo Traveller Tour (12–17 seats)", unit: "per km", price: "₹24", note: "300 km/day min · Family & friend group tours", vehicleSlug: "tempo-traveller-12", tripType: "round-trip" },
      ],
    },
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
    pricing: {
      showRates: true,
      note: "Instant ticket assistance with zero cancellation hassle and fast turnaround.",
      rows: [
        { id: "pr1", label: "Train & Tatkal Booking Assistance", unit: "per ticket", price: "₹150", note: "IRCTC confirmed ticket service" },
        { id: "pr2", label: "Flight Ticket Booking & Reschedule", unit: "per passenger", price: "₹250", note: "Domestic flights across all airlines" },
        { id: "pr3", label: "Interstate Bus & Sleeper Coach", unit: "per seat", price: "₹100", note: "KSRTC, SETC & private Volvo sleepers" },
      ],
    },
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
    pricing: {
      showRates: true,
      note: "24x7 control room support, breakdown replacement vehicle and route guidance across South India.",
      rows: [
        { id: "pr1", label: "24×7 On-Road Trip Assistance", unit: "per trip", price: "Free", note: "Included with every South Zoom vehicle booking" },
        { id: "pr2", label: "Standby Vehicle Dispatch Guarantee", unit: "per trip", price: "Included", note: "Replacement car sent from nearest hub if needed" },
      ],
    },
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
      service.pricingRows && service.pricingRows.length > 0
        ? { showRates: service.showPricing, note: override.pricing?.note || "Quoted rates include fuel and driver charges. Tolls and permits extra at actuals.", rows: service.pricingRows }
        : (override.pricing ?? { showRates: false, note: "Rates for this service are shared on enquiry.", rows: [] }),
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
