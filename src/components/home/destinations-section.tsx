import { useState, useEffect } from "react";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { destinations, destinationsSection } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { AppLink } from "@/components/common/app-link";
import { EmptyState } from "@/components/home/fleet-section";
import supabase from "@/lib/supabase";

export function DestinationsSection() {
  const [liveDests, setLiveDests] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('destinations').select('*').order('name');
        if (!error && data && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.slug || d.id,
            name: d.name,
            state: d.state,
            image: d.image_url || 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
            alt: `${d.name}, ${d.state}`,
            packageCount: 2,
            featured: d.featured,
          }));
          setLiveDests(mapped);
        }
      } catch (e) {
        console.error('Failed to load destinations:', e);
      }
    })();
  }, []);

  if (!destinationsSection.meta.visible) return null;

  const defaultItems = destinationsSection.itemIds
    .map((id) => destinations.find((d) => d.id === id))
    .filter((d): d is (typeof destinations)[number] => Boolean(d));

  const items = liveDests.length > 0 ? liveDests : defaultItems;

  const featuredLarge = items[0];
  const topTwo = items.slice(1, 3);
  const bottomThree = items.slice(3, 6);

  return (
    <section
      id="destinations"
      className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background py-14 sm:py-20"
    >
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader meta={destinationsSection.meta} />

        {items.length === 0 ? (
          <EmptyState message="Destinations will appear here soon." />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-5">
            {/* 1 Large Featured Image (Left side) */}
            {featuredLarge ? (
              <div className="flex lg:col-span-2">
                <AppLink
                  href="/destinations"
                  className="group relative flex h-full min-h-[380px] w-full flex-col justify-end overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10"
                >
                  <img
                    src={featuredLarge.image}
                    alt={featuredLarge.alt}
                    width={1920}
                    height={1080}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-foreground shadow-md">
                      <Sparkles className="h-3.5 w-3.5" /> Featured Spot
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 p-6 sm:p-8">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-foreground/80">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {featuredLarge.state}
                    </div>
                    <h3 className="mt-1.5 text-2xl font-extrabold text-white transition-colors group-hover:text-primary-foreground sm:text-3xl">
                      {featuredLarge.name}
                    </h3>
                    <p className="mt-2 text-xs text-white/80 line-clamp-2 sm:text-sm">
                      Experience the magnificent landscapes and tea gardens of {featuredLarge.name}.
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                        {featuredLarge.packageCount} Tour Packages
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-all group-hover:translate-x-1">
                        Explore{" "}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </AppLink>
              </div>
            ) : null}

            {/* Right Side: 2 Images Above & 3 Images Below */}
            <div className="flex flex-col gap-3 sm:gap-5 lg:col-span-3">
              {/* Top Row: 2 Images Above */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-5">
                {topTwo.map((d) => (
                  <AppLink
                    key={d.id}
                    href="/destinations"
                    className="group relative flex min-h-[140px] sm:min-h-[220px] flex-col justify-end overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                  >
                    <img
                      src={d.image}
                      alt={d.alt}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <div className="relative z-10 p-2.5 sm:p-5">
                      <span className="text-[9px] sm:text-[11px] font-semibold text-white/80 truncate block">{d.state}</span>
                      <h4 className="text-xs sm:text-lg font-bold text-white transition-colors group-hover:text-primary truncate">
                        {d.name}
                      </h4>
                      <div className="mt-1 sm:mt-2 flex items-center justify-between">
                        <span className="rounded-full bg-black/40 px-1.5 sm:px-2.5 py-0.5 text-[8px] sm:text-[11px] font-medium text-white/90 backdrop-blur-md truncate">
                          {d.packageCount} pkgs
                        </span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </AppLink>
                ))}
              </div>

              {/* Bottom Row: 3 Images Below */}
              <div className="grid grid-cols-3 gap-2 sm:gap-5">
                {bottomThree.map((d) => (
                  <AppLink
                    key={d.id}
                    href="/destinations"
                    className="group relative flex min-h-[120px] sm:min-h-[210px] flex-col justify-end overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                  >
                    <img
                      src={d.image}
                      alt={d.alt}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <div className="relative z-10 p-2 sm:p-4">
                      <span className="text-[8px] sm:text-[11px] font-semibold text-white/80 truncate block">{d.state}</span>
                      <h4 className="text-[11px] sm:text-base font-bold text-white transition-colors group-hover:text-primary truncate">
                        {d.name}
                      </h4>
                      <div className="mt-1 sm:mt-1.5 flex items-center justify-between">
                        <span className="rounded-full bg-black/40 px-1 sm:px-2 py-0.5 text-[7px] sm:text-[10px] font-medium text-white/90 backdrop-blur-md truncate">
                          {d.packageCount} pkgs
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </AppLink>
                ))}
              </div>
            </div>
          </div>
        )}

        <ViewAllMobile meta={destinationsSection.meta} />
      </div>
    </section>
  );
}
