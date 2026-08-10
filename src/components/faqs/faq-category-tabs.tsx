import { Button } from "@/components/ui/button";
import { countFaqsInCategory, type FaqCategory } from "@/content/faqs";

export function FaqCategoryTabs({
  categories,
  active,
  total,
  onSelect,
}: {
  categories: FaqCategory[];
  active: string;
  total: number;
  onSelect: (slug: string) => void;
}) {
  const options = [{ slug: "all", label: "All topics", count: total }].concat(
    categories.map((c) => ({ slug: c.slug, label: c.label, count: countFaqsInCategory(c.slug) })),
  );

  return (
    <div
      role="group"
      aria-label="Filter FAQs by topic"
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
            <span className="truncate">{o.label}</span>
            <span className="ml-1.5 text-xs opacity-70">{o.count}</span>
          </Button>
        );
      })}
    </div>
  );
}
