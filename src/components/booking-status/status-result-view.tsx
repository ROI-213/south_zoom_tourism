import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileDown,
  Info,
  ListChecks,
  MessageCircle,
  Phone,
  RotateCcw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { StatusTimeline } from "@/components/booking-status/status-timeline";
import {
  formatTrackedDate,
  requestResend,
  stageMeta,
  type StatusResult,
} from "@/content/booking-status";
import { inr } from "@/content/booking-summary";
import { company, telLink, waLink } from "@/content/site";

export function StatusResultView({
  result,
  onReset,
}: {
  result: StatusResult;
  onReset: () => void;
}) {
  const [resent, setResent] = useState<string | null>(null);
  const meta = stageMeta(result.stage);
  const payments = result.payments;

  const facts: { icon: typeof CalendarDays; label: string; value: string }[] = [
    { icon: CalendarDays, label: "Travel dates", value: result.travelWindow || "To be confirmed" },
    { icon: Users, label: "Guests", value: result.guestsLabel || "Shared with our team" },
    { icon: Info, label: "Requested on", value: formatTrackedDate(result.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="status-heading"
        className="rounded-2xl border border-border bg-card p-5 sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {result.serviceLabel} · <span className="font-mono">{result.reference}</span>
            </p>
            <h2 id="status-heading" className="mt-1 text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
              {meta.label}
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
              {result.note || meta.help}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Check another
          </Button>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-border bg-background p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Service
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold">{result.serviceTitle}</dd>
            {result.serviceSubtitle ? (
              <dd className="text-sm text-muted-foreground">{result.serviceSubtitle}</dd>
            ) : null}
          </div>
          <div className="min-w-0 rounded-xl border border-border bg-background p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Verified contact
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold">{result.maskedName}</dd>
            <dd className="break-words text-sm text-muted-foreground">
              {[result.maskedPhone, result.maskedEmail].filter(Boolean).join(" · ")}
            </dd>
          </div>
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0 rounded-xl border border-border bg-background p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <fact.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {fact.label}
              </dt>
              <dd className="mt-1 break-words text-sm font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="timeline-heading"
        className="rounded-2xl border border-border bg-card p-5 sm:p-7"
      >
        <h3 id="timeline-heading" className="text-lg font-bold tracking-tight">
          Progress
        </h3>
        <div className="mt-5">
          <StatusTimeline steps={result.timeline} />
        </div>
      </section>

      {payments ? (
        <section
          aria-labelledby="payment-heading"
          className="rounded-2xl border border-border bg-card p-5 sm:p-7"
        >
          <h3
            id="payment-heading"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
            Payment state
          </h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total", value: inr(payments.total) },
              { label: "Received", value: inr(payments.paid) },
              { label: "Under verification", value: inr(payments.underVerification) },
              { label: "Pending", value: inr(payments.pending) },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-xl border border-border bg-background p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 break-words text-base font-bold">{item.value}</dd>
              </div>
            ))}
          </dl>
          {payments.pending > 0 ? (
            <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
              <AppLink
                href={`/qr-payment?booking=${encodeURIComponent(result.reference)}&amount=${payments.pending}`}
              >
                Pay pending amount
              </AppLink>
            </Button>
          ) : null}
        </section>
      ) : null}

      {result.pendingActions.length ? (
        <section
          aria-labelledby="actions-heading"
          className="rounded-2xl border border-border bg-card p-5 sm:p-7"
        >
          <h3 id="actions-heading" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
            Pending actions
          </h3>
          <ul className="mt-4 space-y-2">
            {result.pendingActions.map((action) => (
              <li key={action} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 text-pretty text-muted-foreground">{action}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        aria-labelledby="docs-heading"
        className="rounded-2xl border border-border bg-card p-5 sm:p-7"
      >
        <h3 id="docs-heading" className="text-lg font-bold tracking-tight">
          Documents &amp; support
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {result.confirmationHref ? (
            <Button asChild className="w-full sm:w-auto">
              <a href={result.confirmationHref}>
                <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                Open secure booking page
              </a>
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              requestResend(result.reference, "whatsapp");
              setResent("whatsapp");
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Resend confirmation on WhatsApp
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <a href={telLink()}>
              <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
              Call {company.phone}
            </a>
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <a
              href={waLink(`Hi, please share an update on ${result.reference}.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat with support
            </a>
          </Button>
        </div>
        {resent ? (
          <p role="status" className="mt-4 text-sm font-medium text-primary">
            Request received — our team will resend the confirmation and receipt to the contact on
            file within office hours.
          </p>
        ) : null}
        {!result.documentsAvailable ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Downloadable documents are issued once the booking is confirmed. Until then this page shows
            your live status.
          </p>
        ) : null}
      </section>
    </div>
  );
}
