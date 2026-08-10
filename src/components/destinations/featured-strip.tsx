import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { DestinationRecord } from "@/content/destinations";
import { getDestinationPackageCount } from "@/content/destinations";

export function FeaturedStrip({
  heading,
  description,
  destinations,
  id,
}: {
  heading: string;
  description: string;
  destinations: DestinationRecord[];
  id: string;
}) {
  if (destinations.length === 0) return null;

  return (
    <section aria-labelledby={`${id}-heading`} className="mt-12">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 id={`${id}-heading`} className="text-xl font-bold sm:text-2xl">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <ul className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {destinations.map((d) => (
          <li key={d.id} className="w-[240px] shrink-0 snap-start sm:w-[280px]">
            <Link
              to="/destinations/$slug"
              params={{ slug: d.slug }}
              className="group block overflow-hidden rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={d.image}
                  alt={`${d.name} — ${d.imageAlt}`}
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3">
                  <span className="block truncate text-sm font-bold text-background">{d.name}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-background/85">
                    {d.state} · {getDestinationPackageCount(d)} packages
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
