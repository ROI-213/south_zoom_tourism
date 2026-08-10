import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getHotelGallery,
  getUsedGalleryCategories,
  type HotelMediaItem,
} from "@/content/hotel-details";

export function HotelDetailGallery({
  hotelId,
  hotelName,
}: {
  hotelId: string;
  hotelName: string;
}) {
  const all = useMemo(() => getHotelGallery(hotelId), [hotelId]);
  const categories = useMemo(() => getUsedGalleryCategories(hotelId), [hotelId]);
  const [active, setActive] = useState<string>("all");
  const [lightbox, setLightbox] = useState<HotelMediaItem | null>(null);

  if (all.length === 0) {
    return (
      <section aria-labelledby="gallery-heading" className="rounded-xl border bg-card p-6">
        <h2 id="gallery-heading" className="text-lg font-semibold">
          Photos
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Photos for this property are being updated. Ask our stay desk for the latest set.
        </p>
      </section>
    );
  }

  const shown = active === "all" ? all : all.filter((m) => m.categorySlug === active);

  return (
    <section aria-labelledby="gallery-heading" className="space-y-3">
      <h2 id="gallery-heading" className="text-lg font-semibold">
        Photos of {hotelName}
      </h2>

      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label="Photo categories"
      >
        <CategoryTab
          label={`All (${all.length})`}
          selected={active === "all"}
          onSelect={() => setActive("all")}
        />
        {categories.map((category) => (
          <CategoryTab
            key={category.slug}
            label={category.label}
            selected={active === category.slug}
            onSelect={() => setActive(category.slug)}
          />
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setLightbox(item)}
              className="group block w-full overflow-hidden rounded-lg border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Open photo: ${item.caption}`}
            >
              <img
                src={item.image}
                alt={item.imageAlt}
                width={1920}
                height={1200}
                loading={index < 4 ? "eager" : "lazy"}
                decoding="async"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="block truncate px-2 py-1.5 text-left text-xs text-muted-foreground">
                {item.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-3xl p-2 sm:p-4">
          {lightbox && (
            <>
              <DialogTitle className="px-1 text-base">{lightbox.caption}</DialogTitle>
              <DialogDescription className="px-1 text-xs">
                {lightbox.imageAlt}
              </DialogDescription>
              <img
                src={lightbox.image}
                alt={lightbox.imageAlt}
                width={1920}
                height={1200}
                className="max-h-[70vh] w-full rounded-md object-contain"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function CategoryTab({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      role="tab"
      aria-selected={selected}
      variant={selected ? "default" : "outline"}
      size="sm"
      className="shrink-0"
      onClick={onSelect}
    >
      {label}
    </Button>
  );
}
