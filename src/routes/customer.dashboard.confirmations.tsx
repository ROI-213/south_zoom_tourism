import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileCheck2 } from "lucide-react";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { EmptyState } from "@/components/customer/dashboard/empty-state";
import { BookingStatusBadge } from "@/components/customer/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientData } from "@/hooks/use-client-data";
import { downloadPdf } from "@/lib/simple-pdf";
import { buildBookingConfirmationLines, bookingConfirmationFileName } from "@/content/booking-documents";
import { deriveAccessToken } from "@/content/booking-access";
import { formatDate, listCustomerBookings } from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const HREF = "/customer/dashboard/confirmations";
const TITLE = "Confirmations & Vouchers — South Zoom Tourism";
const DESCRIPTION = "Confirmation letters and vouchers for every booking on your account.";

export const Route = createFileRoute("/customer/dashboard/confirmations")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: ConfirmationsPage,
});

function ConfirmationsPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Confirmations"
      description="Carry these when you travel — each document link is checked against your verified contact number."
    >
      {(profile) => <ConfirmationsBody profile={profile} />}
    </DashboardShell>
  );
}

function ConfirmationsBody({ profile }: { profile: CustomerProfile }) {
  const { data, loading } = useClientData(() => listCustomerBookings(profile), [profile.id]);
  if (loading) return <Skeleton className="h-56 w-full rounded-2xl" aria-busy="true" />;

  const withDocs = (data ?? []).filter((booking) => booking.summary);

  if (withDocs.length === 0) {
    return (
      <EmptyState
        icon={FileCheck2}
        title="No documents yet"
        body="Confirmation letters and hotel vouchers appear here once a booking is processed by our team."
        primary={{ href: "/customer/dashboard/bookings", label: "View bookings" }}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {withDocs.map((booking) => {
        const summary = booking.summary!;
        return (
          <li key={booking.reference} className="min-w-0 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{booking.snapshot.title}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.reference} · {booking.snapshot.travelWindow} · issued {formatDate(booking.createdAt)}
                </p>
              </div>
              <BookingStatusBadge status={booking.statusLabel} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() =>
                  downloadPdf(
                    buildBookingConfirmationLines(summary),
                    bookingConfirmationFileName(summary),
                    `${summary.bookingNumber} confirmation`,
                  )
                }
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download confirmation
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link
                  to="/booking-confirmation/$bookingNumber"
                  params={{ bookingNumber: booking.reference }}
                  search={{ t: deriveAccessToken(booking.reference, booking.ownerPhone) }}
                >
                  Open secure booking page
                </Link>
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
