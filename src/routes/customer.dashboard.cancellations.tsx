import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { EmptyState } from "@/components/customer/dashboard/empty-state";
import { ToneBadge } from "@/components/customer/dashboard/status-badge";
import { CancellationDialog } from "@/components/customer/dashboard/cancellation-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientData } from "@/hooks/use-client-data";
import { inr } from "@/content/payment";
import {
  cancellationStatusMeta,
  formatDateTime,
  listCancellations,
  listCustomerBookings,
  type CustomerBooking,
} from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const HREF = "/customer/dashboard/cancellations";
const TITLE = "Cancellation Requests — South Zoom Tourism";
const DESCRIPTION = "Raise and track cancellation or reschedule requests. Refunds are always confirmed by our team.";

export const Route = createFileRoute("/customer/dashboard/cancellations")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: CancellationsPage,
});

function CancellationsPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Cancellations"
      description="Requests are reviewed against the policy on your booking. Nothing is refunded automatically."
    >
      {(profile) => <CancellationsBody profile={profile} />}
    </DashboardShell>
  );
}

function CancellationsBody({ profile }: { profile: CustomerProfile }) {
  const { data, loading, reload } = useClientData(
    () => ({ requests: listCancellations(profile), bookings: listCustomerBookings(profile) }),
    [profile.id],
  );
  const [target, setTarget] = useState<CustomerBooking | null>(null);
  const [picking, setPicking] = useState(false);

  if (loading || !data) return <Skeleton className="h-56 w-full rounded-2xl" aria-busy="true" />;

  const cancellable = data.bookings.filter(
    (booking) => booking.statusLabel !== "cancelled" && booking.statusLabel !== "refunded",
  );

  return (
    <div className="space-y-6">
      {cancellable.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-base font-bold tracking-tight">Request a cancellation or change</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the booking you need to change. Our team replies with the applicable policy.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cancellable.map((booking) => (
              <Button
                key={booking.reference}
                size="sm"
                variant={picking ? "outline" : "outline"}
                onClick={() => {
                  setTarget(booking);
                  setPicking(true);
                }}
              >
                {booking.reference}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {data.requests.length === 0 ? (
        <EmptyState
          icon={XCircle}
          title="No cancellation requests"
          body="If your plans change, raise a request from any booking and we will confirm the policy and any refund in writing."
          primary={{ href: "/customer/dashboard/bookings", label: "View bookings" }}
        />
      ) : (
        <ul className="space-y-3">
          {data.requests.map((request) => (
            <li key={request.reference} className="min-w-0 rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {request.reference} · {request.bookingReference}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold">{request.bookingTitle}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {request.preferredResolution === "cancel" ? "Cancellation" : "Reschedule"} · {request.reason} ·
                    raised {formatDateTime(request.createdAt)}
                  </p>
                </div>
                <ToneBadge {...cancellationStatusMeta[request.status]} />
              </div>
              {request.details ? (
                <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2.5 text-sm">{request.details}</p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                {request.refundAmount != null
                  ? `Refund confirmed: ${inr(request.refundAmount)}.`
                  : "Refund amount, if any, is confirmed by our team after review."}
                {request.adminNote ? ` ${request.adminNote}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <CancellationDialog
        profile={profile}
        booking={picking ? target : null}
        onOpenChange={(open) => {
          if (!open) {
            setPicking(false);
            setTarget(null);
          }
        }}
        onCreated={reload}
      />
    </div>
  );
}
