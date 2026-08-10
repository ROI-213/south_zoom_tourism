import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Toaster } from "@/components/ui/sonner";
import { ContactCards } from "@/components/contact/contact-cards";
import { ContactQuickActions } from "@/components/contact/contact-quick-actions";
import { ContactMap } from "@/components/contact/contact-map";
import { ContactForm } from "@/components/contact/contact-form";
import { EmergencyContactCard } from "@/components/contact/emergency-contact-card";
import { company } from "@/content/site";
import {
  contactBannerBlock,
  contactFormBlock,
  contactSettings,
  emergencyContact,
  getContactChannels,
  getEnquiryServiceOptions,
} from "@/content/contact";

type ContactSearch = Record<string, string>;

const CANONICAL = "https://south-zoom-tourism.lovable.app/contact-us";

export const Route = createFileRoute("/contact-us")({
  // Accepts context params from Book Now / enquiry CTAs across the site
  // (e.g. ?vehicle=innova-crysta&intent=booking, ?hotel=..., ?topic=...).
  validateSearch: (search: Record<string, unknown>): ContactSearch =>
    Object.fromEntries(
      Object.entries(search).filter(([, v]) => typeof v === "string" && v !== ""),
    ) as ContactSearch,
  component: ContactPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The contact page didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Contact Us — Call, WhatsApp or Enquire | South Zoom Tourism" },
      {
        name: "description",
        content:
          "Contact South Zoom Tourism in Chennai — office address, phone and WhatsApp numbers, email, business hours, 24×7 emergency desk and a service-wise enquiry form.",
      },
      { property: "og:title", content: "Contact Us — South Zoom Tourism" },
      {
        property: "og:description",
        content:
          "Call, WhatsApp, email or send a service-specific enquiry. Office address, business hours and directions for South Zoom Tourism, Chennai.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: company.name,
          email: company.email,
          telephone: company.phoneRaw,
          url: CANONICAL,
          address: {
            "@type": "PostalAddress",
            streetAddress: contactSettings.address,
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: contactSettings.mapLat,
            longitude: contactSettings.mapLng,
          },
          openingHours: contactSettings.businessHours
            .filter((h) => h.published)
            .map((h) => `${h.days} ${h.hours}`),
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer service",
              telephone: company.phoneRaw,
              email: company.email,
            },
            ...(emergencyContact.published && emergencyContact.phoneRaw
              ? [
                  {
                    "@type": "ContactPoint",
                    contactType: "emergency",
                    telephone: emergencyContact.phoneRaw,
                    availableLanguage: ["en", "ta"],
                  },
                ]
              : []),
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: contactBannerBlock.breadcrumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: c.href,
          })),
        }),
      },
    ],
  }),
});

/** Builds a readable subject/message from whatever context params arrived. */
function buildPrefill(search: ContactSearch) {
  const serviceOptions = getEnquiryServiceOptions();
  const known = new Set(serviceOptions.map((o) => o.slug));

  let service = "general";
  if (search.service && known.has(search.service)) service = search.service;
  else if (search.vehicle) service = known.has("local-taxi") ? "local-taxi" : "general";
  else if (search.hotel || search.room)
    service = known.has("hotel-and-room-booking") ? "hotel-and-room-booking" : "general";
  else if (search.package)
    service = known.has("custom-tour-planning") ? "custom-tour-planning" : "general";

  const bits: string[] = [];
  if (search.vehicle) bits.push(`Vehicle: ${search.vehicle}`);
  if (search.package) bits.push(`Package: ${search.package}`);
  if (search.hotel) bits.push(`Hotel: ${search.hotel}`);
  if (search.room) bits.push(`Room: ${search.room}`);
  if (search.destination) bits.push(`Destination: ${search.destination}`);
  if (search.checkin) bits.push(`Check-in: ${search.checkin}`);
  if (search.checkout) bits.push(`Check-out: ${search.checkout}`);
  if (search.topic) bits.push(`FAQ topic: ${search.topic}`);
  if (search.question) bits.push(`Question: ${search.question}`);
  if (search.estimate) bits.push(`Estimate shown: ${search.estimate}`);

  const label = serviceOptions.find((o) => o.slug === service)?.label ?? "General enquiry";
  const subject =
    search.intent === "booking"
      ? `Booking enquiry — ${label}`
      : bits.length > 0
        ? `${label} enquiry`
        : "";

  return { service, subject, message: bits.join("\n") };
}

function ContactPage() {
  const navigate = useNavigate({ from: "/contact-us" });
  const search = Route.useSearch();
  const prefill = useMemo(() => buildPrefill(search), [search]);
  const [service, setService] = useState(prefill.service);

  const channels = getContactChannels();

  const selectService = (slug: string) => {
    setService(slug);
    navigate({
      search: (prev: ContactSearch) => ({ ...prev, service: slug }),
      replace: true,
      hash: "enquiry-form",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Navbar />

      <main className="flex-1">
        {contactBannerBlock.visible ? (
          <PageBanner
            title={contactBannerBlock.title}
            subtitle={contactBannerBlock.subtitle}
            image={contactBannerBlock.image}
            imageAlt={contactBannerBlock.imageAlt}
            breadcrumbs={contactBannerBlock.breadcrumbs}
          />
        ) : (
          <h1 className="sr-only">Contact Us</h1>
        )}

        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <section aria-labelledby="quick-actions-heading">
            <h2 id="quick-actions-heading" className="sr-only">
              Quick actions
            </h2>
            <ContactQuickActions onEnquiry={selectService} />
          </section>

          <section aria-labelledby="contact-channels-heading" className="mt-8">
            <h2 id="contact-channels-heading" className="text-lg font-bold tracking-tight sm:text-xl">
              Ways to reach us
            </h2>
            <div className="mt-4">
              <ContactCards channels={channels} />
            </div>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <section id="enquiry-form" className="min-w-0 scroll-mt-24">
              <h2 id="contact-form-heading" className="text-lg font-bold tracking-tight sm:text-xl">
                {contactFormBlock.heading}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {contactFormBlock.description}
              </p>
              <div className="mt-4">
                <ContactForm
                  serviceSlug={service}
                  subjectPrefill={prefill.subject}
                  messagePrefill={prefill.message}
                  onServiceChange={setService}
                />
              </div>
            </section>

            <div className="grid min-w-0 gap-8 self-start">
              <ContactMap />
              <EmergencyContactCard />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
