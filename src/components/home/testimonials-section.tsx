import { Star, Quote, Car, MapPin } from "lucide-react";
import { testimonialsSection } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { EmptyState } from "@/components/home/fleet-section";

/* Unique gradient colors for avatar backgrounds */
const avatarGradients = [
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-sky-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-pink-600",
  "from-yellow-500 to-amber-600",
  "from-teal-500 to-emerald-600",
];

export function TestimonialsSection() {
  if (!testimonialsSection.meta.visible) return null;
  const items = testimonialsSection.items;
  const slidingItems = [...items, ...items, ...items, ...items];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-secondary/20 py-14 sm:py-20"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader meta={testimonialsSection.meta} />

        {items.length === 0 ? (
          <EmptyState message="Reviews will appear here soon." />
        ) : (
          <div className="relative mt-8 min-w-0 overflow-hidden py-4">
            {/* Edge Fade Overlays */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-background to-transparent" />

            {/* Continuous Marquee Track */}
            <div className="flex w-max gap-6 animate-continuous-slide hover:[animation-play-state:paused]">
              {slidingItems.map((t, idx) => {
                const initials = t.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("");
                const gradient = avatarGradients[idx % avatarGradients.length];
                const tripType = (t as Record<string, unknown>).tripType as string | undefined;
                const address = (t as Record<string, unknown>).address as string | undefined;

                return (
                  <figure
                    key={`${t.id}-${idx}`}
                    className="group flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 sm:w-[380px]"
                  >
                    <div>
                      {/* Card Header: Rating Stars & Quote Icon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center gap-1"
                            aria-label={`${t.rating} out of 5 stars`}
                          >
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-primary text-primary transition-transform group-hover:scale-110"
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                          {tripType && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                              <Car className="h-2.5 w-2.5" />
                              {tripType}
                            </span>
                          )}
                        </div>
                        <Quote className="h-6 w-6 text-primary/30 transition-colors group-hover:text-primary/60" />
                      </div>

                      {/* Review Text */}
                      <blockquote className="mt-4 text-xs italic leading-relaxed text-foreground/80 sm:text-sm line-clamp-4">
                        &ldquo;{t.text}&rdquo;
                      </blockquote>
                    </div>

                    {/* Author Footer */}
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradient} text-xs font-extrabold text-white shadow-md`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                          {t.name}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          {address ? `${address}, ${t.city}` : t.city}
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        )}

        <ViewAllMobile meta={testimonialsSection.meta} />
      </div>
    </section>
  );
}
