import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Toaster } from "@/components/ui/sonner";
import { Card } from "@/components/ui/card";
import { PaymentInstructions } from "@/components/payment/payment-instructions";
import { PaymentProofForm } from "@/components/payment/payment-proof-form";
import { PaymentAcknowledgement } from "@/components/payment/payment-acknowledgement";
import { PaymentStatusLookup } from "@/components/payment/payment-status-lookup";
import {
  paymentBannerBlock,
  paymentFaqs,
  paymentSettings,
  type PaymentSubmissionRecord,
} from "@/content/payment";
import { company } from "@/content/site";
import banner from "@/assets/services-banner.jpg";

type QrSearch = { booking?: string; amount?: string; name?: string; phone?: string };

const CANONICAL = "https://south-zoom-tourism.lovable.app/qr-payment";

export const Route = createFileRoute("/qr-payment")({
  validateSearch: (search: Record<string, unknown>): QrSearch => {
    // TanStack parses bare numerics into numbers — normalise everything to strings.
    const str = (v: unknown) =>
      typeof v === "string" ? v || undefined : typeof v === "number" ? String(v) : undefined;
    return {
      booking: str(search.booking),
      amount: str(search.amount),
      name: str(search.name),
      phone: str(search.phone),
    };
  },

  component: QrPaymentPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The payment page didn't load</h1>
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
      { title: "QR Payment & Proof Upload | South Zoom Tourism" },
      {
        name: "description",
        content:
          "Pay your South Zoom Tourism booking by UPI QR, UPI ID or bank transfer, then upload your payment screenshot for verification and download an acknowledgement.",
      },
      { property: "og:title", content: "QR Payment & Proof Upload — South Zoom Tourism" },
      {
        property: "og:description",
        content:
          "Scan the UPI QR or use our bank details, then submit your transaction ID and screenshot. Payments are verified by our accounts team before a booking is marked paid.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://south-zoom-tourism.lovable.app/" },
                { "@type": "ListItem", position: 2, name: "QR Payment", item: CANONICAL },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: paymentFaqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
});

function QrPaymentPage() {
  const search = Route.useSearch();
  const [record, setRecord] = useState<PaymentSubmissionRecord | null>(null);

  if (!paymentSettings.published) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Online payment is temporarily closed</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please call {company.phone} to complete your payment.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const amountNumber = Number(search.amount);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      <main>
        <PageBanner
          title={paymentBannerBlock.heading}
          subtitle={paymentBannerBlock.subheading}
          image={banner}
          imageAlt="South Zoom Tourism travel desk where offline payments are verified"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "QR Payment", href: "/qr-payment" },
          ]}
        />

        <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <h2 className="sr-only">Payment details</h2>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            {paymentSettings.intro}
          </p>
          <div className="mt-8">
            <PaymentInstructions
              amount={Number.isFinite(amountNumber) && amountNumber > 0 ? amountNumber : undefined}
              note={search.booking}
            />
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-10 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              {record ? (
                <PaymentAcknowledgement record={record} onSubmitAnother={() => setRecord(null)} />
              ) : (
                <PaymentProofForm
                  defaults={{
                    bookingNumber: search.booking,
                    amount: search.amount,
                    name: search.name,
                    phone: search.phone,
                  }}
                  onSubmitted={setRecord}
                />
              )}
            </div>

            <div className="min-w-0 space-y-6">
              <PaymentStatusLookup />

              <Card className="p-5 sm:p-6">
                <h2 className="text-lg font-bold text-foreground">Common questions</h2>
                <dl className="mt-3 space-y-4">
                  {paymentFaqs.map((faq) => (
                    <div key={faq.q}>
                      <dt className="text-sm font-semibold text-foreground">{faq.q}</dt>
                      <dd className="mt-1 text-sm text-muted-foreground">{faq.a}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
