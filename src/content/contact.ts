/**
 * Admin-managed contact page content.
 *
 * Mirrors the future contact tables:
 *   contact_settings:  office_label, address, map_lat, map_lng, map_embed_url,
 *                      directions_url, business_hours[], published
 *   contact_channels:  id, type ('phone' | 'whatsapp' | 'email' | 'address' | 'hours'),
 *                      label, value, href, note, display_order, published
 *   contact_enquiries: id, reference, source, page_url, name, phone, email,
 *                      service_slug, subject, message, status, assigned_to,
 *                      created_at
 *
 * Every value used by a Call / WhatsApp / Email / Map action is read from here
 * (or from `company` in site.ts) — never hardcoded inside a component.
 */

import servicesBanner from "@/assets/services-banner.jpg";
import { company } from "@/content/site";
import { getPublishedServices } from "@/content/services";

export type ContactChannelType = "address" | "phone" | "whatsapp" | "email" | "hours";

export type ContactChannel = {
  id: string;
  type: ContactChannelType;
  label: string;
  value: string;
  /** tel:, mailto:, https:// or map link — resolved from admin config. */
  href?: string;
  note?: string;
  order: number;
  published: boolean;
};

export type EnquiryStatus = "new" | "in_progress" | "closed";

export type ContactEnquiryPayload = {
  reference: string;
  source: string;
  page_url: string;
  name: string;
  phone: string;
  email: string | null;
  service_slug: string | null;
  subject: string;
  message: string;
  status: EnquiryStatus;
  assigned_to: string | null;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/* Office / map settings                                                */
/* ------------------------------------------------------------------ */

export const contactSettings = {
  published: true,
  officeLabel: "Head Office — Bangalore in Karnataka",
  address: company.address,
  /** Alternate numbers are admin-managed; leave empty to hide the card. */
  alternatePhone: company.whatsapp,
  alternatePhoneRaw: company.whatsappRaw,
  mapLat: 13.0280,
  mapLng: 77.4912, // Anchepalya, Bengaluru
  businessHours: [
    { id: "bh1", days: "Monday – Sunday", hours: "24 Hours Service Desk", order: 1, published: true },
    { id: "bh2", days: "WhatsApp Assistance", hours: "+91 6366357757", order: 2, published: true },
    { id: "bh3", days: "Call Support", hours: "+91 6366357757", order: 3, published: true },
  ],
};

/**
 * Emergency / after-hours desk. Renders ONLY when `published` is true and a
 * number is configured, so the admin can switch it off entirely.
 */
export const emergencyContact = {
  published: true,
  heading: "24×7 on-trip emergency desk",
  description:
    "For travellers already on a trip — breakdowns, driver changes, hotel issues or itinerary emergencies outside office hours.",
  phone: "+91 98400 99111",
  phoneRaw: "+919840099111",
};

export const contactBannerBlock = {
  visible: true,
  title: "Contact Us",
  subtitle:
    "Call, WhatsApp, email or send an enquiry — our booking desk replies the same day, usually within an hour during office hours.",
  image: servicesBanner,
  imageAlt: "South Zoom Tourism vehicle on a South India highway at sunrise",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Contact Us", href: "/contact-us" },
  ],
};

export const contactFormBlock = {
  heading: "Send us an enquiry",
  description:
    "Tell us the route, dates and travellers. We reply with vehicle options, stays and a fixed quote.",
  successNote:
    "Save your reference number — quote it when you call or WhatsApp us and we'll pull up your enquiry instantly.",
  /** Blocks identical resubmissions within this window (ms). */
  duplicateWindowMs: 60_000,
};

/* ------------------------------------------------------------------ */
/* Derived helpers                                                      */
/* ------------------------------------------------------------------ */

/** Keyless Google Maps embed for the configured office coordinates. */
export function mapEmbedUrl(): string {
  const q = `${contactSettings.mapLat},${contactSettings.mapLng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
}

export function directionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${contactSettings.mapLat},${contactSettings.mapLng}`,
  )}`;
}

export function getContactChannels(): ContactChannel[] {
  const channels: ContactChannel[] = [
    {
      id: "cc-address",
      type: "address",
      label: contactSettings.officeLabel,
      value: contactSettings.address,
      href: directionsUrl(),
      note: "Walk-ins welcome during office hours",
      order: 1,
      published: contactSettings.published,
    },
    {
      id: "cc-phone",
      type: "phone",
      label: "Primary mobile",
      value: company.phone,
      href: `tel:${company.phoneRaw}`,
      note: "Bookings, quotes and changes",
      order: 2,
      published: true,
    },
    {
      id: "cc-phone-alt",
      type: "phone",
      label: "Alternate mobile",
      value: contactSettings.alternatePhone,
      href: `tel:${contactSettings.alternatePhoneRaw}`,
      note: "If the primary line is busy",
      order: 3,
      published: Boolean(contactSettings.alternatePhone && contactSettings.alternatePhoneRaw),
    },
    {
      id: "cc-whatsapp",
      type: "whatsapp",
      label: "WhatsApp",
      value: company.phone,
      href: `https://wa.me/${company.whatsappRaw}`,
      note: "Fastest for itineraries and photos",
      order: 4,
      published: Boolean(company.whatsappRaw),
    },
    {
      id: "cc-email",
      type: "email",
      label: "Email",
      value: company.email,
      href: `mailto:${company.email}`,
      note: "Corporate bookings and invoices",
      order: 5,
      published: Boolean(company.email),
    },
    {
      id: "cc-hours",
      type: "hours",
      label: "Business hours",
      value: company.officeTimings,
      note: "Emergency desk runs 24×7",
      order: 6,
      published: true,
    },
  ];

  return channels.filter((c) => c.published).sort((a, b) => a.order - b.order);
}

/** Service options for the enquiry form — sourced from admin service records. */
export function getEnquiryServiceOptions(): { slug: string; label: string }[] {
  return [{ slug: "general", label: "General enquiry" }].concat(
    getPublishedServices().map((s) => ({ slug: s.slug, label: s.title })),
  );
}

/** SZT-YYMMDD-XXXX reference shown to the customer after submission. */
export function generateEnquiryReference(now = new Date()): string {
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SZT-${y}${m}${d}-${rand}`;
}
