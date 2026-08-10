import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { EmptyState } from "@/components/customer/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientData } from "@/hooks/use-client-data";
import { inr } from "@/content/payment";
import { downloadPdf } from "@/lib/simple-pdf";
import { buildBookingInvoiceLines, bookingInvoiceFileName } from "@/content/booking-documents";
import { formatDate, listCustomerBookings } from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const HREF = "/customer/dashboard/invoices";
const TITLE = "Invoices — South Zoom Tourism";
const DESCRIPTION = "Download invoices for bookings where a payment has been received and verified.";

export const Route = createFileRoute("/customer/dashboard/invoices")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: InvoicesPage,
});

function InvoicesPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Invoices"
      description="An invoice becomes available once a payment on that booking is verified by our accounts team."
    >
      {(profile) => <InvoicesBody profile={profile} />}
    </DashboardShell>
  );
}

function InvoicesBody({ profile }: { profile: CustomerProfile }) {
  const { data, loading } = useClientData(() => listCustomerBookings(profile), [profile.id]);
  if (loading) return <Skeleton className="h-56 w-full rounded-2xl" aria-busy="true" />;

  const invoiceable = (data ?? []).filter((booking) => booking.summary && buildBookingInvoiceLines(booking.summary));

  if (invoiceable.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No invoices yet"
        body="Once a payment is verified against one of your bookings, its invoice can be downloaded from here."
        primary={{ href: "/customer/dashboard/payments", label: "View payments" }}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {invoiceable.map((booking) => (
        <li
          key={booking.reference}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{booking.snapshot.title}</p>
            <p className="text-xs text-muted-foreground">
              {booking.reference} · {formatDate(booking.createdAt)} · paid {inr(booking.paid)} of{" "}
              {inr(booking.snapshot.total)}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              const summary = booking.summary;
              if (!summary) return;
              const lines = buildBookingInvoiceLines(summary);
              if (lines) downloadPdf(lines, bookingInvoiceFileName(summary), `${summary.bookingNumber} invoice`);
            }}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download invoice
          </Button>
        </li>
      ))}
    </ul>
  );
}
