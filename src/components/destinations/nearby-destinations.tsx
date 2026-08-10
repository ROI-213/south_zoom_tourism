import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { DestinationRecord } from "@/content/destinations";

export function NearbyDestinations({ destinations }: { destinations: DestinationRecord[] }) {
  if (destinations.length === 0) return null;

  return (
    <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.map((d) => (
        <li key={d.id} className="min-w-0">
          <Link
            to="/destinations/$slug"
            params={{ slug: d.slug }}
            className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={d.image}
              alt={`${d.name} — ${d.imageAlt}`}
              width={160}
              height={160}
              loading="lazy"
              decoding="async"
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{d.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {d.state} · {d.idealDuration}
              </span>
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
