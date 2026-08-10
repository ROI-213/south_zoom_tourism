/**
 * Admin-managed gallery content.
 *
 * Mirrors the future `gallery_categories`, `gallery_albums` and
 * `gallery_media` tables:
 *   gallery_categories: id, slug, label, description, display_order, published
 *   gallery_albums:     id, slug, title, description, cover_image, cover_alt,
 *                       category_slug, display_order, published
 *   gallery_media:      id, album_slug, category_slug, type ('image' | 'video'),
 *                       image, alt, caption, attribution, width, height,
 *                       video_url, related_label, related_href,
 *                       display_order, published
 *
 * Nothing renders unless `published` is true, and every list is sorted by
 * `order` so the admin controls sequence. Intrinsic width/height are stored so
 * the grid can reserve space and avoid layout shift.
 */

import heroTours from "@/assets/hero-tours.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import heroHotels from "@/assets/hero-hotels.jpg";
import serviceGroup from "@/assets/service-group.png";
import aboutBanner from "@/assets/about-banner.jpg";
import office1 from "@/assets/office-1.jpg";
import serviceCorporate from "@/assets/service-corporate.jpg";
import servicePilgrimage from "@/assets/service-pilgrimage.jpg";
import serviceWedding from "@/assets/service-wedding.jpg";
import servicesBanner from "@/assets/services-banner.jpg";
import team1 from "@/assets/team-1.jpg";
import team2 from "@/assets/team-2.jpg";

export type GalleryCategory = {
  id: string;
  slug: string;
  label: string;
  description: string;
  order: number;
  published: boolean;
};

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  coverAlt: string;
  categorySlug: string;
  order: number;
  published: boolean;
};

export type GalleryMedia = {
  id: string;
  type: "image" | "video";
  albumSlug: string;
  categorySlug: string;
  /** Image, or poster frame for a video. */
  image: string;
  alt: string;
  caption: string;
  attribution?: string;
  /** Intrinsic size — used to reserve space and prevent layout shift. */
  width: number;
  height: number;
  /** Privacy-friendly embed URL for `type: "video"`. Never autoplays. */
  videoUrl?: string;
  relatedLabel?: string;
  relatedHref?: string;
  order: number;
  published: boolean;
};

export const galleryBannerBlock = {
  visible: true,
  title: "Gallery",
  subtitle:
    "Real photos and videos from South Zoom Tourism trips — our fleet, partner hotels and rooms, South India destinations, customer journeys, group tours, corporate travel and events.",
  image: servicesBanner,
  imageAlt: "South Zoom Tourism vehicle on a South India highway at sunrise",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Gallery", href: "/gallery" },
  ],
};

export const galleryPerPage = 12;

export const galleryCategories: GalleryCategory[] = [
  { id: "c1", slug: "fleet", label: "Fleet", description: "Cars, SUVs and tempo travellers in service.", order: 1, published: true },
  { id: "c2", slug: "destinations", label: "Tour Destinations", description: "Places we take travellers across South India.", order: 2, published: true },
  { id: "c3", slug: "hotels", label: "Hotels", description: "Partner properties we book for guests.", order: 3, published: true },
  { id: "c4", slug: "rooms", label: "Rooms", description: "Room categories available through us.", order: 4, published: true },
  { id: "c5", slug: "customer-trips", label: "Customer Trips", description: "Moments shared by travellers.", order: 5, published: true },
  { id: "c6", slug: "group-tours", label: "Group Tours", description: "School, family and community groups.", order: 6, published: true },
  { id: "c7", slug: "corporate-travel", label: "Corporate Travel", description: "Employee transport and business trips.", order: 7, published: true },
  { id: "c8", slug: "events", label: "Events", description: "Weddings, conferences and company events.", order: 8, published: true },
  { id: "c9", slug: "videos", label: "Videos", description: "Walkarounds, drives and trip films.", order: 9, published: true },
];

export const galleryAlbums: GalleryAlbum[] = [
  { id: "a1", slug: "our-fleet", title: "Our Fleet", description: "Sedans, SUVs and tempo travellers maintained in-house.", coverImage: heroFleet, coverAlt: "South Zoom sedan parked on a coastal highway", categorySlug: "fleet", order: 1, published: true },
  { id: "a2", slug: "hill-stations", title: "Hill Stations", description: "Ooty, Munnar, Coorg and Kodaikanal.", coverImage: heroTours, coverAlt: "Misty tea plantations on a hill station tour", categorySlug: "destinations", order: 2, published: true },
  { id: "a3", slug: "partner-hotels", title: "Partner Hotels", description: "Properties we book across South India.", coverImage: heroHotels, coverAlt: "Partner hotel exterior with hill views", categorySlug: "hotels", order: 3, published: true },
  { id: "a4", slug: "room-categories", title: "Room Categories", description: "Deluxe, premium and family rooms.", coverImage: aboutBanner, coverAlt: "Deluxe hotel room with a valley-facing window", categorySlug: "rooms", order: 4, published: true },
  { id: "a5", slug: "traveller-moments", title: "Traveller Moments", description: "Photos shared by our customers.", coverImage: team1, coverAlt: "Family on a South Zoom tour at a viewpoint", categorySlug: "customer-trips", order: 5, published: true },
  { id: "a6", slug: "group-departures", title: "Group Departures", description: "Large groups travelling with our tempo fleet.", coverImage: servicePilgrimage, coverAlt: "Group of pilgrims boarding a tempo traveller", categorySlug: "group-tours", order: 6, published: true },
  { id: "a7", slug: "corporate-accounts", title: "Corporate Accounts", description: "Employee shuttles and business transfers.", coverImage: serviceCorporate, coverAlt: "Executive MPV used for employee and business transfers", categorySlug: "corporate-travel", order: 7, published: true },
  { id: "a8", slug: "weddings-and-events", title: "Weddings & Events", description: "Wedding fleets and conference logistics.", coverImage: serviceWedding, coverAlt: "Decorated wedding car arranged by South Zoom", categorySlug: "events", order: 8, published: true },
  { id: "a9", slug: "trip-films", title: "Trip Films", description: "Short videos from routes and vehicle walkarounds.", coverImage: heroTours, coverAlt: "Video still from a South India road trip film", categorySlug: "videos", order: 9, published: true },
];

export const galleryMedia: GalleryMedia[] = [
  // Fleet
  { id: "m1", type: "image", albumSlug: "our-fleet", categorySlug: "fleet", image: heroFleet, alt: "White South Zoom sedan parked beside a coastal highway at sunset", caption: "Sedan ready for an airport transfer on the East Coast Road", attribution: "South Zoom Tourism", width: 1920, height: 1080, relatedLabel: "Browse the fleet", relatedHref: "/fleet", order: 1, published: true },
  { id: "m2", type: "image", albumSlug: "our-fleet", categorySlug: "fleet", image: servicesBanner, alt: "Tempo traveller cleaned and lined up before a group departure", caption: "17-seat tempo traveller before a Coorg group departure", attribution: "South Zoom Tourism", width: 1920, height: 1080, relatedLabel: "Tempo traveller options", relatedHref: "/fleet", order: 2, published: true },
  { id: "m3", type: "image", albumSlug: "our-fleet", categorySlug: "fleet", image: office1, alt: "Driver checking tyre pressure during a pre-trip vehicle inspection", caption: "Every vehicle gets a pre-trip inspection", attribution: "South Zoom Tourism", width: 1600, height: 1067, order: 3, published: true },

  // Destinations
  { id: "m4", type: "image", albumSlug: "hill-stations", categorySlug: "destinations", image: heroTours, alt: "Tea plantations covered in morning mist on a Munnar tour", caption: "Tea estates near Munnar on a three-day package", attribution: "South Zoom Tourism", width: 1920, height: 1080, relatedLabel: "Munnar packages", relatedHref: "/tour-packages", order: 1, published: true },
  { id: "m5", type: "image", albumSlug: "hill-stations", categorySlug: "destinations", image: aboutBanner, alt: "Winding ghat road climbing towards Ooty through eucalyptus forest", caption: "The ghat climb into Ooty", attribution: "South Zoom Tourism", width: 1920, height: 1080, relatedLabel: "Explore destinations", relatedHref: "/destinations", order: 2, published: true },
  { id: "m6", type: "image", albumSlug: "hill-stations", categorySlug: "destinations", image: servicePilgrimage, alt: "Hill temple gopuram lit by early morning light", caption: "Sunrise darshan on the temple circuit", attribution: "South Zoom Tourism", width: 1600, height: 1067, relatedLabel: "Pilgrimage tours", relatedHref: "/services", order: 3, published: true },

  // Hotels
  { id: "m7", type: "image", albumSlug: "partner-hotels", categorySlug: "hotels", image: heroHotels, alt: "Partner hotel exterior with landscaped gardens and hill views", caption: "A partner resort in Coorg", attribution: "Property photo, used with permission", width: 1920, height: 1080, relatedLabel: "Find hotels", relatedHref: "/hotels", order: 1, published: true },
  { id: "m8", type: "image", albumSlug: "partner-hotels", categorySlug: "hotels", image: office1, alt: "Hotel lobby with reception desk and seating area", caption: "Check-in handled on your behalf", attribution: "Property photo, used with permission", width: 1600, height: 1067, order: 2, published: true },

  // Rooms
  { id: "m9", type: "image", albumSlug: "room-categories", categorySlug: "rooms", image: aboutBanner, alt: "Deluxe double room with a large window facing the valley", caption: "Deluxe valley-view room", attribution: "Property photo, used with permission", width: 1920, height: 1080, relatedLabel: "Search rooms", relatedHref: "/hotels", order: 1, published: true },
  { id: "m10", type: "image", albumSlug: "room-categories", categorySlug: "rooms", image: heroHotels, alt: "Family room with twin beds and a seating corner", caption: "Family rooms for four guests", attribution: "Property photo, used with permission", width: 1920, height: 1080, order: 2, published: true },

  // Customer trips
  { id: "m11", type: "image", albumSlug: "traveller-moments", categorySlug: "customer-trips", image: team1, alt: "Family posing at a hill viewpoint during their tour", caption: "The Rajan family at Dolphin's Nose, Kodaikanal", attribution: "Shared by the guest", width: 1200, height: 1200, order: 1, published: true },
  { id: "m12", type: "image", albumSlug: "traveller-moments", categorySlug: "customer-trips", image: team2, alt: "Couple beside their booked SUV on a honeymoon trip", caption: "Honeymoon trip through Munnar and Thekkady", attribution: "Shared by the guest", width: 1200, height: 1200, relatedLabel: "Honeymoon packages", relatedHref: "/tour-packages", order: 2, published: true },

  // Group tours
  { id: "m13", type: "image", albumSlug: "group-departures", categorySlug: "group-tours", image: servicePilgrimage, alt: "Group of travellers boarding a tempo traveller before a temple tour", caption: "A 34-guest Navagraha temple departure", attribution: "South Zoom Tourism", width: 1600, height: 1067, order: 1, published: true },
  { id: "m14", type: "image", albumSlug: "group-departures", categorySlug: "group-tours", image: serviceGroup, alt: "South Zoom group tour vehicles", caption: "Group travel fleet ready for departure", attribution: "South Zoom Tourism", width: 1600, height: 1067, order: 2, published: true },

  // Corporate
  { id: "m15", type: "image", albumSlug: "corporate-accounts", categorySlug: "corporate-travel", image: serviceCorporate, alt: "Executive MPV for corporate and employee transport", caption: "Daily employee transport for a Bengaluru account", attribution: "South Zoom Tourism", width: 1600, height: 1067, relatedLabel: "Corporate travel", relatedHref: "/services", order: 1, published: true },

  // Events
  { id: "m16", type: "image", albumSlug: "weddings-and-events", categorySlug: "events", image: serviceWedding, alt: "Decorated wedding car with floral arrangements outside a venue", caption: "Wedding fleet for a Madurai ceremony", attribution: "South Zoom Tourism", width: 1600, height: 1067, relatedLabel: "Event transport", relatedHref: "/services", order: 1, published: true },
  { id: "m17", type: "image", albumSlug: "weddings-and-events", categorySlug: "events", image: office1, alt: "Conference guests arriving at a hotel entrance from shuttle vehicles", caption: "Conference shuttle rotation in Chennai", attribution: "South Zoom Tourism", width: 1600, height: 1067, order: 2, published: true },

  // Videos
  { id: "m18", type: "video", albumSlug: "trip-films", categorySlug: "videos", image: heroTours, alt: "Video still of a car driving through misty hill roads", caption: "Munnar road trip — 2 minute film", attribution: "South Zoom Tourism", width: 1920, height: 1080, videoUrl: "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0", order: 1, published: true },
  { id: "m19", type: "video", albumSlug: "trip-films", categorySlug: "videos", image: heroFleet, alt: "Video still of a tempo traveller interior walkaround", caption: "Tempo traveller interior walkaround", attribution: "South Zoom Tourism", width: 1920, height: 1080, videoUrl: "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0", relatedLabel: "See the fleet", relatedHref: "/fleet", order: 2, published: true },
];

/* ------------------------------------------------------------------ */
/* Selectors                                                            */
/* ------------------------------------------------------------------ */

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function getPublishedMedia(): GalleryMedia[] {
  return galleryMedia.filter((m) => m.published).sort(byOrder);
}

export function getPublishedAlbums(): GalleryAlbum[] {
  const media = getPublishedMedia();
  return galleryAlbums
    .filter((a) => a.published && media.some((m) => m.albumSlug === a.slug))
    .sort(byOrder);
}

export function getPublishedCategories(): GalleryCategory[] {
  const media = getPublishedMedia();
  return galleryCategories
    .filter((c) => c.published && media.some((m) => m.categorySlug === c.slug))
    .sort(byOrder);
}

export function getCategoryLabel(slug: string): string {
  return galleryCategories.find((c) => c.slug === slug)?.label ?? slug;
}

export function getAlbum(slug: string): GalleryAlbum | undefined {
  return getPublishedAlbums().find((a) => a.slug === slug);
}

export function countMediaInCategory(slug: string): number {
  return getPublishedMedia().filter((m) => m.categorySlug === slug).length;
}

export function countMediaInAlbum(slug: string): number {
  return getPublishedMedia().filter((m) => m.albumSlug === slug).length;
}

export function filterMedia({
  category = "all",
  album,
}: {
  category?: string;
  album?: string;
}): GalleryMedia[] {
  return getPublishedMedia().filter((m) => {
    if (album && m.albumSlug !== album) return false;
    if (category !== "all" && m.categorySlug !== category) return false;
    return true;
  });
}
