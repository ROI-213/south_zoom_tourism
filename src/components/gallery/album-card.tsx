import { Images } from "lucide-react";
import type { GalleryAlbum } from "@/content/gallery";
import { countMediaInAlbum, getCategoryLabel } from "@/content/gallery";

export function AlbumCard({
  album,
  onOpen,
}: {
  album: GalleryAlbum;
  onOpen: (slug: string) => void;
}) {
  const count = countMediaInAlbum(album.slug);

  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={() => onOpen(album.slug)}
        className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Open album ${album.title}, ${count} items`}
      >
        <img
          src={album.coverImage}
          alt={album.coverAlt}
          width={1600}
          height={1067}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-1 p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {getCategoryLabel(album.categorySlug)}
          </span>
          <span className="truncate text-base font-bold text-foreground">{album.title}</span>
          <span className="text-sm text-muted-foreground">{album.description}</span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Images className="h-4 w-4 shrink-0" aria-hidden="true" />
            {count} {count === 1 ? "item" : "items"}
          </span>
        </span>
      </button>
    </li>
  );
}
