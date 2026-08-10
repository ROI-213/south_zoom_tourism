import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs, type Crumb } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLink } from "@/components/common/app-link";
import { SearchSummaryBar } from "@/components/hotels/search-summary-bar";
import { ListingFilters } from "@/components/hotels/listing-filters";
import { HotelResultCard } from "@/components/hotels/hotel-result-card";
import {
  applyListingFilters,
  buildListingResults,
  getLocalityFacets,
  getPriceBounds,
  listingPageBlock,
  listingSortOptions,
  sortListingResults,
  type ListingFilterState,
  type ListingStay,
} from "@/content/hotel-listing";
import { company, telLink, waLink } from "@/content/site";
import {
  countActiveFilters,
  joinList,
  resolveFilters,
  resolveSort,
  resolveStay,
  type ListingSearch,
} from "@/components/hotels/listing-search";

type Props = {
  search: ListingSearch;
  /** Route to write URL updates back to. */
  routeTo: "/hotels/search" | "/hotels/$destinationSlug";
  routeParams?: Record<string, string>;
  title: string;
  intro?: string;
  breadcrumbs: Crumb[];
  lockedDestination?: string;
};

export function HotelListingView({
  search,
  routeTo,
  routeParams,
  title,
  intro,
  breadcrumbs,
  lockedDestination,
}: Props) {
  const navigate = useNavigate();
  const stay = useMemo(
    () => resolveStay(search, lockedDestination),
    [search, lockedDestination],
  );
  const filters = useMemo(() => resolveFilters(search), [search]);
  const sort = resolveSort(search.sort);
  const page = Math.max(1, search.page ?? 1);

  const candidates = useMemo(() => buildListingResults(stay), [stay]);
  const filtered = useMemo(() => applyListingFilters(candidates, filters), [candidates, filters]);
  const sorted = useMemo(() => sortListingResults(filtered, sort), [filtered, sort]);
  const localities = useMemo(
    () => getLocalityFacets(candidates.map((c) => c.hotel)),
    [candidates],
  );
  const priceBounds = useMemo(() => getPriceBounds(candidates), [candidates]);

  const perPage = listingPageBlock.perPage;
  const visible = sorted.slice(0, page * perPage);
  const hasMore = sorted.length > visible.length;
  const activeCount = countActiveFilters(filters);

  const push = useCallback(
    (patch: Partial<ListingSearch>) => {
      void navigate({
        to: routeTo,
        params: routeParams as never,
        search: (prev: ListingSearch) => ({ ...prev, page: undefined, ...patch }),
        replace: true,
      });
    },
    [navigate, routeTo, routeParams],
  );

  const onStayApply = (next: ListingStay) =>
    push({
      destination: lockedDestination ? undefined : next.destination || undefined,
      checkIn: next.checkIn,
      checkOut: next.checkOut,
      rooms: next.rooms,
      adults: next.adults,
      children: next.children,
      roomType: next.roomType === "any" ? undefined : next.roomType,
    });

  const onFilterChange = (patch: Partial<ListingFilterState>) => {
    const next = { ...filters, ...patch };
    push({
      localities: joinList(next.localities),
      categories: joinList(next.categories),
      minPrice: next.minPrice ?? undefined,
      maxPrice: next.maxPrice ?? undefined,
      stars: joinList(next.starRatings.map(String)),
      guestRating: next.minGuestRating ?? undefined,
      roomTypes: joinList(next.roomTypes),
      meals: joinList(next.mealPlans),
      amenities: joinList(next.amenities),
      freeCancellation: next.freeCancellation || undefined,
      payAtHotel: next.payAtHotel || undefined,
      instantConfirmation: next.instantConfirmation || undefined,
      minRooms: next.minRoomsAvailable ?? undefined,
      maxDistance: next.maxDistanceKm ?? undefined,
    });
  };

  const onReset = () =>
    push({
      localities: undefined,
      categories: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      stars: undefined,
      guestRating: undefined,
      roomTypes: undefined,
      meals: undefined,
      amenities: undefined,
      freeCancellation: undefined,
      payAtHotel: undefined,
      instantConfirmation: undefined,
      minRooms: undefined,
      maxDistance: undefined,
      hotelName: undefined,
    });

  const filterPanel = (idPrefix: string) => (
    <ListingFilters
      filters={filters}
      localities={localities}
      priceBounds={priceBounds}
      onChange={onFilterChange}
      onReset={onReset}
      idPrefix={idPrefix}
    />
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          <header className="mt-4 space-y-2">
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            {intro ? <p className="max-w-2xl text-sm text-muted-foreground">{intro}</p> : null}
          </header>

          <div className="mt-5">
            <SearchSummaryBar
              stay={stay}
              nights={candidates[0]?.nights ?? 0}
              resultCount={sorted.length}
              destinationLocked={Boolean(lockedDestination)}
              onApply={onStayApply}
            />
          </div>

          {search.hotelName ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">Hotel: {search.hotelName}</Badge>
              <Button variant="ghost" size="sm" onClick={() => push({ hotelName: undefined })}>
                Clear
              </Button>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border bg-card p-4">
                {filterPanel("desktop")}
              </div>
            </aside>

            <section aria-label={listingPageBlock.heading} className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="mr-1 h-4 w-4" aria-hidden="true" />
                        Filters{activeCount ? ` (${activeCount})` : ""}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filter stays</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">{filterPanel("mobile")}</div>
                    </SheetContent>
                  </Sheet>
                  <p className="text-sm text-muted-foreground">
                    Showing {visible.length} of {sorted.length}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="listing-sort" className="text-sm text-muted-foreground">
                    Sort
                  </label>
                  <Select value={sort} onValueChange={(v) => push({ sort: v })}>
                    <SelectTrigger id="listing-sort" className="w-[190px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {listingSortOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {sorted.length === 0 ? (
                <div
                  className="mt-6 rounded-xl border border-dashed p-8 text-center"
                  data-testid="listing-empty"
                >
                  <h2 className="text-lg font-semibold">No stays available for this search</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    No room inventory matches these dates, occupancy and filters. Try clearing a
                    few filters, shifting your dates, or talk to our stay desk — we hold unlisted
                    blocks at partner properties.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button variant="outline" onClick={onReset}>
                      Clear filters
                    </Button>
                    <Button asChild>
                      <AppLink
                        href={waLink(
                          `Need help finding a stay in ${stay.destination || "South India"}`,
                        )}
                      >
                        Chat with stay desk
                      </AppLink>
                    </Button>
                    <Button asChild variant="ghost">
                      <AppLink href={telLink()}>Call {company.phone}</AppLink>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <ul className="mt-5 space-y-4">
                    {visible.map((result, i) => (
                      <li key={result.hotel.id}>
                        <HotelResultCard result={result} stay={stay} eager={i < 2} />
                      </li>
                    ))}
                  </ul>
                  {hasMore ? (
                    <div className="mt-6 flex justify-center">
                      <Button variant="outline" onClick={() => push({ page: page + 1 })}>
                        Show more stays
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
