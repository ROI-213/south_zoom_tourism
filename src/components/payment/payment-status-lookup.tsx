import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  formatPaidOn,
  inr,
  loadPaymentSubmission,
  paymentStatusMeta,
  type PaymentSubmissionRecord,
} from "@/content/payment";

export function PaymentStatusLookup() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<PaymentSubmissionRecord | null>(null);
  const [searched, setSearched] = useState(false);

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = value.trim().toUpperCase();
    setResult(ref ? loadPaymentSubmission(ref) : null);
    setSearched(true);
  };

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Check a payment status</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the payment reference we issued (for example SZT-PAY-260729-1234).
      </p>

      <form onSubmit={lookup} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="pay-lookup" className="sr-only">
            Payment reference
          </Label>
          <Input
            id="pay-lookup"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="SZT-PAY-…"
          />
        </div>
        <Button type="submit" variant="outline">
          <Search className="mr-2 h-4 w-4" aria-hidden="true" />
          Check status
        </Button>
      </form>

      <div aria-live="polite" className="mt-4">
        {result ? (
          <div className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-foreground">{result.reference}</span>
              <Badge variant="outline">{paymentStatusMeta[result.status].label}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {inr(result.amount)} · paid on {formatPaidOn(result.paidOn)} · booking{" "}
              {result.bookingNumber}
            </p>
            {result.rejectionReason ? (
              <p className="mt-2 text-sm text-destructive">Reason: {result.rejectionReason}</p>
            ) : null}
          </div>
        ) : searched ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            No payment found for that reference on this device. If you submitted it elsewhere, call
            us and we'll look it up.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
