import { useMemo, useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SlidersHorizontal, Calculator, Car, Sparkles, Settings } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { AutoFareCalculatorModal } from "@/components/fleet/auto-fare-calculator-modal";
import { AdminFleetManagementDialog } from "@/components/admin/fleet-management-dialog";
import { AdminFleetFareManagementDialog } from "@/components/admin/fleet-fare-management";
import {
  FleetFilters,
  defaultFleetFilters,
  type FleetFilterState,
} from "@/components/fleet/fleet-filters";
import { ActiveFilterChips, type Chip } from "@/components/fleet/active-filter-chips";
import {
  fleetBannerBlock,
  fleetIntroBlock,
  fleetPriceBounds,
  getPublishedVehicles,
  getFleetVehicles,
  getVehicleCategoryLabel,
  setDynamicFleetVehicles,
  mapDbFleetToRecord,
  sortOptions,
  tripTypeOptions,
  type SortValue,
} from "@/content/fleet";
import { company } from "@/content/site";
import { getLatestTravelSearch, saveLatestTravelSearch } from "@/lib/search-storage";
import supabase from "@/lib/supabase";

type FleetSearch = {
  categories?: string;
  ac?: string;
  seats?: number;
  luggage?: number;
  trip?: string;
  maxPrice?: number;
  available?: string;
  sort?: string;
  pickupCity?: string;
  dropCity?: string;
  pickupDate?: string;
  pickupTime?: string;
  passengers?: string;
  vehicleType?: string;
  pickup?: string;
  destination?: string;
};

export const Route = createFileRoute("/fleet/")({
  validateSearch: (search: Record<string, unknown>): FleetSearch => ({
    categories: typeof search.categories === "string" ? search.categories : undefined,
    ac: typeof search.ac === "string" ? search.ac : undefined,
    seats: Number(search.seats) > 0 ? Number(search.seats) : undefined,
    luggage: Number(search.luggage) > 0 ? Number(search.luggage) : undefined,
    trip: typeof search.trip === "string" ? search.trip : undefined,
    maxPrice: Number(search.maxPrice) > 0 ? Number(search.maxPrice) : undefined,
    available: search.available === "1" ? "1" : undefined,
    sort: typeof search.sort === "string" ? search.sort : undefined,
    pickupCity: typeof search.pickupCity === "string" ? search.pickupCity : undefined,
    dropCity: typeof search.dropCity === "string" ? search.dropCity : undefined,
    pickupDate: typeof search.pickupDate === "string" ? search.pickupDate : undefined,
    pickupTime: typeof search.pickupTime === "string" ? search.pickupTime : undefined,
    passengers: typeof search.passengers === "string" ? search.passengers : undefined,
    vehicleType: typeof search.vehicleType === "string" ? search.vehicleType : undefined,
    pickup: typeof search.pickup === "string" ? search.pickup : undefined,
    destination: typeof search.destination === "string" ? search.destination : undefined,
  }),
  component: FleetPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The fleet didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">No vehicles found</h1>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Fleet & Vehicle Booking — South Zoom Tourism" },
      {
        name: "description",
        content:
          "Compare hatchbacks, sedans, SUVs, tempo travellers, mini buses and coaches with seats, luggage, AC and per-km rates. Book verified drivers across South India.",
      },
      { property: "og:title", content: "Fleet & Vehicle Booking — South Zoom Tourism" },
      {
        property: "og:description",
        content:
          "Compare hatchbacks, sedans, SUVs, tempo travellers and buses with published per-kilometre rates and verified drivers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/fleet" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/fleet" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "South Zoom Tourism fleet",
          itemListElement: getPublishedVehicles().map((vehicle, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: vehicle.name,
          })),
        }),
      },
    ],
  }),
});

function FleetPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/fleet/" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [fleetAdminOpen, setFleetAdminOpen] = useState(false);
  const [fleetFareAdminOpen, setFleetFareAdminOpen] = useState(false);
  const [fleetDataVersion, setFleetDataVersion] = useState(0);

  // Re-calculate price bounds reactively from current fleet data
  const fleetPriceBoundsLive = useMemo(() => {
    const prices = getFleetVehicles().map((v) => v.pricePerKm);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [fleetDataVersion]);

  // Re-render when fleet data changes in localStorage (admin edits)
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('fleets').select('*').order('display_order');
        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDbFleetToRecord);
          setDynamicFleetVehicles(mapped);
          setFleetDataVersion((v) => v + 1);
        }
      } catch (err) {
        console.error('Error fetching fleet from Supabase:', err);
      }
    })();

    const handleUpdate = () => setFleetDataVersion((v) => v + 1);
    window.addEventListener("fleetDataUpdated", handleUpdate);
    window.addEventListener("fleetFareSettingsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("fleetDataUpdated", handleUpdate);
      window.removeEventListener("fleetFareSettingsUpdated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (search.pickupCity || search.dropCity || search.pickup || search.destination || search.vehicleType) {
      saveLatestTravelSearch({
        pickupCity: search.pickupCity || search.pickup,
        dropCity: search.dropCity || search.destination,
        pickupDate: search.pickupDate,
        pickupTime: search.pickupTime,
        tripType: search.trip,
        passengers: search.passengers,
        vehicleType: search.vehicleType,
      });
    }
  }, [search]);

  const filters: FleetFilterState = {
    categories: search.categories ? search.categories.split(",").filter(Boolean) : [],
    ac: search.ac ?? "all",
    seats: search.seats ?? 0,
    luggage: search.luggage ?? 0,
    trip: search.trip ?? "all",
    maxPrice: search.maxPrice ?? fleetPriceBoundsLive.max,
    availableOnly: search.available === "1",
  };
  const sort = (search.sort ?? "recommended") as SortValue;

  const apply = (next: Partial<FleetFilterState>) => {
    const merged = { ...filters, ...next };
    navigate({
      search: {
        categories: merged.categories.length ? merged.categories.join(",") : undefined,
        ac: merged.ac !== "all" ? merged.ac : undefined,
        seats: merged.seats > 0 ? merged.seats : undefined,
        luggage: merged.luggage > 0 ? merged.luggage : undefined,
        trip: merged.trip !== "all" ? merged.trip : undefined,
        maxPrice: merged.maxPrice < fleetPriceBounds.max ? merged.maxPrice : undefined,
        available: merged.availableOnly ? "1" : undefined,
        sort: sort !== "recommended" ? sort : undefined,
      },
      replace: true,
    });
  };

  const clearAll = () => navigate({ search: {}, replace: true });

  const setSort = (value: string) =>
    navigate({
      search: (prev: FleetSearch): FleetSearch => ({
        ...prev,
        sort: value !== "recommended" ? value : undefined,
      }),
      replace: true,
    });

  const vehicles = useMemo(() => {
    const list = getPublishedVehicles().filter((vehicle) => {
      if (filters.categories.length && !filters.categories.includes(vehicle.categorySlug)) return false;
      if (filters.ac === "ac" && !vehicle.ac) return false;
      if (filters.ac === "non-ac" && vehicle.ac) return false;
      if (vehicle.seats < filters.seats) return false;
      if (vehicle.luggage < filters.luggage) return false;
      if (filters.trip !== "all" && !vehicle.tripTypes.includes(filters.trip as never)) return false;
      if (vehicle.pricePerKm > filters.maxPrice) return false;
      if (filters.availableOnly && !vehicle.available) return false;
      if (!vehicle.available && !vehicle.allowEnquiryWhenUnavailable) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.pricePerKm - b.pricePerKm);
      case "capacity":
        return [...list].sort((a, b) => b.seats - a.seats);
      case "popularity":
        return [...list].sort((a, b) => b.popular - a.popular);
      default:
        return [...list].sort(
          (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order,
        );
    }
  }, [filters, sort, fleetDataVersion]);

  const chips: Chip[] = [
    ...filters.categories.map((slug) => ({
      id: `cat-${slug}`,
      label: getVehicleCategoryLabel(slug),
      onRemove: () => apply({ categories: filters.categories.filter((c) => c !== slug) }),
    })),
    ...(filters.ac !== "all"
      ? [{ id: "ac", label: filters.ac === "ac" ? "AC" : "Non-AC", onRemove: () => apply({ ac: "all" }) }]
      : []),
    ...(filters.seats > 0
      ? [{ id: "seats", label: `${filters.seats}+ passengers`, onRemove: () => apply({ seats: 0 }) }]
      : []),
    ...(filters.luggage > 0
      ? [{ id: "luggage", label: `${filters.luggage}+ bags`, onRemove: () => apply({ luggage: 0 }) }]
      : []),
    ...(filters.trip !== "all"
      ? [
          {
            id: "trip",
            label: tripTypeOptions.find((t) => t.value === filters.trip)?.label ?? filters.trip,
            onRemove: () => apply({ trip: "all" }),
          },
        ]
      : []),
    ...(filters.maxPrice < fleetPriceBounds.max
      ? [
          {
            id: "price",
            label: `Up to ₹${filters.maxPrice}/km`,
            onRemove: () => apply({ maxPrice: fleetPriceBounds.max }),
          },
        ]
      : []),
    ...(filters.availableOnly
      ? [{ id: "available", label: "Available now", onRemove: () => apply({ availableOnly: false }) }]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        {fleetBannerBlock.visible ? (
          <PageBanner
            title={fleetBannerBlock.title}
            subtitle={fleetBannerBlock.subtitle}
            image={fleetBannerBlock.image}
            imageAlt={fleetBannerBlock.imageAlt}
            breadcrumbs={fleetBannerBlock.breadcrumbs}
          />
        ) : null}

        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
            {fleetIntroBlock.visible ? (
              <section aria-labelledby="fleet-intro-heading" className="max-w-2xl">
                <h2 id="fleet-intro-heading" className="text-xl font-bold sm:text-2xl text-foreground">
                  {fleetIntroBlock.heading}
                </h2>
                <p className="mt-2 text-pretty text-sm text-muted-foreground">
                  {fleetIntroBlock.body}
                </p>
              </section>
            ) : null}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-base font-bold">Filters</h2>
                <FleetFilters value={filters} onChange={apply} onClear={clearAll} />
              </div>
            </aside>

            <section aria-label="Vehicle results" className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground" role="status">
                  {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"}
                </p>
                <div className="flex items-center gap-2">
                  <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                        Filters{chips.length ? ` (${chips.length})` : ""}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="p-4">
                        <FleetFilters value={filters} onChange={apply} onClear={clearAll} />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <label htmlFor="fleet-sort" className="sr-only">
                    Sort vehicles
                  </label>
                  <select
                    id="fleet-sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {chips.length > 0 ? (
                <div className="mt-4">
                  <ActiveFilterChips chips={chips} onClearAll={clearAll} />
                </div>
              ) : null}

              {vehicles.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
                  <h3 className="text-base font-bold">No vehicles match these filters</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Try clearing a filter or two. If you need something specific, our team can arrange
                    it — call {company.phone} and we'll find the right vehicle.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Button type="button" onClick={clearAll}>
                      Clear all filters
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/contact-us">Contact support</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                  {vehicles.map((vehicle, index) => (
                    <li key={vehicle.id}>
                      <VehicleCard vehicle={vehicle} priority={index < 3} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Auto Fare Calculator Modal */}
      <AutoFareCalculatorModal
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
      />

      {/* Admin Fleet Management Dialog */}
      <AdminFleetManagementDialog
        open={fleetAdminOpen}
        onOpenChange={setFleetAdminOpen}
      />

      {/* Admin Fleet Fare Management Dialog */}
      <AdminFleetFareManagementDialog
        open={fleetFareAdminOpen}
        onOpenChange={setFleetFareAdminOpen}
      />

      <Footer />
    </div>
  );
}
