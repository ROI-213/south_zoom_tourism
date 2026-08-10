import { AppLink } from "@/components/common/app-link";
import { countHotelsInCategory, type HotelCategory } from "@/content/hotels";

export function HotelCategoryGrid({
  categories,
  activeSlug,
}: {
  categories: HotelCategory[];
  activeSlug?: string;
}) {
  if (categories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Categories are being updated. Use the search above to find a stay.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const count = countHotelsInCategory(c.slug);
        const active = activeSlug === c.slug;
        return (
          <li key={c.id}>
            <AppLink
              href={`/hotels?category=${encodeURIComponent(c.slug)}`}
              className={`flex h-full flex-col rounded-xl border p-4 transition-colors ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/60"
              }`}
              ariaLabel={`Browse ${c.label} stays`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-foreground">{c.label}</span>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                  {count} {count === 1 ? "stay" : "stays"}
                </span>
              </span>
              <span className="mt-1.5 text-xs text-muted-foreground">{c.description}</span>
            </AppLink>
          </li>
        );
      })}
    </ul>
  );
}
