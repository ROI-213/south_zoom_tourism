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
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
