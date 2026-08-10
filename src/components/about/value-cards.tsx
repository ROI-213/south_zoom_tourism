import * as Icons from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { AboutHeading } from "@/components/about/about-heading";
import type { ValueItem } from "@/content/about";

type IconName = keyof typeof Icons;

/** Shared card grid used by both Core Values and Why Choose Us. */
export function ValueCards({
  heading,
  subheading,
  items,
  visible = true,
  tinted = false,
}: {
  heading: string;
  subheading?: string;
  items: ValueItem[];
  visible?: boolean;
  tinted?: boolean;
}) {
  const list = items.filter((i) => i.visible).sort((a, b) => a.order - b.order);
  if (!visible || list.length === 0) return null;

  return (
    <section className={tinted ? "bg-secondary/40 py-14 sm:py-20" : "py-14 sm:py-20"}>
      <div className="mx-auto max-w-7xl px-4">
        <AboutHeading heading={heading} subheading={subheading} />
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((item, i) => {
            const Icon = (Icons[item.icon as IconName] ?? Icons.Circle) as Icons.LucideIcon;
            return (
              <Reveal as="li" key={item.id} delay={i * 50} className="min-w-0">
                <div className="h-full rounded-xl border border-border bg-card p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
