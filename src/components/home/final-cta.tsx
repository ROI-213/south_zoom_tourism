import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { company, finalCta, telLink, waLink } from "@/content/site";
import { AppLink } from "@/components/common/app-link";

export function FinalCta() {
  if (!finalCta.meta.visible) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-4">
      <div className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
              {finalCta.meta.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-sm text-primary-foreground/80 sm:text-base">
              {finalCta.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <AppLink href={finalCta.primaryCta.href}>{finalCta.primaryCta.label}</AppLink>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={telLink()} className="gap-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {company.phone}
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a
                href={waLink("Hi South Zoom Tourism, I'd like to plan a trip. Here are my dates: ")}
                target="_blank"
                rel="noreferrer noopener"
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
