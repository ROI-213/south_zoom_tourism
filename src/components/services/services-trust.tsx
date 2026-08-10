import * as Icons from "lucide-react";
import { servicesTrustBlock } from "@/content/services";
import { Reveal } from "@/components/common/reveal";
import { AboutHeading } from "@/components/about/about-heading";

type IconName = keyof typeof Icons;

export function ServicesTrust() {
  if (!servicesTrustBlock.visible) return null;

  return (
    <section className="bg-secondary/40 py-14 sm:py-20" aria-labelledby="services-trust-heading">
      <div className="mx-auto max-w-7xl px-4">
        <div id="services-trust-heading">
          <AboutHeading
            heading={servicesTrustBlock.heading}
            subheading={servicesTrustBlock.subheading}
          />
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {servicesTrustBlock.items.map((item, index) => {
            const Icon = (Icons[item.icon as IconName] ?? Icons.Circle) as Icons.LucideIcon;
            return (
              <Reveal as="li" key={item.id} delay={index * 60} className="h-full">
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
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
