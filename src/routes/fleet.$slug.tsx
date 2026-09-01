import { useState, useEffect } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Check, MessageCircle, Phone, CalendarCheck, ArrowLeft, Calculator, ShieldAlert, Sparkles } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { VehicleGallery } from "@/components/fleet/vehicle-gallery";
import { VehiclePricing } from "@/components/fleet/vehicle-pricing";
import { VehicleBookingForm } from "@/components/fleet/vehicle-booking-form";
import { AutoFareCalculatorModal } from "@/components/fleet/auto-fare-calculator-modal";
import { getFleetFareConfig, type FleetFareConfig } from "@/content/fleet-pricing";
import {
  getPublishedVehicles,
  getVehicleBySlug,
  getVehicleCategoryLabel,
  tripTypeOptions,
  type FleetVehicle,
} from "@/content/fleet";
import {
  getGallery,
  getRelatedVehicles,
  getVehicleDetail,
  getVisibleFeatures,
  type VehicleDetail,
} from "@/content/vehicle-details";
import { company, waLink } from "@/content/site";

type IconName = keyof typeof Icons;
type LoaderData = { vehicle: FleetVehicle; detail?: VehicleDetail };

type VehicleDetailSearch = {
  pickup?: string;
  destination?: string;
  pickupCity?: string;
  dropCity?: string;
  pickupDate?: string;
  pickupTime?: string;
  tripType?: string;
  fare?: string;
  advance?: string;
  autoOpenBooking?: string;
};

export const Route = createFileRoute("/fleet/$slug")({
  validateSearch: (search: Record<string, unknown>): VehicleDetailSearch => ({
    pickup: typeof search.pickup === "string" ? search.pickup : undefined,
    destination: typeof search.destination === "string" ? search.destination : undefined,
    pickupCity: typeof search.pickupCity === "string" ? search.pickupCity : undefined,
    dropCity: typeof search.dropCity === "string" ? search.dropCity : undefined,
    pickupDate: typeof search.pickupDate === "string" ? search.pickupDate : undefined,
    pickupTime: typeof search.pickupTime === "string" ? search.pickupTime : undefined,
    tripType: typeof search.tripType === "string" ? search.tripType : undefined,
    fare: typeof search.fare === "string" ? search.fare : undefined,
    advance: typeof search.advance === "string" ? search.advance : undefined,
    autoOpenBooking: typeof search.autoOpenBooking === "string" ? search.autoOpenBooking : undefined,
  }),
  loader: ({ params }): LoaderData => {
    const vehicle = getVehicleBySlug(params.slug);
    if (!vehicle) throw notFound();
    return { vehicle, detail: getVehicleDetail(params.slug) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Vehicle unavailable — South Zoom Tourism" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { vehicle, detail } = loaderData;
    const title = `${vehicle.name} — Hire ${getVehicleCategoryLabel(vehicle.categorySlug)} | South Zoom Tourism`;
    const description =
      detail?.summary ??
      `Hire the ${vehicle.name} with a verified driver — ${vehicle.seats} seats, ${vehicle.luggage} bags, ${vehicle.ac ? "AC" : "non-AC"}, from ${vehicle.priceFromLabel}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 158) },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/fleet/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/fleet/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: vehicle.name,
            brand: { "@type": "Brand", name: vehicle.brand },
            model: vehicle.model,
            description,
            category: getVehicleCategoryLabel(vehicle.categorySlug),
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: vehicle.pricePerKm,
              availability: vehicle.available
                ? "https://schema.org/InStock"
                : "https://schema.org/PreOrder",
              seller: { "@type": "TravelAgency", name: company.name, telephone: company.phone },
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Fleet", item: "/fleet" },
              { "@type": "ListItem", position: 3, name: vehicle.name, item: `/fleet/${params.slug}` },
            ],
          }),
        },
      ],
    };
  },
  component: VehicleDetailPage,
  errorComponent: ({ error }) => (
    <VehicleFallback title="This vehicle didn't load" message={error.message} />
  ),
  notFoundComponent: () => (
    <VehicleFallback
      title="Vehicle not found"
      message="This vehicle is no longer listed. Browse the current fleet to find a similar option."
    />
  ),
});

function VehicleFallback({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/fleet">Back to the fleet</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={`tel:${company.phoneRaw}`}>Call {company.phone}</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function VehicleDetailPage() {
  const search = Route.useSearch();
  const { vehicle: initialVehicle, detail: initialDetail } = Route.useLoaderData() as LoaderData;
  const [vehicle, setVehicle] = useState<FleetVehicle>(initialVehicle);
  const [detail, setDetail] = useState<VehicleDetail | undefined>(initialDetail);
  const [bookingRef, setBookingRef] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [fareConfig, setFareConfig] = useState<FleetFareConfig>(() => getFleetFareConfig(initialVehicle.id));

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getVehicleBySlug(initialVehicle.slug);
      if (updated) setVehicle(updated);
      setDetail(getVehicleDetail(initialVehicle.slug));
      setFareConfig(getFleetFareConfig(initialVehicle.id));
    };
    window.addEventListener("fleetDataUpdated", handleUpdate);
    window.addEventListener("vehicleDetailUpdated", handleUpdate);
    window.addEventListener("fleetFareSettingsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("fleetDataUpdated", handleUpdate);
      window.removeEventListener("vehicleDetailUpdated", handleUpdate);
      window.removeEventListener("fleetFareSettingsUpdated", handleUpdate);
    };
  }, [initialVehicle.slug, initialVehicle.id]);

  const gallery = detail ? getGallery(detail) : [];
  const features = detail ? getVisibleFeatures(detail) : [];
  const related = getRelatedVehicles(vehicle, getPublishedVehicles());

  const scrollToBooking = () => {
    setBookingRef((n) => n + 1);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const specs = [
    { label: "Category", value: getVehicleCategoryLabel(vehicle.categorySlug) },
    { label: "Passengers", value: `${vehicle.seats}` },
    { label: "Luggage", value: `${vehicle.luggage} bags` },
    { label: "Air conditioning", value: vehicle.ac ? "AC" : "Non-AC" },
    ...(detail?.specs ?? []),
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Fleet", href: "/fleet" },
              { label: vehicle.name, href: `/fleet/${vehicle.slug}` },
            ]}
          />

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              {/* Always show the correctly resolved vehicle image as the primary photo */}
              <div className="overflow-hidden rounded-xl border border-border">
                <img
                  src={vehicle.image}
                  alt={vehicle.imageAlt || vehicle.name}
                  width={1200}
                  height={750}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>

              {/* Additional gallery images from DB (if any) shown below as thumbnails */}
              {gallery.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {gallery.slice(0, 4).map((img) => (
                    <div key={img.id} className="overflow-hidden rounded-lg border border-border">
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <header className="mt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{getVehicleCategoryLabel(vehicle.categorySlug)}</Badge>
                  <Badge variant={vehicle.available ? "secondary" : "outline"}>
                    {vehicle.availabilityText}
                  </Badge>
                </div>
                <h1 className="mt-3 text-balance text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                  {vehicle.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {vehicle.brand} · {vehicle.model}
                </p>
                {detail?.summary ? (
                  <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {detail.summary}
                  </p>
                ) : null}

                {/* Auto Fare Calculator Hero Card */}
                <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-background p-5 shadow-sm">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Configured Route Tariffs
                  </span>
                  <div className="mt-3 flex flex-wrap items-baseline gap-6">
                    <div>
                      <span className="text-xs text-muted-foreground block font-medium">One Way Tariff</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-foreground">
                        ₹{fareConfig.oneWayRatePerKm}
                        <span className="text-xs font-normal text-muted-foreground"> / km</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        (Min {fareConfig.oneWayMinimumKm} km)
                      </span>
                    </div>
                    <div className="h-8 w-[1px] bg-border hidden sm:block" />
                    <div>
                      <span className="text-xs text-muted-foreground block font-medium">Round Trip Tariff</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{fareConfig.roundTripRatePerKm}
                        <span className="text-xs font-normal text-muted-foreground"> / km</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        (Min {fareConfig.roundTripMinimumKmPerDay} km/day)
                      </span>
                    </div>
                  </div>
                </div>
              </header>

              <section className="mt-8" aria-labelledby="specs-heading">
                <h2 id="specs-heading" className="text-lg font-bold sm:text-xl">
                  Specifications
                </h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {specs.map((spec) => (
                    <div key={spec.label} className="rounded-lg border border-border p-3">
                      <dt className="text-xs text-muted-foreground">{spec.label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  {vehicle.tripTypes.map((trip) => (
                    <Badge key={trip} variant="outline">
                      {tripTypeOptions.find((t) => t.value === trip)?.label ?? trip}
                    </Badge>
                  ))}
                </div>
              </section>

              {features.length > 0 ? (
                <section className="mt-8" aria-labelledby="features-heading">
                  <h2 id="features-heading" className="text-lg font-bold sm:text-xl">
                    On-board features
                  </h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {features.map((feature) => {
                      const Icon = (Icons[feature.icon as IconName] ?? Icons.Check) as Icons.LucideIcon;
                      return (
                        <li key={feature.id} className="flex items-start gap-2 text-sm">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="min-w-0">{feature.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {vehicle.features && vehicle.features.length > 0 ? (
                <section className="mt-8" aria-labelledby="highlights-heading">
                  <h2 id="highlights-heading" className="text-lg font-bold sm:text-xl">
                    Highlights
                  </h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {vehicle.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {detail ? (
                <section className="mt-8" aria-labelledby="rates-heading">
                  <div>
                    <h2 id="rates-heading" className="text-lg font-bold sm:text-xl">
                      Rates & Standard Packages
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fuel, driver charges and maintenance are included. Anything billed at actuals is
                      shown before you confirm.
                    </p>
                  </div>
                  <div className="mt-4">
                    <VehiclePricing detail={detail} />
                  </div>
                </section>
              ) : null}

              {detail?.policies && detail.policies.length > 0 ? (
                <section className="mt-8" aria-labelledby="policies-heading">
                  <h2 id="policies-heading" className="text-lg font-bold sm:text-xl">
                    Rental Policies & Guidelines
                  </h2>
                  <ul className="mt-3 space-y-2.5">
                    {detail.policies.map((policy, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" aria-hidden="true" />
                        <span className="leading-snug">{policy}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section id="booking" className="mt-10 scroll-mt-24 lg:hidden" aria-labelledby="booking-heading-mobile">
                <h2 id="booking-heading-mobile" className="text-lg font-bold sm:text-xl">
                  Book this vehicle
                </h2>
                <div className="mt-4 rounded-xl border border-border bg-card p-5">
                  <VehicleBookingForm
                    key={bookingRef}
                    idPrefix="mbk"
                    vehicle={vehicle}
                    detail={detail}
                    prefillPickup={search.pickup || search.pickupCity}
                    prefillDestination={search.destination || search.dropCity}
                    prefillDate={search.pickupDate}
                    prefillTime={search.pickupTime}
                    prefillTripType={search.tripType}
                    prefillFare={search.fare ? Number(search.fare) : undefined}
                    prefillAdvance={search.advance ? Number(search.advance) : undefined}
                  />
                </div>
              </section>

              {related.length > 0 ? (
                <section className="mt-10" aria-labelledby="related-heading">
                  <h2 id="related-heading" className="text-lg font-bold sm:text-xl">
                    Similar vehicles
                  </h2>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((item) => (
                      <li key={item.id}>
                        <Link
                          to="/fleet/$slug"
                          params={{ slug: item.slug }}
                          className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
                        >
                          <img
                            src={item.image}
                            alt={item.imageAlt}
                            width={600}
                            height={375}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[16/10] w-full object-cover"
                          />
                          <span className="flex flex-1 flex-col p-4">
                            <span className="text-sm font-bold">{item.name}</span>
                            <span className="mt-1 text-xs text-muted-foreground">
                              {item.seats} seats · {item.luggage} bags · {item.ac ? "AC" : "Non-AC"}
                            </span>
                            <span className="mt-2 text-sm font-semibold text-primary">
                              Starting {item.priceFromLabel}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="mt-10">
                <Link
                  to="/fleet"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  All vehicles
                </Link>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
                <div className="mb-2">
                  <h2 className="text-base font-bold">Book the {vehicle.name}</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Send a booking request with your journey details.
                </p>
                <div className="mt-4">
                  <VehicleBookingForm
                    vehicle={vehicle}
                    detail={detail}
                    prefillPickup={search.pickup || search.pickupCity}
                    prefillDestination={search.destination || search.dropCity}
                    prefillDate={search.pickupDate}
                    prefillTime={search.pickupTime}
                    prefillTripType={search.tripType}
                    prefillFare={search.fare ? Number(search.fare) : undefined}
                    prefillAdvance={search.advance ? Number(search.advance) : undefined}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Sticky mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={`tel:${company.phoneRaw}`} aria-label={`Call ${company.phone}`}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a
              href={waLink(`Hi South Zoom Tourism, I'd like to book the ${vehicle.name}.`)}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Chat on WhatsApp about the ${vehicle.name}`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          </Button>
          <Button
            size="sm"
            className="flex-1 font-bold gap-1"
            type="button"
            onClick={() => setShowCalculator(true)}
          >
            <Calculator className="h-4 w-4" aria-hidden="true" />
            Fare Calc
          </Button>
        </div>
      </div>

      {/* Auto Fare Calculator Modal */}
      <AutoFareCalculatorModal
        open={showCalculator}
        onOpenChange={setShowCalculator}
        initialVehicle={vehicle}
      />

      <Footer />
      <Toaster />
    </div>
  );
}
