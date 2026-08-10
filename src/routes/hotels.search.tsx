import { createFileRoute } from "@tanstack/react-router";
import { HotelListingView } from "@/components/hotels/hotel-listing-view";
import {
  validateListingSearch,
  type ListingSearch,
} from "@/components/hotels/listing-search";

export const Route = createFileRoute("/hotels/search")({
  validateSearch: (search: Record<string, unknown>): ListingSearch =>
    validateListingSearch(search),
  head: () => ({
    meta: [
      { title: "Hotel Search Results — Compare Verified Stays | South Zoom Tourism" },
      {
        name: "description",
        content:
          "Search live room availability across South Zoom Tourism partner hotels, resorts, homestays and service apartments. Filter by locality, price, rating, meal plan and amenities.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Hotel Search Results | South Zoom Tourism" },
      {
        property: "og:description",
        content:
          "Live room availability, all-in nightly rates and detailed filters across verified South India stays.",
      },
    ],
    links: [{ rel: "canonical", href: "https://southzoomtourism.com/hotels/search" }],
  }),
  component: HotelSearchResults,
});

function HotelSearchResults() {
  const search = Route.useSearch();

  return (
    <HotelListingView
      search={search}
      routeTo="/hotels/search"
      title={
        search.destination ? `Stays in ${search.destination}` : "Hotel search results"
      }
      intro="Availability is checked night by night against the room block we hold at each property, so a stay only appears here when it can actually be confirmed for your dates."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Hotels", href: "/hotels" },
        { label: "Search results", href: "/hotels/search" },
      ]}
    />
  );
}
