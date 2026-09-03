import { useState } from "react";
import { Clock, Download, Loader2, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { downloadPdf, logoToJpegDataUrl } from "@/lib/simple-pdf";
import sztLogo from "@/assets/szt-logo.png";
import {
  acknowledgementFileName,
  buildAcknowledgementLines,
  resolveBookingBalance,
  standardPaymentTerms,
} from "@/content/payment-documents";
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
  const [downloading, setDownloading] = useState(false);
  const status = paymentStatusMeta[record.status];
  const balanceInfo = resolveBookingBalance(record);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const logoData = await logoToJpegDataUrl(sztLogo || "/szt-logo.png", 220);
      downloadPdf(
        buildAcknowledgementLines(record),
        acknowledgementFileName(record),
        `Payment acknowledgement ${record.reference}`,
        logoData,
      );
    } catch {
      downloadPdf(
        buildAcknowledgementLines(record),
        acknowledgementFileName(record),
        `Payment acknowledgement ${record.reference}`,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <img src={sztLogo} alt="South Zoom Tourism" className="h-10 w-auto object-contain rounded-md" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Payment proof received</h2>
            <p className="text-xs text-muted-foreground">
              Keep this reference for any follow-up.
            </p>
          </div>
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
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Amount declared (Paid)</dt>
          <dd className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{inr(record.amount)}</dd>
        </div>
        {balanceInfo.totalFare != null && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Total booking fare</dt>
            <dd className="text-sm font-bold text-foreground">{inr(balanceInfo.totalFare)}</dd>
          </div>
        )}
        {balanceInfo.pendingBalance != null && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Pending balance amount (Pay to driver / hotel)
            </dt>
            <dd className="text-lg font-extrabold text-amber-800 dark:text-amber-200 mt-0.5 flex flex-wrap items-center gap-2">
              <span>{inr(balanceInfo.pendingBalance)}</span>
              <span className="text-xs font-normal text-muted-foreground">
                (Remaining balance to be paid directly during your journey)
              </span>
            </dd>
          </div>
        )}
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

      <details className="mt-4 rounded-lg border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground group">
        <summary className="cursor-pointer font-semibold text-foreground flex items-center justify-between list-none select-none">
          <span className="flex items-center gap-2">
            <span>📋</span>
            <span>Terms & Conditions for Booking & Payments</span>
          </span>
          <span className="text-[11px] text-primary font-medium group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <ul className="mt-2.5 list-decimal list-inside space-y-1 text-[11px] leading-relaxed border-t border-border/60 pt-2 text-foreground/85">
          {standardPaymentTerms.map((term, i) => (
            <li key={i}>{term}</li>
          ))}
        </ul>
      </details>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          disabled={downloading}
          onClick={handleDownload}
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Generating PDF…
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Download acknowledgement
            </>
          )}
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
