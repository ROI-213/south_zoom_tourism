export type LastTravelSearch = {
  pickupCity?: string;
  dropCity?: string;
  tripType?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  passengers?: string | number;
  vehicleType?: string;
};

const STORAGE_KEY = "szt_latest_travel_search";

export function saveLatestTravelSearch(search: Partial<LastTravelSearch>) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLatestTravelSearch();
    const merged = { ...existing, ...search };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("sztTravelSearchUpdated", { detail: merged }));
  } catch (e) {
    console.error("Failed to save search:", e);
  }
}

export function getLatestTravelSearch(): LastTravelSearch {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  if (typeof window === "undefined") {
    return {
      pickupCity: "Bengaluru",
      dropCity: "Mysuru",
      tripType: "One Way",
      pickupDate: today,
      pickupTime: "08:00",
      returnDate: tomorrow,
      returnTime: "20:00",
      passengers: "2",
      vehicleType: "Hatchback A/C",
    };
  }
  try {
    const raw =
      window.sessionStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        pickupCity: "Bengaluru",
        dropCity: "Mysuru",
        tripType: "One Way",
        pickupDate: today,
        pickupTime: "08:00",
        returnDate: tomorrow,
        returnTime: "20:00",
        passengers: "2",
        vehicleType: "Hatchback A/C",
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      pickupCity: "Bengaluru",
      dropCity: "Mysuru",
      tripType: "One Way",
      pickupDate: today,
      pickupTime: "08:00",
      returnDate: tomorrow,
      returnTime: "20:00",
      passengers: "2",
      vehicleType: "Hatchback A/C",
    };
  }
}
