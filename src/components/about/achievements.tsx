import * as Icons from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { AboutHeading } from "@/components/about/about-heading";
import { achievementsBlock } from "@/content/about";

type IconName = keyof typeof Icons;

export function Achievements() {
  const items = achievementsBlock.items.filter((i) => i.visible).sort((a, b) => a.order - b.order);
  if (!achievementsBlock.visible || items.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <AboutHeading heading={achievementsBlock.heading} />
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = (Icons[item.icon as IconName] ?? Icons.Award) as Icons.LucideIcon;
            return (
              <Reveal as="li" key={item.id} delay={i * 50} className="min-w-0">
                <div className="h-full rounded-xl border border-border bg-card p-5 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold sm:text-base">{item.title}</h3>
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
