import { useState } from "react";
import { CalendarDays, MapPin, Maximize2, Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { featuredPackages, tourPackages, waLink } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { AppLink } from "@/components/common/app-link";
import { EmptyState } from "@/components/home/fleet-section";

export function PackagesSection() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);

  if (!featuredPackages.meta.visible) return null;

  const items = featuredPackages.itemIds
    .map((id) => tourPackages.find((p) => p.id === id))
    .filter((p): p is (typeof tourPackages)[number] => Boolean(p));

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
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <li
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
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
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/95 px-3 py-1 text-[11px] font-extrabold text-primary-foreground shadow-md backdrop-blur-sm">
                    <Sparkles className="h-3 w-3" /> {p.category}
                  </span>

                  {/* Fullscreen hover badge */}
                  <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                    <Maximize2 className="h-4 w-4" />
                  </div>

                  {/* Duration badge */}
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {p.nights}N / {p.days}D
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                        {p.title}
                      </h3>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {p.destination}
                      </p>
                    </div>
                  </div>

                  {/* Highlights list */}
                  <ul className="mt-4 space-y-1.5 border-t border-b border-border/60 py-3 text-xs text-muted-foreground">
                    {p.highlights.map((h) => (
                      <li key={h} className="inline-flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-muted-foreground">Starting from</span>
                      <p className="text-base font-extrabold text-primary">
                        ₹{p.priceFrom.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-muted-foreground"> / person</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 pt-1">
                    <Button asChild size="sm" className="flex-1 font-semibold">
                      <AppLink href="/contact-us">Book</AppLink>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1 font-semibold">
                      <a
                        href={waLink(
                          `Hi South Zoom Tourism, I'm interested in the "${p.title}" package (${p.nights}N/${p.days}D, ${p.destination}).`,
                        )}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Enquire
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
