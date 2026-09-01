import { useState, useEffect } from "react";
import { CalendarDays, MapPin, Maximize2, Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { featuredPackages, tourPackages, waLink } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { AppLink } from "@/components/common/app-link";
import { EmptyState } from "@/components/home/fleet-section";
import supabase from "@/lib/supabase";
import { resolvePackageImage } from "@/lib/image-map";

export function PackagesSection() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);
  const [livePackages, setLivePackages] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('tour_packages')
          .select('*')
          .eq('active', true)
          .order('display_order');
        if (!error && data && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.slug || p.id,
            title: p.title,
            category: p.category || 'Tour',
            destination: p.destinations?.name || p.destination || p.category || 'South India',
            nights: p.nights || 2,
            days: p.days || 3,
            priceFrom: p.price_from || 7999,
            image: resolvePackageImage(p.main_image, `${p.slug} ${p.title}`),
            alt: p.title,
            highlights: Array.isArray(p.highlights) ? p.highlights : ['Sightseeing', 'Stay Included', 'Private Cab'],
            featured: p.featured,
          }));
          const featured = mapped.filter((p: any) => p.featured);
          setLivePackages(featured.length > 0 ? featured : mapped.slice(0, 4));
        }
      } catch (e) {
        console.error('Failed to load packages:', e);
      }
    })();
  }, []);

  if (!featuredPackages.meta.visible) return null;

  const defaultItems = featuredPackages.itemIds
    .map((id) => tourPackages.find((p) => p.id === id))
    .filter((p): p is (typeof tourPackages)[number] => Boolean(p));

  const items = livePackages.length > 0 ? livePackages : defaultItems;

  return (
    <section
      id="packages"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-secondary/30 py-14 sm:py-20"
    >
      {/* Ambient glow decoration */}
      <div className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader meta={featuredPackages.meta} />

        {items.length === 0 ? (
          <EmptyState message="No packages are featured right now." />
        ) : (
          <ul className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => (
              <li
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
              >
                {/* Image Header with Fullscreen Trigger */}
                <div
                  onClick={() => setSelectedImage({ src: p.image, alt: p.alt, title: p.title })}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30 cursor-pointer"
                >
                  <img
                    src={p.image}
                    alt={p.alt}
                    width={1920}
                    height={1080}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                  {/* Category Pill */}
                  <span className="absolute left-2 top-2 sm:left-3 sm:top-3 inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-primary/95 px-1.5 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-extrabold text-primary-foreground shadow-md backdrop-blur-sm">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {p.category}
                  </span>

                  {/* Fullscreen hover badge */}
                  <div className="absolute right-2 top-2 sm:right-3 sm:top-3 grid h-6 w-6 sm:h-8 sm:w-8 place-items-center rounded-lg sm:rounded-xl bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                    <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>

                  {/* Duration badge */}
                  <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs font-semibold text-white backdrop-blur-md">
                    <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" aria-hidden="true" />
                    {p.nights}N / {p.days}D
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-2.5 sm:p-5">
                  <div>
                    <h3 className="text-xs sm:text-base font-bold text-foreground transition-colors group-hover:text-primary truncate">
                      {p.title}
                    </h3>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" aria-hidden="true" /> {p.destination}
                    </p>
                  </div>

                  {/* Highlights list */}
                  <ul className="mt-2 space-y-1 border-t border-b border-border/60 py-1.5 sm:py-2.5 text-[9px] sm:text-xs text-muted-foreground max-h-12 overflow-hidden">
                    {p.highlights.slice(0, 2).map((h) => (
                      <li key={h} className="inline-flex items-center gap-1 truncate">
                        <Check className="h-3 w-3 shrink-0 text-primary" /> <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[11px] text-muted-foreground">Starting from</span>
                      <p className="text-xs sm:text-base font-extrabold text-primary">
                        ₹{p.priceFrom.toLocaleString("en-IN")}
                        <span className="text-[9px] sm:text-xs font-normal text-muted-foreground"> / person</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex gap-1.5 pt-1">
                    <Button asChild size="sm" className="h-7 sm:h-8 flex-1 text-[10px] sm:text-xs font-semibold px-1 sm:px-3">
                      <AppLink href="/contact-us">Book</AppLink>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="h-7 sm:h-8 flex-1 text-[10px] sm:text-xs font-semibold px-1 sm:px-3">
                      <a
                        href={waLink(
                          `Hi South Zoom Tourism, I'm interested in the "${p.title}" package (${p.nights}N/${p.days}D, ${p.destination}).`,
                        )}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Lightbox Modal */}
        <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-4xl border-none bg-black/95 p-2 text-white overflow-hidden">
            <DialogTitle className="sr-only">
              {selectedImage?.title ?? "Tour Package Preview"}
            </DialogTitle>
            <div className="relative flex flex-col items-center justify-center p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 z-20 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
              {selectedImage ? (
                <div className="flex flex-col items-center">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl"
                  />
                  <h4 className="mt-3 text-lg font-bold text-white text-center">{selectedImage.title}</h4>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        <ViewAllMobile meta={featuredPackages.meta} />
      </div>
    </section>
  );
}
