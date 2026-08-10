import { useState } from "react";
import { MapPin, Star, Maximize2, X, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { featuredHotels, hotels, waLink } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { AppLink } from "@/components/common/app-link";
import { EmptyState } from "@/components/home/fleet-section";

export function HotelsSection() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);

  if (!featuredHotels.meta.visible) return null;

  const items = featuredHotels.itemIds
    .map((id) => hotels.find((h) => h.id === id))
    .filter((h): h is (typeof hotels)[number] => Boolean(h));

  return (
    <section id="hotels" className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <SectionHeader meta={featuredHotels.meta} />

      {items.length === 0 ? (
        <EmptyState message="No hotels are featured right now." />
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((h) => (
            <li
              key={h.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Photo Header with Lightbox Trigger */}
              <div
                onClick={() => setSelectedImage({ src: h.image, alt: h.alt, title: h.name })}
                className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30 cursor-pointer"
              >
                <img
                  src={h.image}
                  alt={h.alt}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Star rating badge */}
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  {Array.from({ length: h.starRating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-primary text-primary"
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-1 text-[10px] text-white/90">{h.starRating} Star</span>
                </div>

                {/* Fullscreen hover badge */}
                <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-5">
                <div>
                  <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                    {h.name}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {h.city}
                  </p>
                </div>

                <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
                  <BedDouble className="h-3.5 w-3.5 text-primary" /> {h.roomType}
                </p>

                {/* Amenities Badges */}
                <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-b border-border/60 py-3">
                  {h.amenities.map((a) => (
                    <li
                      key={a}
                      className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
                    >
                      {a}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Nightly rate</span>
                    <p className="text-base font-extrabold text-primary">
                      ₹{h.pricePerNight.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-muted-foreground"> / night</span>
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
                        `Hi South Zoom Tourism, I'd like to check availability at ${h.name}, ${h.city} (${h.roomType}).`,
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
            {selectedImage?.title ?? "Hotel Room Preview"}
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

      <ViewAllMobile meta={featuredHotels.meta} />
    </section>
  );
}
