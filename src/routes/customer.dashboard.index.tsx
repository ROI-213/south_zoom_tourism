import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Car, Hotel, IndianRupee, LifeBuoy, Map, Sparkles, XCircle } from "lucide-react";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { BookingCard } from "@/components/customer/dashboard/booking-card";
import { EmptyState } from "@/components/customer/dashboard/empty-state";
import { LinkBookingDialog } from "@/components/customer/dashboard/link-booking-dialog";
import { ToneBadge } from "@/components/customer/dashboard/status-badge";
import { AppLink } from "@/components/common/app-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientData } from "@/hooks/use-client-data";
import { inr } from "@/content/payment";
import {
  buildOverview,
  cancellationStatusMeta,
  formatDate,
  supportStatusMeta,
  type CustomerBookingKind,
} from "@/content/customer-data";

const HREF = "/customer/dashboard";
const TITLE = "My Dashboard — South Zoom Tourism";
const DESCRIPTION =
  "Your upcoming trips, payments due, recent bookings and support actions in one private dashboard.";

export const Route = createFileRoute("/customer/dashboard/")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: DashboardOverviewPage,
});

const kindCards: { kind: CustomerBookingKind; href: string; icon: typeof Car }[] = [
  { kind: "vehicle", href: "/customer/dashboard/bookings/vehicle", icon: Car },
  { kind: "tour-package", href: "/customer/dashboard/bookings/tour", icon: Map },
  { kind: "hotel", href: "/customer/dashboard/bookings/hotel", icon: Hotel },
];

function DashboardOverviewPage() {
  return (
    <DashboardShell href={HREF} title="Dashboard" description="Everything about your trips, in one place.">
      {(profile) => <OverviewBody profileId={profile.id} profile={profile} />}
    </DashboardShell>
  );
}

function OverviewBody({
  profile,
  profileId,
}: {
  profile: Parameters<typeof buildOverview>[0];
  profileId: string;
}) {
  const { data, loading, reload } = useClientData(() => buildOverview(profile), [profileId]);

  if (loading || !data) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="ov-stats" className="min-w-0">
        <h2 id="ov-stats" className="sr-only">
          Account summary
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Upcoming trips" value={String(data.upcoming.length)} />
          <Stat label="Payment due" value={inr(data.paymentDue)} tone={data.paymentDue > 0 ? "warn" : "ok"} />
          <Stat label="Under verification" value={inr(data.underVerification)} />
          <Stat label="Total booked" value={inr(data.totalBooked)} />
        </div>
      </section>

      <section aria-labelledby="ov-upcoming" className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="ov-upcoming" className="text-lg font-bold tracking-tight">
            Upcoming
          </h2>
          <LinkBookingDialog profile={profile} onLinked={reload} />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {kindCards.map(({ kind, href, icon: Icon }) => (
            <AppLink
              key={kind}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{data.upcomingByKind[kind].length} upcoming</span>
                <span className="block text-xs text-muted-foreground">
                  {kind === "vehicle" ? "Vehicle trips" : kind === "hotel" ? "Hotel stays" : "Tour departures"}
                </span>
              </span>
            </AppLink>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          {data.upcoming.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Nothing on the calendar yet"
              body="Book a cab, a tour package or a hotel and it will show up here with documents and payment status."
              primary={{ href: "/tour-packages", label: "Browse packages" }}
              secondary={{ href: "/custom-tour", label: "Plan a custom trip" }}
            />
          ) : (
            data.upcoming.slice(0, 3).map((booking) => (
              <BookingCard key={booking.reference} booking={booking} compact />
            ))
          )}
        </div>
      </section>

      {data.paymentDue > 0 ? (
        <section
          aria-labelledby="ov-due"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5"
        >
          <div className="min-w-0">
            <h2 id="ov-due" className="flex items-center gap-2 text-base font-bold tracking-tight">
              <IndianRupee className="h-4 w-4" aria-hidden="true" />
              {inr(data.paymentDue)} pending across your bookings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pay by UPI or bank transfer and upload the proof — our team verifies it manually.
            </p>
          </div>
          <Button asChild size="sm">
            <AppLink href="/customer/dashboard/payments">Review payments</AppLink>
          </Button>
        </section>
      ) : null}

      <section aria-labelledby="ov-recent" className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="ov-recent" className="text-lg font-bold tracking-tight">
            Recent bookings
          </h2>
          <Button asChild size="sm" variant="ghost">
            <AppLink href="/customer/dashboard/bookings">View all</AppLink>
          </Button>
        </div>
        <div className="mt-3 space-y-4">
          {data.recent.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
              Your booking history will appear here.
            </p>
          ) : (
            data.recent.map((booking) => <BookingCard key={booking.reference} booking={booking} compact />)
          )}
        </div>
      </section>

      <section aria-labelledby="ov-actions" className="grid gap-4 md:grid-cols-2">
        <h2 id="ov-actions" className="sr-only">
          Requests and support
        </h2>
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-base font-bold tracking-tight">
            <XCircle className="h-4 w-4 text-primary" aria-hidden="true" />
            Cancellation requests
          </h3>
          {data.openCancellations.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No open requests.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.openCancellations.slice(0, 3).map((request) => (
                <li key={request.reference} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    {request.reference} · {request.bookingTitle}
                  </span>
                  <ToneBadge {...cancellationStatusMeta[request.status]} />
                </li>
              ))}
            </ul>
          )}
          <Button asChild size="sm" variant="outline" className="mt-4">
            <AppLink href="/customer/dashboard/cancellations">Manage requests</AppLink>
          </Button>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-base font-bold tracking-tight">
            <LifeBuoy className="h-4 w-4 text-primary" aria-hidden="true" />
            Support
          </h3>
          {data.openSupport.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No open tickets. We reply within one working day.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.openSupport.slice(0, 3).map((request) => (
                <li key={request.reference} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{request.subject}</span>
                  <ToneBadge {...supportStatusMeta[request.status]} />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <AppLink href="/customer/dashboard/support">Support requests</AppLink>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/contact-us">Call our desk</Link>
            </Button>
          </div>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Last synced {formatDate(new Date().toISOString())} · only bookings verified against your contact
        details are shown here.
      </p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" | "ok" }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 truncate text-xl font-bold tracking-tight ${
          tone === "warn" ? "text-amber-600 dark:text-amber-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
