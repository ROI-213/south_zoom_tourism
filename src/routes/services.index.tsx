import { useMemo, useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Reveal } from "@/components/common/reveal";
import { CategoryFilter } from "@/components/services/category-filter";
import { ServiceCard } from "@/components/services/service-card";
import { ServicesTrust } from "@/components/services/services-trust";
import { ServicesEnquiryCta } from "@/components/services/services-enquiry-cta";
import { ServicesFaqs } from "@/components/services/services-faqs";
import { EnquiryDialog } from "@/components/services/enquiry-dialog";
import { Toaster } from "@/components/ui/sonner";
import {
  getCategoryLabel,
  getPublishedServices,
  getVisibleCategories,
  servicesBannerBlock,
  servicesFaqBlock,
  servicesIntroBlock,
  servicesSeo,
  setDynamicServices,
  mapDbServiceToRecord,
  type Service,
} from "@/content/services";
import { AutoFareCalculatorModal } from "@/components/fleet/auto-fare-calculator-modal";
import { getPublishedVehicles, type FleetVehicle } from "@/content/fleet";
import { HotelEnquiryModal } from "@/components/hotels/hotel-enquiry-modal";
import { getPublishedHotels } from "@/content/hotels";
import { company } from "@/content/site";
import supabase from "@/lib/supabase";

type ServicesSearch = { category: string };

export const Route = createFileRoute("/services/")({
  validateSearch: (search: Record<string, unknown>): ServicesSearch => ({
    category: typeof search.category === "string" && search.category ? search.category : "all",
  }),
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: servicesSeo.title },
      { name: "description", content: servicesSeo.description },
      { property: "og:title", content: servicesSeo.title },
      { property: "og:description", content: servicesSeo.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: servicesSeo.canonical },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: servicesSeo.canonical }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: servicesSeo.title,
          itemListElement: getPublishedServices().map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Service",
              name: service.title,
              description: service.shortDescription,
              url: `/services/${service.slug}`,
              provider: { "@type": "TravelAgency", name: company.name },
            },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: servicesFaqBlock.items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: servicesBannerBlock.breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.label,
            item: crumb.href,
          })),
        }),
      },
    ],
  }),
});

function ServicesPage() {
  const { category } = Route.useSearch();
  const navigate = useNavigate();
  const [servicesList, setServicesList] = useState<Service[]>(() => getPublishedServices());

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('services').select('*').eq('active', true).order('display_order');
        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDbServiceToRecord);
          setDynamicServices(mapped);
          setServicesList(mapped);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    })();
  }, []);

  const allServices = servicesList;
  const categories = useMemo(() => getVisibleCategories(), [servicesList]);
  const activeCategory = categories.some((c) => c.slug === category) ? category : "all";

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: allServices.length };
    for (const service of allServices) {
      map[service.categorySlug] = (map[service.categorySlug] ?? 0) + 1;
    }
    return map;
  }, [allServices]);

  const visibleServices =
    activeCategory === "all"
      ? allServices
      : allServices.filter((s) => s.categorySlug === activeCategory);

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySlug, setEnquirySlug] = useState(allServices[0]?.slug ?? "");
  const [fleetBookingOpen, setFleetBookingOpen] = useState(false);
  const [hotelBookingOpen, setHotelBookingOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | undefined>(undefined);
  const [selectedTripType, setSelectedTripType] = useState<"one-way" | "round-trip" | "local" | "airport">("one-way");

  const openEnquiry = (service?: Service) => {
    setEnquirySlug(service?.slug ?? allServices[0]?.slug ?? "");
    setEnquiryOpen(true);
  };

  const handleBook = (service: Service) => {
    if (service.slug === "hotel-and-room-booking") {
      setHotelBookingOpen(true);
      return;
    }

    let tripType: "one-way" | "round-trip" | "local" | "airport" = "one-way";
    if (service.slug === "airport-transfers") tripType = "airport";
    else if (service.slug === "local-taxi") tripType = "local";
    else if (
      service.slug === "group-travel" ||
      service.slug === "pilgrimage-tours" ||
      service.slug === "custom-tour-planning"
    )
      tripType = "round-trip";
    else if (service.slug === "corporate-travel" || service.slug === "wedding-and-events")
      tripType = "local";

    const vehicles = getPublishedVehicles();
    let vehicle = vehicles.find((v) => v.slug === "maruti-dzire");
    if (service.slug === "group-travel") {
      vehicle = vehicles.find((v) => v.slug === "tempo-traveller-12") || vehicle;
    }
    setSelectedVehicle(vehicle || vehicles[0]);
    setSelectedTripType(tripType);
    setFleetBookingOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        {servicesBannerBlock.visible ? (
          <PageBanner
            title={servicesBannerBlock.title}
            subtitle={servicesBannerBlock.subtitle}
            image={servicesBannerBlock.image}
            imageAlt={servicesBannerBlock.imageAlt}
            breadcrumbs={servicesBannerBlock.breadcrumbs}
          />
        ) : null}

        <section className="py-12 sm:py-16" aria-labelledby="services-intro-heading">
          <div className="mx-auto max-w-7xl px-4">
            {servicesIntroBlock.visible ? (
              <div className="max-w-3xl">
                <h2
                  id="services-intro-heading"
                  className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  {servicesIntroBlock.heading}
                </h2>
                <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
                  {servicesIntroBlock.body}
                </p>
              </div>
            ) : null}

            <div className="mt-8">
              <CategoryFilter
                categories={categories}
                active={activeCategory}
                counts={counts}
                onChange={(slug) =>
                  navigate({ to: "/services", search: { category: slug }, replace: true })
                }
              />
            </div>

            <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
              Showing {visibleServices.length}{" "}
              {visibleServices.length === 1 ? "service" : "services"}
              {activeCategory === "all" ? "" : ` in ${getCategoryLabel(activeCategory)}`}.
            </p>

            {visibleServices.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <h3 className="text-base font-bold">No services in this category yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  We're adding more here soon. In the meantime, tell us what you need and we'll
                  arrange it.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEnquiry()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Send an enquiry
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({ to: "/services", search: { category: "all" }, replace: true })
                    }
                    className="rounded-md border border-border px-4 py-2 text-sm font-semibold"
                  >
                    View all services
                  </button>
                </div>
              </div>
            ) : (
              <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleServices.map((service, index) => (
                  <Reveal as="li" key={service.id} delay={Math.min(index, 5) * 60} className="h-full">
                    <ServiceCard
                      service={service}
                      onEnquire={openEnquiry}
                      onBook={handleBook}
                      priority={index < 3}
                    />
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </section>

        <ServicesTrust />
        <ServicesEnquiryCta onEnquire={() => openEnquiry()} />
        <ServicesFaqs />
      </main>
      <Footer />

      {/* Fleet Booking Modal */}
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

      <EnquiryDialog open={enquiryOpen} onOpenChange={setEnquiryOpen} serviceSlug={enquirySlug} />
      <Toaster />
    </div>
  );
}
