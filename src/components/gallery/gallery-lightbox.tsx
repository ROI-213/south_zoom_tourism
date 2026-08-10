import { useCallback, useEffect, useRef, useState } from "react";
import { Share2, Link2, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { toast } from "sonner";
import type { GalleryMedia } from "@/content/gallery";
import { getCategoryLabel } from "@/content/gallery";

const canShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

export function GalleryLightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: GalleryMedia[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const open = index !== null && index >= 0 && index < items.length;
  const item = open ? items[index] : null;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const share = async () => {
    if (!item) return;
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/gallery?media=${item.id}` : "";
    const data = { title: item.caption, text: item.alt, url };
    try {
      if (canShare()) {
        await navigator.share!(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", { description: "Share it anywhere you like." });
    } catch {
      /* user dismissed the share sheet — nothing to report */
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[min(96vw,64rem)] gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{item?.caption ?? "Gallery media"}</DialogTitle>
        {item ? (
          <div
            onTouchStart={(e) => {
              const t = e.touches[0];
              touchStart.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={(e) => {
              const start = touchStart.current;
              touchStart.current = null;
              if (!start) return;
              const t = e.changedTouches[0];
              const dx = t.clientX - start.x;
              const dy = t.clientY - start.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
            }}
          >
            <div className="relative bg-black">
              {item.type === "video" && item.videoUrl ? (
                <div className="aspect-video w-full">
                  <iframe
                    key={item.id}
                    src={item.videoUrl}
                    title={item.caption}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              ) : (
                <img
                  src={item.image}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  decoding="async"
                  className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
                />
              )}

              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous item"
                    className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-md hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next item"
                    className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-md hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="grid gap-3 border-t border-border bg-background p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.caption}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getCategoryLabel(item.categorySlug)}
                  {item.attribution ? ` · ${item.attribution}` : ""}
                  {items.length > 1 && index !== null ? ` · ${index + 1} of ${items.length}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.relatedHref ? (
                  <Button asChild size="sm" variant="secondary">
                    <AppLink href={item.relatedHref}>
                      {item.relatedLabel ?? "View more"}
                      <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </AppLink>
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={share}>
                  {canShare() ? (
                    <Share2 className="mr-1 h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Link2 className="mr-1 h-4 w-4" aria-hidden="true" />
                  )}
                  Share
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
