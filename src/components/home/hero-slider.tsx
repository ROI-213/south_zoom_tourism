import { useCallback, useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides as staticHeroSlides } from "@/content/site";
import { AppLink } from "@/components/common/app-link";
import { supabase } from "@/lib/supabase";
import { resolveHeroImage } from "@/lib/image-map";

export function HeroSlider() {
  const [slides, setSlides] = useState<any[]>(() =>
    staticHeroSlides.filter((s) => s.visible).sort((a, b) => a.order - b.order)
  );
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    async function loadLiveHeroSlides() {
      try {
        const { data, error } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map((s) => ({
            id: s.id,
            order: s.display_order,
            visible: s.active,
            badge: s.badge || undefined,
            heading: s.heading,
            description: s.description || "",
            imageDesktop: resolveHeroImage(s.image_desktop, s.heading),
            imageMobile: resolveHeroImage(s.image_mobile || s.image_desktop, s.heading),
            alt: s.heading,
            primaryCta: {
              label: s.primary_cta_label || "Book Now",
              href: s.primary_cta_href || "/fleet",
              variant: "primary",
            },
            secondaryCta: {
              label: "Talk to a Planner",
              href: "/contact-us",
              variant: "secondary",
            },
          }));
          setSlides(mapped);
        }
      } catch (err) {
        console.error("Using static hero slides fallback", err);
      }
    }
    loadLiveHeroSlides();
  }, []);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => api.scrollNext(), 6500);
    return () => window.clearInterval(id);
  }, [api, paused]);

  const scrollTo = useCallback((i: number) => api?.scrollTo(i), [api]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-label="Featured travel services"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto max-w-7xl px-4 pt-4 sm:pt-6">
        <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} className="w-full">
          <CarouselContent className="ml-0">
            {slides.map((slide, index) => (
              <CarouselItem key={slide.id} className="basis-full pl-0">
                <div className="relative h-[440px] w-full overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-border sm:h-[520px] lg:h-[600px]">
                  <img
                    src={slide.imageDesktop}
                    srcSet={`${slide.imageMobile} 768w, ${slide.imageDesktop} 1920w`}
                    sizes="100vw"
                    alt={slide.alt}
                    width={1920}
                    height={1080}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/40 sm:bg-gradient-to-r sm:from-background/95 sm:via-background/70 sm:to-background/10" />
                  <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
                    <div className="max-w-xl">
                      {slide.badge ? (
                        <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {slide.badge}
                        </span>
                      ) : null}
                      <h1 className="mt-4 text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        {slide.heading}
                      </h1>
                      <p className="mt-4 text-pretty text-sm text-muted-foreground sm:text-base">
                        {slide.description}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button asChild size="lg">
                          <AppLink href={slide.primaryCta.href}>{slide.primaryCta.label}</AppLink>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                          <AppLink href={slide.secondaryCta.href}>
                            {slide.secondaryCta.label}
                          </AppLink>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="pointer-events-none absolute inset-x-2 top-1/2 hidden -translate-y-1/2 justify-between md:flex">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous slide"
            className="pointer-events-auto rounded-full shadow-lg"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Next slide"
            className="pointer-events-auto rounded-full shadow-lg"
            onClick={() => api?.scrollNext()}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${slide.heading}`}
              aria-current={selected === i}
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                selected === i ? "w-6 bg-primary" : "w-2 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
