import { Info } from "lucide-react";
import {
  formatStayDay,
  hotelBookingSettings,
  inr,
  type PaymentSplit,
} from "@/content/hotel-booking";
import type { RoomQuote } from "@/content/room-details";

export function StayPriceSummary({
  quote,
  split = "advance",
  compact = false,
  showNights = true,
}: {
  quote: RoomQuote | null;
  split?: PaymentSplit;
  compact?: boolean;
  showNights?: boolean;
}) {
  if (!quote) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Choose a room and rate plan to see the nightly break-up, taxes and total.
      </div>
    );
  }

  const advance = Math.round((quote.total * hotelBookingSettings.advancePercent) / 100);
  const payNow = split === "full" ? quote.total : advance;

  return (
    <div className="min-w-0 rounded-xl border border-border bg-muted/30 p-4">
      {showNights ? (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nightly rates ({quote.rooms} room{quote.rooms === 1 ? "" : "s"})
          </p>
          <ul className="mt-1.5 space-y-1">
            {quote.nights.map((night) => (
              <li
                key={night.date}
                className="flex items-baseline justify-between gap-3 text-xs"
              >
                <span className="min-w-0 truncate text-muted-foreground">
                  {formatStayDay(night.date)}
                  {night.peak ? " · peak" : ""}
                </span>
                <span className="shrink-0 tabular-nums">
                  {inr(night.planRate * quote.rooms)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <dl className="space-y-2 border-t border-border pt-3">
        <Line
          label={`Room tariff — ${quote.rooms} × ${quote.nightCount} night${quote.nightCount === 1 ? "" : "s"}`}
          amount={quote.roomSubtotal}
        />
        {quote.discountAmount > 0 ? (
          <Line label={`Rate plan discount (${quote.discountPercent}%)`} amount={-quote.discountAmount} />
        ) : null}
        {quote.extraAdultTotal > 0 ? (
          <Line label="Extra adult charges" amount={quote.extraAdultTotal} />
        ) : null}
        {quote.extraChildTotal > 0 ? (
          <Line label="Child charges" amount={quote.extraChildTotal} />
        ) : null}
        {quote.serviceCharge > 0 ? (
          <Line label="Service charge" amount={quote.serviceCharge} />
        ) : null}
        <Line label={`GST & taxes (${quote.taxPercent}%)`} amount={quote.taxAmount} />
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-sm font-bold">Total payable</span>
        <span className="text-lg font-extrabold tabular-nums text-primary">
          {inr(quote.total)}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {split === "full"
            ? "Paying in full now"
            : `Advance now (${hotelBookingSettings.advancePercent}%)`}
        </span>
        <span className="text-xs font-semibold tabular-nums">{inr(payNow)}</span>
      </div>
      {quote.total - payNow > 0 ? (
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Balance at check-in</span>
          <span className="text-xs font-semibold tabular-nums">{inr(quote.total - payNow)}</span>
        </div>
      ) : null}

      {!compact ? (
        <p className="mt-3 flex gap-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            {quote.refundable
              ? quote.cancellationTerms || "Free cancellation as per hotel policy."
              : "Non-refundable rate — the amount paid is not returned on cancellation."}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function Line({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="min-w-0 text-sm">{label}</dt>
      <dd className="shrink-0 text-sm font-semibold tabular-nums">{inr(amount)}</dd>
    </div>
  );
}
