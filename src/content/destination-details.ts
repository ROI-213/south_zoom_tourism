/**
 * Admin-managed destination guide content.
 *
 * Mirrors the future `destination_guides`, `destination_attractions`,
 * `destination_weather`, `destination_tips`, `destination_media`,
 * `destination_faqs` and `destination_nearby` tables:
 *   destination_slug, overview[], attractions[](name, description,
 *   distance_km, travel_time, display_order, visible), weather[],
 *   travel_tips[], gallery[](image, alt, display_order, visible),
 *   faqs[](question, answer, display_order, visible), nearby_slugs[],
 *   map_embed_url, seo_title, seo_description, section_visibility,
 *   published.
 *
 * Every field is optional at the record level: a destination created by the
 * admin with no guide row still renders a complete, useful page through
 * `getDestinationGuide()`, which falls back to the destination record itself.
 */

import heroTours from "@/assets/hero-tours.jpg";
import heroHotels from "@/assets/hero-hotels.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import servicePilgrimage from "@/assets/service-pilgrimage.jpg";
import servicesBanner from "@/assets/services-banner.jpg";
import aboutBanner from "@/assets/about-banner.jpg";
import destBengaluruNew from "@/assets/destinations/dest-bengaluru-new.jpg";
import destMysuruNew from "@/assets/destinations/dest-mysuru-new.jpg";
import destOotyNew2 from "@/assets/destinations/dest-ooty-new2.jpg";
import destGoaNew2 from "@/assets/destinations/dest-goa-new2.jpg";
import type { DestinationRecord } from "@/content/destinations";

export type DestinationAttraction = {
  id: string;
  name: string;
  description: string;
  /** Distance from the destination centre, in km. Optional. */
  distanceKm?: number;
  travelTime?: string;
  order: number;
  visible: boolean;
};

export type DestinationWeatherRow = {
  id: string;
  season: string;
  months: string;
  temperature: string;
  note: string;
  order: number;
  visible: boolean;
};

export type DestinationMedia = {
  id: string;
  image: string;
  alt: string;
  order: number;
  visible: boolean;
};

export type DestinationFaq = {
  id: string;
  question: string;
  answer: string;
  order: number;
  visible: boolean;
};

export type DestinationGuide = {
  destinationSlug: string;
  /** Long-form overview paragraphs. */
  overview: string[];
  attractions: DestinationAttraction[];
  weather: DestinationWeatherRow[];
  travelTips: string[];
  gallery: DestinationMedia[];
  faqs: DestinationFaq[];
  nearbySlugs: string[];
  /** Optional embedded map (OpenStreetMap iframe URL). */
  mapEmbedUrl?: string;
  mapLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
};

const A = (
  n: number,
  name: string,
  description: string,
  distanceKm?: number,
  travelTime?: string,
): DestinationAttraction => ({
  id: `att-${n}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
  description,
  distanceKm,
  travelTime,
  order: n,
  visible: true,
});

const F = (n: number, question: string, answer: string): DestinationFaq => ({
  id: `dfaq-${n}-${question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 32)}`,
  question,
  answer,
  order: n,
  visible: true,
});

const M = (n: number, image: string, alt: string): DestinationMedia => ({
  id: `dmedia-${n}`,
  image,
  alt,
  order: n,
  visible: true,
});

const W = (
  n: number,
  season: string,
  months: string,
  temperature: string,
  note: string,
): DestinationWeatherRow => ({
  id: `dw-${n}-${season.toLowerCase()}`,
  season,
  months,
  temperature,
  note,
  order: n,
  visible: true,
});

const osm = (lat: number, lon: number, d = 0.25) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${(lon - d).toFixed(3)}%2C${(
    lat - d
  ).toFixed(
    3,
  )}%2C${(lon + d).toFixed(3)}%2C${(lat + d).toFixed(3)}&layer=mapnik&marker=${lat}%2C${lon}`;

export const destinationGuides: DestinationGuide[] = [
  {
    destinationSlug: "bengaluru",
    overview: [
      "Bengaluru is the gateway most South India road trips begin from. Airport pickups, corporate travel and weekend departures to Coorg, Mysuru and Chikkamagaluru all start here, so we keep chauffeur-driven sedans and tempo travellers stationed across the city.",
      "Plan a day of parks, palaces and food streets before you drive out, or use the city purely as a transit night — either way our drivers know the traffic windows that decide whether you leave in one hour or three.",
    ],
    attractions: [
      A(
        1,
        "Lalbagh Botanical Garden",
        "240-acre garden with the glass house and a 3,000-million-year-old rock.",
        5,
        "20 min",
      ),
      A(
        2,
        "Bangalore Palace",
        "Tudor-style palace with audio-guided halls and a photogenic courtyard.",
        6,
        "25 min",
      ),
      A(
        3,
        "Nandi Hills",
        "Sunrise viewpoint above the clouds — leave the city by 4:30 AM.",
        60,
        "1 hr 30 min",
      ),
      A(
        4,
        "Cubbon Park & Vidhana Soudha",
        "Central green lung flanked by the state's landmark civic buildings.",
        3,
        "15 min",
      ),
    ],
    weather: [
      W(
        1,
        "Winter",
        "October – February",
        "15°C – 28°C",
        "Best window. Cool mornings, ideal for Nandi Hills.",
      ),
      W(
        2,
        "Summer",
        "March – May",
        "22°C – 36°C",
        "Warm afternoons; plan indoor sightseeing midday.",
      ),
      W(
        3,
        "Monsoon",
        "June – September",
        "19°C – 28°C",
        "Short heavy showers, evening traffic slows considerably.",
      ),
    ],
    travelTips: [
      "Airport is 35–40 km from the centre — allow 90 minutes at peak hours.",
      "Book outstation departures before 6 AM to clear city traffic.",
      "Most malls and palaces need advance online tickets on weekends.",
    ],
    gallery: [
      M(1, destBengaluruNew, "Vidhana Soudha, Bengaluru's landmark civic building"),
      M(2, servicesBanner, "Tree-lined avenue in central Bengaluru"),
      M(3, heroFleet, "Chauffeur-driven sedan ready for a Bengaluru airport transfer"),
    ],
    faqs: [
      F(
        1,
        "How far is Kempegowda International Airport from the city?",
        "About 35–40 km from MG Road. We recommend leaving 3 hours before domestic departures during peak hours.",
      ),
      F(
        2,
        "Can I hire a car for local sightseeing only?",
        "Yes — our 8 hr / 80 km local packages cover city sightseeing with a driver who handles parking and permits.",
      ),
    ],
    nearbySlugs: ["mysuru", "coorg", "chikkamagaluru"],
    mapEmbedUrl: osm(12.9716, 77.5946),
    mapLabel: "Map of Bengaluru",
    published: true,
  },
  {
    destinationSlug: "mysuru",
    overview: [
      "Mysuru rewards a slow pace: the palace, Chamundi Hill and Brindavan Gardens can all be done in a day and a half without rushing, and the city stays walkable in the evenings.",
      "Most guests pair Mysuru with Coorg or Ooty. Our drivers hold the Karnataka–Tamil Nadu permits needed for onward Nilgiri runs.",
    ],
    attractions: [
      A(
        1,
        "Mysore Palace",
        "Illuminated on Sunday evenings — arrive by 6:30 PM for the lighting.",
        2,
        "10 min",
      ),
      A(
        2,
        "Chamundeshwari Temple",
        "Hilltop temple with city views; 1,000 steps for those who want them.",
        13,
        "35 min",
      ),
      A(
        3,
        "Brindavan Gardens",
        "Terraced gardens below the KRS dam with a musical fountain show.",
        21,
        "45 min",
      ),
      A(
        4,
        "St. Philomena's Church",
        "Neo-Gothic cathedral with stained glass and twin spires.",
        3,
        "12 min",
      ),
    ],
    weather: [
      W(
        1,
        "Winter",
        "September – February",
        "16°C – 29°C",
        "Peak season, includes Dasara festivities.",
      ),
      W(2, "Summer", "March – May", "22°C – 36°C", "Hot midday; start sightseeing early."),
      W(3, "Monsoon", "June – August", "20°C – 30°C", "Green and quiet, occasional heavy showers."),
    ],
    travelTips: [
      "Palace illumination runs Sundays and public holidays, 7–7:45 PM.",
      "Dasara week books out months ahead — confirm hotels early.",
      "Carry socks: shoes come off at both the palace and the hill temple.",
    ],
    gallery: [
      M(1, destMysuruNew, "Illuminated Mysore Palace at night"),
      M(2, heroTours, "Brindavan Gardens terraces near Mysuru"),
      M(3, aboutBanner, "Heritage street in Mysuru old town"),
    ],
    faqs: [
      F(
        1,
        "How many days do I need in Mysuru?",
        "One full day covers the palace, Chamundi Hill and the gardens. Two days if you add Srirangapatna and Ranganathittu.",
      ),
      F(
        2,
        "Can Mysuru be a day trip from Bengaluru?",
        "Yes — it is a 3 to 3.5 hour drive each way on the expressway. We run this as a 1-day outstation trip.",
      ),
    ],
    nearbySlugs: ["coorg", "bengaluru", "ooty"],
    mapEmbedUrl: osm(12.2958, 76.6394),
    mapLabel: "Map of Mysuru",
    published: true,
  },
  {
    destinationSlug: "coorg",
    overview: [
      "Coorg — Kodagu — is coffee country: plantation stays, waterfalls and misty ghats within a comfortable drive of Bengaluru or Mysuru.",
      "Roads inside the district are narrow and steep in places, so we recommend an SUV or a tempo traveller with a driver used to the ghat sections.",
    ],
    attractions: [
      A(1, "Abbey Falls", "Plantation walk leading to a hanging bridge viewpoint.", 8, "25 min"),
      A(2, "Raja's Seat", "Sunset garden overlooking the valley in Madikeri.", 1, "5 min"),
      A(3, "Dubare Elephant Camp", "Morning elephant interaction on the Cauvery bank.", 30, "1 hr"),
      A(4, "Talakaveri", "Origin of the Cauvery on Brahmagiri hill.", 44, "1 hr 30 min"),
    ],
    weather: [
      W(1, "Winter", "October – March", "14°C – 28°C", "Clear skies, best for plantation stays."),
      W(
        2,
        "Monsoon",
        "June – September",
        "18°C – 24°C",
        "Full waterfalls but slippery trails and leeches.",
      ),
      W(
        3,
        "Summer",
        "April – May",
        "20°C – 32°C",
        "Pleasant compared to the plains; good value on stays.",
      ),
    ],
    travelTips: [
      "Carry light woollens — nights drop sharply even in summer.",
      "Fuel up in Kushalnagar; pumps are sparse deeper into the estates.",
      "Mobile coverage is patchy inside plantations; share your itinerary before you leave.",
    ],
    gallery: [
      M(1, heroTours, "Coffee plantations under mist in Coorg"),
      M(2, servicesBanner, "Waterfall in the Coorg hills"),
      M(3, heroHotels, "Plantation homestay verandah in Coorg"),
    ],
    faqs: [
      F(
        1,
        "What is the best time to visit Coorg?",
        "October to March for clear weather. Visit in the monsoon only if you want full waterfalls and don't mind rain.",
      ),
      F(
        2,
        "Which vehicle suits Coorg roads?",
        "An SUV for families and a tempo traveller for groups — the ghat roads are narrow with tight hairpins.",
      ),
    ],
    nearbySlugs: ["mysuru", "chikkamagaluru", "wayanad"],
    mapEmbedUrl: osm(12.4244, 75.7382),
    mapLabel: "Map of Coorg (Madikeri)",
    published: true,
  },
  {
    destinationSlug: "ooty",
    overview: [
      "Ooty and Coonoor together make the classic Nilgiri loop: tea gardens, the toy train, colonial-era gardens and viewpoints that clear up beautifully between October and June.",
      "The 36-hairpin climb from Mettupalayam is the standard approach. Our drivers hold inter-state permits so pickups from Bengaluru, Mysuru or Coimbatore are straightforward.",
    ],
    attractions: [
      A(
        1,
        "Botanical Gardens",
        "Terraced Victorian gardens with a fossil tree trunk.",
        2,
        "10 min",
      ),
      A(
        2,
        "Nilgiri Mountain Railway",
        "UNESCO-listed toy train between Ooty and Coonoor.",
        1,
        "5 min",
      ),
      A(
        3,
        "Doddabetta Peak",
        "Highest point in the Nilgiris with a telescope house.",
        10,
        "30 min",
      ),
      A(
        4,
        "Coonoor & Sim's Park",
        "Tea estates, Dolphin's Nose and a quieter hill town.",
        19,
        "45 min",
      ),
    ],
    weather: [
      W(
        1,
        "Peak",
        "October – June",
        "10°C – 25°C",
        "Cool and clear; the best months for the toy train.",
      ),
      W(
        2,
        "Monsoon",
        "July – September",
        "12°C – 20°C",
        "Heavy mist, limited viewpoints, lowest hotel rates.",
      ),
      W(
        3,
        "Winter nights",
        "December – January",
        "0°C – 15°C",
        "Frost on some mornings — pack proper woollens.",
      ),
    ],
    travelTips: [
      "Book the Ooty–Coonoor toy train seats well ahead; they sell out daily.",
      "Vehicles need a green-tax pass at the Nilgiri check post — we handle it.",
      "Avoid late-night ghat driving; the descent is closed to heavy traffic after dark.",
    ],
    gallery: [
      M(1, destOotyNew2, "Boats on Ooty lake in the Nilgiris"),
      M(2, servicesBanner, "Toy train crossing a viaduct near Coonoor"),
      M(3, heroHotels, "Cottage stay overlooking Ooty lake"),
    ],
    faqs: [
      F(
        1,
        "How many days are enough for Ooty?",
        "Two nights covers Ooty and Coonoor comfortably. Add a third to include Pykara and Avalanche.",
      ),
      F(
        2,
        "Is the toy train worth it?",
        "Yes — the Ooty to Coonoor leg takes about an hour and is the highlight for most families.",
      ),
    ],
    nearbySlugs: ["kodaikanal", "mysuru", "wayanad"],
    mapEmbedUrl: osm(11.4102, 76.695),
    mapLabel: "Map of Ooty",
    published: true,
  },
  {
    destinationSlug: "munnar",
    overview: [
      "Munnar stacks tea estates, Eravikulam National Park and cottage stays above the clouds into a compact two- to three-night trip from Kochi or Madurai.",
      "Roads are good but winding; a chauffeur-driven SUV keeps the estate roads and early-morning park slots manageable.",
    ],
    attractions: [
      A(
        1,
        "Eravikulam National Park",
        "Home of the Nilgiri tahr; entry by timed slot.",
        13,
        "40 min",
      ),
      A(2, "Mattupetty Dam", "Boating and the Echo Point stop on the same loop.", 13, "35 min"),
      A(3, "Tea Museum", "Working demonstration of the estate tea process.", 2, "10 min"),
      A(4, "Top Station", "Border viewpoint over the Theni valley.", 32, "1 hr 15 min"),
    ],
    weather: [
      W(
        1,
        "Peak",
        "September – March",
        "10°C – 25°C",
        "Clear mornings, best for the park and viewpoints.",
      ),
      W(2, "Monsoon", "June – August", "14°C – 22°C", "Heavy rain; some estate roads close."),
      W(3, "Summer", "April – May", "16°C – 28°C", "Comfortable escape from the plains."),
    ],
    travelTips: [
      "Eravikulam tickets are released online each morning — book at 7 AM.",
      "Mist rolls in after 3 PM; do viewpoints in the first half of the day.",
      "Cottage stays are spread out — keep the vehicle with you for the full stay.",
    ],
    gallery: [
      M(1, heroTours, "Tea plantations layered across the Munnar hills"),
      M(2, heroHotels, "Hill cottage above the clouds in Munnar"),
      M(3, servicesBanner, "Mountain road winding through Munnar estates"),
    ],
    faqs: [
      F(
        1,
        "How do I reach Munnar?",
        "Kochi airport is the usual entry (about 4 hours). We also run Madurai and Coimbatore pickups.",
      ),
      F(
        2,
        "Is Munnar good for a honeymoon?",
        "Yes — plantation resorts, private cottages and quiet viewpoints make it one of our most-booked honeymoon destinations.",
      ),
    ],
    nearbySlugs: ["kodaikanal", "wayanad", "ooty"],
    mapEmbedUrl: osm(10.0889, 77.0595),
    mapLabel: "Map of Munnar",
    published: true,
  },
  {
    destinationSlug: "goa",
    overview: [
      "Goa splits into two moods: North Goa for beaches, markets and nightlife, South Goa for quiet sands and heritage churches. Most itineraries we run take in both with a car on call.",
      "Airport and railway transfers, sunset cruises and day trips to Dudhsagar are all arranged with a driver so no one is stuck negotiating rides at the beach.",
    ],
    attractions: [
      A(
        1,
        "Baga & Calangute",
        "The busiest North Goa beach stretch, shacks and water sports.",
        14,
        "35 min",
      ),
      A(
        2,
        "Old Goa churches",
        "Basilica of Bom Jesus and Se Cathedral, both UNESCO listed.",
        10,
        "25 min",
      ),
      A(3, "Palolem Beach", "Crescent bay in South Goa, calm water and kayaks.", 68, "1 hr 45 min"),
      A(4, "Dudhsagar Falls", "Four-tier waterfall reached by a jeep safari.", 60, "2 hr"),
    ],
    weather: [
      W(1, "Peak", "November – February", "21°C – 32°C", "Dry, breezy and busiest — book early."),
      W(
        2,
        "Monsoon",
        "June – September",
        "24°C – 29°C",
        "Green and cheap; most water sports shut.",
      ),
      W(3, "Shoulder", "March – May", "26°C – 34°C", "Humid but quieter beaches and lower rates."),
    ],
    travelTips: [
      "North and South Goa are 60–70 km apart — pick a base rather than switching daily.",
      "Dudhsagar jeep safaris are permit-controlled and stop in peak monsoon.",
      "Keep an ID on you; beach shacks and cruises check at boarding.",
    ],
    gallery: [
      M(1, destGoaNew2, "Palm-lined Palolem beach on the South Goa coast"),
      M(2, heroTours, "Palm-lined beach at sunset in Goa"),
      M(3, servicesBanner, "Portuguese-era church facade in Old Goa"),
    ],
    faqs: [
      F(
        1,
        "North Goa or South Goa?",
        "North for nightlife and markets, South for quiet beaches and resorts. Families usually prefer South with a day trip north.",
      ),
      F(
        2,
        "Do you provide airport transfers in Goa?",
        "Yes — Dabolim and Mopa transfers are both covered, including late-night arrivals.",
      ),
    ],
    nearbySlugs: ["gokarna", "hampi", "bengaluru"],
    mapEmbedUrl: osm(15.2993, 74.124, 0.4),
    mapLabel: "Map of Goa",
    published: true,
  },
  {
    destinationSlug: "tirupati",
    overview: [
      "Tirumala darshan drives the trip, and the logistics matter more than the sightseeing: slot timings, the ghat road, locker rules and where the vehicle can wait.",
      "We run Tirupati as a one- or two-night pilgrimage with drivers who do this route weekly and know the queue complexes.",
    ],
    attractions: [
      A(
        1,
        "Sri Venkateswara Temple, Tirumala",
        "The main darshan; slots must be booked in advance.",
        22,
        "1 hr",
      ),
      A(
        2,
        "Sri Padmavathi Temple, Tiruchanur",
        "Traditionally visited alongside Tirumala.",
        5,
        "20 min",
      ),
      A(3, "Kapila Theertham", "Temple at the base of the hills beside a waterfall.", 4, "15 min"),
      A(4, "Silathoranam", "Natural rock arch near Tirumala.", 23, "1 hr 5 min"),
    ],
    weather: [
      W(
        1,
        "Winter",
        "October – February",
        "18°C – 30°C",
        "Most comfortable for the hill climb and queues.",
      ),
      W(2, "Summer", "March – June", "26°C – 40°C", "Hot; carry water and avoid midday walking."),
      W(
        3,
        "Monsoon",
        "July – September",
        "23°C – 33°C",
        "Cooler with intermittent rain on the ghat road.",
      ),
    ],
    travelTips: [
      "Book darshan slots online before travelling; walk-in waits can exceed 12 hours.",
      "Leather items and electronics are restricted in the queue complex — use the lockers.",
      "Dress code is traditional: no shorts or sleeveless tops.",
    ],
    gallery: [
      M(1, servicePilgrimage, "Temple gopuram at Tirupati"),
      M(2, aboutBanner, "Pilgrims on the Tirumala ghat road"),
      M(3, heroFleet, "Tempo traveller used for a Tirupati pilgrimage group"),
    ],
    faqs: [
      F(
        1,
        "Can you arrange darshan tickets?",
        "We guide you through the official TTD booking and plan the drive around your slot; tickets are issued by the temple trust only.",
      ),
      F(
        2,
        "Can the vehicle go up to Tirumala?",
        "Yes, the ghat road is open to private vehicles with a log entry at the toll gate.",
      ),
    ],
    nearbySlugs: ["bengaluru", "hampi", "mysuru"],
    mapEmbedUrl: osm(13.6288, 79.4192),
    mapLabel: "Map of Tirupati",
    published: true,
  },
  {
    destinationSlug: "hampi",
    overview: [
      "Hampi is an open-air ruin field spread over 25 km² — boulder landscapes, Vijayanagara temples and river crossings that need a vehicle and an early start.",
      "Two nights lets you split the sacred centre and the royal enclosure without doing either in the midday heat.",
    ],
    attractions: [
      A(1, "Virupaksha Temple", "Still-active temple at the heart of Hampi bazaar.", 1, "5 min"),
      A(
        2,
        "Vittala Temple & Stone Chariot",
        "The iconic chariot and musical pillars.",
        4,
        "15 min",
      ),
      A(
        3,
        "Royal Enclosure & Lotus Mahal",
        "Stepped tank, elephant stables and palace ruins.",
        3,
        "12 min",
      ),
      A(4, "Matanga Hill", "Sunrise viewpoint over the boulder landscape.", 2, "10 min"),
    ],
    weather: [
      W(
        1,
        "Peak",
        "November – February",
        "16°C – 30°C",
        "Best months; cool mornings for walking the ruins.",
      ),
      W(2, "Summer", "March – June", "24°C – 40°C", "Very hot — sightseeing before 10 AM only."),
      W(3, "Monsoon", "July – October", "22°C – 32°C", "Green landscape, occasional showers."),
    ],
    travelTips: [
      "Start at sunrise; shade is scarce across the ruins.",
      "One combined ticket covers Vittala and the Royal Enclosure on the same day.",
      "Hospet (Hosapete) is the nearest railhead, 13 km away.",
    ],
    gallery: [
      M(1, aboutBanner, "Stone chariot at the Vittala temple in Hampi"),
      M(2, heroTours, "Boulder landscape around Hampi at sunrise"),
      M(3, servicePilgrimage, "Virupaksha temple tower in Hampi"),
    ],
    faqs: [
      F(
        1,
        "How many days for Hampi?",
        "Two nights is ideal. One long day is possible from Hospet if you start before sunrise.",
      ),
      F(
        2,
        "Is Hampi walkable?",
        "Partly. The sacred centre is walkable, but the royal enclosure and Vittala need a vehicle in between.",
      ),
    ],
    nearbySlugs: ["gokarna", "goa", "bengaluru"],
    mapEmbedUrl: osm(15.335, 76.462),
    mapLabel: "Map of Hampi",
    published: true,
  },
];

/* ------------------------------------------------------------------ */
/* Derived helpers                                                      */
/* ------------------------------------------------------------------ */

const byOrder = <T extends { order: number; visible: boolean }>(rows: T[]) =>
  rows.filter((r) => r.visible).sort((a, b) => a.order - b.order);

/**
 * Guide content for a destination, with a safe fallback so admin-created
 * destinations without a guide row still render a complete page.
 */
export function getDestinationGuide(destination: DestinationRecord): DestinationGuide {
  const record = destinationGuides.find(
    (g) => g.destinationSlug === destination.slug && g.published,
  );

  if (!record) {
    return {
      destinationSlug: destination.slug,
      overview: [destination.shortDescription],
      attractions: destination.highlights.map((h, i) =>
        A(i + 1, h, `A highlight of any ${destination.name} itinerary.`),
      ),
      weather: [],
      travelTips: [],
      gallery: [M(1, destination.image, `${destination.name} — ${destination.imageAlt}`)],
      faqs: [],
      nearbySlugs: [],
      published: true,
    };
  }

  return {
    ...record,
    attractions: byOrder(record.attractions),
    weather: byOrder(record.weather),
    gallery: byOrder(record.gallery),
    faqs: byOrder(record.faqs),
  };
}
