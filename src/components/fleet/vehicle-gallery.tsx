import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { VehicleGalleryImage } from "@/content/vehicle-details";

const kindLabels: Record<VehicleGalleryImage["kind"], string> = {
  exterior: "Exterior",
  interior: "Interior",
  seating: "Seating",
  luggage: "Luggage space",
};

export function VehicleGallery({ images }: { images: VehicleGalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);

  const count = images.length;
  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (!lightbox) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, next, prev]);

  if (count === 0) {
    return (
      <div className="grid aspect-[16/10] w-full place-items-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        Photos of this vehicle are being added.
      </div>
    );
  }

  const current = images[active];

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-xl bg-muted"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(delta) > 40) (delta < 0 ? next : prev)();
          touchStart.current = null;
        }}
      >
        <img
          src={current.url}
          alt={current.alt}
          width={1200}
          height={750}
          fetchPriority="high"
          decoding="async"
          className="aspect-[16/10] w-full object-cover"
        />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label={`Open larger view of ${current.alt}`}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </button>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        ) : null}
        <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold">
          {kindLabels[current.kind]}
        </span>
      </div>

      <ul className="mt-3 grid grid-cols-4 gap-2" aria-label="Vehicle photo thumbnails">
        {images.map((image, index) => (
          <li key={image.id}>
            <button
              type="button"
              aria-label={`Show ${kindLabels[image.kind]} photo`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={`block w-full overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                index === active ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                width={300}
                height={200}
                loading="lazy"
                decoding="async"
                className="aspect-[3/2] w-full object-cover"
              />
              <span className="block truncate px-1 py-1 text-[11px] text-muted-foreground">
                {kindLabels[image.kind]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo viewer — ${current.alt}`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={current.url}
            alt={current.alt}
            className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <div
            className="mt-4 flex items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setLightbox(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Close
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
