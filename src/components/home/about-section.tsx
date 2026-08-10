import { Button } from "@/components/ui/button";
import { aboutSection } from "@/content/site";
import { CountUp } from "@/components/common/count-up";
import { AppLink } from "@/components/common/app-link";

import heroFleet from "@/assets/hero-fleet.jpg";

export function AboutSection() {
  if (!aboutSection.meta.visible) return null;

  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md">
          <img
            src={heroFleet}
            alt={aboutSection.imageAlt}
            width={1200}
            height={800}
            className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">About us</p>
          <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {aboutSection.meta.heading}
          </h2>
          <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
            {aboutSection.meta.subheading}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {aboutSection.stats.map((stat) => (
              <div key={stat.id} className="rounded-xl border border-border bg-card p-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    className="block text-2xl font-extrabold tracking-tight text-primary"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <Button asChild size="lg" className="mt-8">
            <AppLink href={aboutSection.cta.href}>{aboutSection.cta.label}</AppLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
