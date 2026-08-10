import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { BookingVerifyForm } from "@/components/booking/booking-verify-form";
import { BookingSummaryView } from "@/components/booking/booking-summary-view";
import {
  deriveAccessToken,
  grantAccess,
  readGrant,
} from "@/content/booking-access";
import { loadBookingSummary, type BookingSummary } from "@/content/booking-summary";
import { company, telLink } from "@/content/site";
import { Phone } from "lucide-react";

const SITE = "https://south-zoom-tourism.lovable.app";
const TITLE = "Booking Confirmation — South Zoom Tourism";
const DESCRIPTION =
  "Secure booking confirmation: status, service details, travel dates, payment summary, downloadable confirmation and invoice for your South Zoom Tourism booking.";

type Search = { t?: string };

export const Route = createFileRoute("/booking-confirmation/$bookingNumber")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    t:
      typeof search.t === "string" && search.t
        ? search.t
        : typeof search.t === "number"
          ? String(search.t)
          : undefined,
  }),
  component: BookingConfirmationPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">We couldn't open this booking</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
    </div>
  ),
  head: ({ params }) => {
    const canonical = `${SITE}/booking-confirmation/${params.bookingNumber}`;
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
});

function BookingConfirmationPage() {
  const { bookingNumber: rawNumber } = Route.useParams();
  const bookingNumber = rawNumber.trim().toUpperCase();
  const { t } = Route.useSearch();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [authorised, setAuthorised] = useState(false);

  const resolve = useCallback(() => {
    const record = loadBookingSummary(bookingNumber);
    if (!record) return { record: null, ok: false };
    const expected = deriveAccessToken(bookingNumber, record.phone);
    const supplied = t ?? readGrant(bookingNumber) ?? "";
    return { record, ok: supplied === expected };
  }, [bookingNumber, t]);

  useEffect(() => {
    const { record, ok } = resolve();
    if (ok && record) {
      grantAccess(bookingNumber, deriveAccessToken(bookingNumber, record.phone));
      setSummary(record);
      setAuthorised(true);
    } else {
      setSummary(null);
      setAuthorised(false);
    }
    setLoading(false);
  }, [bookingNumber, resolve]);

  const handleVerify = (phone: string) => {
    const record = loadBookingSummary(bookingNumber);
    if (!record) return false;
    const expected = deriveAccessToken(bookingNumber, record.phone);
    if (deriveAccessToken(bookingNumber, phone) !== expected) return false;
    grantAccess(bookingNumber, expected);
    setSummary(record);
    setAuthorised(true);
    return true;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const { record, ok } = resolve();
    if (ok && record) setSummary(record);
    window.setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="print:hidden">
        <TopBar />
        <Navbar />
      </div>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="print:hidden">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Booking confirmation", href: `/booking-confirmation/${bookingNumber}` },
              ]}
            />
          </div>

          {loading ? (
            <div className="mt-8 space-y-4" aria-busy="true">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : authorised && summary ? (
            <BookingSummaryView summary={summary} onRefresh={handleRefresh} refreshing={refreshing} />
          ) : (
            <>
              <BookingVerifyForm bookingNumber={bookingNumber} onVerify={handleVerify} />
              <section className="mt-6 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                <h2 className="text-sm font-semibold text-foreground">Why the extra step?</h2>
                <p className="mt-2 text-pretty">
                  Booking numbers are short and predictable, so we never show trip, guest or payment
                  details from the number alone. Verification keeps every customer's booking private.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild size="sm" variant="outline">
                    <a href={telLink()}>
                      <Phone aria-hidden="true" /> Call {company.phone}
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <AppLink href="/">Back to home</AppLink>
                  </Button>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
