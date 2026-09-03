import { useState, useEffect } from "react";
import { MapPin, Star, Maximize2, X, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { featuredHotels, hotels as staticHotels, waLink } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { AppLink } from "@/components/common/app-link";
import { EmptyState } from "@/components/home/fleet-section";
import { fetchLiveHotels, mapDbHotelsToHomeList, type DynamicHomeHotel } from "@/lib/hotel-service";

export function HotelsSection() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);

  // Initialize with static fallback items
  const initialItems: DynamicHomeHotel[] = featuredHotels.itemIds
    .map((id) => staticHotels.find((h) => h.id === id))
    .filter((h): h is (typeof staticHotels)[number] => Boolean(h))
    .map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      starRating: h.starRating,
      roomType: h.roomType,
      pricePerNight: h.pricePerNight,
      image: h.image,
      alt: h.alt,
      amenities: h.amenities,
      active: true,
      featured: true,
    }));

  const [items, setItems] = useState<DynamicHomeHotel[]>(initialItems);

  useEffect(() => {
    async function loadDynamicHotels() {
      try {
        const dbHotels = await fetchLiveHotels();
        if (dbHotels && dbHotels.length > 0) {
          // Filter to featured hotels first, or take top 8 active
          const featuredDb = dbHotels.filter((h) => h.featured);
          const listToUse = featuredDb.length > 0 ? featuredDb : dbHotels.slice(0, 8);
          const mapped = mapDbHotelsToHomeList(listToUse);
          if (mapped.length > 0) {
            setItems(mapped);
          }
        }
      } catch (err) {
        console.error("Error loading dynamic hotels for homepage:", err);
      }
    }
    loadDynamicHotels();
  }, []);

  if (!featuredHotels.meta.visible) return null;

  return (
    <section id="hotels" className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <SectionHeader meta={featuredHotels.meta} />

      {items.length === 0 ? (
        <EmptyState message="No hotels are featured right now." />
      ) : (
        <ul className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {items.map((h) => (
            <li
              key={h.id}
              className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
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
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Star rating badge */}
                <div className="absolute left-2 top-2 sm:left-3 sm:top-3 inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-black/60 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold text-white backdrop-blur-md">
                  {Array.from({ length: h.starRating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary text-primary"
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-0.5 text-[8px] sm:text-[10px] text-white/90">{h.starRating}★</span>
                </div>

                {/* Fullscreen hover badge */}
                <div className="absolute right-2 top-2 sm:right-3 sm:top-3 grid h-6 w-6 sm:h-8 sm:w-8 place-items-center rounded-lg sm:rounded-xl bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-2.5 sm:p-5">
                <div>
                  <h3 className="text-xs sm:text-base font-bold text-foreground transition-colors group-hover:text-primary truncate">
                    {h.name}
                  </h3>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" aria-hidden="true" /> {h.city}
                  </p>
                </div>

                <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-foreground/90 truncate">
                  <BedDouble className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" /> {h.roomType}
                </p>

                {/* Amenities Badges */}
                <ul className="mt-2 flex flex-wrap gap-1 border-t border-b border-border/60 py-1.5 sm:py-2.5 max-h-12 overflow-hidden">
                  {h.amenities.slice(0, 2).map((a) => (
                    <li
                      key={a}
                      className="rounded-full bg-secondary/80 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium text-secondary-foreground truncate"
                    >
                      {a}
                    </li>
                  ))}
                </ul>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[11px] text-muted-foreground">Nightly rate</span>
                    <p className="text-xs sm:text-base font-extrabold text-primary">
                      ₹{h.pricePerNight.toLocaleString("en-IN")}
                      <span className="text-[9px] sm:text-xs font-normal text-muted-foreground"> / night</span>
                    </p>
                  </div>
                </div>

                {(() => {
                  const citySlug = (h.city || "south-india")
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                  const detailHref = `/hotels/${citySlug}/${h.id}`;
                  const bookHref = `/book/hotel?hotel=${encodeURIComponent(h.id)}&destination=${encodeURIComponent(h.city)}`;

                  return (
                    <div className="mt-2.5 flex gap-1.5 pt-1">
                      <Button asChild size="sm" className="h-7 sm:h-8 flex-1 text-[10px] sm:text-xs font-semibold px-1 sm:px-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <AppLink href={bookHref}>Book now</AppLink>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="h-7 sm:h-8 flex-1 text-[10px] sm:text-xs font-semibold px-1 sm:px-3">
                        <AppLink href={detailHref}>View details</AppLink>
                      </Button>
                    </div>
                  );
                })()}
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
