import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MessageCircle,
  Phone,
  Printer,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLink } from "@/components/common/app-link";
import { maskEmail, maskPhone } from "@/content/booking-access";
import {
  bookingShareMessage,
  bookingStatusMeta,
  inr,
  summaryNextSteps,
  type BookingSummary,
} from "@/content/booking-summary";
import {
  bookingConfirmationFileName,
  bookingInvoiceFileName,
  buildBookingConfirmationLines,
  buildBookingInvoiceLines,
} from "@/content/booking-documents";
import { downloadPdf } from "@/lib/simple-pdf";
import { company, telLink, waLink } from "@/content/site";
import { paymentStatusMeta } from "@/content/payment";

const toneClass: Record<string, string> = {
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  green: "border-primary/40 bg-primary/10 text-primary",
  red: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

function StatusIcon({ tone }: { tone: string }) {
  if (tone === "green") return <CheckCircle2 className="h-7 w-7 shrink-0 text-primary" aria-hidden="true" />;
  if (tone === "red") return <XCircle className="h-7 w-7 shrink-0 text-destructive" aria-hidden="true" />;
  if (tone === "muted") return <RefreshCw className="h-7 w-7 shrink-0 text-muted-foreground" aria-hidden="true" />;
  return <Clock className="h-7 w-7 shrink-0 text-amber-600" aria-hidden="true" />;
}

function KeyValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background p-3">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

export function BookingSummaryView({
  summary,
  onRefresh,
  refreshing,
}: {
  summary: BookingSummary;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const meta = bookingStatusMeta[summary.status];
  const invoiceLines = buildBookingInvoiceLines(summary);
  const p = summary.payments;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card border px-4 py-2.5 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{company.name}</span>
          <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/40 bg-primary/5">
            Verified Operator
          </Badge>
        </div>
        <span className="text-muted-foreground font-medium">{company.msmeRegistration}</span>
      </div>

      <section
        aria-labelledby="booking-heading"
        className={`rounded-2xl border p-5 sm:p-7 ${toneClass[meta.tone]} print:border-black`}
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
          <StatusIcon tone={meta.tone} />
          <div className="min-w-0">
            <h1
              id="booking-heading"
              className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
            >
              {meta.headline}
            </h1>
            <p className="mt-2 text-pretty text-sm text-foreground/80">
              {summary.statusNote || meta.description}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KeyValue label="Booking number">
            <span className="font-mono text-sm font-bold">{summary.bookingNumber}</span>
          </KeyValue>
          <KeyValue label="Status">
            <Badge variant="secondary">{meta.label}</Badge>
          </KeyValue>
          <KeyValue label="Customer">{summary.customerName}</KeyValue>
          <KeyValue label="Booked on">
            {new Date(summary.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </KeyValue>
        </dl>
      </section>

      {/* Actions */}
      <section aria-labelledby="actions-heading" className="rounded-2xl border border-border bg-card p-5 print:hidden">
        <h2 id="actions-heading" className="text-base font-bold">
          Documents and actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() =>
              downloadPdf(
                buildBookingConfirmationLines(summary),
                bookingConfirmationFileName(summary),
                `Booking ${summary.bookingNumber}`,
              )
            }
          >
            <Download aria-hidden="true" /> Download confirmation
          </Button>
          {invoiceLines ? (
            <Button
              variant="outline"
              onClick={() =>
                downloadPdf(invoiceLines, bookingInvoiceFileName(summary), `Invoice ${summary.bookingNumber}`)
              }
            >
              <FileText aria-hidden="true" /> Download invoice
            </Button>
          ) : (
            <Button variant="outline" disabled title="An invoice is issued once the booking is confirmed">
              <FileText aria-hidden="true" /> Invoice not yet issued
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={waLink(bookingShareMessage(summary))} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" /> Share on WhatsApp
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" /> Print
          </Button>
          <Button variant="ghost" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw aria-hidden="true" className={refreshing ? "animate-spin" : undefined} /> Refresh
            status
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* Service */}
          <section aria-labelledby="service-heading" className="rounded-2xl border border-border bg-card p-5">
            <h2 id="service-heading" className="text-base font-bold">
              {summary.serviceLabel}
            </h2>
            <p className="mt-1 text-lg font-extrabold tracking-tight">{summary.serviceTitle}</p>
            <p className="text-sm text-muted-foreground">{summary.serviceSubtitle}</p>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <KeyValue label="Travel dates">{summary.travelWindow}</KeyValue>
              <KeyValue label="Guests">{summary.guestsLabel}</KeyValue>
              {summary.detailRows.map((row) => (
                <KeyValue key={row.label} label={row.label}>
                  {row.value}
                </KeyValue>
              ))}
            </dl>

            {summary.productHref && (
              <Button asChild variant="link" className="mt-2 h-auto p-0 print:hidden">
                <AppLink href={summary.productHref}>View this {summary.kind === "hotel" ? "hotel" : "package"}</AppLink>
              </Button>
            )}
          </section>

          {/* Next steps */}
          <section aria-labelledby="next-heading" className="rounded-2xl border border-border bg-card p-5">
            <h2 id="next-heading" className="text-base font-bold">
              What happens next
            </h2>
            <ol className="mt-4 space-y-4">
              {summaryNextSteps(summary).map((step, index) => (
                <li key={step.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          {/* Payment */}
          <section aria-labelledby="payment-heading" className="rounded-2xl border border-border bg-card p-5">
            <h2 id="payment-heading" className="text-base font-bold">
              Payment summary
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Booking value</dt>
                <dd className="font-semibold">{inr(p.total)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Amount paid</dt>
                <dd className="font-semibold text-primary">{inr(p.paid)}</dd>
              </div>
              {p.underVerification > 0 && (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Under verification</dt>
                  <dd className="font-semibold">{inr(p.underVerification)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
                <dt className="font-semibold">Pending amount</dt>
                <dd className="text-base font-extrabold">{inr(p.pending)}</dd>
              </div>
            </dl>

            {p.entries.length > 0 && (
              <ul className="mt-4 space-y-2">
                {p.entries.map((entry) => (
                  <li key={entry.reference} className="rounded-xl border border-border p-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-semibold">{entry.reference}</span>
                      <Badge variant="outline">{paymentStatusMeta[entry.status].label}</Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {inr(entry.amount)} · {entry.paidOn} · {entry.method}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {p.pending > 0 && summary.status !== "cancelled" && summary.status !== "refunded" && (
              <Button asChild className="mt-4 w-full print:hidden">
                <AppLink
                  href={`/qr-payment?booking=${encodeURIComponent(summary.bookingNumber)}&amount=${p.pending}`}
                >
                  Pay pending amount
                </AppLink>
              </Button>
            )}
          </section>

          {/* Contact on file + support */}
          <section aria-labelledby="support-heading" className="rounded-2xl border border-border bg-card p-5">
            <h2 id="support-heading" className="text-base font-bold">
              Support
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact on file: {maskPhone(summary.phone)}
              {summary.email ? ` · ${maskEmail(summary.email)}` : ""}
            </p>
            <div className="mt-4 flex flex-col gap-2 print:hidden">
              <Button asChild variant="outline">
                <a href={telLink()}>
                  <Phone aria-hidden="true" /> Call {company.phone}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={waLink(`Support needed for booking ${summary.bookingNumber}`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle aria-hidden="true" /> WhatsApp support
                </a>
              </Button>
              <Button asChild variant="ghost">
                <AppLink href="/contact-us">Contact form</AppLink>
              </Button>
            </div>
            <div className="mt-4 border-t border-border pt-3 text-xs space-y-1">
              <p className="font-semibold text-foreground">{company.name}</p>
              <p className="text-muted-foreground font-medium">{company.msmeRegistration}</p>
              <p className="text-muted-foreground">
                {company.address} · {company.email}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
