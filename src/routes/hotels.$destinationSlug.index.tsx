import { createFileRoute, notFound } from "@tanstack/react-router";
import { HotelListingView } from "@/components/hotels/hotel-listing-view";
import {
  validateListingSearch,
  type ListingSearch,
} from "@/components/hotels/listing-search";
import { getVisibleHotelDestinations, getPublishedHotels } from "@/content/hotels";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Resolves a destination slug to the admin-managed city name. */
function resolveDestination(slug: string): string | null {
  const managed = getVisibleHotelDestinations().find(
    (d) => d.destinationSlug === slug || slugify(d.city) === slug,
  );
  if (managed) return managed.city;
  const city = getPublishedHotels().find((h) => slugify(h.city) === slug);
  return city?.city ?? null;
}

export const Route = createFileRoute("/hotels/$destinationSlug/")({
  validateSearch: (search: Record<string, unknown>): ListingSearch =>
    validateListingSearch(search),
  loader: ({ params }) => {
    const destination = resolveDestination(params.destinationSlug);
    if (!destination) throw notFound();
    return { destination };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Destination unavailable | South Zoom Tourism" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const city = loaderData.destination;
    const title = `Hotels in ${city} — Verified Stays & Live Availability | South Zoom Tourism`;
    const description = `Compare verified hotels, resorts and homestays in ${city} with live room availability, all-in nightly rates, guest ratings and free-cancellation options.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://southzoomtourism.com/hotels/${params.destinationSlug}`,
        },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl p-10 text-center" role="alert">
      <h1 className="text-xl font-semibold">We could not load these stays</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-xl font-semibold">Destination not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We do not have contracted stays for this destination yet.
      </p>
      <a href="/hotels" className="mt-4 inline-block text-primary underline">
        Back to hotels
      </a>
    </div>
  ),
  component: DestinationHotels,
});

function DestinationHotels() {
  const search = Route.useSearch();
  const { destinationSlug } = Route.useParams();
  const { destination } = Route.useLoaderData();

  return (
    <HotelListingView
      search={search}
      routeTo="/hotels/$destinationSlug"
      routeParams={{ destinationSlug }}
      lockedDestination={destination}
      title={`Hotels in ${destination}`}
      intro={`Every ${destination} property below is checked night by night against the room block we hold, so it only appears when your dates and occupancy can be confirmed.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Hotels", href: "/hotels" },
        { label: destination, href: `/hotels/${destinationSlug}` },
      ]}
    />
  );
}
