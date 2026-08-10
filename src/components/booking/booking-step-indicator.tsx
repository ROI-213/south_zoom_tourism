import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { bookingSteps } from "@/content/package-booking";

export function BookingStepIndicator({
  current,
  maxReached,
  onJump,
}: {
  current: number;
  maxReached: number;
  onJump: (index: number) => void;
}) {
  const total = bookingSteps.length;
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Step {current + 1} of {total}
        </p>
        <p className="text-xs text-muted-foreground">{pct}% complete</p>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Booking progress"
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {bookingSteps.map((step, i) => {
          const done = i < maxReached && i < current;
          const active = i === current;
          return (
            <li key={step.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onJump(i)}
                disabled={i > maxReached}
                className={cn(
                  "w-full rounded-lg border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="truncate text-xs font-semibold">{step.title}</span>
                </span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">{step.hint}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
