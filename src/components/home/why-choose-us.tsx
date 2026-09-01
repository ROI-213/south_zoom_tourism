import * as Icons from "lucide-react";
import { whyChooseUs } from "@/content/site";
import { SectionHeader } from "@/components/common/section-header";

type IconName = keyof typeof Icons;

export function WhyChooseUs() {
  if (!whyChooseUs.meta.visible) return null;

  return (
    <section
      id="why-us"
      className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background py-14 sm:py-20"
    >
      {/* Ambient lighting orb */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader meta={whyChooseUs.meta} align="center" />

        <ul className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.items.map((item, idx) => {
            const Icon = (Icons[item.icon as IconName] ?? Icons.Circle) as Icons.LucideIcon;
            const numberFormatted = String(idx + 1).padStart(2, "0");

            return (
              <li
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-3.5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
              >
                {/* Number Watermark */}
                <span className="pointer-events-none absolute right-2 sm:right-4 top-1 sm:top-2 text-4xl sm:text-6xl font-black text-muted-foreground/10 transition-colors group-hover:text-primary/15">
                  {numberFormatted}
                </span>

                <div>
                  {/* Glowing Icon Badge */}
                  <span className="grid h-9 w-9 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
                  </span>

                  <h3 className="mt-3 sm:mt-5 text-xs sm:text-lg font-bold text-foreground transition-colors group-hover:text-primary truncate">
                    {item.title}
                  </h3>

                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm leading-relaxed text-muted-foreground line-clamp-2 sm:line-clamp-none">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
