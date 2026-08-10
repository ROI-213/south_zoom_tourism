import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Button } from "@/components/ui/button";
import { PackageDetailView } from "@/components/packages/package-detail-view";
import {
  getPackageDetail,
  getRelatedPackages,
  type PackageDetail,
} from "@/content/package-details";
import {
  formatPackagePrice,
  getPublishedPackages,
  type TourPackageRecord,
} from "@/content/tour-packages";

function findPackage(slug: string) {
  return getPublishedPackages().find((p) => p.slug === slug);
}


export const Route = createFileRoute("/tour-packages/$slug")({
  loader: ({ params }) => {
    const pkg = findPackage(params.slug);
    if (!pkg) throw notFound();
    return {
      pkg,
      detail: getPackageDetail(pkg),
      related: getRelatedPackages(pkg),
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Package unavailable — South Zoom Tourism" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { pkg, detail } = loaderData;
    const description = `${pkg.nights} nights / ${pkg.days} days from ${pkg.startingCity}. ${pkg.hotelCategory} stay and ${pkg.vehicleCategory} travel across ${pkg.destination}, ${pkg.state}.`;
    const url = `/tour-packages/${params.slug}`;
    return {
      meta: [
        { title: `${pkg.title} — South Zoom Tourism` },
        { name: "description", content: description },
        { property: "og:title", content: `${pkg.title} — South Zoom Tourism` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: pkg.title,
            description,
            touristType: detail.travellerTypes,
            itinerary: {
              "@type": "ItemList",
              itemListElement: detail.days.map((day) => ({
                "@type": "ListItem",
                position: day.day,
                name: day.title,
                description: day.route,
              })),
            },
            provider: { "@type": "TravelAgency", name: "South Zoom Tourism" },
            ...(pkg.showPrice && pkg.price > 0
              ? {
                  offers: {
                    "@type": "Offer",
                    price: pkg.price,
                    priceCurrency: "INR",
                    availability: pkg.soldOut
                      ? "https://schema.org/SoldOut"
                      : "https://schema.org/InStock",
                    url,
                  },
                }
              : {}),
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
              { "@type": "ListItem", position: 3, name: pkg.title, item: url },
            ],
          }),
        },
      ],
    };
  },

  component: PackageDetailPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">This package didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: PackageNotFound,
});

function PackageNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Package not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This itinerary may have been retired or renamed. Browse everything currently on offer.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/tour-packages">All tour packages</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact-us">Contact us</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PackageDetailPage() {
  const { pkg, detail, related } = Route.useLoaderData() as {
    pkg: TourPackageRecord;
    detail: PackageDetail;
    related: TourPackageRecord[];
  };
  const price = formatPackagePrice(pkg);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <PageBanner
          title={pkg.title}
          subtitle={`${pkg.nights} nights / ${pkg.days} days · Starts from ${pkg.startingCity} · ${price.amount} ${price.basis}`}
          image={pkg.image}
          imageAlt={pkg.imageAlt}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Tour Packages", href: "/tour-packages" },
            { label: pkg.title, href: `/tour-packages/${pkg.slug}` },
          ]}
        />
        <PackageDetailView pkg={pkg} detail={detail} related={related} />
      </main>
      <Footer />
    </div>
  );
}
