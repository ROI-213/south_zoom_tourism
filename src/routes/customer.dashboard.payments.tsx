import { createFileRoute, Link } from "@tanstack/react-router";
import { IndianRupee } from "lucide-react";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { EmptyState } from "@/components/customer/dashboard/empty-state";
import { ToneBadge } from "@/components/customer/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useClientData } from "@/hooks/use-client-data";
import { inr, paymentStatusMeta } from "@/content/payment";
import { formatDate, formatDateTime, listCustomerBookings, listCustomerPayments } from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const HREF = "/customer/dashboard/payments";
const TITLE = "Payments — South Zoom Tourism";
const DESCRIPTION = "Amounts due, submitted payment proofs and their verification status.";

export const Route = createFileRoute("/customer/dashboard/payments")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: PaymentsPage,
});

function PaymentsPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Payments"
      description="What is due, what you have paid, and where each payment proof stands."
    >
      {(profile) => <PaymentsBody profile={profile} />}
    </DashboardShell>
  );
}

function PaymentsBody({ profile }: { profile: CustomerProfile }) {
  const { data, loading } = useClientData(
    () => ({ bookings: listCustomerBookings(profile), payments: listCustomerPayments(profile) }),
    [profile.id],
  );

  if (loading || !data) return <Skeleton className="h-64 w-full rounded-2xl" aria-busy="true" />;

  const due = data.bookings.filter((booking) => booking.pending > 0);

  return (
    <div className="space-y-8">
      <section aria-labelledby="pay-due" className="min-w-0">
        <h2 id="pay-due" className="text-lg font-bold tracking-tight">
          Amounts due
        </h2>
        {due.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
            Nothing pending right now.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {due.map((booking) => (
              <li
                key={booking.reference}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{booking.snapshot.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.reference} · total {inr(booking.snapshot.total)} · paid {inr(booking.paid)}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link
                    to="/qr-payment"
                    search={{
                      booking: booking.reference,
                      amount: String(booking.pending),
                      name: booking.ownerName,
                      phone: booking.ownerPhone,
                    }}
                  >
                    Pay {inr(booking.pending)}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pay-history" className="min-w-0">
        <h2 id="pay-history" className="text-lg font-bold tracking-tight">
          Payment history
        </h2>
        {data.payments.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={IndianRupee}
              title="No payments submitted yet"
              body="When you transfer an advance or the balance, upload the proof and it will be listed here with its verification status."
              primary={{ href: "/qr-payment", label: "Submit a payment" }}
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {data.payments.map((payment) => (
              <li key={payment.reference} className="min-w-0 rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {inr(payment.amount)} · {payment.bookingNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {payment.method} · paid on {formatDate(payment.paidOn)} · ref {payment.reference}
                    </p>
                  </div>
                  <ToneBadge
                    label={paymentStatusMeta[payment.status].label}
                    tone={paymentStatusMeta[payment.status].tone}
                  />
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Transaction ID</dt>
                    <dd className="break-words font-medium">{payment.transactionId}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Submitted</dt>
                    <dd className="font-medium">{formatDateTime(payment.createdAt)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Proof</dt>
                    <dd className="break-words font-medium">
                      {payment.screenshot ? payment.screenshot.fileName : "Not attached"}
                    </dd>

                  </div>
                </dl>
                {payment.rejectionReason ? (
                  <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                    {payment.rejectionReason}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
