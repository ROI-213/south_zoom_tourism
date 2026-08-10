import { Link } from "@tanstack/react-router";
import { getPublishedDestinations } from "@/content/destinations";
import { cn } from "@/lib/utils";

export function DestinationSelector({ currentSlug }: { currentSlug?: string }) {
  const destinations = getPublishedDestinations();

  return (
    <div className="w-full border-b border-border bg-card/60 backdrop-blur sticky top-[60px] sm:top-[68px] z-40">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-1 overflow-x-auto scrollbar-none gap-8">
          <div className="flex items-center gap-1 sm:gap-2 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2 shrink-0 hidden md:inline">
              Destinations:
            </span>
            {destinations.map((d) => {
              const isActive = d.slug === currentSlug;
              return (
                <Link
                  key={d.id}
                  to="/destinations/$slug"
                  params={{ slug: d.slug }}
                  className={cn(
                    "relative px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {d.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          <Link
            to="/destinations"
            className="text-xs font-bold text-primary hover:underline shrink-0 pl-4 border-l border-border hidden sm:block"
          >
            View All →
          </Link>
        </div>
      </div>
    </div>
  );
}
