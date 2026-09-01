import { useMemo, useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SlidersHorizontal, MapPinOff } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { KarnatakaSlider } from "@/components/home/karnataka-slider";
import { PageBanner } from "@/components/common/page-banner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DestinationCard } from "@/components/destinations/destination-card";
import {
  DestinationFilters,
  popularityOptions,
} from "@/components/destinations/destination-filters";
import { CustomTripCta } from "@/components/destinations/custom-trip-cta";
import { ActiveFilterChips, type Chip } from "@/components/fleet/active-filter-chips";
import {
  destinationSortOptions,
  destinationsBannerBlock,
  destinationsIntroBlock,
  destinationsPerPage,
  filterDestinations,
  getPublishedDestinations,
  getTripTypeLabel,
  setDynamicDestinations,
  mapDbDestinationToRecord,
  type DestinationFilterState,
  type DestinationSortValue,
} from "@/content/destinations";
import supabase from "@/lib/supabase";

type DestinationSearch = {
  q?: string;
  state?: string;
  tripType?: string;
  popularity?: string;
  sort?: string;
  show?: number;
};

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const num = (v: unknown) => (Number(v) > 0 ? Number(v) : undefined);

export const Route = createFileRoute("/destinations/")({
  validateSearch: (search: Record<string, unknown>): DestinationSearch => ({
    q: str(search.q),
    state: str(search.state),
    tripType: str(search.tripType),
    popularity: str(search.popularity),
    sort: str(search.sort),
    show: num(search.show),
  }),
  component: DestinationsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The destinations didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">No destinations found</h1>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Destinations in South India — South Zoom Tourism" },
      {
        name: "description",
        content:
          "Explore Bengaluru, Mysuru, Coorg, Ooty, Munnar, Wayanad, Goa, Tirupati, Hampi, Gokarna and more — each with packages, partner hotels and recommended vehicles.",
      },
      { property: "og:title", content: "Destinations in South India — South Zoom Tourism" },
      {
        property: "og:description",
        content:
          "Filter South India destinations by state, trip type and popularity, then jump straight to packages, stays and transport for that place.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/destinations" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/destinations" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "South Zoom Tourism destinations",
          itemListElement: getPublishedDestinations().map((d, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: d.name,
            item: `/destinations/${d.slug}`,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: "Destinations", item: "/destinations" },
          ],
        }),
      },
    ],
  }),
});

import { DestinationSelector } from "@/components/destinations/destination-selector";

function DestinationsPage() {
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('destinations').select('*').order('name');
        if (!error && data && data.length > 0) {
          const mapped = (data as any[]).map(mapDbDestinationToRecord);
          setDynamicDestinations(mapped);
          setDataLoaded(true);
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
      }
    })();
  }, []);

  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/destinations/" });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters: DestinationFilterState = {
    query: search.q ?? "",
    state: search.state ?? "all",
    tripType: search.tripType ?? "all",
    popularity: search.popularity ?? "all",
  };
  const sort = (search.sort ?? "recommended") as DestinationSortValue;
  const shown = search.show ?? destinationsPerPage;

  const apply = (next: Partial<DestinationFilterState>) => {
    const merged = { ...filters, ...next };
    navigate({
      search: {
        q: merged.query.trim() || undefined,
        state: merged.state !== "all" ? merged.state : undefined,
        tripType: merged.tripType !== "all" ? merged.tripType : undefined,
        popularity: merged.popularity !== "all" ? merged.popularity : undefined,
        sort: sort !== "recommended" ? sort : undefined,
      },
      replace: true,
    });
  };

  const clearAll = () => navigate({ search: {}, replace: true });

  const setSort = (value: string) =>
    navigate({
      search: (prev: DestinationSearch): DestinationSearch => ({
        ...prev,
        sort: value !== "recommended" ? value : undefined,
        show: undefined,
      }),
      replace: true,
    });

  const results = useMemo(() => filterDestinations(filters, sort), [filters, sort]);
  const visible = results.slice(0, shown);

  const chips: Chip[] = [
    ...(filters.query
      ? [{ id: "q", label: `"${filters.query}"`, onRemove: () => apply({ query: "" }) }]
      : []),
    ...(filters.state !== "all"
      ? [{ id: "state", label: filters.state, onRemove: () => apply({ state: "all" }) }]
      : []),
    ...(filters.tripType !== "all"
      ? [
          {
            id: "tripType",
            label: getTripTypeLabel(filters.tripType),
            onRemove: () => apply({ tripType: "all" }),
          },
        ]
      : []),
    ...(filters.popularity !== "all"
      ? [
          {
            id: "popularity",
            label:
              popularityOptions.find((o) => o.value === filters.popularity)?.label ??
              filters.popularity,
            onRemove: () => apply({ popularity: "all" }),
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <DestinationSelector />
      <main className="flex-1">
        {destinationsBannerBlock.visible ? (
          <PageBanner
            title={destinationsBannerBlock.title}
            subtitle={destinationsBannerBlock.subtitle}
            image={destinationsBannerBlock.image}
            imageAlt={destinationsBannerBlock.imageAlt}
            breadcrumbs={destinationsBannerBlock.breadcrumbs}
          />
        ) : null}

        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          {destinationsIntroBlock.visible ? (
            <section aria-labelledby="destinations-intro-heading" className="max-w-3xl">
              <h2 id="destinations-intro-heading" className="text-xl font-bold sm:text-2xl">
                {destinationsIntroBlock.heading}
              </h2>
              <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
                {destinationsIntroBlock.body}
              </p>
            </section>
          ) : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-base font-bold">Find a destination</h2>
                <DestinationFilters
                  value={filters}
                  onChange={apply}
                  onClear={clearAll}
                  idPrefix="dest-desktop"
                />
              </div>
            </aside>

            <section aria-label="Destination results" className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground" role="status">
                  {results.length} destination{results.length === 1 ? "" : "s"}
                </p>
                <div className="flex items-center gap-2">
                  <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Find a destination</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">
                        <DestinationFilters
                          value={filters}
                          onChange={apply}
                          onClear={clearAll}
                          idPrefix="dest-mobile"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <label htmlFor="destination-sort" className="sr-only">
                    Sort destinations
                  </label>
                  <select
                    id="destination-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {destinationSortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {chips.length ? (
                <div className="mt-4">
                  <ActiveFilterChips chips={chips} onClearAll={clearAll} />
                </div>
              ) : null}

              {visible.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
                  <MapPinOff
                    className="mx-auto h-8 w-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-base font-bold">No destinations match those filters</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try a different state or trip type, or tell us where you want to go and we will
                    build the trip.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Button type="button" variant="outline" onClick={clearAll}>
                      Clear filters
                    </Button>
                    <Button asChild>
                      <Link to="/contact-us">Plan a custom trip</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((destination, index) => (
                      <li key={destination.id} className="min-w-0">
                        <DestinationCard destination={destination} priority={index < 3} />
                      </li>
                    ))}
                  </ul>

                  {results.length > visible.length ? (
                    <div className="mt-8 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          navigate({
                            search: (prev: DestinationSearch): DestinationSearch => ({
                              ...prev,
                              show: (prev.show ?? destinationsPerPage) + destinationsPerPage,
                            }),
                            replace: true,
                          })
                        }
                      >
                        Load more destinations
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>

          <CustomTripCta />
        </div>

        <KarnatakaSlider />
      </main>
      <Footer />
    </div>
  );
}
