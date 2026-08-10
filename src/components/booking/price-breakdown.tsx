import { Info } from "lucide-react";
import { formatRupees } from "@/content/package-details";
import { bookingSettings, type BookingEstimate } from "@/content/package-booking";

export function PriceBreakdown({
  estimate,
  showAdvance = true,
}: {
  estimate: BookingEstimate;
  showAdvance?: boolean;
}) {
  if (!estimate.available) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        This package is quoted on request. Submit the booking request and our team will send a
        written quote with the full break-up.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <dl className="space-y-2.5">
        {estimate.lines.map((line) => (
          <div key={line.label} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <dt className="text-sm font-medium">{line.label}</dt>
              {line.note ? (
                <p className="text-xs text-muted-foreground">{line.note}</p>
              ) : null}
            </div>
            <dd className="shrink-0 text-sm font-semibold tabular-nums">
              {formatRupees(line.amount)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-sm font-bold">Estimated total</span>
        <span className="text-lg font-extrabold tabular-nums text-primary">
          {formatRupees(estimate.total)}
        </span>
      </div>

      {showAdvance ? (
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Advance on confirmation ({bookingSettings.advancePercent}%)
          </span>
          <span className="text-xs font-semibold tabular-nums">{formatRupees(estimate.advance)}</span>
        </div>
      ) : null}

      {estimate.manualChildren > 0 ? (
        <p className="mt-3 flex gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            {estimate.manualChildren} child age{estimate.manualChildren > 1 ? "s are" : " is"} outside
            our configured age bands, so that portion is confirmed manually by our team.
          </span>
        </p>
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground">
        Estimate only — taxes on the quoted components are included, but the final amount is
        confirmed in writing before any payment.
      </p>
    </div>
  );
}
