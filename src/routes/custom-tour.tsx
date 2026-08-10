import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Toaster } from "@/components/ui/sonner";
import { CustomTourWizard } from "@/components/custom-tour/custom-tour-wizard";
import {
  customTourBannerBlock,
  customTourIntroBlock,
  customTourNextSteps,
} from "@/content/custom-tour";
import { company } from "@/content/site";

const CANONICAL = "https://south-zoom-tourism.lovable.app/custom-tour";
const TITLE = "Custom Tour Builder — Personalised South India Trips";
const DESCRIPTION =
  "Build a personalised South India itinerary: choose destinations, dates, travellers, vehicle, hotel category and budget. Get a day-wise custom tour quote from South Zoom Tourism.";

export const Route = createFileRoute("/custom-tour")({
  component: CustomTourPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The custom tour builder didn't load</h1>
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
      { title: `${TITLE} | ${company.name}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
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
          "@type": "BreadcrumbList",
          itemListElement: customTourBannerBlock.breadcrumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `https://south-zoom-tourism.lovable.app${c.href === "/" ? "" : c.href}`,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Customised tour planning",
          name: TITLE,
          description: DESCRIPTION,
          url: CANONICAL,
          provider: {
            "@type": "TravelAgency",
            name: company.name,
            telephone: company.phoneRaw,
            email: company.email,
          },
          areaServed: "South India",
        }),
      },
    ],
  }),
});

function CustomTourPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <h1 className="sr-only">Custom tour enquiry — South Zoom Tourism</h1>
        {customTourBannerBlock.visible ? (
          <PageBanner
            title={customTourBannerBlock.title}
            subtitle={customTourBannerBlock.subtitle}
            image={customTourBannerBlock.image}
            imageAlt={customTourBannerBlock.imageAlt}
            breadcrumbs={customTourBannerBlock.breadcrumbs}
          />
        ) : null}

        <section className="py-10 sm:py-14" aria-labelledby="custom-tour-heading">
          <div className="mx-auto max-w-7xl px-4">
            <h2 id="custom-tour-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
              {customTourIntroBlock.heading}
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
              {customTourIntroBlock.description}
            </p>

            <div className="mt-6">
              <CustomTourWizard />
            </div>
          </div>
        </section>

        <section className="pb-14 sm:pb-20" aria-labelledby="custom-tour-next-heading">
          <div className="mx-auto max-w-7xl px-4">
            <h2
              id="custom-tour-next-heading"
              className="text-xl font-bold tracking-tight sm:text-2xl"
            >
              What happens next
            </h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3">
              {customTourNextSteps.map((s, i) => (
                <li key={s.id} className="min-w-0 rounded-xl border border-border bg-card p-5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
