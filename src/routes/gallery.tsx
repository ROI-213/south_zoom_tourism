import { useMemo, useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImageOff, LayoutGrid, Images as ImagesIcon, ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox";
import { AlbumCard } from "@/components/gallery/album-card";
import {
  filterMedia,
  galleryBannerBlock,
  galleryPerPage,
  getAlbum,
  getCategoryLabel,
  getPublishedAlbums,
  getPublishedCategories,
  getPublishedMedia,
  setDynamicGalleryMedia,
  mapDbGalleryToMedia,
} from "@/content/gallery";
import supabase from "@/lib/supabase";

type GallerySearch = {
  category?: string;
  album?: string;
  view?: "albums" | "all";
  show?: number;
  media?: string;
};

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const num = (v: unknown) => (Number(v) > 0 ? Number(v) : undefined);

export const Route = createFileRoute("/gallery")({
  validateSearch: (search: Record<string, unknown>): GallerySearch => ({
    category: str(search.category),
    album: str(search.album),
    view: search.view === "all" ? "all" : search.view === "albums" ? "albums" : undefined,
    show: num(search.show),
    media: str(search.media),
  }),
  component: GalleryPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The gallery didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Gallery not found</h1>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Photo & Video Gallery — South Zoom Tourism" },
      {
        name: "description",
        content:
          "Browse South Zoom Tourism photos and videos: our fleet, South India destinations, partner hotels and rooms, customer trips, group tours, corporate travel and events.",
      },
      { property: "og:title", content: "Photo & Video Gallery — South Zoom Tourism" },
      {
        property: "og:description",
        content:
          "Real photos and trip films from South Zoom Tourism — fleet, destinations, hotels, rooms, customer trips, group tours, corporate travel and events.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/gallery" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: "South Zoom Tourism gallery",
          url: "/gallery",
          image: getPublishedMedia()
            .filter((m) => m.type === "image")
            .map((m) => ({
              "@type": "ImageObject",
              contentUrl: m.image,
              caption: m.caption,
              creditText: m.attribution,
            })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: "Gallery", item: "/gallery" },
          ],
        }),
      },
    ],
  }),
});

function GalleryPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/gallery" });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [galleryVersion, setGalleryVersion] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('gallery').select('*').eq('active', true).order('display_order');
        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDbGalleryToMedia);
          setDynamicGalleryMedia(mapped);
          setGalleryVersion((v) => v + 1);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
      }
    })();
  }, []);

  const categories = useMemo(() => getPublishedCategories(), [galleryVersion]);
  const albums = useMemo(() => getPublishedAlbums(), [galleryVersion]);
  const allMedia = useMemo(() => getPublishedMedia(), [galleryVersion]);

  const category = search.category ?? "all";
  const albumSlug = search.album;
  const album = albumSlug ? getAlbum(albumSlug) : undefined;
  const view: "albums" | "all" = album ? "all" : (search.view ?? "albums");
  const shown = search.show ?? galleryPerPage;

  const items = useMemo(
    () => filterMedia({ category, album: album?.slug }),
    [category, album?.slug],
  );
  const visible = items.slice(0, shown);

  const visibleAlbums = useMemo(
    () => (category === "all" ? albums : albums.filter((a) => a.categorySlug === category)),
    [albums, category],
  );

  const setCategory = (slug: string) =>
    navigate({
      search: (prev: GallerySearch): GallerySearch => ({
        ...prev,
        category: slug !== "all" ? slug : undefined,
        album: undefined,
        show: undefined,
      }),
      replace: true,
    });

  const setView = (next: "albums" | "all") =>
    navigate({
      search: (prev: GallerySearch): GallerySearch => ({
        ...prev,
        view: next === "all" ? "all" : undefined,
        album: undefined,
        show: undefined,
      }),
      replace: true,
    });

  const openAlbum = (slug: string) =>
    navigate({
      search: (prev: GallerySearch): GallerySearch => ({ ...prev, album: slug, show: undefined }),
      replace: true,
    });

  const clearAlbum = () =>
    navigate({
      search: (prev: GallerySearch): GallerySearch => ({
        ...prev,
        album: undefined,
        show: undefined,
      }),
      replace: true,
    });

  const loadMore = () =>
    navigate({
      search: (prev: GallerySearch): GallerySearch => ({
        ...prev,
        show: shown + galleryPerPage,
      }),
      replace: true,
    });

  const showAlbums = view === "albums" && !album;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        {galleryBannerBlock.visible ? (
          <PageBanner
            title={galleryBannerBlock.title}
            subtitle={galleryBannerBlock.subtitle}
            image={galleryBannerBlock.image}
            imageAlt={galleryBannerBlock.imageAlt}
            breadcrumbs={galleryBannerBlock.breadcrumbs}
          />
        ) : (
          <h1 className="mx-auto max-w-7xl px-4 pt-10 text-3xl font-extrabold">Gallery</h1>
        )}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          {allMedia.length === 0 ? (
            <EmptyGallery />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <GalleryFilters
                  categories={categories}
                  active={category}
                  total={allMedia.length}
                  onSelect={setCategory}
                />
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={showAlbums ? "default" : "outline"}
                    aria-pressed={showAlbums}
                    onClick={() => setView("albums")}
                  >
                    <ImagesIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Albums
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!showAlbums ? "default" : "outline"}
                    aria-pressed={!showAlbums}
                    onClick={() => setView("all")}
                  >
                    <LayoutGrid className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    All media
                  </Button>
                </div>
              </div>

              {album ? (
                <div className="mt-6">
                  <Breadcrumbs
                    items={[
                      { label: "Home", href: "/" },
                      { label: "Gallery", href: "/gallery" },
                      { label: album.title, href: `/gallery?album=${album.slug}` },
                    ]}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                        {album.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">{album.description}</p>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={clearAlbum}>
                      <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      All albums
                    </Button>
                  </div>
                </div>
              ) : (
                <h2 className="mt-6 text-xl font-bold text-foreground sm:text-2xl">
                  {showAlbums ? "Albums" : "All media"}
                  {category !== "all" ? ` — ${getCategoryLabel(category)}` : ""}
                </h2>
              )}

              {showAlbums ? (
                visibleAlbums.length === 0 ? (
                  <EmptyResults onReset={() => setCategory("all")} />
                ) : (
                  <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleAlbums.map((a) => (
                      <AlbumCard key={a.id} album={a} onOpen={openAlbum} />
                    ))}
                  </ul>
                )
              ) : items.length === 0 ? (
                <EmptyResults onReset={() => setCategory("all")} />
              ) : (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Showing {visible.length} of {items.length} items
                  </p>
                  <GalleryGrid items={visible} onOpen={setLightbox} />
                  {visible.length < items.length ? (
                    <div className="mt-8 text-center">
                      <Button type="button" variant="outline" onClick={loadMore}>
                        Load more media
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
      <Toaster />
      <GalleryLightbox
        items={visible}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndexChange={setLightbox}
      />
    </div>
  );
}

function EmptyGallery() {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <ImageOff className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm text-muted-foreground">
        Photos and videos will appear here as soon as they are published.
      </p>
    </div>
  );
}

function EmptyResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
      <ImageOff className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm text-muted-foreground">Nothing published in this category yet.</p>
      <Button type="button" variant="outline" className="mt-4" onClick={onReset}>
        Show all media
      </Button>
    </div>
  );
}
