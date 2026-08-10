import { Button } from "@/components/ui/button";
import { countMediaInCategory, type GalleryCategory } from "@/content/gallery";

export function GalleryFilters({
  categories,
  active,
  total,
  onSelect,
}: {
  categories: GalleryCategory[];
  active: string;
  total: number;
  onSelect: (slug: string) => void;
}) {
  const options = [{ slug: "all", label: "All media", count: total }].concat(
    categories.map((c) => ({ slug: c.slug, label: c.label, count: countMediaInCategory(c.slug) })),
  );

  return (
    <div
      role="group"
      aria-label="Filter gallery by category"
      className="-mx-1 flex flex-wrap gap-2 px-1"
    >
      {options.map((o) => {
        const selected = active === o.slug;
        return (
          <Button
            key={o.slug}
            type="button"
            size="sm"
            variant={selected ? "default" : "outline"}
            aria-pressed={selected}
            onClick={() => onSelect(o.slug)}
            className="rounded-full"
          >
            {o.label}
            <span className="ml-1.5 text-xs opacity-70">{o.count}</span>
          </Button>
        );
      })}
    </div>
  );
}
