/**
 * Admin-managed site content.
 *
 * NOTE: this module is the temporary source of truth for every home-page
 * section. Each exported object mirrors the shape of the future
 * admin/database tables (id, order, visible, headings, CTAs, item refs) so
 * the UI can be switched to live data without changing any component.
 */

import heroFleet from "@/assets/hero-fleet.jpg";
import heroTours from "@/assets/hero-tours.jpg";
import heroHotels from "@/assets/hero-hotels.jpg";
import serviceGroup from "@/assets/service-group.png";
import carDzire from "@/assets/car-dzire.png";
import carInnova from "@/assets/car-innova.png";
import carErtiga from "@/assets/car-ertiga.png";
import pkgOoty from "@/assets/pkg-ooty.png";
import pkgAlleppey from "@/assets/pkg-alleppey.png";
import pkgNavagraha from "@/assets/pkg-navagraha.png";
import tourNavagraha from "@/assets/tour-navagraha.png";
import tourCoorg from "@/assets/tour-coorg.png";
import tourTirupati from "@/assets/tour-tirupati.png";
import aboutBanner from "@/assets/about-banner.jpg";
import servicesBanner from "@/assets/services-banner.jpg";
import roomOotyDeluxe from "@/assets/rooms/room-ooty-deluxe.jpg";
import roomChennaiExec from "@/assets/rooms/room-chennai-executive.jpg";
import roomAlleppeyCottage from "@/assets/rooms/room-alleppey-cottage.jpg";
import roomMaduraiFamily from "@/assets/rooms/room-madurai-family.jpg";
import destOoty from "@/assets/destinations/dest-ooty-new.png";
import destMunnar from "@/assets/destinations/dest-munnar-new.png";
import destKodaikanal from "@/assets/destinations/dest-kodai-new.png";
import destPondicherry from "@/assets/destinations/dest-pondy-new.png";
import destMadurai from "@/assets/destinations/dest-madurai-new.png";
import destAlleppey from "@/assets/destinations/dest-alleppey-new.png";
import destChennai from "@/assets/destinations/dest-chennai.jpg";
import destGoa from "@/assets/destinations/dest-goa.jpg";

export type Cta = {
  label: string;
  /** internal route path or external/tel/whatsapp url */
  href: string;
  variant?: "primary" | "secondary";
};

export type SectionMeta = {
  id: string;
  order: number;
  visible: boolean;
  heading: string;
  subheading?: string;
  viewAll?: Cta;
};

/* ------------------------------------------------------------------ */
/* Company / contact                                                    */
/* ------------------------------------------------------------------ */

export const company = {
  name: "South Zoom Tourism",
  tagline: "Bengaluru's Premier South India Travel & Cab Desk",
  phone: "+91 8884015512",
  phoneRaw: "+918884015512",
  whatsapp: "+91 6366357757",
  whatsappRaw: "916366357757",
  email: "bookings@southzoomtourism.com",
  officeTimings: "Mon – Sun · 24×7 Service",
  address: "South Zoom Tourism, #8, Srinivasa Building, Anchepalya Main Road, TG Halli, Bengaluru – 560073, Karnataka.",
  headOffice: "Bangalore in Karnataka",
  areasOfOperation: "Karnataka, Tamilnadu, Kerala, Andhra Pradesh, Goa, Puducherry",
  socials: [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
};

export function waLink(message: string) {
  return `https://wa.me/${company.whatsappRaw}?text=${encodeURIComponent(message)}`;
}

export function telLink() {
  return `tel:${company.phoneRaw}`;
}

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */

export const mainNav = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Fleet", to: "/fleet" },
  { label: "Tour Packages", to: "/tour-packages" },
  { label: "Destinations", to: "/destinations" },
  { label: "Hotels & Rooms", to: "/hotels" },
  { label: "Gallery", to: "/gallery" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "FAQs", to: "/faqs" },
  { label: "About Us", to: "/about-us" },
  { label: "Contact Us", to: "/contact-us" },
] as const;

/* ------------------------------------------------------------------ */
/* Hero slides                                                          */
/* ------------------------------------------------------------------ */

export type HeroSlide = {
  id: string;
  order: number;
  visible: boolean;
  badge?: string;
  heading: string;
  description: string;
  imageDesktop: string;
  imageMobile: string;
  alt: string;
  primaryCta: Cta;
  secondaryCta: Cta;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "car-rentals",
    order: 1,
    visible: true,
    badge: "Flat 10% off on round trips",
    heading: "Car rentals across South India",
    description:
      "Well-maintained sedans, SUVs and tempo travellers with verified drivers, transparent pricing and 24×7 support.",
    imageDesktop: heroFleet,
    imageMobile: heroFleet,
    alt: "White SUV taxi driving on a palm-lined South Indian coastal highway at sunset",
    primaryCta: { label: "Book a Vehicle", href: "/fleet", variant: "primary" },
    secondaryCta: { label: "View Fleet", href: "/fleet", variant: "secondary" },
  },
  {
    id: "tour-packages",
    order: 2,
    visible: true,
    badge: "Curated itineraries",
    heading: "Tour packages made for real travellers",
    description:
      "Hill stations, heritage towns, backwaters and beaches — planned end to end with stays, transfers and sightseeing.",
    imageDesktop: heroTours,
    imageMobile: heroTours,
    alt: "Hill temple beside a winding road surrounded by misty tea plantations",
    primaryCta: { label: "Explore Packages", href: "/tour-packages", variant: "primary" },
    secondaryCta: { label: "Talk to a Planner", href: "/contact-us", variant: "secondary" },
  },
  {
    id: "hotels",
    order: 3,
    visible: true,
    badge: "Best rate guarantee",
    heading: "Hotels & rooms at partner rates",
    description:
      "Handpicked resorts, business hotels and homestays with instant confirmation and free cancellation options.",
    imageDesktop: heroHotels,
    imageMobile: heroHotels,
    alt: "Luxury hotel room with a balcony overlooking green hills",
    primaryCta: { label: "Find a Room", href: "/hotels", variant: "primary" },
    secondaryCta: { label: "See Featured Hotels", href: "/hotels", variant: "secondary" },
  },
  {
    id: "airport-transfers",
    order: 4,
    visible: true,
    badge: "Flight tracking included",
    heading: "Airport transfers, always on time",
    description:
      "Fixed-fare pickups and drops for every South Indian airport, with 60 minutes of complimentary waiting.",
    imageDesktop: heroFleet,
    imageMobile: heroFleet,
    alt: "Airport transfer car ready for pickup on a highway",
    primaryCta: { label: "Book Transfer", href: "/fleet", variant: "primary" },
    secondaryCta: { label: "Get a Quote", href: "/contact-us", variant: "secondary" },
  },
  {
    id: "corporate",
    order: 5,
    visible: true,
    badge: "GST invoices",
    heading: "Corporate travel on monthly billing",
    description:
      "Dedicated account manager, employee transport, and consolidated invoicing for teams of any size.",
    imageDesktop: heroTours,
    imageMobile: heroTours,
    alt: "Corporate travel vehicles on a highway in South India",
    primaryCta: { label: "Request Proposal", href: "/contact-us", variant: "primary" },
    secondaryCta: { label: "Our Services", href: "/services", variant: "secondary" },
  },
  {
    id: "pilgrimage",
    order: 6,
    visible: true,
    badge: "Temple circuits",
    heading: "Pilgrimage tours with local guidance",
    description:
      "Navagraha, Murugan and Kerala temple circuits with darshan planning, prasadam stops and comfortable stays.",
    imageDesktop: heroTours,
    imageMobile: heroTours,
    alt: "South Indian temple gopuram at sunrise",
    primaryCta: { label: "View Pilgrimage Tours", href: "/tour-packages", variant: "primary" },
    secondaryCta: { label: "Enquire Now", href: "/contact-us", variant: "secondary" },
  },
  {
    id: "group-tours",
    order: 7,
    visible: true,
    badge: "Up to 50 seats",
    heading: "Group tours & event travel",
    description:
      "Buses, tempo travellers and multi-vehicle convoys for schools, weddings and company offsites.",
    imageDesktop: heroHotels,
    imageMobile: heroHotels,
    alt: "Group travel bus parked at a scenic viewpoint",
    primaryCta: { label: "Plan Group Travel", href: "/contact-us", variant: "primary" },
    secondaryCta: { label: "See Fleet", href: "/fleet", variant: "secondary" },
  },
];

/* ------------------------------------------------------------------ */
/* Search card                                                          */
/* ------------------------------------------------------------------ */

export const searchOptions = {
  tripTypes: ["One Way", "Round Trip", "Local (8hr/80km)", "Airport Transfer"],
  vehicleTypes: ["Any", "Sedan", "SUV", "Innova Crysta", "Tempo Traveller", "Mini Bus"],
  cities: [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Bengaluru",
    "Kochi",
    "Ooty",
    "Kodaikanal",
    "Munnar",
    "Pondicherry",
    "Thanjavur",
  ],
  packageCategories: [
    "Any",
    "Hill Station",
    "Beach",
    "Heritage",
    "Pilgrimage",
    "Backwaters",
    "Weekend Getaway",
  ],
  durations: ["Any", "1–2 Days", "3–4 Days", "5–7 Days", "8+ Days"],
};

/* ------------------------------------------------------------------ */
/* About / statistics                                                   */
/* ------------------------------------------------------------------ */

export const aboutSection = {
  meta: {
    id: "about",
    order: 3,
    visible: true,
    heading: "Headquartered in Bengaluru — South India's Dependable Travel Partner",
    subheading:
      "South Zoom Tourism is headquartered in Bengaluru, Karnataka with extensive operations across Karnataka, Tamilnadu, Kerala, Andhra Pradesh, Goa, and Puducherry. Clean vehicles, honest fares, and route-trained drivers since 2009.",
  } satisfies SectionMeta,
  image: heroFleet,
  imageAlt: "South Zoom Tourism drivers standing beside the company fleet of cars and tempo travellers",
  cta: { label: "Know More", href: "/about-us", variant: "primary" } as Cta,
  /** `source: "manual"` today; switches to "calculated" when live data lands. */
  stats: [
    { id: "years", label: "Years of service", value: 16, suffix: "+", source: "manual" },
    { id: "trips", label: "Completed trips", value: 48200, suffix: "+", source: "manual" },
    { id: "vehicles", label: "Vehicles in fleet", value: 140, suffix: "+", source: "manual" },
    { id: "destinations", label: "Destinations covered", value: 85, suffix: "+", source: "manual" },
    { id: "customers", label: "Happy customers", value: 31500, suffix: "+", source: "manual" },
  ],
};

/* ------------------------------------------------------------------ */
/* Services                                                             */
/* ------------------------------------------------------------------ */

export const servicesSection = {
  meta: {
    id: "services",
    order: 4,
    visible: true,
    heading: "Everything you need for one trip",
    subheading: "Ten services, one team, one invoice.",
    viewAll: { label: "All Services", href: "/services" },
  } satisfies SectionMeta,
  items: [
    { id: "local-taxi", icon: "Car", title: "Local Taxi", description: "Hourly and full-day city cabs with waiting time included." },
    { id: "outstation", icon: "Route", title: "Outstation Trips", description: "One-way and round trips with transparent per-km pricing." },
    { id: "airport", icon: "Plane", title: "Airport Transfers", description: "Fixed fares, flight tracking and meet-and-greet pickups." },
    { id: "corporate", icon: "Briefcase", title: "Corporate Travel", description: "Employee transport and monthly billing with GST invoices." },
    { id: "group", icon: "Users", title: "Group Travel", description: "Tempo travellers and buses for 12 to 50 passengers." },
    { id: "packages", icon: "Map", title: "Tour Packages", description: "Ready-made and custom itineraries across South India." },
    { id: "hotels", icon: "BedDouble", title: "Hotels & Rooms", description: "Partner-rate stays from budget rooms to hill resorts." },
    { id: "pilgrimage", icon: "Landmark", title: "Pilgrimage Tours", description: "Temple circuits with darshan planning and local guides." },
    { id: "wedding", icon: "HeartHandshake", title: "Wedding & Events", description: "Guest transfers, decorated cars and multi-day fleets." },
    { id: "custom", icon: "Sparkles", title: "Custom Planning", description: "Tell us your dates and budget — we build the trip." },
  ],
};

/* ------------------------------------------------------------------ */
/* Master records (fleet / packages / hotels / destinations)            */
/* ------------------------------------------------------------------ */

import fleetSedan from "@/assets/fleet-sedan.png";
import fleetSuv from "@/assets/fleet-suv.png";
import fleetTempo from "@/assets/fleet-tempo.png";
import fleetBus from "@/assets/fleet-bus.png";

export type Vehicle = {
  id: string;
  name: string;
  category: string;
  seats: number;
  luggage: number;
  ac: boolean;
  perKm: number;
  image: string;
  alt: string;
};

export const vehicles: Vehicle[] = [
  { id: "v-dzire", name: "Sedan (Dzire / Etios)", category: "Sedan", seats: 4, luggage: 2, ac: true, perKm: 14, image: fleetSedan, alt: "White Sedan tourist cab with yellow South Zoom Tourism board" },
  { id: "v-crysta", name: "SUV (Innova Crysta / Ertiga)", category: "SUV", seats: 7, luggage: 4, ac: true, perKm: 20, image: fleetSuv, alt: "White SUV tourist cab with yellow South Zoom Tourism board" },
  { id: "v-tempo", name: "Tempo Traveller (TT)", category: "Tempo Traveller", seats: 12, luggage: 10, ac: true, perKm: 24, image: fleetTempo, alt: "White Tempo Traveller 12-seater with yellow South Zoom Tourism board" },
  { id: "v-bus", name: "Tourist Bus (27-45 Seater)", category: "Bus", seats: 35, luggage: 25, ac: true, perKm: 38, image: fleetBus, alt: "White Tourist Bus coach with yellow South Zoom Tourism board" },
];

export type TourPackage = {
  id: string;
  title: string;
  destination: string;
  category: string;
  nights: number;
  days: number;
  priceFrom: number;
  image: string;
  alt: string;
  highlights: string[];
};

export const tourPackages: TourPackage[] = [
  { id: "p-ooty", title: "Ooty & Coonoor Escape", destination: "Ooty", category: "Hill Station", nights: 2, days: 3, priceFrom: 8999, image: pkgOoty, alt: "Tea gardens near Ooty", highlights: ["Botanical Garden", "Toy train", "Doddabetta peak"] },
  { id: "p-munnar", title: "Munnar Tea Trails", destination: "Munnar", category: "Hill Station", nights: 3, days: 4, priceFrom: 12499, image: tourCoorg, alt: "Tea plantations in Munnar with misty hills", highlights: ["Tea museum", "Eravikulam park", "Mattupetty dam"] },
  { id: "p-navagraha", title: "Navagraha Temple Circuit", destination: "Kumbakonam", category: "Pilgrimage", nights: 2, days: 3, priceFrom: 7499, image: tourNavagraha, alt: "South Indian temple gopuram with golden light", highlights: ["9 temples", "Guided darshan", "Vegetarian meals"] },
  { id: "p-alleppey", title: "Alleppey Backwater Cruise", destination: "Alleppey", category: "Backwaters", nights: 1, days: 2, priceFrom: 9999, image: pkgAlleppey, alt: "Houseboat on Kerala backwaters", highlights: ["Houseboat stay", "Sunset cruise", "Village walk"] },
  { id: "p-pondy", title: "Pondicherry Weekend", destination: "Pondicherry", category: "Beach", nights: 1, days: 2, priceFrom: 5999, image: heroHotels, alt: "French quarter street in Pondicherry", highlights: ["White Town", "Auroville", "Promenade beach"] },
  { id: "p-thanjavur", title: "Tirupati Divine Darshan", destination: "Tirupati", category: "Pilgrimage", nights: 2, days: 3, priceFrom: 8499, image: tourTirupati, alt: "Tirupati Balaji temple at golden hour", highlights: ["Balaji darshan", "Kalyana katta", "Padmavathi temple"] },
];

export type Hotel = {
  id: string;
  name: string;
  city: string;
  starRating: number;
  roomType: string;
  pricePerNight: number;
  image: string;
  alt: string;
  amenities: string[];
};

export const hotels: Hotel[] = [
  { id: "h-hillview", name: "Hillview Resort", city: "Ooty", starRating: 4, roomType: "Deluxe Valley Room", pricePerNight: 4200, image: roomOotyDeluxe, alt: "Deluxe hotel room with valley view in Ooty", amenities: ["Free breakfast", "Wi-Fi", "Parking"] },
  { id: "h-marina", name: "Marina Grand", city: "Chennai", starRating: 4, roomType: "Executive Room", pricePerNight: 3800, image: roomChennaiExec, alt: "Executive hotel room in Chennai", amenities: ["Airport pickup", "Gym", "Restaurant"] },
  { id: "h-backwater", name: "Backwater Retreat", city: "Alleppey", starRating: 3, roomType: "Lake Facing Cottage", pricePerNight: 3300, image: roomAlleppeyCottage, alt: "Lake facing cottage in Alleppey", amenities: ["Lake view", "Breakfast", "Boat ride"] },
  { id: "h-templestay", name: "Temple Stay Residency", city: "Madurai", starRating: 3, roomType: "Family Room", pricePerNight: 2600, image: roomMaduraiFamily, alt: "Family hotel room in Madurai", amenities: ["Near temple", "Veg restaurant", "Wi-Fi"] },
];

export type Destination = {
  id: string;
  name: string;
  state: string;
  image: string;
  alt: string;
  packageCount: number;
};

export const destinations: Destination[] = [
  { id: "d-ooty", name: "Ooty", state: "Tamil Nadu", image: destOoty, alt: "Rolling Nilgiri hills and tea gardens of Ooty", packageCount: 12 },
  { id: "d-munnar", name: "Munnar", state: "Kerala", image: destMunnar, alt: "Sunrise over the tea plantations and mountain ranges of Munnar, Kerala", packageCount: 9 },
  { id: "d-kodai", name: "Kodaikanal", state: "Tamil Nadu", image: destKodaikanal, alt: "Serene Kodaikanal lake framed by the hills of Tamil Nadu", packageCount: 8 },
  { id: "d-pondy", name: "Pondicherry", state: "Puducherry", image: destPondicherry, alt: "Evening on the French colonial seafront promenade in Pondicherry", packageCount: 7 },
  { id: "d-madurai", name: "Madurai", state: "Tamil Nadu", image: destMadurai, alt: "Colourful gopuram towers of the Meenakshi Amman temple in Madurai", packageCount: 6 },
  { id: "d-alleppey", name: "Alleppey", state: "Kerala", image: destAlleppey, alt: "Houseboats gliding through Kerala backwaters in Alleppey", packageCount: 5 },
];

/* ------------------------------------------------------------------ */
/* Featured selections (reference master records by id + ordering)      */
/* ------------------------------------------------------------------ */

export const featuredFleet = {
  meta: {
    id: "fleet",
    order: 5,
    visible: true,
    heading: "Featured fleet",
    subheading: "Sanitised, insured and driver-ready vehicles.",
    viewAll: { label: "View All Vehicles", href: "/fleet" },
  } satisfies SectionMeta,
  itemIds: ["v-dzire", "v-crysta", "v-tempo", "v-bus"],
};

export const featuredPackages = {
  meta: {
    id: "packages",
    order: 6,
    visible: true,
    heading: "Popular tour packages",
    subheading: "Most-booked itineraries this season.",
    viewAll: { label: "View All Packages", href: "/tour-packages" },
  } satisfies SectionMeta,
  itemIds: ["p-ooty", "p-munnar", "p-alleppey", "p-navagraha"],
};

export const featuredHotels = {
  meta: {
    id: "hotels",
    order: 7,
    visible: true,
    heading: "Featured hotels & rooms",
    subheading: "Partner properties with negotiated rates.",
    viewAll: { label: "View All Hotels", href: "/hotels" },
  } satisfies SectionMeta,
  itemIds: ["h-hillview", "h-marina", "h-backwater", "h-templestay"],
};

export const destinationsSection = {
  meta: {
    id: "destinations",
    order: 8,
    visible: true,
    heading: "Popular destinations",
    subheading: "Where our travellers are heading right now.",
    viewAll: { label: "Browse Destinations", href: "/destinations" },
  } satisfies SectionMeta,
  itemIds: ["d-ooty", "d-munnar", "d-kodai", "d-pondy", "d-madurai", "d-alleppey"],
};

/* ------------------------------------------------------------------ */
/* Why choose us / how it works                                         */
/* ------------------------------------------------------------------ */

export const whyChooseUs = {
  meta: {
    id: "why-us",
    order: 9,
    visible: true,
    heading: "Why travellers choose South Zoom",
    subheading: "No hidden charges. No last-minute surprises.",
  } satisfies SectionMeta,
  items: [
    { id: "w1", icon: "BadgeIndianRupee", title: "Transparent fares", description: "Toll, permit and driver bata shown before you confirm." },
    { id: "w2", icon: "ShieldCheck", title: "Verified drivers", description: "Background-checked, badge-holding and route-trained." },
    { id: "w3", icon: "Clock", title: "24×7 support", description: "A real person on call at every hour of your trip." },
    { id: "w4", icon: "Wrench", title: "Maintained fleet", description: "Every vehicle serviced and inspected before dispatch." },
    { id: "w5", icon: "MapPinned", title: "Local expertise", description: "16 years of routes, stays and shortcuts across the south." },
    { id: "w6", icon: "RefreshCcw", title: "Easy changes", description: "Free date changes up to 24 hours before departure." },
  ],
};

export const howItWorks = {
  meta: {
    id: "how-it-works",
    order: 10,
    visible: true,
    heading: "How it works",
    subheading: "Two simple flows — one for travel, one for stays.",
  } satisfies SectionMeta,
  travel: [
    { id: "t1", title: "Search your trip", description: "Enter pickup, drop, date and passengers." },
    { id: "t2", title: "Pick a vehicle", description: "Compare seats, luggage space and per-km fare." },
    { id: "t3", title: "Confirm booking", description: "Pay an advance or book with pay-on-arrival." },
    { id: "t4", title: "Meet your driver", description: "Driver details arrive on WhatsApp before pickup." },
  ],
  hotel: [
    { id: "h1", title: "Search rooms", description: "Choose city, dates, rooms and guests." },
    { id: "h2", title: "Compare stays", description: "Filter by rating, amenities and nightly rate." },
    { id: "h3", title: "Reserve instantly", description: "Instant confirmation with free cancellation options." },
    { id: "h4", title: "Check in", description: "Show your voucher at the property — that's it." },
  ],
};

/* ------------------------------------------------------------------ */
/* Testimonials / gallery / FAQ / final CTA                             */
/* ------------------------------------------------------------------ */

export const testimonialsSection = {
  meta: {
    id: "testimonials",
    order: 11,
    visible: true,
    heading: "What our travellers say",
    subheading: "Real reviews from real South Indian travellers.",
    viewAll: { label: "All Reviews", href: "/testimonials" },
  } satisfies SectionMeta,
  items: [
    {
      id: "r1",
      name: "Suresh Nagaraj",
      city: "Bengaluru",
      address: "Koramangala, 5th Block",
      rating: 5,
      tripType: "Outstation Round Trip",
      date: "July 2025",
      text: "We booked an Innova Crysta from Bengaluru to Ooty for a family weekend. The driver, Mohan, arrived 15 minutes early at our Koramangala apartment. Vehicle was spotless — AC worked perfectly even on the ghat roads. Fare matched the quote down to the last rupee. Will definitely book again for our Coorg trip next month.",
    },
    {
      id: "r2",
      name: "Lakshmi Venkatesh",
      city: "Bengaluru",
      address: "Jayanagar, 4th T Block",
      rating: 5,
      tripType: "Local City Rental",
      date: "June 2025",
      text: "I needed an 8-hour city cab for my mother's hospital visits across Bengaluru — Jayanagar to Malleshwaram to Rajajinagar. The Dzire was well-maintained, the driver was patient with all our stops, and the billing was completely transparent. No hidden charges at all. Highly recommended for senior citizen travel.",
    },
    {
      id: "r3",
      name: "Karthik Ramamurthy",
      city: "Chennai",
      address: "Adyar, Lattice Bridge Road",
      rating: 5,
      tripType: "Airport Transfer",
      date: "May 2025",
      text: "Landed at Chennai airport at 2 AM after a delayed flight. The South Zoom driver was tracking my flight and was waiting right outside arrivals. Smooth ride to my home in Adyar in 40 minutes. Fixed fare, no surge, no haggling. This is how airport pickups should work everywhere.",
    },
    {
      id: "r4",
      name: "Priya Shankar",
      city: "Mysuru",
      address: "Vijayanagar, 2nd Stage",
      rating: 5,
      tripType: "Tour Package",
      date: "April 2025",
      text: "Booked the 3-day Wayanad package for our anniversary. Everything from the homestay to the jeep safari at Muthanga was arranged perfectly. The itinerary was realistic — no rushing between spots. Our driver doubled as a local guide and took us to a hidden waterfall not on the regular tourist route!",
    },
    {
      id: "r5",
      name: "Mohammed Irfan",
      city: "Bengaluru",
      address: "HSR Layout, Sector 2",
      rating: 4,
      tripType: "Corporate Travel",
      date: "March 2025",
      text: "Our startup uses South Zoom for all employee airport transfers and client pickups. Monthly billing with proper GST invoices saves our accounts team hours of work. Vehicles are always clean and professional. Only reason for 4 stars is one minor delay during peak Bengaluru traffic, but they communicated proactively.",
    },
    {
      id: "r6",
      name: "Deepa Raghavan",
      city: "Coimbatore",
      address: "RS Puram, Cross Cut Road",
      rating: 5,
      tripType: "Pilgrimage Tour",
      date: "February 2025",
      text: "Organised the Navagraha temple circuit for my parents and in-laws — 6 senior citizens. South Zoom provided a Tempo Traveller with extra comfortable seats. The driver knew every temple's darshan timing, parking spots, and even which prasadam shops were the best. My parents are still talking about this trip!",
    },
    {
      id: "r7",
      name: "Arun Prakash B.",
      city: "Bengaluru",
      address: "Whitefield, ITPL Main Road",
      rating: 5,
      tripType: "Outstation One-Way",
      date: "January 2025",
      text: "Needed a one-way drop from Whitefield to Pondicherry for a friend's wedding. Got an Ertiga at a very fair one-way rate — no return fare tricks. Driver was well-rested, car had good tyres, and we reached Pondy in under 5 hours. The WhatsApp booking process was super convenient too.",
    },
    {
      id: "r8",
      name: "Sangeetha M.",
      city: "Bengaluru",
      address: "Electronic City, Phase 1",
      rating: 5,
      tripType: "Group Travel",
      date: "December 2024",
      text: "Booked a 17-seater Tempo Traveller for our office team outing to Hogenakkal Falls. South Zoom handled the pickup from Electronic City, lunch stop planning, and the return timing perfectly. The vehicle had a good music system and charging ports for everyone. The whole team had a blast!",
    },
    {
      id: "r9",
      name: "Venkatesh Prasad",
      city: "Madurai",
      address: "KK Nagar, 10th Street",
      rating: 5,
      tripType: "Outstation Round Trip",
      date: "November 2024",
      text: "Round trip from Madurai to Rameswaram and Kanyakumari — 4 days, 3 nights. The Innova Crysta was brand new, the driver Senthil was knowledgeable about all the temple protocols, and the hotel arrangements were clean and well-located. Total cost was exactly what was quoted. No surprises.",
    },
    {
      id: "r10",
      name: "Ananya Krishnan",
      city: "Bengaluru",
      address: "Indiranagar, 12th Main",
      rating: 5,
      tripType: "Local City Rental",
      date: "October 2024",
      text: "Used South Zoom for a full-day Bengaluru darshan with my visiting relatives from Delhi — Lalbagh, Vidhana Soudha, ISKCON, and Nandi Hills. The driver knew all the shortcuts to avoid traffic. Clean Ertiga, bottled water provided, and the fare was exactly as quoted. My relatives were very impressed!",
    },
  ],
};

export const gallerySection = {
  meta: {
    id: "gallery",
    order: 12,
    visible: true,
    heading: "From our trips",
    viewAll: { label: "Open Gallery", href: "/gallery" },
  } satisfies SectionMeta,
  items: [
    { id: "g1", image: heroTours, alt: "Hill temple on a misty morning during a South Zoom tour" },
    { id: "g2", image: heroFleet, alt: "South Zoom taxi on a coastal highway at sunset" },
    { id: "g3", image: heroHotels, alt: "Partner hotel room with hill views" },
    { id: "g4", image: serviceGroup, alt: "South Zoom group tour fleet" },
    { id: "g5", image: heroTours, alt: "Tea plantations visited on a Munnar package" },
    { id: "g6", image: heroFleet, alt: "Tempo traveller ready for a group tour" },
  ],
};

export const faqSection = {
  meta: {
    id: "faqs",
    order: 13,
    visible: true,
    heading: "Frequently asked questions",
    viewAll: { label: "All FAQs", href: "/faqs" },
  } satisfies SectionMeta,
  items: [
    { id: "f1", question: "How is the fare calculated for outstation trips?", answer: "Outstation fares use a per-km rate with a daily minimum running distance, plus driver allowance, tolls and state permits. Every component is shown before you confirm." },
    { id: "f2", question: "Can I book a vehicle without paying in advance?", answer: "Yes. Most routes support pay-on-arrival. Peak-season and multi-day bookings need a small advance to block the vehicle." },
    { id: "f3", question: "Do your tour packages include hotels and meals?", answer: "Packages include stays, transfers and listed sightseeing. Meals are included where the itinerary says so — each package page lists inclusions and exclusions." },
    { id: "f4", question: "What is your cancellation policy?", answer: "Vehicle bookings can be cancelled free up to 24 hours before pickup. Hotel and package cancellation depends on the property or operator policy shown at booking." },
    { id: "f5", question: "Do you provide GST invoices for corporate travel?", answer: "Yes. Corporate accounts get GST invoices, monthly consolidated billing and a dedicated account manager." },
  ],
};

export const finalCta = {
  meta: { id: "final-cta", order: 14, visible: true, heading: "Ready when you are" } satisfies SectionMeta,
  description:
    "Tell us your dates and we'll send a plan with vehicle options, stays and a fixed quote — usually within an hour.",
  primaryCta: { label: "Book Now", href: "/contact-us", variant: "primary" } as Cta,
};

export const footerContent = {
  about:
    "South Zoom Tourism is headquartered in Bengaluru, Karnataka — providing premier car rentals, outstation cabs, tour packages and hotel bookings across Karnataka, Tamilnadu, Kerala, Andhra Pradesh, Goa & Puducherry.",
  columns: [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about-us" },
        { label: "Services", href: "/services" },
        { label: "Gallery", href: "/gallery" },
        { label: "Testimonials", href: "/testimonials" },
      ],
    },
    {
      title: "Book",
      links: [
        { label: "Fleet", href: "/fleet" },
        { label: "Tour Packages", href: "/tour-packages" },
        { label: "Hotels & Rooms", href: "/hotels" },
        { label: "Contact Us", href: "/contact-us" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "FAQs", href: "/faqs" },
        { label: "QR Payment", href: "/qr-payment" },
        { label: "Customer Login", href: "/customer/login" },
        { label: "Booking Status", href: "/booking-status" },
        { label: "Contact Us", href: "/contact-us" },
      ],
    },
  ],
};
