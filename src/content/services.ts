/**
 * Admin-managed services data.
 *
 * Mirrors the shape of the future `services` table so the UI can switch to
 * live data with no component changes:
 *   id, slug, category, title, short_description, detail_description,
 *   image, image_alt, icon, features[], benefits[], price_from,
 *   show_pricing, display_order, published, featured.
 *
 * Only `published` records are rendered publicly. Adding a new record here
 * (or a new row in the table later) adds a card and a detail page with no
 * code changes.
 */

import servicesBanner from "@/assets/services-banner.jpg";
import serviceLocalTaxi from "@/assets/service-local-taxi.png";
import serviceOutstation from "@/assets/service-outstation.png";
import serviceAirport from "@/assets/service-airport.png";
import serviceCorporate from "@/assets/service-corporate-new.png";
import serviceGroup from "@/assets/service-group-new.jpg";
import servicePilgrimage from "@/assets/service-pilgrimage-new.png";
import serviceWedding from "@/assets/service-wedding-vip.jpg";
import serviceHotels from "@/assets/service-hotel-stays.jpg";
import heroHotels from "@/assets/service-hotel-stays.jpg";
import pkgOoty from "@/assets/pkg-ooty.png";
import destBengaluru from "@/assets/destinations/dest-bengaluru-new.jpg";
import team1 from "@/assets/team-1.jpg";

export type ServiceCategory = {
  id: string;
  slug: string;
  label: string;
  order: number;
  visible: boolean;
};

export type Service = {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  icon: string;
  shortDescription: string;
  detailDescription: string;
  image: string;
  imageAlt: string;
  features: string[];
  benefits: string[];
  priceFrom?: string;
  showPricing: boolean;
  order: number;
  published: boolean;
  featured: boolean;
  pricingRows?: any[];
  pricingNote?: string;
  processSteps?: { id: string; title: string; description: string }[];
  terms?: string[];
  faqs?: { id: string; question: string; answer: string }[];
  modules?: any[];
};

// Dynamic cache for admin-managed services
export let dynamicServices: Service[] = [];
export const setDynamicServices = (items: Service[]) => {
  dynamicServices = items;
};

export function mapDbServiceToRecord(row: any, index: number = 0): Service {
  const rowSlug = (row.slug || '').toLowerCase();
  const rowName = (row.name || '').toLowerCase();

  const existing = services.find((s) => {
    const sSlug = s.slug.toLowerCase();
    const sTitle = s.title.toLowerCase();
    return sSlug === rowSlug || sTitle === rowName;
  });

  const isWedding = rowSlug.includes('wedding') || rowName.includes('wedding');
  const isHotel = rowSlug.includes('hotel') || rowName.includes('hotel') || rowSlug.includes('stay');

  const defaultImage = isWedding
    ? serviceWedding
    : isHotel
    ? serviceHotels
    : existing?.image || services[index % services.length]?.image;

  const defaultPrice = isWedding
    ? '₹4,200 / day'
    : isHotel
    ? '₹1,800 / night'
    : existing?.priceFrom || '₹14 / km';

  let parsedPricingRows: any[] | undefined = undefined;
  if (row.pricing_rows) {
    if (typeof row.pricing_rows === 'string') {
      try {
        parsedPricingRows = JSON.parse(row.pricing_rows);
      } catch {}
    } else if (Array.isArray(row.pricing_rows)) {
      parsedPricingRows = row.pricing_rows;
    }
  }

  return {
    id: row.id || existing?.id || `srv-${index}`,
    slug: row.slug || existing?.slug || (row.name || '').toLowerCase().replace(/\s+/g, '-'),
    categorySlug: row.category_slug || (isHotel ? 'stays' : isWedding ? 'business' : existing?.categorySlug || 'cabs'),
    title: row.name || existing?.title || '',
    icon: row.icon || (isHotel ? 'BedDouble' : isWedding ? 'HeartHandshake' : existing?.icon || 'Car'),
    shortDescription: row.short_description || existing?.shortDescription || '',
    detailDescription: row.full_description || existing?.detailDescription || row.short_description || '',
    image: row.main_image || defaultImage,
    imageAlt: row.image_alt || row.name || existing?.imageAlt || '',
    features: row.features && Array.isArray(row.features) && row.features.length > 0
      ? row.features
      : existing?.features || ['Verified Chauffeurs', 'Transparent Pricing', '24x7 Support'],
    benefits: row.benefits && Array.isArray(row.benefits) && row.benefits.length > 0
      ? row.benefits
      : existing?.benefits || ['No surge pricing', 'Clean vehicles', 'GST Invoices'],
    priceFrom: row.price_from || existing?.priceFrom || defaultPrice,
    showPricing: row.show_pricing !== undefined ? row.show_pricing : true,
    order: row.display_order || existing?.order || index + 1,
    published: row.active !== false,
    featured: row.featured !== undefined ? row.featured : (existing?.featured || false),
    pricingRows: parsedPricingRows,
    pricingNote: row.pricing_note || undefined,
    processSteps: Array.isArray(row.process_steps) && row.process_steps.length > 0 ? row.process_steps : undefined,
    terms: Array.isArray(row.terms) && row.terms.length > 0 ? row.terms : undefined,
    faqs: Array.isArray(row.faqs) && row.faqs.length > 0 ? row.faqs : undefined,
    modules: Array.isArray(row.modules) && row.modules.length > 0 ? row.modules : undefined,
  };
}

export const serviceCategories: ServiceCategory[] = [
  { id: "c-all", slug: "all", label: "All Services", order: 0, visible: true },
  { id: "c-cabs", slug: "cabs", label: "Cabs & Transfers", order: 1, visible: true },
  { id: "c-tours", slug: "tours", label: "Tours & Packages", order: 2, visible: true },
  { id: "c-stays", slug: "stays", label: "Stays", order: 3, visible: true },
  { id: "c-business", slug: "business", label: "Business & Events", order: 4, visible: true },
  { id: "c-support", slug: "support", label: "Travel Support", order: 5, visible: true },
];

export const services: Service[] = [
  {
    id: "s-local-taxi",
    slug: "local-taxi",
    categorySlug: "cabs",
    title: "Local Taxi",
    icon: "Car",
    shortDescription:
      "Hourly and full-day city cabs with waiting time, fuel and driver charges included in the quoted fare.",
    detailDescription:
      "City travel packages of 4 hours / 40 km, 8 hours / 80 km and 12 hours / 120 km across Chennai, Coimbatore, Madurai, Bengaluru and Kochi. Extra hours and kilometres are billed at the published slab rate, never at a surge price.",
    image: serviceLocalTaxi,
    imageAlt: "White sedan local city taxi with verified chauffeur",
    features: ["4h / 8h / 12h packages", "Hatchback to SUV", "Waiting time included"],
    benefits: ["No surge pricing", "Same driver all day", "Pay after the trip"],
    priceFrom: "₹1,800 / 4 hrs",
    showPricing: true,
    order: 1,
    published: true,
    featured: true,
  },
  {
    id: "s-outstation",
    slug: "outstation-trips",
    categorySlug: "cabs",
    title: "Outstation Trips",
    icon: "Route",
    shortDescription:
      "One-way drops and round trips anywhere in South India on a transparent per-kilometre rate.",
    detailDescription:
      "Round trips bill a 300 km daily minimum; one-way drops bill only the distance you travel with a 150 km minimum. Tolls, permits and driver bata are itemised in the quote before you confirm, so the final invoice matches the estimate.",
    image: serviceOutstation,
    imageAlt: "Outstation journey across scenic South India highway routes",
    features: ["One-way and round trip", "Per-km published rates", "Multi-day itineraries"],
    benefits: ["Tolls and permits itemised", "Night driving allowance shown upfront", "Route-experienced drivers"],
    priceFrom: "₹12 / km",
    showPricing: true,
    order: 2,
    published: true,
    featured: true,
  },
  {
    id: "s-airport",
    slug: "airport-transfers",
    categorySlug: "cabs",
    title: "Airport Transfers",
    icon: "Plane",
    shortDescription:
      "Fixed-fare pickups and drops with live flight tracking and complimentary waiting on arrivals.",
    detailDescription:
      "We track your flight number and adjust the pickup automatically for delays. Arrival pickups include 60 minutes of free waiting, and meet-and-greet at the terminal gate is available on request.",
    image: serviceAirport,
    imageAlt: "Airport transfer taxi pickup outside modern international terminal",
    features: ["Flight tracking", "60 min free waiting", "Meet and greet option"],
    benefits: ["Fixed fare, no meter", "24×7 including red-eye flights", "Luggage-sized vehicles"],
    priceFrom: "₹950 per transfer",
    showPricing: true,
    order: 3,
    published: true,
    featured: true,
  },
  {
    id: "s-corporate",
    slug: "corporate-travel",
    categorySlug: "business",
    title: "Corporate Travel",
    icon: "Briefcase",
    shortDescription:
      "Employee transport, client pickups and executive cars on monthly billing with GST invoices.",
    detailDescription:
      "Dedicated account manager, verified and police-checked chauffeurs, duty slips for every trip and one consolidated monthly invoice. Rate cards are agreed in advance and locked for the contract period.",
    image: serviceCorporate,
    imageAlt: "Toyota Innova Crysta executive MPV used for corporate and employee transport",
    features: ["Monthly consolidated billing", "GST invoices", "Dedicated account manager"],
    benefits: ["Verified chauffeurs", "Duty slips and trip reports", "Locked contract rates"],
    priceFrom: "₹14 / km",
    showPricing: true,
    order: 4,
    published: true,
    featured: true,
  },
  {
    id: "s-group",
    slug: "group-travel",
    categorySlug: "cabs",
    title: "Group Travel",
    icon: "Users",
    shortDescription:
      "Tempo travellers, mini coaches and buses for groups of 12 to 50 passengers with luggage space.",
    detailDescription:
      "School trips, family functions, offsites and pilgrim groups. Every group vehicle carries a first-aid kit and a co-driver on journeys longer than eight hours, and seating plans are confirmed before departure.",
    image: serviceGroup,
    imageAlt: "South Zoom group travel vehicles and tempo travellers",
    features: ["12 to 50 seats", "Push-back and AC options", "Co-driver on long routes"],
    benefits: ["One point of contact", "Luggage carrier included", "Group-rate discounts"],
    priceFrom: "₹24 / km",
    showPricing: true,
    order: 5,
    published: true,
    featured: false,
  },
  {
    id: "s-pilgrimage",
    slug: "pilgrimage-tours",
    categorySlug: "tours",
    title: "Pilgrimage Tours",
    icon: "Landmark",
    shortDescription:
      "Temple circuits across Tamil Nadu, Kerala and Karnataka with darshan timings planned around you.",
    detailDescription:
      "Navagraha, Arupadai Veedu, Rameswaram, Tirupati and Sabarimala circuits. We plan around darshan slots, arrange local guides where allowed and book stays close to each temple so elders travel less.",
    image: servicePilgrimage,
    imageAlt: "Pilgrims walking towards a South Indian temple gopuram at sunrise",
    features: ["Darshan-aware itineraries", "Temple-adjacent stays", "Local guide assistance"],
    benefits: ["Elder-friendly pacing", "Early morning departures", "Vegetarian meal stops"],
    priceFrom: "₹14 / km",
    showPricing: true,
    order: 6,
    published: true,
    featured: true,
  },
  {
    id: "s-wedding",
    slug: "wedding-and-events",
    categorySlug: "business",
    title: "Wedding & Event Transport",
    icon: "HeartHandshake",
    shortDescription:
      "Decorated cars, guest shuttles and multi-day fleets coordinated by an on-site travel desk.",
    detailDescription:
      "From the muhurtham car to airport runs for out-of-town guests, we run a single fleet plan across all function days with a coordinator on the ground and standby vehicles for last-minute changes.",
    image: serviceWedding,
    imageAlt: "White wedding car decorated with marigold garlands outside a function hall",
    features: ["Decorated bridal car", "Guest shuttle loops", "On-site coordinator"],
    benefits: ["Standby vehicles", "Multi-day single invoice", "Uniformed drivers"],
    priceFrom: "₹4,200 / day",
    showPricing: true,
    order: 7,
    published: true,
    featured: false,
  },
  {
    id: "s-hotels",
    slug: "hotel-and-room-booking",
    categorySlug: "stays",
    title: "Hotel & Room Booking",
    icon: "BedDouble",
    shortDescription:
      "Partner-rate rooms from budget lodges to hill resorts, inspected by our team before listing.",
    detailDescription:
      "Every partner property is visited by our team before it goes on the list. Rooms can be added to any vehicle or package booking so the stay, transfers and sightseeing arrive on one confirmation.",
    image: heroHotels,
    imageAlt: "Partner hotel room with a balcony overlooking scenic hills",
    features: ["Inspected partner hotels", "Budget to premium", "Add-on to any trip"],
    benefits: ["Negotiated partner rates", "Free cancellation options", "One combined confirmation"],
    priceFrom: "₹1,800 / night",
    showPricing: true,
    order: 8,
    published: true,
    featured: true,
  },
  {
    id: "s-custom",
    slug: "custom-tour-planning",
    categorySlug: "tours",
    title: "Customised Tour Planning",
    icon: "Sparkles",
    shortDescription:
      "Tell us your dates, budget and interests and we build the whole itinerary around them.",
    detailDescription:
      "A planner drafts a day-by-day route with drive times, stays, entry tickets and meal stops, then revises it with you until it fits. Quotes stay valid for seven days and break down every cost line.",
    image: pkgOoty,
    imageAlt: "Customized holiday tour planning in scenic South India destinations",
    features: ["Day-by-day itinerary", "Unlimited revisions", "Itemised quote"],
    benefits: ["Built around your budget", "Realistic drive times", "Quote valid 7 days"],
    priceFrom: "₹14 / km",
    showPricing: true,
    order: 9,
    published: true,
    featured: false,
  },
  {
    id: "s-tickets",
    slug: "ticket-booking",
    categorySlug: "support",
    title: "Ticket Booking",
    icon: "Ticket",
    shortDescription:
      "Train, bus, flight and monument tickets booked and reconfirmed alongside your travel plan.",
    detailDescription:
      "We handle IRCTC and airline bookings, seat selection, rescheduling and monument entry passes so your tickets line up with your pickup times instead of being booked separately.",
    image: destBengaluru,
    imageAlt: "City transport and travel reservation booking services",
    features: ["Train, bus and flight", "Monument entry passes", "Reschedule support"],
    benefits: ["Tickets matched to pickups", "Single support number", "Digital copies on WhatsApp"],
    showPricing: false,
    order: 10,
    published: true,
    featured: false,
  },
  {
    id: "s-assistance",
    slug: "travel-assistance",
    categorySlug: "support",
    title: "24/7 Travel Assistance",
    icon: "LifeBuoy",
    shortDescription:
      "A real person on the phone for breakdowns, route changes and late-night arrivals — any day.",
    detailDescription:
      "Our control room stays open every day of the year. If a vehicle has trouble, a replacement is dispatched from the nearest hub, and any change of plan mid-trip is re-quoted in writing before it is applied.",
    image: team1,
    imageAlt: "Dedicated 24/7 travel desk support coordinator assisting customers",
    features: ["365-day control room", "Replacement vehicle dispatch", "Written re-quotes"],
    benefits: ["No automated menus", "WhatsApp and phone", "Escalation to a manager"],
    showPricing: false,
    order: 11,
    published: true,
    featured: false,
  },
];

/* ------------------------------------------------------------------ */
/* Page blocks                                                          */
/* ------------------------------------------------------------------ */

export const servicesSeo = {
  title: "Travel Services in South India — South Zoom Tourism",
  description:
    "Local taxis, outstation trips, airport transfers, corporate and group travel, pilgrimage tours, hotel booking, custom itineraries and ticketing across South India.",
  canonical: "/services",
};

export const servicesBannerBlock = {
  id: "services-banner",
  order: 1,
  visible: true,
  title: "Our Travel Services",
  subtitle:
    "One travel desk for cabs, tours, stays and events — with published rates, verified drivers and support that answers.",
  image: servicesBanner,
  imageAlt: "South Zoom Tourism fleet of taxis, SUVs and a tempo traveller lined up at golden hour",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ],
};

export const servicesIntroBlock = {
  id: "services-intro",
  order: 2,
  visible: true,
  heading: "Pick a service, or let us plan the whole trip",
  body: "Every service below is run by the same team, on the same fleet, with the same published rates. Book them individually or combine cabs, stays and sightseeing into one plan with a single invoice and one number to call.",
};

export const servicesTrustBlock = {
  id: "services-trust",
  order: 4,
  visible: true,
  heading: "What every service includes",
  subheading: "The same standards apply whether you book a two-hour airport drop or a ten-day tour.",
  items: [
    { id: "t1", icon: "BadgeCheck", title: "Professional drivers", description: "Licence-verified, background-checked, route-trained and in uniform on every trip." },
    { id: "t2", icon: "IndianRupee", title: "Transparent rates", description: "Per-km rates, tolls, permits and allowances shown before you confirm — no fare added later." },
    { id: "t3", icon: "Hotel", title: "Verified hotels", description: "Every partner property is visited by our team before we put a room on the list." },
    { id: "t4", icon: "Headset", title: "24/7 support", description: "A real person on the phone every day of the year, including night arrivals." },
    { id: "t5", icon: "SlidersHorizontal", title: "Custom planning", description: "Any service can be reshaped around your dates, budget, group size and pace." },
  ],
};

export const servicesEnquiryBlock = {
  id: "services-enquiry",
  order: 5,
  visible: true,
  heading: "Not sure which service fits?",
  description:
    "Send us your dates and what you have in mind. We reply with options and a fixed quote — usually within an hour during office hours.",
};

export const servicesFaqBlock = {
  id: "services-faqs",
  order: 6,
  visible: true,
  heading: "Service questions",
  subheading: "Answers to what customers ask before booking a service.",
  items: [
    { id: "sf1", question: "Can I combine more than one service in a single booking?", answer: "Yes. Cabs, hotel rooms, sightseeing and tickets can be combined into one plan with a single confirmation and one invoice. Tell us everything you need in the enquiry and we quote it together." },
    { id: "sf2", question: "Are driver allowance, tolls and permits extra?", answer: "They are shown as separate lines in your quote before you confirm, so the final invoice matches what you approved. Nothing is added after the trip." },
    { id: "sf3", question: "Do you operate outside Tamil Nadu?", answer: "Yes — we run trips across Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, Goa and Puducherry, and interstate permits are arranged by us." },
    { id: "sf4", question: "How quickly do you respond to a service enquiry?", answer: "Within an hour during office hours (6:00 AM – 11:00 PM, all days). Overnight enquiries are answered first thing the next morning." },
    { id: "sf5", question: "Can I change or cancel a booked service?", answer: "Vehicle bookings can be cancelled free up to 2 hours before pickup. Hotel and package changes follow the property or operator policy shown at the time of booking." },
  ],
};

/* ------------------------------------------------------------------ */
/* Selectors (mirror the future published/order query)                  */
/* ------------------------------------------------------------------ */

export function getPublishedServices(): Service[] {
  if (dynamicServices.length > 0) {
    return dynamicServices.filter((s) => s.published).sort((a, b) => a.order - b.order);
  }
  return services.filter((s) => s.published).sort((a, b) => a.order - b.order);
}

export function getServiceBySlug(slug: string): Service | undefined {
  if (dynamicServices.length > 0) {
    return dynamicServices.find((s) => s.slug === slug && s.published);
  }
  return getPublishedServices().find((s) => s.slug === slug);
}

export function getVisibleCategories(): ServiceCategory[] {
  const used = new Set(getPublishedServices().map((s) => s.categorySlug));
  return serviceCategories
    .filter((c) => c.visible && (c.slug === "all" || used.has(c.slug)))
    .sort((a, b) => a.order - b.order);
}

export function getCategoryLabel(slug: string): string {
  return serviceCategories.find((c) => c.slug === slug)?.label ?? "Services";
}
