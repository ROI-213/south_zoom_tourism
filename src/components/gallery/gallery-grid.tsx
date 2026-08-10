import { Play } from "lucide-react";
import type { GalleryMedia } from "@/content/gallery";

export function GalleryGrid({
  items,
  onOpen,
}: {
  items: GalleryMedia[];
  onOpen: (index: number) => void;
}) {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
      {items.map((m, i) => (
        <li key={m.id} className="min-w-0">
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={
              m.type === "video" ? `Play video: ${m.caption}` : `Open photo: ${m.caption}`
            }
            className="group block w-full overflow-hidden rounded-xl border border-border bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="relative block">
              <img
                src={m.image}
                alt={m.alt}
                width={m.width}
                height={m.height}
                loading={i < 3 ? "eager" : "lazy"}
                decoding="async"
                sizes="(min-width: 1024px) 33vw, (min-width: 420px) 50vw, 100vw"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              {m.type === "video" ? (
                <span className="absolute inset-0 grid place-items-center bg-foreground/20">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-background/90 shadow-md">
                    <Play className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                </span>
              ) : null}
            </span>
            <span className="block p-3">
              <span className="block truncate text-sm font-semibold text-foreground">
                {m.caption}
              </span>
              {m.attribution ? (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {m.attribution}
                </span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
