import { useState } from "react";
import { Users, Briefcase, Snowflake, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { featuredFleet, vehicles, waLink } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { AppLink } from "@/components/common/app-link";

export function FleetSection() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);

  if (!featuredFleet.meta.visible) return null;

  const items = featuredFleet.itemIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is (typeof vehicles)[number] => Boolean(v));

  const displayItems = items.length > 0 ? items : vehicles;

  return (
    <section id="fleet" className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <SectionHeader meta={featuredFleet.meta} />

      {displayItems.length === 0 ? (
        <EmptyState message="No vehicles are featured right now." />
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayItems.map((v) => (
            <li
              key={v.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
            >
              {/* Full-bleed Image Box with Lightbox Trigger */}
              <div
                onClick={() => setSelectedImage({ src: v.image, alt: v.alt, title: v.name })}
                className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20 cursor-pointer"
              >
                <img
                  src={v.image}
                  alt={v.alt}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Fullscreen hover trigger badge */}
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-[2px]">
                  <Maximize2 className="h-4 w-4" />
                  <span>View Full Screen</span>
                </div>
              </div>

              {/* Vehicle Card Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold group-hover:text-primary transition-colors">{v.name}</h3>
                    <p className="text-xs text-muted-foreground">{v.category}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    ₹{v.perKm}/km
                  </span>
                </div>

                <ul className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-b border-border/60 py-3">
                  <li className="inline-flex items-center gap-1.5 font-medium">
                    <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {v.seats} seats
                  </li>
                  <li className="inline-flex items-center gap-1.5 font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {v.luggage} bags
                  </li>
                  {v.ac ? (
                    <li className="inline-flex items-center gap-1.5 font-medium">
                      <Snowflake className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> AC
                    </li>
                  ) : null}
                </ul>

                <div className="mt-5 flex gap-2 pt-1">
                  <Button asChild size="sm" className="flex-1 font-semibold">
                    <AppLink href="/contact-us">Book</AppLink>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1 font-semibold">
                    <a
                      href={waLink(
                        `Hi South Zoom Tourism, I'd like a quote for the ${v.name} (${v.category}, ${v.seats} seats).`,
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

      {/* Full-Screen Image Lightbox Modal */}
      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-none text-white overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedImage?.title ?? "Vehicle Preview"}
          </DialogTitle>
          <div className="relative flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors z-20"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            {selectedImage ? (
              <div className="flex flex-col items-center">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
                />
                <h4 className="mt-3 text-lg font-bold text-white text-center">{selectedImage.title}</h4>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <ViewAllMobile meta={featuredFleet.meta} />
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}
