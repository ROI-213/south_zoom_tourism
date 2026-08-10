import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
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
  ServiceFeatures,
  ServiceProcess,
  ServiceGallery,
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
} from "@/content/service-details";
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
  const detail = getServiceDetail(service);
  const sections = orderedSections(detail);
  const faqs = resolveServiceFaqs(detail);
  const published = getPublishedServices();
  const related = detail.relatedIds
    .map((id) => published.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "overview":
        return <ServiceOverview key={key} text={service.detailDescription} />;
      case "modules":
        return <ServiceModules key={key} modules={detail.modules} />;
      case "features":
        return <ServiceFeatures key={key} features={service.features} benefits={service.benefits} />;
      case "process":
        return <ServiceProcess key={key} steps={detail.process} />;
      case "gallery":
        return <ServiceGallery key={key} items={detail.gallery} serviceTitle={service.title} />;
      case "pricing":
        return (
          <ServicePricing
            key={key}
            showRates={service.showPricing && detail.pricing.showRates}
            note={detail.pricing.note}
            rows={detail.pricing.rows}
            onEnquire={() => setOpen(true)}
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
        <ServiceHero service={service} onEnquire={() => setOpen(true)} />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid min-w-0 gap-10">{sections.map(renderSection)}</div>
            <ServiceEnquiryCard service={service} onEnquire={() => setOpen(true)} />
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
      <ServiceMobileActionBar service={service} onEnquire={() => setOpen(true)} />
      <EnquiryDialog
        open={open}
        onOpenChange={setOpen}
        serviceSlug={service.slug}
        source={`service-detail:${service.slug}`}
      />
      <Toaster />
    </div>
  );
}
