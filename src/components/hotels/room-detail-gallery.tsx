import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { RoomMediaItem } from "@/content/room-details";

/** Room gallery: one lead image plus lazy thumbnails, with a lightbox. */
export function RoomDetailGallery({
  media,
  roomName,
}: {
  media: RoomMediaItem[];
  roomName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (media.length === 0) return null;
  const [lead, ...rest] = media;
  const active = openIndex === null ? null : media[openIndex];

  return (
    <section aria-label={`Photos of ${roomName}`} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border sm:aspect-[16/10]"
        >
          <img
            src={lead.image}
            alt={lead.imageAlt}
            width={1200}
            height={750}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="sr-only">Open photo viewer</span>
        </button>

        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            {rest.slice(0, 2).map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenIndex(i + 1)}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border"
              >
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  width={600}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {i === 1 && rest.length > 2 && (
                  <span className="absolute inset-0 grid place-items-center bg-foreground/60 text-sm font-semibold text-background">
                    +{rest.length - 2} more
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogTitle className="sr-only">{active?.caption ?? roomName}</DialogTitle>
          {active && (
            <figure className="space-y-2">
              <img
                src={active.image}
                alt={active.imageAlt}
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
              <figcaption className="px-2 pb-2 text-center text-sm text-muted-foreground">
                {active.caption}
              </figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
