import { Reveal } from "@/components/common/reveal";
import { AboutHeading } from "@/components/about/about-heading";
import { timelineBlock } from "@/content/about";

export function AboutTimeline() {
  const items = timelineBlock.items.filter((i) => i.visible).sort((a, b) => a.order - b.order);
  if (!timelineBlock.visible || items.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <AboutHeading heading={timelineBlock.heading} subheading={timelineBlock.subheading} />

        <ol className="relative space-y-8 border-l border-border pl-6 sm:pl-10">
          {items.map((item, i) => (
            <Reveal as="li" key={item.id} delay={i * 60} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[31px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-primary bg-background sm:-left-[47px]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <div className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {item.year}
                  </span>
                  <h3 className="mt-3 text-base font-bold sm:text-lg">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.imageAlt ?? item.title}
                    width={640}
                    height={480}
                    loading="lazy"
                    className="h-32 w-full shrink-0 rounded-lg object-cover sm:h-24 sm:w-40"
                  />
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
