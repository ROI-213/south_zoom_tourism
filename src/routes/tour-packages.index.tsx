import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PackageCard } from "@/components/packages/package-card";
import {
  PackageFilters,
  durationOptions,
  type PackageFilterState,
} from "@/components/packages/package-filters";
import { PackageEnquiryDialog } from "@/components/packages/package-enquiry-dialog";
import { ActiveFilterChips, type Chip } from "@/components/fleet/active-filter-chips";
import {
  getPackageCategoryLabel,
  getPublishedPackages,
  isPackageAvailableOn,
  packageBudgetBounds,
  packageCategories,
  packageSortOptions,
  packagesBannerBlock,
  packagesIntroBlock,
  packagesPerPage,
  type PackageSortValue,
  type TourPackageRecord,
} from "@/content/tour-packages";
import { company } from "@/content/site";

type PackageSearch = {
  categories?: string;
  state?: string;
  destination?: string;
  city?: string;
  duration?: string;
  date?: string;
  maxBudget?: number;
  travellers?: number;
  hotel?: string;
  vehicle?: string;
  sort?: string;
  show?: number;
};

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const num = (v: unknown) => (Number(v) > 0 ? Number(v) : undefined);

export const Route = createFileRoute("/tour-packages/")({
  validateSearch: (search: Record<string, unknown>): PackageSearch => ({
    categories: str(search.categories),
    state: str(search.state),
    destination: str(search.destination),
    city: str(search.city),
    duration: str(search.duration),
    date: str(search.date),
    maxBudget: num(search.maxBudget),
    travellers: num(search.travellers),
    hotel: str(search.hotel),
    vehicle: str(search.vehicle),
    sort: str(search.sort),
    show: num(search.show),
  }),
  component: TourPackagesPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The packages didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">No packages found</h1>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Tour Packages in South India — South Zoom Tourism" },
      {
        name: "description",
        content:
          "Browse family, honeymoon, pilgrimage, group and weekend tour packages across Tamil Nadu, Kerala, Karnataka, Andhra Pradesh and Goa with stays and transfers included.",
      },
      { property: "og:title", content: "Tour Packages in South India — South Zoom Tourism" },
      {
        property: "og:description",
        content:
          "Filter by state, destination, duration, budget and hotel category. Every package lists its starting city, vehicle and inclusions.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/tour-packages" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/tour-packages" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "South Zoom Tourism tour packages",
          itemListElement: getPublishedPackages().map((pkg, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: pkg.title,
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
            { "@type": "ListItem", position: 2, name: "Tour Packages", item: "/tour-packages" },
          ],
        }),
      },
    ],
  }),
});

function matchesDuration(pkg: TourPackageRecord, duration: string) {
  if (duration === "1-2") return pkg.days <= 2;
  if (duration === "3-4") return pkg.days >= 3 && pkg.days <= 4;
  if (duration === "5+") return pkg.days >= 5;
  return true;
}

function TourPackagesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/tour-packages/" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enquiry, setEnquiry] = useState<{ open: boolean; slug: string }>({
    open: false,
    slug: "",
  });

  const filters: PackageFilterState = {
    categories: search.categories ? search.categories.split(",").filter(Boolean) : [],
    state: search.state ?? "all",
    destination: search.destination ?? "all",
    startingCity: search.city ?? "all",
    duration: search.duration ?? "all",
    travelDate: search.date ?? "",
    maxBudget: search.maxBudget ?? packageBudgetBounds.max,
    travellers: search.travellers ?? 0,
    hotelCategory: search.hotel ?? "all",
    vehicleCategory: search.vehicle ?? "all",
  };
  const sort = (search.sort ?? "recommended") as PackageSortValue;
  const shown = search.show ?? packagesPerPage;

  const apply = (next: Partial<PackageFilterState>) => {
    const merged = { ...filters, ...next };
    navigate({
      search: {
        categories: merged.categories.length ? merged.categories.join(",") : undefined,
        state: merged.state !== "all" ? merged.state : undefined,
        destination: merged.destination !== "all" ? merged.destination : undefined,
        city: merged.startingCity !== "all" ? merged.startingCity : undefined,
        duration: merged.duration !== "all" ? merged.duration : undefined,
        date: merged.travelDate || undefined,
        maxBudget:
          merged.maxBudget < packageBudgetBounds.max ? merged.maxBudget : undefined,
        travellers: merged.travellers > 0 ? merged.travellers : undefined,
        hotel: merged.hotelCategory !== "all" ? merged.hotelCategory : undefined,
        vehicle: merged.vehicleCategory !== "all" ? merged.vehicleCategory : undefined,
        sort: sort !== "recommended" ? sort : undefined,
      },
      replace: true,
    });
  };

  const clearAll = () => navigate({ search: {}, replace: true });

  const setSort = (value: string) =>
    navigate({
      search: (prev: PackageSearch): PackageSearch => ({
        ...prev,
        sort: value !== "recommended" ? value : undefined,
        show: undefined,
      }),
      replace: true,
    });

  const toggleCategoryChip = (slug: string) =>
    apply({
      categories: filters.categories.includes(slug)
        ? filters.categories.filter((c) => c !== slug)
        : [...filters.categories, slug],
    });

  const packages = useMemo(() => {
    const list = getPublishedPackages().filter((pkg) => {
      if (
        filters.categories.length &&
        !filters.categories.some((slug) => pkg.categorySlugs.includes(slug))
      )
        return false;
      if (filters.state !== "all" && pkg.state !== filters.state) return false;
      if (filters.destination !== "all" && pkg.destination !== filters.destination) return false;
      if (filters.startingCity !== "all" && pkg.startingCity !== filters.startingCity) return false;
      if (!matchesDuration(pkg, filters.duration)) return false;
      if (filters.travelDate && !isPackageAvailableOn(pkg, filters.travelDate)) return false;
      if (pkg.showPrice && pkg.price > filters.maxBudget) return false;
      if (filters.travellers > 0 && pkg.maxTravellers < filters.travellers) return false;
      if (filters.hotelCategory !== "all" && pkg.hotelCategory !== filters.hotelCategory)
        return false;
      if (filters.vehicleCategory !== "all" && pkg.vehicleCategory !== filters.vehicleCategory)
        return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "duration-asc":
        return [...list].sort((a, b) => a.days - b.days);
      case "duration-desc":
        return [...list].sort((a, b) => b.days - a.days);
      default:
        return [...list].sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            Number(b.bestSeller) - Number(a.bestSeller) ||
            a.order - b.order,
        );
    }
  }, [filters, sort]);

  const visible = packages.slice(0, shown);

  const chips: Chip[] = [
    ...filters.categories.map((slug) => ({
      id: `cat-${slug}`,
      label: getPackageCategoryLabel(slug),
      onRemove: () => apply({ categories: filters.categories.filter((c) => c !== slug) }),
    })),
    ...(filters.state !== "all"
      ? [{ id: "state", label: filters.state, onRemove: () => apply({ state: "all" }) }]
      : []),
    ...(filters.destination !== "all"
      ? [
          {
            id: "destination",
            label: filters.destination,
            onRemove: () => apply({ destination: "all" }),
          },
        ]
      : []),
    ...(filters.startingCity !== "all"
      ? [
          {
            id: "city",
            label: `From ${filters.startingCity}`,
            onRemove: () => apply({ startingCity: "all" }),
          },
        ]
      : []),
    ...(filters.duration !== "all"
      ? [
          {
            id: "duration",
            label:
              durationOptions.find((d) => d.value === filters.duration)?.label ?? filters.duration,
            onRemove: () => apply({ duration: "all" }),
          },
        ]
      : []),
    ...(filters.travelDate
      ? [
          {
            id: "date",
            label: `Travelling ${filters.travelDate}`,
            onRemove: () => apply({ travelDate: "" }),
          },
        ]
      : []),
    ...(filters.maxBudget < packageBudgetBounds.max
      ? [
          {
            id: "budget",
            label: `Up to ₹${filters.maxBudget.toLocaleString("en-IN")}`,
            onRemove: () => apply({ maxBudget: packageBudgetBounds.max }),
          },
        ]
      : []),
    ...(filters.travellers > 0
      ? [
          {
            id: "travellers",
            label: `${filters.travellers}+ travellers`,
            onRemove: () => apply({ travellers: 0 }),
          },
        ]
      : []),
    ...(filters.hotelCategory !== "all"
      ? [
          {
            id: "hotel",
            label: `${filters.hotelCategory} hotels`,
            onRemove: () => apply({ hotelCategory: "all" }),
          },
        ]
      : []),
    ...(filters.vehicleCategory !== "all"
      ? [
          {
            id: "vehicle",
            label: filters.vehicleCategory,
            onRemove: () => apply({ vehicleCategory: "all" }),
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        {packagesBannerBlock.visible ? (
          <PageBanner
            title={packagesBannerBlock.title}
            subtitle={packagesBannerBlock.subtitle}
            image={packagesBannerBlock.image}
            imageAlt={packagesBannerBlock.imageAlt}
            breadcrumbs={packagesBannerBlock.breadcrumbs}
          />
        ) : null}

        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          {packagesIntroBlock.visible ? (
            <section aria-labelledby="packages-intro-heading" className="max-w-3xl">
              <h2 id="packages-intro-heading" className="text-xl font-bold sm:text-2xl">
                {packagesIntroBlock.heading}
              </h2>
              <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
                {packagesIntroBlock.body}
              </p>
            </section>
          ) : null}

          <nav aria-label="Package categories" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {packageCategories
                .filter((c) => c.visible)
                .sort((a, b) => a.order - b.order)
                .map((category) => {
                  const active = filters.categories.includes(category.slug);
                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleCategoryChip(category.slug)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {category.label}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-base font-bold">Filters</h2>
                <PackageFilters value={filters} onChange={apply} onClear={clearAll} />
              </div>
            </aside>

            <section aria-label="Package results" className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground" role="status">
                  {packages.length} package{packages.length === 1 ? "" : "s"}
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
                        <PackageFilters
                          idPrefix="mpf"
                          value={filters}
                          onChange={apply}
                          onClear={clearAll}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <label htmlFor="packages-sort" className="sr-only">
                    Sort packages
                  </label>
                  <select
                    id="packages-sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {packageSortOptions.map((option) => (
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

              {packages.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
                  <h3 className="text-base font-bold">No packages match these filters</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Try clearing a filter or two. We also build itineraries from scratch — call{" "}
                    {company.phone} and we'll plan around your dates.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Button type="button" onClick={clearAll}>
                      Clear all filters
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() =>
                        setEnquiry({ open: true, slug: "customised-south-india-tour" })
                      }
                    >
                      Plan a custom package
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((pkg, index) => (
                      <li key={pkg.id}>
                        <PackageCard
                          pkg={pkg}
                          priority={index < 3}
                          onEnquire={(selected) =>
                            setEnquiry({ open: true, slug: selected.slug })
                          }
                        />
                      </li>
                    ))}
                  </ul>

                  {visible.length < packages.length ? (
                    <div className="mt-8 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          navigate({
                            search: (prev: PackageSearch): PackageSearch => ({
                              ...prev,
                              show: shown + packagesPerPage,
                            }),
                            replace: true,
                          })
                        }
                      >
                        Load more packages ({packages.length - visible.length} left)
                      </Button>
                    </div>
                  ) : null}
                </>
              )}

              <section
                aria-labelledby="custom-package-cta"
                className="mt-12 rounded-xl border border-border bg-secondary/40 p-6 text-center sm:p-8"
              >
                <h2 id="custom-package-cta" className="text-lg font-bold sm:text-xl">
                  Nothing fits your dates?
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  Tell us the destinations, hotel category and group size — we'll build a
                  customised itinerary and quote it the same day.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setEnquiry({ open: true, slug: "customised-south-india-tour" })}
                  >
                    Plan a customised package
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/contact-us">Contact our travel desk</Link>
                  </Button>
                </div>
              </section>
            </section>
          </div>
        </div>
      </main>
      <Footer />

      <PackageEnquiryDialog
        open={enquiry.open}
        onOpenChange={(open) => setEnquiry((prev) => ({ ...prev, open }))}
        packageSlug={enquiry.slug}
        travelDate={filters.travelDate}
        travellers={filters.travellers || undefined}
      />
    </div>
  );
}
