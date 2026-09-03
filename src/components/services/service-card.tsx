import * as Icons from "lucide-react";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Service } from "@/content/services";
import { waLink } from "@/content/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type IconName = keyof typeof Icons;

export function ServiceCard({
  service,
  onEnquire,
  onBook,
  priority = false,
}: {
  service: Service;
  onEnquire: (service: Service) => void;
  onBook?: (service: Service) => void;
  priority?: boolean;
}) {
  const Icon = (Icons[service.icon as IconName] ?? Icons.Circle) as Icons.LucideIcon;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={service.image}
          alt={service.imageAlt}
          width={1200}
          height={750}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-background/90 text-primary shadow-sm">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {service.showPricing && service.priceFrom ? (
          <Badge className="absolute right-3 top-3 font-bold">
            {service.priceFrom.startsWith("From ") ? service.priceFrom : `From ${service.priceFrom}`}
          </Badge>
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
            <Button
              size="sm"
              type="button"
              onClick={() => (onBook ? onBook(service) : onEnquire(service))}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-transform active:scale-95 text-xs px-3"
            >
              Book Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="text-xs font-semibold px-2.5"
            >
              <Link to="/services/$slug" params={{ slug: service.slug }} preload="intent">
                View Details
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => onEnquire(service)}
              className="text-xs font-semibold px-2.5"
            >
              Enquire
            </Button>
            <a
              href={waLink(`Hi South Zoom Tourism, I'd like to book your ${service.title} service.`)}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Chat on WhatsApp about ${service.title}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
