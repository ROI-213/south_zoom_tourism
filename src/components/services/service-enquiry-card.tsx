import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/content/services";
import { company, waLink } from "@/content/site";

/** Desktop sticky enquiry card. */
export function ServiceEnquiryCard({
  service,
  onEnquire,
}: {
  service: Service;
  onEnquire: () => void;
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-bold">Enquire about {service.title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {service.showPricing && service.priceFrom
            ? `Starting from ${service.priceFrom}. Get a written quote with every charge itemised.`
            : "Rates are shared on enquiry. Get a written quote with every charge itemised."}
        </p>
        <ul className="mt-4 space-y-2">
          {service.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span className="min-w-0">{benefit}</span>
            </li>
          ))}
        </ul>
        <Button type="button" className="mt-5 w-full" onClick={onEnquire}>
          Enquire Now
        </Button>
        <div className="mt-2 grid grid-cols-2 gap-2">
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
        <p className="mt-3 text-xs text-muted-foreground">
          Office hours {company.officeTimings} · replies usually within an hour.
        </p>
      </div>
    </aside>
  );
}

/** Mobile bottom action bar — hidden on large screens. */
export function ServiceMobileActionBar({
  service,
  onEnquire,
}: {
  service: Service;
  onEnquire: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <a
          href={`tel:${company.phoneRaw}`}
          aria-label={`Call South Zoom Tourism about ${service.title}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          href={waLink(`Hi South Zoom Tourism, I'd like to book your ${service.title} service.`)}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Chat on WhatsApp about ${service.title}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </a>
        <Button type="button" className="min-w-0 flex-1" onClick={onEnquire}>
          Enquire Now
        </Button>
      </div>
    </div>
  );
}
