import { useState, useEffect } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Edit2 } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EnquiryDialog } from "@/components/services/enquiry-dialog";
import { ServicesTrust } from "@/components/services/services-trust";
import { ServiceHero } from "@/components/services/service-hero";
import {
  ServiceEnquiryCard,
  ServiceMobileActionBar,
} from "@/components/services/service-enquiry-card";
import {
  ServiceOverview,
  ServiceModules,
  ServicePricing,
  ServiceTerms,
  ServiceFaqs,
} from "@/components/services/service-detail-blocks";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { getPublishedServices, getServiceBySlug, type Service } from "@/content/services";
import {
  getServiceDetail,
  orderedSections,
  resolveServiceFaqs,
  type SectionKey,
  type PricingRow,
} from "@/content/service-details";
import { AutoFareCalculatorModal } from "@/components/fleet/auto-fare-calculator-modal";
import { getPublishedVehicles, type FleetVehicle } from "@/content/fleet";
import { HotelEnquiryModal } from "@/components/hotels/hotel-enquiry-modal";
import { getPublishedHotels } from "@/content/hotels";
import { company } from "@/content/site";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }): { service: Service } => {
    const service = getServiceBySlug(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Service not found — South Zoom Tourism" }, { name: "robots", content: "noindex" }],
      };
    }
    const { service } = loaderData;
    const title = `${service.title} — South Zoom Tourism`;
    return {
      meta: [
        { title },
        { name: "description", content: service.shortDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: service.shortDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/services/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/services/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.detailDescription,
            serviceType: service.title,
            areaServed: "South India",
            offers: service.showPricing && service.priceFrom
              ? { "@type": "Offer", priceCurrency: "INR", description: `From ${service.priceFrom}` }
              : undefined,
            provider: {
              "@type": "TravelAgency",
              name: company.name,
              telephone: company.phone,
              email: company.email,
            },
          }),
        },
      ],
    };
  },
  component: ServiceDetailPage,
  errorComponent: ({ error }) => (
    <ServiceFallback title="This service didn't load" message={error.message} />
  ),
  notFoundComponent: () => (
    <ServiceFallback
      title="Service not found"
      message="This service is no longer listed or hasn't been published. Browse everything we currently offer."
    />
  ),
});

function ServiceFallback({ title, message }: { title: string; message: string }) {
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
              <Link to="/services" search={{ category: "all" }}>Back to all services</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact-us">Contact us</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ServiceDetailPage() {
  const { service } = Route.useLoaderData() as { service: Service };
  const [open, setOpen] = useState(false);
  const [fleetBookingOpen, setFleetBookingOpen] = useState(false);
  const [hotelBookingOpen, setHotelBookingOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | undefined>(undefined);
  const [selectedTripType, setSelectedTripType] = useState<"one-way" | "round-trip" | "local" | "airport">("one-way");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin_auth") === "true") {
      setIsAdmin(true);
    }
  }, []);

  const detail = getServiceDetail(service);
  const sections = orderedSections(detail);
  const faqs = resolveServiceFaqs(detail);
  const published = getPublishedServices();
  const related = detail.relatedIds
    .map((id) => published.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));

  const defaultTripType = (): "one-way" | "round-trip" | "local" | "airport" => {
    if (service.slug === "airport-transfers") return "airport";
    if (service.slug === "local-taxi") return "local";
    if (
      service.slug === "group-travel" ||
      service.slug === "pilgrimage-tours" ||
      service.slug === "custom-tour-planning"
    )
      return "round-trip";
    if (service.slug === "corporate-travel" || service.slug === "wedding-and-events")
      return "local";
    return "one-way";
  };

  const handleBookRow = (row: PricingRow) => {
    if (service.slug === "hotel-and-room-booking") {
      setHotelBookingOpen(true);
      return;
    }

    const tripType = row.tripType || defaultTripType();
    const vehicles = getPublishedVehicles();
    let vehicle: FleetVehicle | undefined = undefined;

    if (row.vehicleSlug) {
      vehicle = vehicles.find((v) => v.slug === row.vehicleSlug || v.id === row.vehicleSlug);
    }

    if (!vehicle) {
      const lower = (row.label + " " + row.id).toLowerCase();
      if (lower.includes("dzire") || lower.includes("sedan") || lower.includes("etios")) {
        vehicle = vehicles.find((v) => v.slug === "maruti-dzire");
      } else if (lower.includes("ertiga") || lower.includes("small suv")) {
        vehicle = vehicles.find((v) => v.slug === "maruti-ertiga");
      } else if (lower.includes("crysta") || lower.includes("innova") || lower.includes("big suv")) {
        vehicle = vehicles.find((v) => v.slug === "innova-crysta");
      } else if (lower.includes("tempo") || lower.includes("bus") || lower.includes("coach") || lower.includes("shuttle")) {
        vehicle = vehicles.find((v) => v.slug === "tempo-traveller-12");
      } else if (lower.includes("hatchback") || lower.includes("wagonr")) {
        vehicle = vehicles.find((v) => v.slug === "hatchback-wagonr");
      }
    }

    if (!vehicle) {
      vehicle = vehicles.find((v) => v.slug === "maruti-dzire") || vehicles[0];
    }

    setSelectedVehicle(vehicle);
    setSelectedTripType(tripType);
    setFleetBookingOpen(true);
  };

  const handleGeneralBooking = () => {
    if (service.slug === "hotel-and-room-booking") {
      setHotelBookingOpen(true);
    } else if (
      service.categorySlug === "cabs" ||
      service.slug === "group-travel" ||
      service.slug === "wedding-and-events" ||
      service.slug === "corporate-travel" ||
      service.slug === "pilgrimage-tours" ||
      service.slug === "custom-tour-planning"
    ) {
      const vehicles = getPublishedVehicles();
      setSelectedVehicle(vehicles.find((v) => v.slug === "maruti-dzire") || vehicles[0]);
      setSelectedTripType(defaultTripType());
      setFleetBookingOpen(true);
    } else {
      setOpen(true);
    }
  };

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "overview":
        return <ServiceOverview key={key} text={service.detailDescription} />;
      case "modules":
        return <ServiceModules key={key} modules={detail.modules} />;
      case "pricing":
        return (
          <ServicePricing
            key={key}
            showRates={service.showPricing && detail.pricing.showRates}
            note={detail.pricing.note}
            rows={detail.pricing.rows}
            onEnquire={() => setOpen(true)}
            onBookRow={handleBookRow}
          />
        );
      case "terms":
        return <ServiceTerms key={key} terms={detail.terms} />;
      case "faqs":
        return <ServiceFaqs key={key} items={faqs} />;
      case "related":
        return related.length > 0 ? (
          <section key={key} aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold sm:text-2xl">
              Related services
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: item.slug }}
                    className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
                  >
                    <h3 className="text-base font-bold">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{item.shortDescription}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <ServiceHero service={service} onEnquire={handleGeneralBooking} />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid min-w-0 gap-10">{sections.map(renderSection)}</div>
            <ServiceEnquiryCard service={service} onEnquire={handleGeneralBooking} />
          </div>

          <div className="mt-10">
            <Link
              to="/services"
              search={{ category: "all" }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All services
            </Link>
          </div>
        </div>

        <ServicesTrust />
      </main>
      <Footer />
      <ServiceMobileActionBar service={service} onEnquire={handleGeneralBooking} />

      {/* Fleet Booking Modal — exact same enquiry/booking form as fleet page */}
      <AutoFareCalculatorModal
        open={fleetBookingOpen}
        onOpenChange={setFleetBookingOpen}
        initialVehicle={selectedVehicle}
        initialTripType={selectedTripType}
      />

      {/* Hotel Enquiry Modal */}
      {getPublishedHotels()[0] && (
        <HotelEnquiryModal
          open={hotelBookingOpen}
          onOpenChange={setHotelBookingOpen}
          hotel={getPublishedHotels()[0]}
        />
      )}

      <EnquiryDialog
        open={open}
        onOpenChange={setOpen}
        serviceSlug={service.slug}
        source={`service-detail:${service.slug}`}
      />
      <Toaster />

      {isAdmin && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-40">
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white shadow-2xl gap-2 font-bold py-2.5 px-4 rounded-full border-2 border-white ring-2 ring-orange-500/30">
            <Link to="/admin/products/services" search={{ edit: service.slug }}>
              <Edit2 className="w-4 h-4" /> Edit Service in Admin
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
