import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { Reveal } from "@/components/common/reveal";
import { overviewBlock } from "@/content/about";

import fleetWagonR from "@/assets/fleet-wagonr-ka.jpg";
import fleetDzire from "@/assets/fleet-dzire-new.png";
import fleetErtiga from "@/assets/fleet-ertiga-new.png";
import fleetInnova from "@/assets/fleet-innova-new.png";
import fleetTempo from "@/assets/fleet-tempo-new.png";
import fleetUrbania from "@/assets/fleet-urbania-ka.jpg";
import fleetBus from "@/assets/fleet-bus-ka.jpg";
import fleetBmw from "@/assets/fleet-bmw-new.png";

const fleetImages = [
  { src: fleetDzire, alt: "White Swift Dzire Sedan with KA yellow board" },
  { src: fleetInnova, alt: "White Toyota Innova Crysta with KA yellow board" },
  { src: fleetErtiga, alt: "White Maruti Ertiga with KA yellow board" },
  { src: fleetTempo, alt: "White Force Tempo Traveller TT with KA yellow board & SZT sticker" },
  { src: fleetUrbania, alt: "White Force Urbania Luxury Van with KA yellow board & SZT sticker" },
  { src: fleetBus, alt: "White Tourist Coach Bus with KA yellow board & SZT sticker" },
  { src: fleetWagonR, alt: "White Maruti WagonR with KA yellow board" },
  { src: fleetBmw, alt: "White BMW 5 Series Premium Sedan with yellow board" },
];

const slidingFleetImages = [...fleetImages, ...fleetImages];

export function AboutOverview() {
  if (!overviewBlock.visible) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="min-w-0">
          <div className="relative min-w-0 overflow-hidden py-2">
            {/* Subtle edge fade overlays */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-10 sm:w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10 sm:w-16 bg-gradient-to-l from-background to-transparent" />

            <div className="flex h-[280px] w-max gap-4 animate-continuous-slide sm:h-[380px]">
              {slidingFleetImages.map((img, idx) => (
                <div
                  key={`${idx}`}
                  className="flex h-full w-[280px] shrink-0 items-center justify-center sm:w-[360px]"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal className="min-w-0" delay={80}>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {overviewBlock.heading}
          </h2>
          {overviewBlock.paragraphs.map((p, i) => (
            <p key={i} className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
              {p}
            </p>
          ))}

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {overviewBlock.facts.map((fact) => (
              <div key={fact.id} className="min-w-0 rounded-xl border border-border bg-card p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {overviewBlock.ctas.map((cta) => (
              <Button
                key={cta.label}
                asChild
                size="lg"
                variant={cta.variant === "primary" ? "default" : "outline"}
              >
                <AppLink href={cta.href}>{cta.label}</AppLink>
              </Button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
