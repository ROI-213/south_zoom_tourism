import { useState } from "react";
import { Maximize2, MapPin, X } from "lucide-react";
import { gallerySection } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { EmptyState } from "@/components/home/fleet-section";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import destMunnar from "@/assets/destinations/dest-munnar-new.png";
import serviceLocalTaxi from "@/assets/service-local-taxi.png";
import heroHotels from "@/assets/hero-hotels.jpg";
import serviceGroup from "@/assets/service-group.png";
import destAlleppey from "@/assets/destinations/dest-alleppey-new.png";
import servicePilgrimage from "@/assets/service-pilgrimage-new.png";

const galleryItems = [
  { id: "g1", image: destMunnar, title: "Munnar Tea Trails", location: "Munnar, Kerala", alt: "Sunrise over Munnar tea plantations" },
  { id: "g2", image: serviceLocalTaxi, title: "Coastal Taxi Drive", location: "ECR Highway, Tamil Nadu", alt: "White taxi driving along coastal highway at sunset" },
  { id: "g3", image: heroHotels, title: "Hill View Resort Stay", location: "Ooty, Tamil Nadu", alt: "Luxury resort balcony overlooking misty Nilgiri hills" },
  { id: "g4", image: serviceGroup, title: "Group Sightseeing Tour", location: "Coimbatore to Ooty", alt: "Tempo traveller parked at scenic mountain viewpoint" },
  { id: "g5", image: destAlleppey, title: "Backwaters Cruise", location: "Alleppey, Kerala", alt: "Houseboat sailing through Kerala backwaters" },
  { id: "g6", image: servicePilgrimage, title: "Temple Circuit Tour", location: "Madurai & Kumbakonam", alt: "Golden sunrise behind South Indian temple gopuram" },
];

export function GalleryPreview() {
  const [selectedImage, setSelectedImage] = useState<(typeof galleryItems)[number] | null>(null);

  if (!gallerySection.meta.visible) return null;

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-secondary/40 py-14 sm:py-20"
    >
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute right-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader meta={gallerySection.meta} />

          <div className="mt-8 space-y-6">
            {/* Top Row: Big 2 Cards */}
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {galleryItems.slice(0, 2).map((g) => (
                <li
                  key={g.id}
                  onClick={() => setSelectedImage(g)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/60 hover:shadow-2xl"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={g.image}
                      alt={g.alt}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity duration-300 group-hover:opacity-95" />

                    {/* Hover Fullscreen Badge */}
                    <div className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-2xl bg-black/40 text-primary opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                      <Maximize2 className="h-4 w-4 animate-pulse" />
                    </div>

                    {/* Card Footer Content */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="translate-y-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:border-primary/30 group-hover:bg-black/60 shadow-lg">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                          <MapPin className="h-3.5 w-3.5" /> {g.location}
                        </div>
                        <h4 className="mt-1.5 text-sm font-extrabold text-white transition-colors group-hover:text-primary-foreground sm:text-base">
                          {g.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Bottom Row: 4 Cards */}
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {galleryItems.slice(2).map((g) => (
                <li
                  key={g.id}
                  onClick={() => setSelectedImage(g)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/60 hover:shadow-2xl"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={g.image}
                      alt={g.alt}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-115"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity duration-300 group-hover:opacity-95" />

                    {/* Hover Fullscreen Badge */}
                    <div className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-2xl bg-black/40 text-primary opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                      <Maximize2 className="h-4 w-4 animate-pulse" />
                    </div>

                    {/* Card Footer Content */}
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <div className="translate-y-4 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:border-primary/30 group-hover:bg-black/60 shadow-lg">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          <MapPin className="h-3 w-3" /> {g.location}
                        </div>
                        <h4 className="mt-1.5 text-xs font-extrabold text-white transition-colors group-hover:text-primary-foreground sm:text-sm">
                          {g.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        {/* Full-Screen Image Lightbox Modal */}
        <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-4xl border-none bg-black/95 p-2 text-white overflow-hidden">
            <DialogTitle className="sr-only">
              {selectedImage?.title ?? "Trip Photo Preview"}
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
                    src={selectedImage.image}
                    alt={selectedImage.alt}
                    className="max-h-[75vh] w-auto rounded-lg object-contain shadow-2xl"
                  />
                  <h4 className="mt-3 text-lg font-bold text-white">{selectedImage.title}</h4>
                  <p className="mt-1 text-xs text-white/70">{selectedImage.location}</p>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        <ViewAllMobile meta={gallerySection.meta} />
      </div>
    </section>
  );
}
