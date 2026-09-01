import { CountUp } from "@/components/common/count-up";
import { Reveal } from "@/components/common/reveal";
import { AboutHeading } from "@/components/about/about-heading";
import { aboutStatsBlock } from "@/content/about";

export function AboutStats() {
  const items = aboutStatsBlock.items.filter((i) => i.visible).sort((a, b) => a.order - b.order);
  if (!aboutStatsBlock.visible || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <AboutHeading heading={aboutStatsBlock.heading} />

      {/* Mobile Only: Continuously Sliding Stats Carousel */}
      <div className="relative mt-8 sm:hidden overflow-hidden rounded-2xl border border-border/80 bg-muted/20 py-2.5 shadow-inner">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max gap-3 animate-continuous-slide">
          {[...items, ...items].map((stat, idx) => (
            <div
              key={`${stat.id}-${idx}`}
              className="w-[160px] shrink-0 rounded-xl border border-border/80 bg-card p-4 shadow-sm text-center"
            >
              <CountUp
                value={stat.value}
                suffix={stat.suffix}
                className="block text-2xl font-extrabold tracking-tight text-primary"
              />
              <span className="mt-1 block text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop/Tablet: Grid View */}
      <dl className="mt-8 hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((stat, i) => (
          <Reveal key={stat.id} delay={i * 50} className="min-w-0">
            <div className="h-full rounded-xl border border-border bg-card p-5 text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  className="block text-2xl font-extrabold tracking-tight text-primary sm:text-3xl"
                />
                <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </span>
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
