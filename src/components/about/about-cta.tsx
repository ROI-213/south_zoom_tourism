import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { Reveal } from "@/components/common/reveal";
import { aboutCtaBlock } from "@/content/about";

export function AboutCta() {
  if (!aboutCtaBlock.visible) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <Reveal>
        <div className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
                {aboutCtaBlock.heading}
              </h2>
              <p className="mt-3 max-w-2xl text-pretty text-sm text-primary-foreground/85 sm:text-base">
                {aboutCtaBlock.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {aboutCtaBlock.ctas.map((cta) => (
                <Button key={cta.label} asChild size="lg" variant="secondary">
                  <AppLink href={cta.href}>{cta.label}</AppLink>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
