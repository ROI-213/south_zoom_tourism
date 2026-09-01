import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSlider } from "@/components/home/hero-slider";
import { TravelSearchCard } from "@/components/home/travel-search-card";
import { AboutSection } from "@/components/home/about-section";
import { ServicesSection } from "@/components/home/services-section";
import { FleetSection } from "@/components/home/fleet-section";
import { KarnatakaSlider } from "@/components/home/karnataka-slider";
import { PackagesSection } from "@/components/home/packages-section";
import { HotelsSection } from "@/components/home/hotels-section";
import { DestinationsSection } from "@/components/home/destinations-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { company, faqSection } from "@/content/site";

const TITLE = "South Zoom Tourism — Car Rentals, Tours & Hotels in South India";
const DESCRIPTION =
  "Book cabs, tempo travellers, curated tour packages and partner-rate hotels across Tamil Nadu, Kerala and Karnataka. Transparent fares, verified drivers, 24×7 support.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: company.name,
          description: DESCRIPTION,
          telephone: company.phone,
          email: company.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: company.address,
            addressCountry: "IN",
          },
          openingHours: "Mo-Su 06:00-23:00",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqSection.items.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
    ],
  }),
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <HeroSlider />
        <TravelSearchCard />
        <AboutSection />
        <ServicesSection />
        <FleetSection />
        <KarnatakaSlider />
        <PackagesSection />
        <HotelsSection />
        <DestinationsSection />
        <WhyChooseUs />
        <HowItWorks />
        <TestimonialsSection />
        <GalleryPreview />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
