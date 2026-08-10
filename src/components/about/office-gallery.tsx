import { Reveal } from "@/components/common/reveal";
import { AboutHeading } from "@/components/about/about-heading";
import { officeGalleryBlock } from "@/content/about";

export function OfficeGallery() {
  const items = officeGalleryBlock.items.filter((i) => i.visible).sort((a, b) => a.order - b.order);
  if (!officeGalleryBlock.visible || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <AboutHeading heading={officeGalleryBlock.heading} />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal as="li" key={item.id} delay={i * 60} className="min-w-0">
            <img
              src={item.image}
              alt={item.alt}
              width={1200}
              height={900}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
            />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
