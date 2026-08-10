import * as Icons from "lucide-react";
import { MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/content/services";
import { company, waLink } from "@/content/site";

type IconName = keyof typeof Icons;

export function ServiceHero({ service, onEnquire }: { service: Service; onEnquire: () => void }) {
  const Icon = (Icons[service.icon as IconName] ?? Icons.Circle) as Icons.LucideIcon;

  return (
    <section className="border-b border-border bg-secondary/40 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: service.title, href: `/services/${service.slug}` },
          ]}
        />
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="min-w-0">
            <span className="inline-grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              {service.title}
            </h1>
            <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
              {service.shortDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {service.showPricing && service.priceFrom ? (
                <Badge>From {service.priceFrom}</Badge>
              ) : (
                <Badge variant="secondary">Contact for price</Badge>
              )}
              {service.features.slice(0, 2).map((feature) => (
                <Badge key={feature} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button type="button" onClick={onEnquire}>
                Enquire Now
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={waLink(`Hi South Zoom Tourism, I'd like to book your ${service.title} service.`)}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`tel:${company.phoneRaw}`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call
                </a>
              </Button>
            </div>
          </div>
          <img
            src={service.image}
            alt={service.imageAlt}
            width={1200}
            height={800}
            fetchPriority="high"
            className="aspect-[3/2] w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
