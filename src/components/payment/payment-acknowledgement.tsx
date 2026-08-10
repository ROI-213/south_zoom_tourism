import { Clock, Download, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { downloadPdf } from "@/lib/simple-pdf";
import { acknowledgementFileName, buildAcknowledgementLines } from "@/content/payment-documents";
import {
  formatPaidOn,
  inr,
  paymentSettings,
  paymentStatusMeta,
  paymentWhatsAppMessage,
  type PaymentSubmissionRecord,
} from "@/content/payment";
import { company, telLink, waLink } from "@/content/site";

const toneClass: Record<string, string> = {
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  red: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function PaymentAcknowledgement({
  record,
  onSubmitAnother,
}: {
  record: PaymentSubmissionRecord;
  onSubmitAnother: () => void;
}) {
  const status = paymentStatusMeta[record.status];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Payment proof received</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep this reference for any follow-up.
          </p>
        </div>
        <Badge variant="outline" className={toneClass[status.tone]}>
          {status.label}
        </Badge>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Payment reference</dt>
          <dd className="font-mono text-base font-bold text-foreground">{record.reference}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Booking number</dt>
          <dd className="font-mono text-sm font-semibold text-foreground">{record.bookingNumber}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Amount declared</dt>
          <dd className="text-sm font-semibold text-foreground">{inr(record.amount)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Paid on</dt>
          <dd className="text-sm font-semibold text-foreground">{formatPaidOn(record.paidOn)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Transaction ID</dt>
          <dd className="break-all font-mono text-sm font-semibold text-foreground">{record.transactionId}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Proof</dt>
          <dd className="truncate text-sm font-semibold text-foreground">
            {record.screenshot ? record.screenshot.fileName : "Not attached"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Our accounts team usually verifies within {paymentSettings.verificationSlaHours} working
          hours ({paymentSettings.deskHours}). Your booking is not marked paid until then
          {record.acknowledgementSentAt ? ". A copy of this acknowledgement is on its way to you." : "."}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          onClick={() =>
            downloadPdf(
              buildAcknowledgementLines(record),
              acknowledgementFileName(record),
              `Payment acknowledgement ${record.reference}`,
            )
          }
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Download acknowledgement
        </Button>
        <Button asChild variant="outline">
          <a href={waLink(paymentWhatsAppMessage(record))} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Send on WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={telLink()}>
            <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
            Call {company.phone}
          </a>
        </Button>
        <Button type="button" variant="ghost" onClick={onSubmitAnother}>
          Submit another payment
        </Button>
      </div>
    </Card>
  );
}
