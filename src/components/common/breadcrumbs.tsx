import { ChevronRight } from "lucide-react";
import { AppLink } from "@/components/common/app-link";

export type Crumb = { label: string; href: string };

export function Breadcrumbs({ items, tone = "default" }: { items: Crumb[]; tone?: "default" | "onImage" }) {
  if (items.length === 0) return null;
  const muted = tone === "onImage" ? "text-foreground/70" : "text-muted-foreground";

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className={`font-semibold ${muted}`}>
                  {item.label}
                </span>
              ) : (
                <>
                  <AppLink href={item.href} className={`${muted} hover:text-primary hover:underline`}>
                    {item.label}
                  </AppLink>
                  <ChevronRight className={`h-3.5 w-3.5 ${muted}`} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
