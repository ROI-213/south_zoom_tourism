import { Check, Circle, Dot } from "lucide-react";
import type { TimelineStep } from "@/content/booking-status";

const stateStyles: Record<TimelineStep["state"], string> = {
  done: "border-primary bg-primary text-primary-foreground",
  current: "border-primary bg-background text-primary ring-4 ring-primary/15",
  upcoming: "border-border bg-muted text-muted-foreground",
};

export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative space-y-0" aria-label="Booking progress timeline">
      {steps.map((step, index) => (
        <li key={step.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${stateStyles[step.state]}`}
              aria-hidden="true"
            >
              {step.state === "done" ? (
                <Check className="h-4 w-4" />
              ) : step.state === "current" ? (
                <Dot className="h-6 w-6" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={`w-0.5 flex-1 ${step.state === "done" ? "bg-primary/60" : "bg-border"}`}
                aria-hidden="true"
              />
            ) : null}
          </div>
          <div className={`min-w-0 pb-6 ${index === steps.length - 1 ? "pb-0" : ""}`}>
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {step.label}
              {step.state === "current" ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                  Current
                </span>
              ) : null}
              <span className="sr-only">
                {step.state === "done" ? "completed" : step.state === "upcoming" ? "pending" : ""}
              </span>
            </p>
            <p className="mt-1 text-pretty text-sm text-muted-foreground">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
