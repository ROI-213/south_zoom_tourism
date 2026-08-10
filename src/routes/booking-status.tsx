import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { StatusLookupForm, type LookupValues } from "@/components/booking-status/status-lookup-form";
import { StatusResultView } from "@/components/booking-status/status-result-view";
import {
  lookupBookingStatus,
  trackingStages,
  type StatusResult,
} from "@/content/booking-status";
import { company } from "@/content/site";

const SITE = "https://south-zoom-tourism.lovable.app";
const TITLE = "Booking Status Tracking — South Zoom Tourism";
const DESCRIPTION =
  "Check the live status of your South Zoom Tourism booking, enquiry or payment. Verify with your reference number plus mobile or email to see the progress timeline, payment state and pending actions.";

type Search = { ref?: string };

export const Route = createFileRoute("/booking-status")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ref: typeof search.ref === "string" && search.ref ? search.ref.slice(0, 40) : undefined,
  }),
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE}/booking-status` }],
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/booking-status` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: BookingStatusPage,
});

const minutes = (ms: number) => Math.max(1, Math.ceil(ms / 60000));

function BookingStatusPage() {
  const { ref } = Route.useSearch();
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = useCallback((values: LookupValues) => {
    const outcome = lookupBookingStatus(values.reference, values.contact);
    if (outcome.ok) {
      setResult(outcome.result);
      setError(null);
      return;
    }
    setResult(null);
    if (outcome.reason === "blocked") {
      setError(
        `Too many failed attempts from this device. For security, try again in about ${minutes(
          outcome.retryInMs,
        )} minute(s) or call ${company.phone} and our team will check it for you.`,
      );
      return;
    }
    setError(
      "We couldn't match that reference with the mobile number or email provided. Check the details in your confirmation message — or call our team and we'll look it up for you.",
    );
  }, []);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: trackingStages.slice(0, 6).map((stage) => ({
      "@type": "Question",
      name: `What does the "${stage.label}" status mean?`,
      acceptedAnswer: { "@type": "Answer", text: stage.help },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Booking status", href: "/booking-status" },
            ]}
          />
          <header className="mt-6">
            <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              Booking status tracking
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
              Track any South Zoom Tourism reference — hotel bookings, tour packages, custom trip
              enquiries and payment submissions — from one place.
            </p>
          </header>

          <div className="mt-8 space-y-6">
            {result ? (
              <StatusResultView
                result={result}
                onReset={() => {
                  setResult(null);
                  setError(null);
                }}
              />
            ) : (
              <>
                <StatusLookupForm
                  onLookup={handleLookup}
                  errorMessage={error}
                  defaultReference={ref ?? ""}
                />
                <section
                  aria-labelledby="stages-heading"
                  className="rounded-2xl border border-border bg-card p-5 sm:p-7"
                >
                  <h2 id="stages-heading" className="text-lg font-bold tracking-tight">
                    What each status means
                  </h2>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    {trackingStages.map((stage) => (
                      <div key={stage.id} className="min-w-0">
                        <dt className="text-sm font-semibold">{stage.label}</dt>
                        <dd className="mt-1 text-pretty text-sm text-muted-foreground">
                          {stage.help}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
