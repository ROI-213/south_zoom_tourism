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

          {/* Continuously Sliding Stats Carousel */}
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-border/80 bg-muted/20 py-2.5 sm:py-4 shadow-inner">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent" />

            <div className="flex w-max gap-3 sm:gap-5 animate-continuous-slide">
              {[...aboutSection.stats, ...aboutSection.stats].map((stat, idx) => (
                <div
                  key={`${stat.id}-${idx}`}
                  className="w-[160px] sm:w-[200px] shrink-0 rounded-xl border border-border/80 bg-card p-3 sm:p-4 shadow-sm text-center"
                >
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    className="block text-2xl sm:text-3xl font-extrabold tracking-tight text-primary"
                  />
                  <span className="mt-1 block text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Button asChild size="lg" className="mt-8">
            <AppLink href={aboutSection.cta.href}>{aboutSection.cta.label}</AppLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
