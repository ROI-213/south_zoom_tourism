import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { AboutOverview } from "@/components/about/about-overview";
import { AboutTimeline } from "@/components/about/about-timeline";
import { MissionVision } from "@/components/about/mission-vision";
import { ValueCards } from "@/components/about/value-cards";
import { AboutStats } from "@/components/about/about-stats";
import { FounderMessage } from "@/components/about/founder-message";
import { TeamGrid } from "@/components/about/team-grid";
import { Achievements } from "@/components/about/achievements";
import { AboutCta } from "@/components/about/about-cta";
import {
  aboutBannerBlock,
  aboutSeo,
  aboutWhyBlock,
  timelineBlock,
  valuesBlock,
} from "@/content/about";
import { company } from "@/content/site";

export const Route = createFileRoute("/about-us")({
  component: AboutUsPage,
  head: () => ({
    meta: [
      { title: aboutSeo.title },
      { name: "description", content: aboutSeo.description },
      { property: "og:title", content: aboutSeo.title },
      { property: "og:description", content: aboutSeo.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: aboutSeo.canonical },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: aboutSeo.canonical }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: aboutSeo.title,
          description: aboutSeo.description,
          mainEntity: {
            "@type": "TravelAgency",
            name: company.name,
            telephone: company.phone,
            email: company.email,
            foundingDate: timelineBlock.items[0]?.year,
            address: {
              "@type": "PostalAddress",
              streetAddress: company.address,
              addressCountry: "IN",
            },
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: aboutBannerBlock.breadcrumbs.map((c, i) => ({
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

function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        {aboutBannerBlock.visible ? (
          <PageBanner
            title={aboutBannerBlock.title}
            subtitle={aboutBannerBlock.subtitle}
            image={aboutBannerBlock.image}
            imageAlt={aboutBannerBlock.imageAlt}
            breadcrumbs={aboutBannerBlock.breadcrumbs}
          />
        ) : null}
        <AboutOverview />

        {/* MSME Registration Banner */}
        <section className="bg-primary/5 border-y border-primary/15 py-5">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-4 sm:text-left">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                  ✓
                </span>
                <span className="text-base font-bold text-foreground">South Zoom Tourism</span>
              </div>
              <span className="hidden sm:block text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground font-medium">
                Govt. Registered MSME Enterprise &nbsp;|&nbsp; URN: UDYAM-KR-03-0750906
              </span>
            </div>
          </div>
        </section>

        <AboutTimeline />
        <MissionVision />
        <ValueCards
          heading={valuesBlock.heading}
          subheading={valuesBlock.subheading}
          items={valuesBlock.items}
          visible={valuesBlock.visible}
          tinted
        />
        <ValueCards
          heading={aboutWhyBlock.heading}
          subheading={aboutWhyBlock.subheading}
          items={aboutWhyBlock.items}
          visible={aboutWhyBlock.visible}
        />
        <AboutStats />
        <FounderMessage />
        <TeamGrid />
        <Achievements />
        <AboutCta />
      </main>
      <Footer />
    </div>
  );
}
