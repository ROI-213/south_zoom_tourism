import { BadgeCheck } from "lucide-react";
import type { HotelTrustPoint, HotelProcessStep } from "@/content/hotels";

export function HotelTrustSection({ points }: { points: HotelTrustPoint[] }) {
  if (points.length === 0) return null;
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {points.map((p) => (
        <li key={p.id} className="rounded-xl border border-border bg-card p-5">
          <BadgeCheck className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-bold text-foreground">{p.title}</h3>
          <p className="mt-1.5 text-xs text-muted-foreground">{p.description}</p>
        </li>
      ))}
    </ul>
  );
}

export function HotelProcessSection({ steps }: { steps: HotelProcessStep[] }) {
  if (steps.length === 0) return null;
  return (
    <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.id} className="rounded-xl border border-border bg-card p-5">
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            {i + 1}
          </span>
          <h3 className="mt-3 text-sm font-bold text-foreground">{s.title}</h3>
          <p className="mt-1.5 text-xs text-muted-foreground">{s.description}</p>
        </li>
      ))}
    </ol>
  );
}
