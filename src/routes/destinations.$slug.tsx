import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarRange, MapPin, Clock, MessageCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { PageBanner } from "@/components/common/page-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLink } from "@/components/common/app-link";
import { PackageCard } from "@/components/packages/package-card";
import { PackageEnquiryDialog } from "@/components/packages/package-enquiry-dialog";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { CustomTripCta } from "@/components/destinations/custom-trip-cta";
import { DestinationAttractions } from "@/components/destinations/destination-attractions";
import {
  DestinationWeather,
  DestinationTips,
  DestinationMap,
} from "@/components/destinations/destination-info-panels";
import { DestinationGallery } from "@/components/destinations/destination-gallery";
import { DestinationFaqs } from "@/components/destinations/destination-faqs";
import { DestinationEnquiryForm } from "@/components/destinations/destination-enquiry-form";
import { NearbyDestinations } from "@/components/destinations/nearby-destinations";
import {
  getDestinationBySlug,
  getDestinationHotels,
  getDestinationPackages,
  getTripTypeLabel,
} from "@/content/destinations";
import type { DestinationRecord } from "@/content/destinations";
import { getDestinationGuide, type DestinationGuide } from "@/content/destination-details";
import { getPublishedVehicles, getVehicleCategoryLabel, type FleetVehicle } from "@/content/fleet";
import { getServiceBySlug, type Service } from "@/content/services";
import type { TourPackageRecord } from "@/content/tour-packages";
import { waLink, type Hotel } from "@/content/site";

/** Published + currently available vehicles matching the recommended categories. */
function getRecommendedVehicles(destination: DestinationRecord): FleetVehicle[] {
  const wanted = destination.recommendedVehicles.map((v) => v.toLowerCase());
  return getPublishedVehicles().filter((v) => {
    if (!v.available) return false;
    const label = getVehicleCategoryLabel(v.categorySlug).toLowerCase();
    return wanted.some((w) => label.includes(w) || w.includes(label));
  });
}

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const destination = getDestinationBySlug(params.slug);
    if (!destination) throw notFound();
    const guide = getDestinationGuide(destination);
    return {
      destination,
      guide,
      packages: getDestinationPackages(destination),
      hotels: getDestinationHotels(destination),
      vehicles: getRecommendedVehicles(destination),
      services: destination.recommendedServiceSlugs
        .map((slug) => getServiceBySlug(slug))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
      nearby: guide.nearbySlugs
        .map((slug) => getDestinationBySlug(slug))
        .filter((d): d is DestinationRecord => Boolean(d)),
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Destination not found — South Zoom Tourism" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const d = loaderData.destination;
    const g = loaderData.guide;
    const title = g.seoTitle ?? `${d.name} Tour Packages, Hotels & Cabs — South Zoom Tourism`;
    const description = g.seoDescription ?? d.shortDescription;
    const url = `/destinations/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: d.name,
            description,
            addressRegion: d.state,
            touristType: d.tripTypeSlugs.map(getTripTypeLabel),
            includesAttraction: g.attractions.map((a) => ({
              "@type": "TouristAttraction",
              name: a.name,
              description: a.description,
            })),
          }),
        },
        ...(g.faqs.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: g.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                }),
              },
            ]
          : []),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Destinations", item: "/destinations" },
              { "@type": "ListItem", position: 3, name: d.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: DestinationDetailPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">This destination didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link to="/destinations">Back to destinations</Link>
        </Button>
      </div>
    </div>
  ),
  notFoundComponent: DestinationNotFound,
});

function DestinationNotFound() {
  const { slug } = Route.useParams();
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center sm:py-24">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          We don't have a guide for "{slug}" yet
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This destination may have been unpublished or renamed. Browse everywhere we operate, or
          tell us where you want to go and we'll build the trip from scratch.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/destinations">Browse all destinations</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact-us">Plan a custom trip</Link>
          </Button>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold sm:text-2xl">
      {children}
    </h2>
  );
}

import { DestinationSelector } from "@/components/destinations/destination-selector";

function DestinationDetailPage() {
  const { destination, guide, packages, hotels, vehicles, services, nearby } =
    Route.useLoaderData() as {
      destination: DestinationRecord;
      guide: DestinationGuide;
      packages: TourPackageRecord[];
      hotels: Hotel[];
      vehicles: FleetVehicle[];
      services: Service[];
      nearby: DestinationRecord[];
    };

  const [enquiry, setEnquiry] = useState<{ open: boolean; slug: string }>({
    open: false,
    slug: "",
  });

  const vehicleCategories = Array.from(new Set(vehicles.map((v) => v.categorySlug))).join(",");

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <DestinationSelector currentSlug={destination.slug} />
      <main className="flex-1">
        <PageBanner
          title={destination.name}
          subtitle={destination.shortDescription}
          image={destination.image}
          imageAlt={`${destination.name} — ${destination.imageAlt}`}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/destinations" },
            { label: destination.name, href: `/destinations/${destination.slug}` },
          ]}
        />

        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 py-4">
            <Button asChild>
              <a href="#dest-enquiry-heading">Plan my {destination.name} trip</a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tour-packages" search={{ destination: destination.name }}>
                Packages in {destination.name}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/hotels" search={{ city: destination.name }}>
                Hotels in {destination.name}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <AppLink href={waLink(`Hi, I'd like to plan a trip to ${destination.name}.`)}>
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                WhatsApp
              </AppLink>
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          {/* Overview */}
          <section aria-labelledby="dest-overview-heading">
            <SectionHeading id="dest-overview-heading">About {destination.name}</SectionHeading>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border p-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Region
                  </dt>
                  <dd className="truncate text-sm font-semibold">
                    {destination.state} · {destination.region}
                  </dd>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border p-3">
                <CalendarRange className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Best time
                  </dt>
                  <dd className="text-sm font-semibold">{destination.bestTime}</dd>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border p-3">
                <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Ideal duration
                  </dt>
                  <dd className="truncate text-sm font-semibold">{destination.idealDuration}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {guide.overview.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {destination.highlights.map((h: string) => (
                <li key={h}>
                  <Badge variant="secondary">{h}</Badge>
                </li>
              ))}
              {destination.tripTypeSlugs.map((slug: string) => (
                <li key={slug}>
                  <Badge variant="outline">{getTripTypeLabel(slug)}</Badge>
                </li>
              ))}
            </ul>
          </section>

          {/* Attractions */}
          <section aria-labelledby="dest-attractions-heading" className="mt-12">
            <SectionHeading id="dest-attractions-heading">
              Top attractions in {destination.name}
            </SectionHeading>
            <DestinationAttractions
              destinationName={destination.name}
              attractions={guide.attractions}
            />
          </section>

          {/* Weather, tips and map */}
          <section aria-labelledby="dest-planning-heading" className="mt-12">
            <SectionHeading id="dest-planning-heading">Know before you go</SectionHeading>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <DestinationWeather
                destinationName={destination.name}
                bestTime={destination.bestTime}
                rows={guide.weather}
              />
              <DestinationTips destinationName={destination.name} tips={guide.travelTips} />
            </div>
            {guide.mapEmbedUrl ? (
              <div className="mt-5">
                <DestinationMap
                  embedUrl={guide.mapEmbedUrl}
                  label={guide.mapLabel ?? `Map of ${destination.name}`}
                />
              </div>
            ) : null}
          </section>

          {/* Vehicles */}
          <section aria-labelledby="dest-vehicles-heading" className="mt-12">
            <SectionHeading id="dest-vehicles-heading">
              Recommended vehicles for {destination.name}
            </SectionHeading>
            {vehicles.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No vehicles are showing as available for this route right now — send us your dates
                  and we'll confirm one.
                </p>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link to="/fleet">View the full fleet</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {vehicles.slice(0, 3).map((vehicle) => (
                    <li key={vehicle.id} className="min-w-0">
                      <VehicleCard vehicle={vehicle} />
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Button asChild variant="outline">
                    <Link to="/fleet" search={{ categories: vehicleCategories }}>
                      Compare vehicles for this route
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </section>

          {/* Services */}
          <section aria-labelledby="dest-services-heading" className="mt-12">
            <SectionHeading id="dest-services-heading">
              Services we run in {destination.name}
            </SectionHeading>
            {services.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Tell us what you need — our{" "}
                <Link to="/services" className="font-semibold text-primary underline">
                  full service list
                </Link>{" "}
                covers transfers, outstation trips and custom planning.
              </p>
            ) : (
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => (
                  <li key={service.id} className="min-w-0">
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="text-base font-bold">{service.title}</span>
                      <span className="mt-2 text-sm text-muted-foreground">
                        {service.shortDescription}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* FAQs */}
          <section aria-labelledby="dest-faqs-heading" className="mt-12">
            <SectionHeading id="dest-faqs-heading">{destination.name} FAQs</SectionHeading>
            <DestinationFaqs destinationName={destination.name} faqs={guide.faqs} />
          </section>

          {/* Enquiry */}
          <section aria-labelledby="dest-enquiry-heading" className="mt-12 scroll-mt-24">
            <SectionHeading id="dest-enquiry-heading">Plan your {destination.name} trip</SectionHeading>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your dates and we'll reply with a vehicle, stay and day plan — usually within a
              few hours.
            </p>
            <div className="mt-5">
              <DestinationEnquiryForm
                destinationName={destination.name}
                destinationId={destination.id}
                destinationSlug={destination.slug}
              />
            </div>
          </section>

          {/* Nearby */}
          {nearby.length > 0 ? (
            <section aria-labelledby="dest-nearby-heading" className="mt-12">
              <SectionHeading id="dest-nearby-heading">Nearby destinations</SectionHeading>
              <NearbyDestinations destinations={nearby} />
            </section>
          ) : null}

          <CustomTripCta />

          <PackageEnquiryDialog
            open={enquiry.open}
            onOpenChange={(open) => setEnquiry((prev) => ({ ...prev, open }))}
            packageSlug={enquiry.slug}
            source="destinations"
          />
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
