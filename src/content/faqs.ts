/**
 * Admin-managed FAQ content.
 *
 * Mirrors the future FAQ management tables:
 *   faq_categories: id, slug, label, description, display_order, published
 *   faq_items:      id, slug, category_slug, question, answer,
 *                   scopes (global | service | fleet | package | hotel | payment),
 *                   scope_refs (route paths / entity slugs the answer is attached to),
 *                   display_order, published
 *
 * Nothing renders or reaches the FAQPage schema unless `published` is true, and
 * every list is sorted by `order` so the admin controls sequence.
 */

import servicesBanner from "@/assets/services-banner.jpg";

export type FaqScope =
  | "global"
  | "service"
  | "fleet"
  | "package"
  | "hotel"
  | "payment";

export type FaqCategory = {
  id: string;
  slug: string;
  label: string;
  description: string;
  order: number;
  published: boolean;
};

export type FaqItem = {
  id: string;
  /** stable anchor slug used for deep links (?q=... / #faq-...) */
  slug: string;
  categorySlug: string;
  question: string;
  answer: string;
  /** where this answer is surfaced across the site */
  scopes: FaqScope[];
  /** optional entity/page references the answer is attached to */
  scopeRefs?: string[];
  order: number;
  published: boolean;
};

export const faqsBannerBlock = {
  visible: true,
  title: "Frequently Asked Questions",
  subtitle:
    "Answers on vehicle bookings, tour packages, hotel stays, payments, cancellations, refunds, invoices, driver policies and support — searchable and organised by topic.",
  image: servicesBanner,
  imageAlt: "South Zoom Tourism vehicle on a South India highway at sunrise",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "FAQs", href: "/faqs" },
  ],
};

export const faqCategories: FaqCategory[] = [
  { id: "fc1", slug: "general", label: "General", description: "About South Zoom Tourism, coverage and how we work.", order: 1, published: true },
  { id: "fc2", slug: "vehicle-booking", label: "Vehicle Booking", description: "Cars, SUVs, tempo travellers, fares and pickups.", order: 2, published: true },
  { id: "fc3", slug: "tour-packages", label: "Tour Packages", description: "Itineraries, inclusions, departures and customisation.", order: 3, published: true },
  { id: "fc4", slug: "hotels-rooms", label: "Hotels & Rooms", description: "Availability, rate plans, meal plans and check-in.", order: 4, published: true },
  { id: "fc5", slug: "payments", label: "Payments", description: "Advance amounts, payment modes and security.", order: 5, published: true },
  { id: "fc6", slug: "cancellations", label: "Cancellations", description: "Cancellation windows and charges by booking type.", order: 6, published: true },
  { id: "fc7", slug: "refunds", label: "Refunds", description: "Refund timelines, modes and partial refunds.", order: 7, published: true },
  { id: "fc8", slug: "invoices", label: "Invoices", description: "GST invoices, corporate billing and receipts.", order: 8, published: true },
  { id: "fc9", slug: "driver-policies", label: "Driver Policies", description: "Driver hours, allowances, conduct and night driving.", order: 9, published: true },
  { id: "fc10", slug: "customer-support", label: "Customer Support", description: "Reaching us, escalation and trip-day assistance.", order: 10, published: true },
];

export const faqItems: FaqItem[] = [
  /* General */
  {
    id: "fq1",
    slug: "areas-covered",
    categorySlug: "general",
    question: "Which areas does South Zoom Tourism cover?",
    answer:
      "We operate across Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana and Puducherry, with pickups from Chennai, Coimbatore, Madurai, Bengaluru, Kochi and all major airports and railway stations in the region. Outstation trips beyond South India can be arranged on request.",
    scopes: ["global"],
    order: 1,
    published: true,
  },
  {
    id: "fq2",
    slug: "how-to-book",
    categorySlug: "general",
    question: "How do I make a booking?",
    answer:
      "Use the search or booking form on any vehicle, package or hotel page, send an enquiry from the contact page, call us, or message us on WhatsApp. You'll receive a written confirmation with a booking reference, the full fare breakup and your driver or hotel details.",
    scopes: ["global"],
    order: 2,
    published: true,
  },
  {
    id: "fq3",
    slug: "confirmation-time",
    categorySlug: "general",
    question: "How quickly is a booking confirmed?",
    answer:
      "Vehicle bookings are usually confirmed within 30 minutes during office hours (6:00 AM – 11:00 PM). Hotel and package bookings are confirmed within a few hours, depending on property or operator availability.",
    scopes: ["global"],
    order: 3,
    published: true,
  },

  /* Vehicle booking */
  {
    id: "fq4",
    slug: "outstation-fare-calculation",
    categorySlug: "vehicle-booking",
    question: "How is the fare calculated for outstation trips?",
    answer:
      "Outstation fares use a per-km rate with a daily minimum running distance (typically 250 km/day), plus driver allowance, tolls, parking and state permits. Every component is itemised on the vehicle page and in your confirmation before you pay anything.",
    scopes: ["global", "fleet", "service"],
    scopeRefs: ["/fleet", "/services/outstation-taxi"],
    order: 1,
    published: true,
  },
  {
    id: "fq5",
    slug: "airport-pickup-waiting",
    categorySlug: "vehicle-booking",
    question: "How much free waiting time is included for airport pickups?",
    answer:
      "Airport pickups include 60 minutes of free waiting from the actual landing time, and railway station pickups include 30 minutes. Additional waiting is charged at the per-hour rate shown on the vehicle page.",
    scopes: ["fleet", "service"],
    scopeRefs: ["/services/airport-transfer"],
    order: 2,
    published: true,
  },
  {
    id: "fq6",
    slug: "vehicle-model-guarantee",
    categorySlug: "vehicle-booking",
    question: "Will I get exactly the vehicle model I booked?",
    answer:
      "We assign the booked model wherever possible. If it becomes unavailable on the day of travel, we provide an equivalent or higher category vehicle at no extra cost, and inform you before pickup.",
    scopes: ["fleet"],
    order: 3,
    published: true,
  },
  {
    id: "fq7",
    slug: "extra-luggage-child-seat",
    categorySlug: "vehicle-booking",
    question: "Can I request a carrier, child seat or extra luggage space?",
    answer:
      "Yes. Add the request in the booking form notes. Roof carriers and child seats are subject to availability and may carry a small charge, which we confirm in writing before the trip.",
    scopes: ["fleet"],
    order: 4,
    published: true,
  },

  /* Tour packages */
  {
    id: "fq8",
    slug: "package-inclusions",
    categorySlug: "tour-packages",
    question: "What is included in a tour package?",
    answer:
      "Packages include accommodation, all transfers and sightseeing by private vehicle, driver allowance, tolls and permits, and the meals listed in the itinerary. Entry tickets, activities and personal expenses are excluded unless stated on the package page.",
    scopes: ["global", "package"],
    scopeRefs: ["/tour-packages"],
    order: 1,
    published: true,
  },
  {
    id: "fq9",
    slug: "customise-itinerary",
    categorySlug: "tour-packages",
    question: "Can a package itinerary be customised?",
    answer:
      "Yes. Days, hotel categories, vehicle type and add-on sightseeing can all be changed. Send an enquiry from the package page and we'll send a revised itinerary and quote, usually the same day.",
    scopes: ["package"],
    order: 2,
    published: true,
  },
  {
    id: "fq10",
    slug: "package-price-per-person",
    categorySlug: "tour-packages",
    question: "Are package prices per person or for the whole group?",
    answer:
      "Prices are shown per person on twin sharing unless the package page states otherwise. The booking panel recalculates the total live as you change travellers, hotel category, vehicle and departure date.",
    scopes: ["package"],
    order: 3,
    published: true,
  },

  /* Hotels & rooms */
  {
    id: "fq11",
    slug: "hotel-checkin-times",
    categorySlug: "hotels-rooms",
    question: "What are the standard check-in and check-out times?",
    answer:
      "Most partner hotels check in from 2:00 PM and check out by 11:00 AM. Exact times, early check-in and late check-out options appear in the policies panel on each hotel page.",
    scopes: ["hotel"],
    order: 1,
    published: true,
  },
  {
    id: "fq12",
    slug: "meal-plans",
    categorySlug: "hotels-rooms",
    question: "What do the meal plans mean?",
    answer:
      "EP is room only, CP includes breakfast, MAP includes breakfast plus one main meal, and AP includes all meals. Each room's rate plans show the meal plan, refundability and any minimum-night rule before you select it.",
    scopes: ["hotel"],
    order: 2,
    published: true,
  },
  {
    id: "fq13",
    slug: "extra-guest-child-policy",
    categorySlug: "hotels-rooms",
    question: "How are extra guests and children charged?",
    answer:
      "Each room shows its base and maximum occupancy. Extra adults are charged an extra-person rate per night; children below the age shown in the hotel policy usually stay free without an extra bed. The price breakdown updates live when you change guests.",
    scopes: ["hotel"],
    order: 3,
    published: true,
  },

  /* Payments */
  {
    id: "fq14",
    slug: "advance-payment",
    categorySlug: "payments",
    question: "How much advance payment is required?",
    answer:
      "Most local and one-way trips can be paid on completion. Peak-season, multi-day and outstation vehicle bookings need a small advance to block the vehicle, and hotel and package bookings follow the advance shown at checkout.",
    scopes: ["global", "payment"],
    order: 1,
    published: true,
  },
  {
    id: "fq15",
    slug: "payment-modes",
    categorySlug: "payments",
    question: "Which payment modes do you accept?",
    answer:
      "UPI, net banking, debit and credit cards, and bank transfer. Corporate accounts can be invoiced monthly on credit terms. Cash is accepted for balance payments to the driver where the booking allows it.",
    scopes: ["payment"],
    order: 2,
    published: true,
  },
  {
    id: "fq16",
    slug: "hidden-charges",
    categorySlug: "payments",
    question: "Are there any hidden charges?",
    answer:
      "No. Tolls, permits, driver allowance, taxes and surcharges are itemised in the quote before you confirm. The only amounts added later are genuine extras you approve during the trip, such as additional kilometres or waiting time.",
    scopes: ["global", "payment"],
    order: 3,
    published: true,
  },

  /* Cancellations */
  {
    id: "fq17",
    slug: "vehicle-cancellation-policy",
    categorySlug: "cancellations",
    question: "What is the cancellation policy for vehicle bookings?",
    answer:
      "Vehicle bookings can be cancelled free of charge up to 24 hours before pickup. Cancellations within 24 hours may attract a nominal charge covering driver deployment, and no-shows are charged one day's minimum fare.",
    scopes: ["global", "fleet"],
    order: 1,
    published: true,
  },
  {
    id: "fq18",
    slug: "hotel-package-cancellation",
    categorySlug: "cancellations",
    question: "How do hotel and package cancellations work?",
    answer:
      "These follow the property or operator policy shown at the time of booking. Refundable rate plans are cancellable up to the stated deadline; non-refundable plans and peak-date bookings are not cancellable. The applicable rule is printed on your confirmation.",
    scopes: ["hotel", "package"],
    order: 2,
    published: true,
  },
  {
    id: "fq19",
    slug: "modify-instead-of-cancel",
    categorySlug: "cancellations",
    question: "Can I reschedule instead of cancelling?",
    answer:
      "Yes, and it's usually cheaper. Date and vehicle changes are free if requested at least 24 hours before travel, subject to availability. Hotel date changes depend on the property's policy.",
    scopes: ["global"],
    order: 3,
    published: true,
  },

  /* Refunds */
  {
    id: "fq20",
    slug: "refund-timeline",
    categorySlug: "refunds",
    question: "How long does a refund take?",
    answer:
      "Approved refunds are initiated within 48 hours and reach your account in 5–7 working days for cards and net banking, and 1–3 working days for UPI or bank transfer, depending on your bank.",
    scopes: ["payment"],
    order: 1,
    published: true,
  },
  {
    id: "fq21",
    slug: "partial-refunds",
    categorySlug: "refunds",
    question: "Do you issue partial refunds for shortened trips?",
    answer:
      "Yes. If a multi-day trip is cut short, unused hotel nights are refunded as per the property policy and vehicle charges are recalculated on actual usage against the minimum daily commitment. The revised statement is shared before the refund is processed.",
    scopes: ["payment"],
    order: 2,
    published: true,
  },
  {
    id: "fq22",
    slug: "refund-mode",
    categorySlug: "refunds",
    question: "Is the refund sent back to the original payment method?",
    answer:
      "Always. Refunds return to the source account or card used for payment. We do not issue refunds in cash or to a third-party account.",
    scopes: ["payment"],
    order: 3,
    published: true,
  },

  /* Invoices */
  {
    id: "fq23",
    slug: "gst-invoice",
    categorySlug: "invoices",
    question: "Do you provide GST invoices?",
    answer:
      "Yes. Share your GSTIN and billing name at the time of booking and we'll issue a GST-compliant invoice by email after the trip. Invoices can be reissued if billing details change before the month closes.",
    scopes: ["global", "payment"],
    order: 1,
    published: true,
  },
  {
    id: "fq24",
    slug: "corporate-billing",
    categorySlug: "invoices",
    question: "Can corporate accounts be billed monthly?",
    answer:
      "Yes. Corporate clients get consolidated monthly billing with trip-wise detail, cost-centre tagging, agreed credit terms and a dedicated account manager.",
    scopes: ["service", "payment"],
    scopeRefs: ["/services/corporate-travel"],
    order: 2,
    published: true,
  },
  {
    id: "fq25",
    slug: "duplicate-invoice",
    categorySlug: "invoices",
    question: "How do I get a duplicate invoice or receipt?",
    answer:
      "Email us with your booking reference and we'll resend the invoice or payment receipt the same working day.",
    scopes: ["payment"],
    order: 3,
    published: true,
  },

  /* Driver policies */
  {
    id: "fq26",
    slug: "driver-duty-hours",
    categorySlug: "driver-policies",
    question: "What are the driver's duty hours?",
    answer:
      "Drivers operate up to 12 hours a day including breaks, and require a continuous rest period overnight. For very early starts or late finishes we plan a relay or a second driver, which is quoted upfront.",
    scopes: ["fleet"],
    order: 1,
    published: true,
  },
  {
    id: "fq27",
    slug: "driver-allowance-night",
    categorySlug: "driver-policies",
    question: "What is driver allowance and night charge?",
    answer:
      "Driver allowance covers the driver's meals and stay on multi-day trips and is shown as a separate line item. A night charge applies for driving between 11:00 PM and 6:00 AM. Both are quoted before confirmation, never added afterwards.",
    scopes: ["fleet", "payment"],
    order: 2,
    published: true,
  },
  {
    id: "fq28",
    slug: "driver-conduct",
    categorySlug: "driver-policies",
    question: "What conduct standards do drivers follow?",
    answer:
      "All drivers are police-verified, licensed for commercial travel, trained in route etiquette, and are strictly non-smoking and alcohol-free on duty. Any concern raised during a trip is escalated to our operations desk immediately.",
    scopes: ["global", "fleet"],
    order: 3,
    published: true,
  },

  /* Customer support */
  {
    id: "fq29",
    slug: "support-hours",
    categorySlug: "customer-support",
    question: "When can I reach customer support?",
    answer:
      "Our booking desk is open 6:00 AM to 11:00 PM every day on phone, WhatsApp and email. On-trip travellers have a 24×7 emergency number shared with the booking confirmation.",
    scopes: ["global"],
    order: 1,
    published: true,
  },
  {
    id: "fq30",
    slug: "raise-complaint",
    categorySlug: "customer-support",
    question: "How do I raise a complaint or escalate an issue?",
    answer:
      "Send your booking reference and details through the contact form, WhatsApp or email. Complaints are acknowledged within 24 hours and resolved or escalated to a manager within 3 working days.",
    scopes: ["global"],
    order: 2,
    published: true,
  },
  {
    id: "fq31",
    slug: "trip-day-changes",
    categorySlug: "customer-support",
    question: "Can I change my plan on the day of travel?",
    answer:
      "Yes, wherever operations allow it. Call the booking desk rather than instructing the driver directly, so the change, the revised fare and the route are recorded against your booking.",
    scopes: ["global"],
    order: 3,
    published: true,
  },
];

/* ------------------------------------------------------------------ */
/* Selectors — published-only, admin-ordered                            */
/* ------------------------------------------------------------------ */

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function getPublishedFaqCategories(): FaqCategory[] {
  return faqCategories.filter((c) => c.published).sort(byOrder);
}

export function getPublishedFaqs(): FaqItem[] {
  const live = new Set(getPublishedFaqCategories().map((c) => c.slug));
  return faqItems
    .filter((f) => f.published && live.has(f.categorySlug))
    .sort((a, b) => a.categorySlug.localeCompare(b.categorySlug) || byOrder(a, b));
}

/** FAQs attached to a scope (and optionally a specific page/entity ref). */
export function getFaqsByScope(scope: FaqScope, ref?: string): FaqItem[] {
  return getPublishedFaqs().filter(
    (f) => f.scopes.includes(scope) && (!ref || (f.scopeRefs ?? []).includes(ref)),
  );
}

export function getFaqCategoryLabel(slug: string): string {
  return faqCategories.find((c) => c.slug === slug)?.label ?? "General";
}

export function countFaqsInCategory(slug: string): number {
  return getPublishedFaqs().filter((f) => f.categorySlug === slug).length;
}

export function findFaqBySlug(slug: string): FaqItem | undefined {
  return getPublishedFaqs().find((f) => f.slug === slug);
}

/** Case-insensitive question + answer + category match. */
export function searchFaqs(items: FaqItem[], query: string): FaqItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const terms = q.split(/\s+/).slice(0, 8);
  return items.filter((f) => {
    const haystack = `${f.question} ${f.answer} ${getFaqCategoryLabel(f.categorySlug)}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

export const faqSupportBlock = {
  visible: true,
  heading: "Still need help?",
  description:
    "If your question isn't answered here, our booking desk replies on the same day — usually within an hour during office hours.",
};
