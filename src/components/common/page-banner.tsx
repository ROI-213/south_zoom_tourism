import { Breadcrumbs, type Crumb } from "@/components/common/breadcrumbs";

export function PageBanner({
  title,
  subtitle,
  image,
  imageAlt,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
  breadcrumbs: Crumb[];
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={image}
        alt={imageAlt}
        width={1920}
        height={900}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/55 sm:bg-gradient-to-r sm:from-background/95 sm:via-background/80 sm:to-background/25" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-24">
        <Breadcrumbs items={breadcrumbs} tone="onImage" />
        <h1 className="mt-4 max-w-3xl text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
