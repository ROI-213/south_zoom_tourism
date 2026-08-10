import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import {
  galleryKindLabels,
  type PackageGalleryImage,
} from "@/content/package-details";

export function PackageGallery({ images, title }: { images: PackageGalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const ordered = [...images].sort((a, b) => a.order - b.order);
  const count = ordered.length;

  const step = useCallback(
    (delta: number) => setActive((i) => (count ? (i + delta + count) % count : 0)),
    [count],
  );

  useEffect(() => {
    if (!lightbox) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, step]);

  if (!count) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Photos for this itinerary are being added. Ask us and we will share them on WhatsApp.
      </p>
    );
  }

  const current = ordered[active];

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
        <img
          src={current.url}
          alt={current.alt}
          width={1280}
          height={720}
          className="aspect-[16/10] w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
          {galleryKindLabels[current.kind]}
        </span>
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-medium hover:bg-background"
          aria-label={`Open larger photo: ${current.alt}`}
        >
          <ZoomIn className="size-3.5" aria-hidden="true" /> Enlarge
        </button>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 hover:bg-background"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 hover:bg-background"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {ordered.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show ${galleryKindLabels[image.kind].toLowerCase()} photo: ${image.alt}`}
                aria-current={index === active}
                className={`block w-full overflow-hidden rounded-lg border transition ${
                  index === active ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/60"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  width={320}
                  height={200}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo viewer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-h-full w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={current.url} alt={current.alt} className="max-h-[80vh] w-full rounded-lg object-contain" />
            <p className="mt-2 text-center text-xs text-white/80">{current.alt}</p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close photo viewer"
              className="absolute -top-3 right-0 rounded-full bg-background p-2"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
