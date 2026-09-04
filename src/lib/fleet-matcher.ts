/**
 * Canonical vehicle matcher for South Zoom Tourism.
 * Standalone utility with zero internal imports to eliminate circular dependencies.
 */

export function matchVehicleToFareConfig<T extends {
  id?: string;
  fleetId?: string;
  vehicleSlug?: string;
  vehicleName?: string;
  category?: string;
}>(
  identifier: string | undefined | null,
  configs: T[]
): T | undefined {
  if (!identifier || !configs || configs.length === 0) return undefined;
  const raw = String(identifier).toLowerCase().trim();
  if (!raw) return undefined;

  // 1. Direct exact match on id, fleetId, vehicleSlug, or vehicleName
  const direct = configs.find(
    (c) =>
      c.id?.toLowerCase() === raw ||
      c.fleetId?.toLowerCase() === raw ||
      c.vehicleSlug?.toLowerCase() === raw ||
      c.vehicleName?.toLowerCase() === raw ||
      (c.vehicleSlug ? ("ffc-" + c.vehicleSlug).toLowerCase() === raw : false)
  );
  if (direct) return direct;

  // 2. Canonical keyword matching for South Zoom Tourism's 8 fleets
  if (raw.includes("wagonr") || raw.includes("wagon-r") || raw.includes("hatchback")) {
    return configs.find((c) => c.id === "ffc-hatchback" || c.fleetId === "fv-hatchback" || c.vehicleSlug === "hatchback-wagonr" || c.category?.toLowerCase().includes("hatchback"));
  }
  if (raw.includes("dzire") || raw.includes("etios") || raw.includes("sedan") || raw.includes("swift")) {
    return configs.find((c) => c.id === "ffc-sedan" || c.fleetId === "fv-dzire" || c.vehicleSlug === "maruti-dzire" || c.category?.toLowerCase().includes("sedan"));
  }
  if (raw.includes("ertiga") || raw.includes("small-suv") || raw.includes("small suv") || raw.includes("6-seater") || raw.includes("6 seater")) {
    return configs.find((c) => c.id === "ffc-small-suv" || c.fleetId === "fv-ertiga" || c.vehicleSlug === "maruti-ertiga" || (c.category?.toLowerCase().includes("suv") && c.id?.includes("small")));
  }
  if (raw.includes("innova") || raw.includes("crysta") || raw.includes("big-suv") || raw.includes("big suv") || raw.includes("7-seater") || raw.includes("7 seater")) {
    return configs.find((c) => c.id === "ffc-big-suv" || c.fleetId === "fv-crysta" || c.vehicleSlug === "innova-crysta" || (c.category?.toLowerCase().includes("suv") && c.id?.includes("big")));
  }
  if (raw.includes("urbania") || raw.includes("14-seater") || raw.includes("10-seater")) {
    return configs.find((c) => c.id === "ffc-urbania" || c.fleetId === "fv-urbania" || c.vehicleSlug === "force-urbania");
  }
  if (raw.includes("tempo") || raw.includes("traveller") || raw.includes("12-seater") || raw.includes("17-seater") || raw.includes("tt")) {
    return configs.find((c) => c.id === "ffc-tempo" || c.fleetId === "fv-tempo12" || c.vehicleSlug === "tempo-traveller-12" || c.category?.toLowerCase().includes("tempo"));
  }
  if (raw.includes("bus") || raw.includes("coach") || raw.includes("27-seater") || raw.includes("35-seater") || raw.includes("45-seater") || raw.includes("50-seater")) {
    return configs.find((c) => c.id === "ffc-bus" || c.fleetId === "fv-bus27" || c.vehicleSlug === "mini-bus-27" || c.category?.toLowerCase().includes("bus"));
  }
  if (raw.includes("bmw") || raw.includes("mercedes") || raw.includes("audi") || raw.includes("premium") || raw.includes("vip")) {
    return configs.find((c) => c.id === "ffc-premium" || c.fleetId === "fv-premium" || c.vehicleSlug === "premium-bmw" || c.category?.toLowerCase().includes("premium"));
  }

  return undefined;
}
