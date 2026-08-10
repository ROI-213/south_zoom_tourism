import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { EmptyState } from "@/components/customer/dashboard/empty-state";
import { BookingStatusBadge } from "@/components/customer/dashboard/status-badge";
import { StatusTimeline } from "@/components/booking-status/status-timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { useClientData } from "@/hooks/use-client-data";
import { inr } from "@/content/payment";
import {
  stageMeta,
  trackingStages,
  type TimelineStep,
  type TrackingStage,
} from "@/content/booking-status";
import {
  formatDate,
  listCustomerBookings,
  type CustomerBooking,
} from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const HREF = "/customer/dashboard/status";
const TITLE = "Booking Status — South Zoom Tourism";
const DESCRIPTION = "Live progress of every booking reference on your account, from request to completion.";

export const Route = createFileRoute("/customer/dashboard/status")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: DashboardStatusPage,
});

const LINEAR: TrackingStage[] = [
  "new",
  "contacted",
  "quotation-sent",
  "awaiting-confirmation",
  "confirmed",
  "advance-paid",
  "fully-paid",
  "in-progress",
  "completed",
];

/** Maps the booking's own status + payment ledger onto the shared tracking stages. */
function deriveStage(booking: CustomerBooking): TrackingStage {
  const status = booking.statusLabel.toLowerCase();
  if (status.includes("refund")) return "refunded";
  if (status.includes("cancel")) return "cancelled";
  if (booking.snapshot.total > 0 && booking.paid >= booking.snapshot.total) return "fully-paid";
  if (booking.paid > 0) return "advance-paid";
  if (status.includes("confirm")) return "confirmed";
  if (booking.underVerification > 0) return "awaiting-confirmation";
  if (status.includes("quot")) return "quotation-sent";
  if (status.includes("contact")) return "contacted";
  return "new";
}

function buildSteps(stage: TrackingStage): TimelineStep[] {
  const terminal = stage === "cancelled" || stage === "refunded";
  const ids = terminal ? [...LINEAR.slice(0, 5), stage] : LINEAR;
  const currentIndex = ids.indexOf(stage);
  return ids.map((id, index) => {
    const meta = stageMeta(id);
    return {
      id,
      label: meta.label,
      description: meta.description,
      state: index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
    };
  });
}

function DashboardStatusPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Booking status"
      description="Follow each reference from request to completion — the same stages our operations team uses."
    >
      {(profile) => <StatusBody profile={profile} />}
    </DashboardShell>
  );
}

function StatusBody({ profile }: { profile: CustomerProfile }) {
  const { data, loading } = useClientData(() => listCustomerBookings(profile), [profile.id]);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-2xl" aria-busy="true" />;
  }

  const bookings = data ?? [];
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nothing to track yet"
        body="Booking references appear here as soon as a request is submitted. Guest bookings can be tracked with the public tracker."
        primary={{ href: "/booking-status", label: "Public tracker" }}
        secondary={{ href: "/services", label: "Explore services" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {trackingStages.length} tracking stages · updated by our reservations team.
      </p>
      {bookings.map((booking) => {
        const stage = deriveStage(booking);
        const meta = stageMeta(stage);
        return (
          <section
            key={booking.reference}
            aria-label={`Status of ${booking.reference}`}
            className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {booking.reference} · requested {formatDate(booking.createdAt)}
                </p>
                <h2 className="mt-0.5 truncate text-base font-bold tracking-tight">
                  {booking.snapshot.title}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{booking.snapshot.travelWindow}</p>
              </div>
              <BookingStatusBadge status={meta.label} />
            </div>

            <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2.5 text-sm text-muted-foreground">
              {meta.help}
            </p>

            <div className="mt-4">
              <StatusTimeline steps={buildSteps(stage)} />
            </div>

            {booking.pending > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-sm">
                  <span className="text-muted-foreground">Pending </span>
                  <span className="font-bold">{inr(booking.pending)}</span>
                </p>
                <Button asChild size="sm" variant="outline">
                  <AppLink href="/customer/dashboard/payments">Go to payments</AppLink>
                </Button>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
