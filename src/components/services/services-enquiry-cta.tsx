import { MessageCircle, Phone } from "lucide-react";
import { servicesEnquiryBlock } from "@/content/services";
import { company, waLink } from "@/content/site";
import { Button } from "@/components/ui/button";

export function ServicesEnquiryCta({ onEnquire }: { onEnquire: () => void }) {
  if (!servicesEnquiryBlock.visible) return null;

  return (
    <section className="py-14 sm:py-20" aria-labelledby="services-enquiry-heading">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <h2
                id="services-enquiry-heading"
                className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {servicesEnquiryBlock.heading}
              </h2>
              <p className="mt-3 max-w-2xl text-pretty text-sm opacity-90 sm:text-base">
                {servicesEnquiryBlock.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={onEnquire}>
                Send an enquiry
              </Button>
              <Button variant="outline" asChild className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <a
                  href={waLink("Hi South Zoom Tourism, I'd like help choosing the right service.")}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </Button>
              <Button variant="outline" asChild className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <a href={`tel:${company.phoneRaw}`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
