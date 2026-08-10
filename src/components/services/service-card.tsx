import * as Icons from "lucide-react";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Service } from "@/content/services";
import { waLink } from "@/content/site";
import { Badge } from "@/components/ui/badge";

type IconName = keyof typeof Icons;

export function ServiceCard({
  service,
  onEnquire,
  priority = false,
}: {
  service: Service;
  onEnquire: (service: Service) => void;
  priority?: boolean;
}) {
  const Icon = (Icons[service.icon as IconName] ?? Icons.Circle) as Icons.LucideIcon;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors focus-within:border-primary hover:border-primary">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={service.image}
          alt={service.imageAlt}
          width={1200}
          height={750}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-background/90 text-primary shadow-sm">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {service.showPricing && service.priceFrom ? (
          <Badge className="absolute right-3 top-3">From {service.priceFrom}</Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-foreground sm:text-lg">{service.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{service.shortDescription}</p>

        <ul className="mt-4 space-y-1.5">
          {service.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-foreground/90">
              <Icons.Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0">{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/services/$slug"
              params={{ slug: service.slug }}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              View Details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => onEnquire(service)}
              className="inline-flex items-center rounded-md border border-border px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Enquire Now
            </button>
            <a
              href={waLink(`Hi South Zoom Tourism, I'd like to know more about your ${service.title} service.`)}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Chat on WhatsApp about ${service.title}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-primary transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
