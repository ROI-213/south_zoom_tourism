/**
 * Admin-managed About Us content.
 *
 * Mirrors the future `about_page`, `about_timeline`, `about_values`,
 * `about_stats`, `team_members`, `achievements` and `office_gallery`
 * tables: every record carries id / order / visible so the admin can
 * reorder, hide or replace content without code changes.
 */

import aboutBanner from "@/assets/about-banner.jpg";
import serviceGroup from "@/assets/service-group.png";
import office1 from "@/assets/office-1.jpg";
import heroTours from "@/assets/hero-tours.jpg";
import heroHotels from "@/assets/hero-hotels.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import team1 from "@/assets/team-1.jpg";
import team2 from "@/assets/team-2.jpg";
import team3 from "@/assets/team-3.jpg";
import type { Cta } from "@/content/site";

export type Block = { id: string; order: number; visible: boolean };

export const aboutSeo = {
  title: "About Us — South Zoom Tourism | Head Office Bengaluru, Karnataka",
  description:
    "Headquartered in Bengaluru, Karnataka, South Zoom Tourism provides premier cabs, rentals and tours across Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, Goa & Puducherry.",
  canonical: "/about-us",
};

export const aboutBannerBlock = {
  visible: true,
  title: "About South Zoom Tourism",
  subtitle:
    "Sixteen years of moving families, pilgrims and businesses across South India — safely, punctually and at a fare you can check before you book.",
  image: aboutBanner,
  imageAlt:
    "South Zoom Tourism fleet of white cars and tempo travellers parked outside the company office at sunset",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about-us" },
  ],
};

export const overviewBlock = {
  visible: true,
  heading: "A travel desk built on repeat customers",
  paragraphs: [
    "South Zoom Tourism began in 2009 in Chennai with two sedans and a landline. The promise was simple — a clean vehicle, a driver who knows the route, and a fare quoted before the trip, not after it.",
    "Today the same team runs a full travel desk: airport and outstation cabs, tempo travellers and buses for groups, curated tour packages across the southern states, and rooms with vetted hotel partners. Roughly seven in ten bookings each month come from a customer who has travelled with us before.",
  ],
  image: serviceGroup,
  imageAlt: "South Zoom Tourism fleet ready for travel",
  facts: [
    { id: "since", label: "Operating since", value: "2009" },
    { id: "hq", label: "Head office", value: "Bangalore in Karnataka" },
    { id: "areas", label: "Areas of operation", value: "Karnataka · Tamilnadu · Kerala · Andhra Pradesh · Goa · Puducherry" },
    {
      id: "customers",
      label: "Customers served",
      value: "Families · Corporates · Pilgrim groups · Schools · Wedding parties · Inbound tourists",
    },
  ],
  ctas: [
    { label: "Contact Us", href: "/contact-us", variant: "primary" },
    { label: "Explore Services", href: "/services", variant: "secondary" },
  ] as Cta[],
};

export type Milestone = Block & {
  year: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

export const timelineBlock = {
  visible: true,
  heading: "Our journey",
  subheading: "From two cars in Chennai to a four-state travel operation.",
  items: ([
    {
      id: "m-2009",
      order: 1,
      visible: true,
      year: "2009",
      title: "Two cars, one phone line",
      description:
        "Founded in Chennai as a local taxi service for airport runs and city trips, operating out of a single-room office on Anna Salai.",
    },
    {
      id: "m-2012",
      order: 2,
      visible: true,
      year: "2012",
      title: "Outstation routes open",
      description:
        "Added Ooty, Kodaikanal and Pondicherry round trips, and introduced published per-kilometre rates instead of negotiated fares.",
      image: heroFleet,
      imageAlt: "Company sedan on a hill road",
    },
    {
      id: "m-2015",
      order: 3,
      visible: true,
      year: "2015",
      title: "Tour packages launched",
      description:
        "Started building full itineraries with stays, sightseeing and transfers — beginning with the Kerala backwaters and temple circuits.",
      image: heroTours,
      imageAlt: "Hill temple surrounded by tea plantations",
    },
    {
      id: "m-2018",
      order: 4,
      visible: true,
      year: "2018",
      title: "Hotel partner network",
      description:
        "Signed contracted rates with resorts, business hotels and homestays so customers could book stay and travel on one invoice.",
      image: heroHotels,
      imageAlt: "Partner hotel room overlooking hills",
    },
    {
      id: "m-2021",
      order: 5,
      visible: true,
      year: "2021",
      title: "Sanitised fleet and online booking",
      description:
        "Rebuilt operations around contactless booking, live trip tracking and a documented vehicle sanitisation checklist after every trip.",
    },
    {
      id: "m-2024",
      order: 6,
      visible: true,
      year: "2024",
      title: "140+ vehicles across four states",
      description:
        "Corporate travel desks in Chennai, Coimbatore and Bengaluru, with 24×7 assistance and GST-compliant monthly billing.",
      image: office1,
      imageAlt: "South Zoom Tourism operations office",
    },
  ] satisfies Milestone[]) as Milestone[],
};

export const missionBlock = {
  visible: true,
  heading: "Our mission",
  statement:
    "Make every journey in South India predictable — a fair fare quoted upfront, a vehicle that is ready, and a driver who treats the trip as their responsibility.",
  points: [
    "Quote before the trip, invoice that matches the quote.",
    "Never dispatch a vehicle that has not passed its pre-trip check.",
    "Answer the phone at any hour a customer is on the road.",
  ],
};

export const visionBlock = {
  visible: true,
  heading: "Our vision",
  statement:
    "To be the travel desk South Indian families and businesses call first — for a two-hour airport run or a two-week itinerary — and the one they recommend without being asked.",
  points: [
    "One booking window for vehicles, tours and stays.",
    "A driver-partner network people are proud to work in.",
    "Growth measured by repeat customers, not just trip count.",
  ],
};

export type ValueItem = Block & { icon: string; title: string; description: string };

export const valuesBlock = {
  visible: true,
  heading: "Core values",
  subheading: "The seven things every booking is measured against.",
  items: [
    { id: "safety", order: 1, visible: true, icon: "ShieldCheck", title: "Safety", description: "Serviced vehicles, background-checked drivers and enforced speed limits on every route." },
    { id: "reliability", order: 2, visible: true, icon: "Clock", title: "Reliability", description: "Confirmed vehicles arrive on time, and a backup is dispatched if anything goes wrong." },
    { id: "satisfaction", order: 3, visible: true, icon: "Smile", title: "Customer satisfaction", description: "Every trip is followed up, and complaints are closed with the customer, not filed away." },
    { id: "transparency", order: 4, visible: true, icon: "ReceiptText", title: "Transparency", description: "Tolls, permits, driver bata and waiting charges are shown before you confirm." },
    { id: "hospitality", order: 5, visible: true, icon: "HeartHandshake", title: "Hospitality", description: "Courteous drivers, help with luggage and local guidance offered, never pushed." },
    { id: "professional", order: 6, visible: true, icon: "BadgeCheck", title: "Professional service", description: "Uniformed drivers, documented processes and GST-compliant paperwork for businesses." },
    { id: "timeliness", order: 7, visible: true, icon: "Timer", title: "Timeliness", description: "Airport pickups tracked against flight timings, with buffers built into every itinerary." },
  ] satisfies ValueItem[],
};

export const aboutWhyBlock = {
  visible: true,
  heading: "Why travellers choose us",
  subheading: "Operational strength you can check, not just claim.",
  items: [
    { id: "team", order: 1, visible: true, icon: "Users", title: "Experienced team", description: "Trip planners who have personally driven and walked the routes they sell." },
    { id: "drivers", order: 2, visible: true, icon: "IdCard", title: "Professional drivers", description: "Licence-verified, police-verified and trained on customer handling." },
    { id: "hotels", order: 3, visible: true, icon: "BedDouble", title: "Verified stay partners", description: "Every partner property is inspected before it is offered to a customer." },
    { id: "flexible", order: 4, visible: true, icon: "SlidersHorizontal", title: "Flexible packages", description: "Swap hotels, add a day or change the route — itineraries are not locked." },
    { id: "charges", order: 5, visible: true, icon: "ReceiptText", title: "Transparent charges", description: "No surge pricing, no surprise night charges, no hidden toll additions." },
    { id: "booking", order: 6, visible: true, icon: "PhoneCall", title: "Easy booking support", description: "Book online, on WhatsApp or by phone — whichever is quicker for you." },
    { id: "support", order: 7, visible: true, icon: "LifeBuoy", title: "24/7 assistance", description: "A real person on call for the whole duration of your trip, not a chatbot." },
  ] satisfies ValueItem[],
};

export const aboutStatsBlock = {
  visible: true,
  heading: "By the numbers",
  /** `manual` today; switches to `calculated` when live data lands. */
  items: [
    { id: "years", order: 1, visible: true, label: "Years of service", value: 16, suffix: "+", source: "manual" },
    { id: "trips", order: 2, visible: true, label: "Trips completed", value: 48200, suffix: "+", source: "manual" },
    { id: "customers", order: 3, visible: true, label: "Happy customers", value: 31500, suffix: "+", source: "manual" },
    { id: "vehicles", order: 4, visible: true, label: "Vehicles in fleet", value: 140, suffix: "+", source: "manual" },
    { id: "destinations", order: 5, visible: true, label: "Destinations covered", value: 85, suffix: "+", source: "manual" },
    { id: "hotels", order: 6, visible: true, label: "Hotel partners", value: 210, suffix: "+", source: "manual" },
  ],
};

export const messageBlock = {
  visible: true,
  heading: "A message from our founder",
  quote:
    "We have never advertised much. What we have done is answer the phone at 2 a.m. when a family was stuck on the ghat road, and send a replacement vehicle before anyone asked for one. That is the whole business.",
  authorName: "R. Sundaravadivelu",
  authorRole: "Founder & Managing Director",
  authorImage: team1,
  authorImageAlt: "Portrait of R. Sundaravadivelu, founder of South Zoom Tourism",
};

export type TeamMember = Block & {
  name: string;
  designation: string;
  image: string;
  imageAlt: string;
  description: string;
  phone?: string;
  email?: string;
  socials?: { label: string; href: string }[];
};

export const teamBlock = {
  visible: true,
  heading: "The people behind your trip",
  subheading: "Small team, long tenure — most of us have been here over a decade.",
  items: [
    {
      id: "t-founder",
      order: 1,
      visible: true,
      name: "R. Sundaravadivelu",
      designation: "Founder & Managing Director",
      image: team1,
      imageAlt: "Portrait of R. Sundaravadivelu",
      description: "Started the company in 2009 and still reviews every escalated trip personally.",
      phone: "+919840012345",
      email: "founder@southzoomtourism.com",
      socials: [{ label: "LinkedIn", href: "https://linkedin.com" }],
    },
    {
      id: "t-ops",
      order: 2,
      visible: true,
      name: "Divya Ramanathan",
      designation: "Head of Operations",
      image: team2,
      imageAlt: "Portrait of Divya Ramanathan",
      description: "Runs dispatch, driver training and the hotel partner audits across four states.",
      email: "operations@southzoomtourism.com",
      socials: [{ label: "LinkedIn", href: "https://linkedin.com" }],
    },
    {
      id: "t-tours",
      order: 3,
      visible: true,
      name: "Arun Prakash",
      designation: "Tour Planning Manager",
      image: team3,
      imageAlt: "Portrait of Arun Prakash",
      description: "Builds the itineraries and negotiates the stay rates you see on the packages page.",
      phone: "+919840012346",
      email: "tours@southzoomtourism.com",
    },
  ] satisfies TeamMember[],
};

export type Achievement = Block & { icon: string; title: string; description: string };

export const achievementsBlock = {
  visible: true,
  heading: "Achievements & certifications",
  items: [
    { id: "a-1", order: 1, visible: true, icon: "Award", title: "TN Tourism registered operator", description: "Registered tour operator with the Department of Tourism, Government of Tamil Nadu." },
    { id: "a-2", order: 2, visible: true, icon: "FileCheck", title: "All-India tourist permits", description: "Fleet cleared for interstate travel across Tamil Nadu, Kerala, Karnataka and Puducherry." },
    { id: "a-3", order: 3, visible: true, icon: "ShieldCheck", title: "Fully insured fleet", description: "Comprehensive insurance and passenger cover on every vehicle we dispatch." },
    { id: "a-4", order: 4, visible: true, icon: "Star", title: "4.8 average rating", description: "Across 3,400+ verified customer reviews collected after completed trips." },
  ] satisfies Achievement[],
};

export const officeGalleryBlock = {
  visible: true,
  heading: "Inside our office",
  items: [
    { id: "g-1", order: 1, visible: true, image: office1, alt: "South Zoom Tourism travel desk with staff at work" },
    { id: "g-2", order: 2, visible: true, image: serviceGroup, alt: "South Zoom Tourism fleet ready for dispatch" },
    { id: "g-3", order: 3, visible: true, image: aboutBanner, alt: "Fleet parked outside the office at sunset" },
  ],
};

export const aboutCtaBlock = {
  visible: true,
  heading: "Plan your next trip with a team that answers",
  description:
    "Tell us your dates and destination — we will send a written quote with the vehicle, the route and the final fare.",
  ctas: [
    { label: "Contact Us", href: "/contact-us", variant: "primary" },
    { label: "Explore Services", href: "/services", variant: "secondary" },
    { label: "Book Now", href: "/fleet", variant: "secondary" },
  ] as Cta[],
};
