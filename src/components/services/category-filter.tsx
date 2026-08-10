import type { ServiceCategory } from "@/content/services";

export function CategoryFilter({
  categories,
  active,
  onChange,
  counts,
}: {
  categories: ServiceCategory[];
  active: string;
  onChange: (slug: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Service categories"
      className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {categories.map((category) => {
        const selected = category.slug === active;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(category.slug)}
            className={`shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {category.label}
            <span className={selected ? "ml-1.5 opacity-80" : "ml-1.5 text-muted-foreground"}>
              {counts[category.slug] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
