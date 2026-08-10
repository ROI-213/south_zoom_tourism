import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, ShieldAlert, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buildUpiPayload, paymentSettings } from "@/content/payment";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2">
        <span className="truncate font-mono text-sm font-semibold text-foreground">{value}</span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={copy}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </Button>
      </dd>
    </div>
  );
}

export function PaymentInstructions({ amount, note }: { amount?: number; note?: string }) {
  const { upi, bank, instructions, warnings } = paymentSettings;
  const payload = buildUpiPayload(amount, note);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">Scan &amp; pay by UPI</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Works with GPay, PhonePe, Paytm, BHIM and any UPI-enabled bank app.
        </p>

        <div className="mt-5 flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            {upi.qrImageUrl ? (
              <img
                src={upi.qrImageUrl}
                alt={upi.qrAlt}
                width={220}
                height={220}
                loading="lazy"
                className="h-[180px] w-[180px] sm:h-[220px] sm:w-[220px]"
              />
            ) : (
              <QRCodeSVG
                value={payload}
                size={180}
                marginSize={2}
                role="img"
                aria-label={upi.qrAlt}
                className="h-[180px] w-[180px] sm:h-[220px] sm:w-[220px]"
              />
            )}
          </div>
          <p className="text-center text-sm font-semibold text-foreground">{upi.payeeName}</p>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href={payload}>
              <Smartphone className="mr-2 h-4 w-4" aria-hidden="true" />
              Open in a UPI app
            </a>
          </Button>
        </div>

        <Separator className="my-5" />
        <dl className="divide-y divide-border">
          <CopyRow label="UPI ID" value={upi.upiId} />
        </dl>
      </Card>

      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground">Bank transfer (IMPS / NEFT / RTGS)</h2>
          <dl className="mt-3 divide-y divide-border">
            <CopyRow label="Account holder" value={bank.accountHolder} />
            <CopyRow label="Bank" value={bank.bankName} />
            <CopyRow label="Account number" value={bank.accountNumber} />
            <CopyRow label="IFSC" value={bank.ifsc} />
            <CopyRow label="Branch" value={bank.branch} />
            <CopyRow label="Account type" value={bank.accountType} />
          </dl>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground">How to pay</h2>
          <ol className="mt-3 space-y-2.5">
            {instructions.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <ShieldAlert className="h-4 w-4 text-destructive" aria-hidden="true" />
            Before you pay
          </h2>
          <ul className="mt-3 space-y-2">
            {warnings.map((warning) => (
              <li key={warning} className="text-sm text-muted-foreground">
                • {warning}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
