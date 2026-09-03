import heroFleet from '@/assets/hero-fleet.jpg';
import heroTours from '@/assets/hero-tours.jpg';
import heroHotels from '@/assets/hero-hotels.jpg';
import heroAirport from '@/assets/hero-airport.jpg';
import aboutBanner from '@/assets/about-banner.jpg';
import servicesBanner from '@/assets/services-banner.jpg';

// Authentic Destination & Tour Package Photos
import pkgOoty from '@/assets/pkg-ooty.png';
import pkgAlleppey from '@/assets/pkg-alleppey.png';
import pkgNavagraha from '@/assets/pkg-navagraha.png';
import tourNavagraha from '@/assets/tour-navagraha.png';
import tourTirupati from '@/assets/tour-tirupati.png';
import tourCoorg from '@/assets/tour-coorg.png';
import destMunnar from '@/assets/destinations/dest-munnar-new.png';
import destHampi from '@/assets/destinations/dest_hampi_1786683714278.jpg';
import destGokarna from '@/assets/destinations/dest_gokarna_1786683734925.jpg';
import destPondicherry from '@/assets/destinations/dest-pondy-new.png';
import destGoa from '@/assets/destinations/dest-goa-new2.jpg';
import destMadurai from '@/assets/destinations/dest-madurai-new.png';
import destKodaikanal from '@/assets/destinations/dest-kodai-new.png';
import destChikkamagaluru from '@/assets/destinations/dest-chikkamagaluru-new.png';
import destMysuru from '@/assets/destinations/dest-mysuru-new.jpg';
import destBengaluru from '@/assets/destinations/dest-bengaluru-new.jpg';
import destWayanad from '@/assets/destinations/dest-wayanad.jpg';

// Authentic Fleet Vehicle Images
import fleetWagonr from '@/assets/fleet-wagonr-ka.jpg';
import fleetDzire from '@/assets/fleet-dzire-new.png';
import fleetErtiga from '@/assets/fleet-ertiga-new.png';
import fleetInnova from '@/assets/fleet-innova-new.png';
import fleetTempo from '@/assets/fleet-tempo-new.png';
import fleetUrbania from '@/assets/fleet-urbania-ka.jpg';
import fleetBmw from '@/assets/fleet-bmw-new.png';
import fleetBus from '@/assets/fleet-bus-ka.jpg';

export const originalHeroPresets = [
  { label: 'Original Fleet Banner (Sedan/SUV/Innova)', value: heroFleet, filename: 'hero-fleet.jpg' },
  { label: 'Original Tours Banner (Hill Temple/Tea Gardens)', value: heroTours, filename: 'hero-tours.jpg' },
  { label: 'Original Hotels Banner (Resort View/Room)', value: heroHotels, filename: 'hero-hotels.jpg' },
  { label: 'Original About Banner', value: aboutBanner, filename: 'about-banner.jpg' },
  { label: 'Original Services Banner', value: servicesBanner, filename: 'services-banner.jpg' },
];

export function resolveHeroImage(src?: string, heading?: string): string {
  const h = (heading || '').toLowerCase();
  const s = (src || '').toLowerCase();

  // If the slide is about Airport transfers -> use Kempegowda Airport white cab image
  if (h.includes('airport') || h.includes('transfer') || h.includes('flight track') || s.includes('airport')) {
    return heroAirport;
  }
  // If the slide is about Car rentals / Cabs / Fleet -> use the new Bengaluru Vidhana Soudha white fleet image
  if (h.includes('car') || h.includes('cab') || h.includes('rental') || h.includes('fleet') || s.includes('fleet') || s.includes('car')) {
    return heroFleet;
  }
  // If the slide is about Tour packages -> use Karnataka Western Ghats & Mysore white cab image
  if (h.includes('tour') || h.includes('package') || s.includes('tour') || s.includes('package')) {
    return heroTours;
  }
  // If the slide is about Hotels -> use Karnataka luxury resort with white sedan image
  if (h.includes('hotel') || h.includes('resort') || h.includes('stay') || s.includes('hotel')) {
    return heroHotels;
  }

  if (!src) return heroFleet;
  if (src.startsWith('data:')) return src;
  if (src.includes('hero-airport')) return heroAirport;
  if (src.includes('hero-fleet')) return heroFleet;
  if (src.includes('hero-tours')) return heroTours;
  if (src.includes('hero-hotels')) return heroHotels;
  if (src.includes('about-banner')) return aboutBanner;
  if (src.includes('services-banner')) return servicesBanner;
  return heroFleet;
}

/**
 * Resolves the authentic, original photo for a tour package based on slug, title, or destination.
 */
export function resolvePackageImage(image?: string, slugOrTitle?: string): string {
  const key = `${image || ''} ${slugOrTitle || ''}`.toLowerCase();

  if (key.includes('ooty') || key.includes('coonoor') || key.includes('nilgiri')) {
    return pkgOoty;
  }
  if (key.includes('munnar') || key.includes('tea trail')) {
    return destMunnar;
  }
  if (key.includes('coorg') || key.includes('kodagu') || key.includes('coffee')) {
    return tourCoorg;
  }
  if (key.includes('alleppey') || key.includes('alappuzha') || key.includes('houseboat') || key.includes('backwater')) {
    return pkgAlleppey;
  }
  if (key.includes('hampi') || key.includes('vijayanagara') || key.includes('ruins')) {
    return destHampi;
  }
  if (key.includes('gokarna') || key.includes('om beach') || key.includes('kudle')) {
    return destGokarna;
  }
  if (key.includes('pondy') || key.includes('pondicherry') || key.includes('puducherry') || key.includes('french')) {
    return destPondicherry;
  }
  if (key.includes('tirupati') || key.includes('tirumala') || key.includes('balaji') || key.includes('venkateswara')) {
    return tourTirupati;
  }
  if (key.includes('navagraha') || key.includes('kumbakonam') || key.includes('thanjavur')) {
    return tourNavagraha || pkgNavagraha;
  }
  if (key.includes('madurai') || key.includes('meenakshi')) {
    return destMadurai;
  }
  if (key.includes('goa') || key.includes('baga') || key.includes('calangute')) {
    return destGoa;
  }
  if (key.includes('kodai') || key.includes('kodaikanal')) {
    return destKodaikanal;
  }
  if (key.includes('chikkamagaluru') || key.includes('chikmagalur')) {
    return destChikkamagaluru;
  }
  if (key.includes('wayanad')) {
    return destWayanad;
  }
  if (key.includes('mysuru') || key.includes('mysore')) {
    return destMysuru;
  }
  if (key.includes('bengaluru') || key.includes('bangalore')) {
    return destBengaluru;
  }

  // If a custom uploaded image URL is provided, return it
  if (image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:'))) {
    return image;
  }

  return pkgOoty;
}

/**
 * Resolves the authentic, original photo for a destination based on slug or name.
 */
export function resolveDestinationImage(image?: string, slugOrName?: string): string {
  const key = `${image || ''} ${slugOrName || ''}`.toLowerCase();

  if (key.includes('ooty')) return pkgOoty;
  if (key.includes('munnar')) return destMunnar;
  if (key.includes('coorg')) return tourCoorg;
  if (key.includes('alleppey')) return pkgAlleppey;
  if (key.includes('hampi')) return destHampi;
  if (key.includes('gokarna')) return destGokarna;
  if (key.includes('pondy') || key.includes('pondicherry')) return destPondicherry;
  if (key.includes('tirupati')) return tourTirupati;
  if (key.includes('madurai')) return destMadurai;
  if (key.includes('goa')) return destGoa;
  if (key.includes('kodai') || key.includes('kodaikanal')) return destKodaikanal;
  if (key.includes('chikkamagaluru')) return destChikkamagaluru;
  if (key.includes('wayanad')) return destWayanad;
  if (key.includes('mysuru')) return destMysuru;
  if (key.includes('bengaluru')) return destBengaluru;

  if (image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:'))) {
    return image;
  }

  return heroTours;
}

/**
 * Resolves the authentic vehicle photo for any fleet vehicle by slug, name or category.
 * Slug/name keywords always take priority over stored image URLs to prevent wrong images.
 */
export function resolveVehicleImage(image?: string, slugOrName?: string): string {
  // Slug/name keyword checks take HIGHEST priority to prevent wrong image from DB
  const nameKey = (slugOrName || '').toLowerCase();
  if (nameKey.includes('wagonr') || nameKey.includes('hatchback') || nameKey.includes('indica') || nameKey.includes('i10')) {
    return fleetWagonr;
  }
  if (nameKey.includes('dzire') || nameKey.includes('etios') || nameKey.includes('sedan') || nameKey.includes('verna')) {
    return fleetDzire;
  }
  if (nameKey.includes('ertiga') || nameKey.includes('6-seater') || nameKey.includes('carens') || nameKey.includes('suv-ertiga')) {
    return fleetErtiga;
  }
  if (nameKey.includes('innova') || nameKey.includes('crysta') || nameKey.includes('7-seater') || nameKey.includes('hycross') || nameKey.includes('suv-innova')) {
    return fleetInnova;
  }
  if (nameKey.includes('urbania') || nameKey.includes('tempo-17') || nameKey.includes('17-seater')) {
    return fleetUrbania;
  }
  if (nameKey.includes('tempo') || nameKey.includes('12-seater') || nameKey.includes('14-seater') || nameKey.includes('traveller')) {
    return fleetTempo;
  }
  if (nameKey.includes('bmw') || nameKey.includes('audi') || nameKey.includes('mercedes') || nameKey.includes('premium') || nameKey.includes('luxury')) {
    return fleetBmw;
  }
  if (nameKey.includes('bus') || nameKey.includes('coach') || nameKey.includes('mini bus')) {
    return fleetBus;
  }

  // Also check image filename keywords as secondary fallback
  const imgKey = (image || '').toLowerCase();
  if (imgKey.includes('wagonr') || imgKey.includes('hatchback') || imgKey.includes('indica') || imgKey.includes('i10')) {
    return fleetWagonr;
  }
  if (imgKey.includes('dzire') || imgKey.includes('etios') || imgKey.includes('sedan') || imgKey.includes('verna')) {
    return fleetDzire;
  }
  if (imgKey.includes('ertiga') || imgKey.includes('6-seater') || imgKey.includes('carens') || imgKey.includes('suv-ertiga')) {
    return fleetErtiga;
  }
  if (imgKey.includes('innova') || imgKey.includes('crysta') || imgKey.includes('7-seater') || imgKey.includes('hycross') || imgKey.includes('suv-innova')) {
    return fleetInnova;
  }
  if (imgKey.includes('urbania') || imgKey.includes('tempo-17') || imgKey.includes('17-seater')) {
    return fleetUrbania;
  }
  if (imgKey.includes('tempo') || imgKey.includes('12-seater') || imgKey.includes('14-seater') || imgKey.includes('traveller')) {
    return fleetTempo;
  }
  if (imgKey.includes('bmw') || imgKey.includes('audi') || imgKey.includes('mercedes') || imgKey.includes('premium') || imgKey.includes('luxury')) {
    return fleetBmw;
  }
  if (imgKey.includes('bus') || imgKey.includes('coach') || imgKey.includes('mini bus')) {
    return fleetBus;
  }

  // If a valid Supabase or custom uploaded URL is provided use it as final fallback
  if (image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) && !image.includes('photo-1549317661-bd32c8ce0db2')) {
    return image;
  }

  return fleetDzire;
}

