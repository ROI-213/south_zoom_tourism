/**
 * Location Autocomplete Service for South Zoom Tourism.
 *
 * Supports fast instant suggestions for South Indian cities, airports,
 * hill stations, pilgrimage towns, and live fallback querying.
 */

export type LocationSuggestion = {
  id: string;
  name: string;
  state: string;
  category: "city" | "airport" | "tourist" | "station" | "landmark";
  lat?: number;
  lng?: number;
  displayName: string;
};

export const POPULAR_LOCATIONS: LocationSuggestion[] = [
  // Major Cities & Transport Hubs
  { id: "loc-blr", name: "Bengaluru", state: "Karnataka", category: "city", lat: 12.9716, lng: 77.5946, displayName: "Bengaluru, Karnataka" },
  { id: "loc-blr-airport", name: "Kempegowda International Airport (BLR)", state: "Karnataka", category: "airport", lat: 13.1986, lng: 77.7066, displayName: "Bengaluru Airport (BLR), Devanahalli" },
  { id: "loc-blr-majestic", name: "Bengaluru Majestic / City Railway Station", state: "Karnataka", category: "station", lat: 12.9781, lng: 77.5696, displayName: "Majestic / KSR Railway Station, Bengaluru" },
  { id: "loc-blr-whitefield", name: "Whitefield, Bengaluru", state: "Karnataka", category: "landmark", lat: 12.9698, lng: 77.7499, displayName: "Whitefield, Bengaluru, Karnataka" },
  { id: "loc-blr-electronic-city", name: "Electronic City, Bengaluru", state: "Karnataka", category: "landmark", lat: 12.8452, lng: 77.6602, displayName: "Electronic City, Bengaluru, Karnataka" },
  { id: "loc-blr-koramangala", name: "Koramangala, Bengaluru", state: "Karnataka", category: "landmark", lat: 12.9352, lng: 77.6245, displayName: "Koramangala, Bengaluru, Karnataka" },
  { id: "loc-blr-indiranagar", name: "Indiranagar, Bengaluru", state: "Karnataka", category: "landmark", lat: 12.9784, lng: 77.6408, displayName: "Indiranagar, Bengaluru, Karnataka" },
  
  { id: "loc-mys", name: "Mysuru", state: "Karnataka", category: "city", lat: 12.2958, lng: 76.6394, displayName: "Mysuru (Mysore), Karnataka" },
  { id: "loc-mys-palace", name: "Mysuru Palace", state: "Karnataka", category: "tourist", lat: 12.3051, lng: 76.6551, displayName: "Mysuru Palace, Mysuru, Karnataka" },
  
  { id: "loc-coorg", name: "Coorg (Madikeri)", state: "Karnataka", category: "tourist", lat: 12.4244, lng: 75.7382, displayName: "Coorg (Madikeri), Karnataka" },
  { id: "loc-chikmagalur", name: "Chikkamagaluru", state: "Karnataka", category: "tourist", lat: 13.3161, lng: 75.7720, displayName: "Chikkamagaluru, Karnataka" },
  { id: "loc-hampi", name: "Hampi", state: "Karnataka", category: "tourist", lat: 15.3350, lng: 76.4600, displayName: "Hampi, Vijayanagara, Karnataka" },
  { id: "loc-gokarna", name: "Gokarna", state: "Karnataka", category: "tourist", lat: 14.5479, lng: 74.3188, displayName: "Gokarna, Uttara Kannada, Karnataka" },
  { id: "loc-mangalore", name: "Mangaluru (Mangalore)", state: "Karnataka", category: "city", lat: 12.9141, lng: 74.8560, displayName: "Mangaluru, Karnataka" },
  { id: "loc-udupi", name: "Udupi", state: "Karnataka", category: "city", lat: 13.3409, lng: 74.7421, displayName: "Udupi, Karnataka" },
  { id: "loc-shivamogga", name: "Shivamogga (Shimoga / Jog Falls)", state: "Karnataka", category: "city", lat: 13.9299, lng: 75.5681, displayName: "Shivamogga / Jog Falls, Karnataka" },
  { id: "loc-belagavi", name: "Belagavi (Belgaum)", state: "Karnataka", category: "city", lat: 15.8497, lng: 74.4977, displayName: "Belagavi, Karnataka" },
  { id: "loc-hubballi", name: "Hubballi-Dharwad", state: "Karnataka", category: "city", lat: 15.3647, lng: 75.1240, displayName: "Hubballi, Karnataka" },
  { id: "loc-hassan", name: "Hassan (Belur / Halebidu)", state: "Karnataka", category: "tourist", lat: 13.0072, lng: 76.0963, displayName: "Hassan (Belur / Halebidu), Karnataka" },
  { id: "loc-nandi-hills", name: "Nandi Hills", state: "Karnataka", category: "tourist", lat: 13.3702, lng: 77.6835, displayName: "Nandi Hills, Chikkaballapur, Karnataka" },
  { id: "loc-bandipur", name: "Bandipur National Park", state: "Karnataka", category: "tourist", lat: 11.6664, lng: 76.6291, displayName: "Bandipur Tiger Reserve, Karnataka" },
  { id: "loc-kabini", name: "Kabini (Nagarhole)", state: "Karnataka", category: "tourist", lat: 11.9261, lng: 76.2625, displayName: "Kabini / Nagarhole, Karnataka" },
  { id: "loc-dandeli", name: "Dandeli", state: "Karnataka", category: "tourist", lat: 15.2427, lng: 74.6229, displayName: "Dandeli, Karnataka" },
  { id: "loc-murudeshwar", name: "Murudeshwar", state: "Karnataka", category: "tourist", lat: 14.0941, lng: 74.4899, displayName: "Murudeshwar Temple & Beach, Karnataka" },

  // Tamil Nadu
  { id: "loc-chennai", name: "Chennai", state: "Tamil Nadu", category: "city", lat: 13.0827, lng: 80.2707, displayName: "Chennai, Tamil Nadu" },
  { id: "loc-chennai-airport", name: "Chennai International Airport (MAA)", state: "Tamil Nadu", category: "airport", lat: 12.9941, lng: 80.1709, displayName: "Chennai Airport (MAA), Meenambakkam" },
  { id: "loc-ooty", name: "Ooty (Udhagamandalam)", state: "Tamil Nadu", category: "tourist", lat: 11.4102, lng: 76.6950, displayName: "Ooty, Nilgiris, Tamil Nadu" },
  { id: "loc-coonoor", name: "Coonoor", state: "Tamil Nadu", category: "tourist", lat: 11.3530, lng: 76.7959, displayName: "Coonoor, Nilgiris, Tamil Nadu" },
  { id: "loc-kodaikanal", name: "Kodaikanal", state: "Tamil Nadu", category: "tourist", lat: 10.2381, lng: 77.4892, displayName: "Kodaikanal, Dindigul, Tamil Nadu" },
  { id: "loc-coimbatore", name: "Coimbatore", state: "Tamil Nadu", category: "city", lat: 11.0168, lng: 76.9558, displayName: "Coimbatore, Tamil Nadu" },
  { id: "loc-madurai", name: "Madurai", state: "Tamil Nadu", category: "city", lat: 9.9252, lng: 78.1198, displayName: "Madurai (Meenakshi Temple), Tamil Nadu" },
  { id: "loc-rameswaram", name: "Rameswaram", state: "Tamil Nadu", category: "tourist", lat: 9.2876, lng: 79.3129, displayName: "Rameswaram (Dhanushkodi), Tamil Nadu" },
  { id: "loc-kanyakumari", name: "Kanyakumari", state: "Tamil Nadu", category: "tourist", lat: 8.0883, lng: 77.5385, displayName: "Kanyakumari, Tamil Nadu" },
  { id: "loc-tiruchirappalli", name: "Tiruchirappalli (Trichy)", state: "Tamil Nadu", category: "city", lat: 10.7905, lng: 78.7047, displayName: "Tiruchirappalli (Trichy), Tamil Nadu" },
  { id: "loc-thanjavur", name: "Thanjavur", state: "Tamil Nadu", category: "tourist", lat: 10.7870, lng: 79.1378, displayName: "Thanjavur (Brihadeeswara Temple), Tamil Nadu" },
  { id: "loc-kumbakonam", name: "Kumbakonam (Navagraha)", state: "Tamil Nadu", category: "tourist", lat: 10.9602, lng: 79.3845, displayName: "Kumbakonam, Tamil Nadu" },
  { id: "loc-salem", name: "Salem", state: "Tamil Nadu", category: "city", lat: 11.6643, lng: 78.1460, displayName: "Salem, Tamil Nadu" },
  { id: "loc-yercaud", name: "Yercaud", state: "Tamil Nadu", category: "tourist", lat: 11.7753, lng: 78.2093, displayName: "Yercaud, Salem, Tamil Nadu" },
  { id: "loc-hosur", name: "Hosur", state: "Tamil Nadu", category: "city", lat: 12.7409, lng: 77.8253, displayName: "Hosur, Tamil Nadu" },
  { id: "loc-vellore", name: "Vellore (Golden Temple)", state: "Tamil Nadu", category: "city", lat: 12.9165, lng: 79.1325, displayName: "Vellore, Tamil Nadu" },

  // Kerala
  { id: "loc-wayanad", name: "Wayanad (Kalpetta / Sulthan Bathery)", state: "Kerala", category: "tourist", lat: 11.6854, lng: 76.1320, displayName: "Wayanad, Kerala" },
  { id: "loc-munnar", name: "Munnar", state: "Kerala", category: "tourist", lat: 10.0889, lng: 77.0595, displayName: "Munnar, Idukki, Kerala" },
  { id: "loc-kochi", name: "Kochi (Cochin / Ernakulam)", state: "Kerala", category: "city", lat: 9.9312, lng: 76.2673, displayName: "Kochi (Cochin), Kerala" },
  { id: "loc-kochi-airport", name: "Cochin International Airport (COK)", state: "Kerala", category: "airport", lat: 10.1518, lng: 76.3930, displayName: "Cochin Airport (COK), Nedumbassery" },
  { id: "loc-alleppey", name: "Alleppey (Alappuzha)", state: "Kerala", category: "tourist", lat: 9.4981, lng: 76.3388, displayName: "Alleppey (Alappuzha Backwaters), Kerala" },
  { id: "loc-thekkady", name: "Thekkady (Periyar)", state: "Kerala", category: "tourist", lat: 9.6031, lng: 77.1615, displayName: "Thekkady (Periyar Wildlife), Kerala" },
  { id: "loc-trivandrum", name: "Thiruvananthapuram (Trivandrum)", state: "Kerala", category: "city", lat: 8.5241, lng: 76.9366, displayName: "Thiruvananthapuram, Kerala" },
  { id: "loc-kovalam", name: "Kovalam Beach", state: "Kerala", category: "tourist", lat: 8.4004, lng: 76.9787, displayName: "Kovalam, Kerala" },
  { id: "loc-varkala", name: "Varkala Cliff & Beach", state: "Kerala", category: "tourist", lat: 8.7379, lng: 76.7163, displayName: "Varkala, Kerala" },
  { id: "loc-calicut", name: "Kozhikode (Calicut)", state: "Kerala", category: "city", lat: 11.2588, lng: 75.7804, displayName: "Kozhikode (Calicut), Kerala" },
  { id: "loc-kannur", name: "Kannur", state: "Kerala", category: "city", lat: 11.8745, lng: 75.3704, displayName: "Kannur, Kerala" },
  { id: "loc-guruvayur", name: "Guruvayur", state: "Kerala", category: "tourist", lat: 10.5946, lng: 76.0416, displayName: "Guruvayur Temple, Kerala" },

  // Andhra Pradesh & Telangana
  { id: "loc-tirupati", name: "Tirupati (Lord Balaji)", state: "Andhra Pradesh", category: "tourist", lat: 13.6288, lng: 79.4192, displayName: "Tirupati Balaji, Andhra Pradesh" },
  { id: "loc-hyderabad", name: "Hyderabad", state: "Telangana", category: "city", lat: 17.3850, lng: 78.4867, displayName: "Hyderabad, Telangana" },
  { id: "loc-vijayawada", name: "Vijayawada", state: "Andhra Pradesh", category: "city", lat: 16.5062, lng: 80.6480, displayName: "Vijayawada, Andhra Pradesh" },
  { id: "loc-visakhapatnam", name: "Visakhapatnam (Vizag)", state: "Andhra Pradesh", category: "city", lat: 17.6868, lng: 83.2185, displayName: "Visakhapatnam, Andhra Pradesh" },
  { id: "loc-anantapur", name: "Anantapur (Lepakshi)", state: "Andhra Pradesh", category: "tourist", lat: 14.6819, lng: 77.6006, displayName: "Anantapur / Lepakshi, Andhra Pradesh" },
  { id: "loc-kurnool", name: "Kurnool (Mantralayam / Srisailam)", state: "Andhra Pradesh", category: "tourist", lat: 15.8281, lng: 78.0373, displayName: "Kurnool / Srisailam, Andhra Pradesh" },

  // Puducherry & Goa
  { id: "loc-pondicherry", name: "Pondicherry (Puducherry)", state: "Puducherry", category: "tourist", lat: 11.9416, lng: 79.8083, displayName: "Pondicherry (White Town & Beach), Puducherry" },
  { id: "loc-auroville", name: "Auroville, Pondicherry", state: "Puducherry", category: "tourist", lat: 12.0069, lng: 79.8106, displayName: "Auroville, Pondicherry" },
  { id: "loc-goa-north", name: "North Goa (Calangute / Baga / Panaji)", state: "Goa", category: "tourist", lat: 15.5439, lng: 73.7553, displayName: "North Goa (Panaji / Baga / Calangute), Goa" },
  { id: "loc-goa-south", name: "South Goa (Colva / Palolem / Margao)", state: "Goa", category: "tourist", lat: 15.2736, lng: 73.9582, displayName: "South Goa (Margao / Palolem), Goa" },
  { id: "loc-goa-airport-dabolim", name: "Goa Airport (Dabolim - GOI)", state: "Goa", category: "airport", lat: 15.3808, lng: 73.8314, displayName: "Goa Dabolim Airport (GOI)" },
  { id: "loc-goa-airport-mopa", name: "Manohar International Airport Goa (Mopa - GOX)", state: "Goa", category: "airport", lat: 15.7667, lng: 73.8667, displayName: "Goa Mopa Airport (GOX)" },
];

/**
 * Filter local database of destinations with fuzzy match.
 */
export function searchPredefinedLocations(query: string, limit = 8): LocationSuggestion[] {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 1) return POPULAR_LOCATIONS.slice(0, limit);

  const matched = POPULAR_LOCATIONS.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(clean) ||
      loc.displayName.toLowerCase().includes(clean) ||
      loc.state.toLowerCase().includes(clean) ||
      (clean.includes("airport") && loc.category === "airport")
    );
  });

  return matched.slice(0, limit);
}

/**
 * Query locations with live network fallback (OpenStreetMap Nominatim / Indian geocoding).
 */
export async function searchLocationsOnline(
  query: string,
  signal?: AbortSignal,
): Promise<LocationSuggestion[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) {
    return searchPredefinedLocations(clean);
  }

  // 1. Instant local match
  const localMatches = searchPredefinedLocations(clean, 5);

  // 2. If query is longer than 2 chars, try geocoding lookup for precise localities
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(clean)}&limit=6&addressdetails=1`;
    const response = await fetch(url, {
      signal,
      headers: {
        "Accept-Language": "en-IN,en;q=0.9",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const onlineMatches: LocationSuggestion[] = data.map((item: any) => {
        const address = item.address || {};
        const state = address.state || address.state_district || "India";
        const city =
          address.city || address.town || address.village || address.suburb || item.name;
        return {
          id: `osm_${item.place_id}`,
          name: city,
          state,
          category: item.type === "aerodrome" ? "airport" : "city",
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: `${item.display_name.split(",").slice(0, 3).join(",")}`,
        };
      });

      // Deduplicate by name/state
      const seen = new Set<string>();
      const combined = [...localMatches, ...onlineMatches].filter((loc) => {
        const key = `${loc.name.toLowerCase()}_${loc.state.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return combined.slice(0, 8);
    }
  } catch (err) {
    // Network aborted or failed, gracefully return local matches
  }

  return localMatches;
}
