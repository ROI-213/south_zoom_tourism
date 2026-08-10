import { useState } from "react";
import type { DestinationMedia } from "@/content/destination-details";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export function DestinationGallery({
  destinationName,
  media,
}: {
  destinationName: string;
  media: DestinationMedia[];
}) {
  const [active, setActive] = useState<DestinationMedia | null>(null);

  if (media.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Photos of {destinationName} are being uploaded.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((m, i) => (
          <li key={m.id} className="min-w-0">
            <button
              type="button"
              onClick={() => setActive(m)}
              className="group block w-full overflow-hidden rounded-xl border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Open larger photo: ${m.alt}`}
            >
              <img
                src={m.image}
                alt={m.alt}
                width={1200}
                height={800}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl p-2 sm:p-3">
          <DialogTitle className="sr-only">{active?.alt ?? "Destination photo"}</DialogTitle>
          {active ? (
            <img
              src={active.image}
              alt={active.alt}
              width={1600}
              height={1067}
              className="h-auto w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
