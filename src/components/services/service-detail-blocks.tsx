import { Check, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PricingRow, ServiceModule } from "@/content/service-details";

function Block({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 w-full min-w-0">
      <h2 id={`${id}-heading`} className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
        {title}
      </h2>
      {description ? <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p> : null}
      <div className="mt-4 w-full min-w-0">{children}</div>
    </section>
  );
}

export function ServiceOverview({ text }: { text: string }) {
  return (
    <Block id="overview" title="About this service">
      <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">{text}</p>
    </Block>
  );
}

export function ServiceModules({ modules }: { modules: ServiceModule[] }) {
  if (modules.length === 0) return null;
  return (
    <>
      {modules.map((module) => (
        <Block key={module.id} id={module.id} title={module.title} description={module.description}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {module.options.map((option) => (
              <div
                key={option.id}
                className="flex flex-col justify-start rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-primary/50 min-w-0"
              >
                <h3 className="text-sm font-bold text-foreground leading-snug break-words">
                  {option.label}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                  {option.detail}
                </p>
              </div>
            ))}
          </div>
        </Block>
      ))}
    </>
  );
}

export function ServiceFeatures({ features, benefits }: { features: string[]; benefits: string[] }) {
  if (features.length === 0 && benefits.length === 0) return null;
  return (
    <Block id="features" title="What's included">
      <div className="grid gap-6 sm:grid-cols-2">
        <ul className="grid gap-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs sm:text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>
        <ul className="grid gap-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-xs sm:text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 text-foreground/90">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </Block>
  );
}

export function ServiceProcess({
  steps,
}: {
  steps: { id: string; title: string; description: string }[];
}) {
  if (steps.length === 0) return null;
  return (
    <Block id="process" title="How it works">
      <ol className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.id} className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {index + 1}
            </span>
            <h3 className="mt-3 text-sm font-bold text-foreground">{step.title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </li>
        ))}
      </ol>
    </Block>
  );
}

export function ServiceGallery({
  items,
  serviceTitle,
}: {
  items: { id: string; image: string; alt: string }[];
  serviceTitle: string;
}) {
  if (items.length === 0) return null;
  return (
    <Block id="gallery" title={`${serviceTitle} gallery`}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="overflow-hidden rounded-xl border border-border shadow-xs">
            <img
              src={item.image}
              alt={item.alt}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </li>
        ))}
      </ul>
    </Block>
  );
}

export function ServicePricing({
  showRates,
  note,
  rows,
  onEnquire,
}: {
  showRates: boolean;
  note: string;
  rows: PricingRow[];
  onEnquire: () => void;
}) {
  return (
    <Block id="pricing" title="Pricing">
      {showRates && rows.length > 0 ? (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <caption className="sr-only">Published rates for this service</caption>
              <thead className="bg-muted/60 border-b border-border text-foreground font-semibold">
                <tr>
                  <th scope="col" className="px-3.5 py-3 sm:px-4 sm:py-3.5 w-1/2">Option</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3.5 w-1/4">Unit</th>
                  <th scope="col" className="px-3.5 py-3 sm:px-4 sm:py-3.5 w-1/4 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-3.5 py-3 sm:px-4 sm:py-3.5 align-top">
                      <span className="font-semibold text-foreground block">{row.label}</span>
                      {row.note ? (
                        <span className="block text-[11px] text-muted-foreground mt-0.5">{row.note}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 text-muted-foreground align-top whitespace-nowrap">
                      {row.unit}
                    </td>
                    <td className="px-3.5 py-3 sm:px-4 sm:py-3.5 font-bold text-primary text-right align-top whitespace-nowrap">
                      {row.price ?? "On enquiry"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">Contact for price</p>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            Rates for this service depend on your plan. Send an enquiry and we reply with a written quote.
          </p>
          <button
            type="button"
            onClick={onEnquire}
            className="mt-3 text-xs sm:text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Request a quote →
          </button>
        </div>
      )}
      {note ? (
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0">{note}</span>
        </p>
      ) : null}
    </Block>
  );
}

export function ServiceTerms({ terms }: { terms: string[] }) {
  if (terms.length === 0) return null;
  return (
    <Block id="terms" title="Terms & conditions">
      <ul className="grid gap-2.5">
        {terms.map((term) => (
          <li key={term} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span className="min-w-0 text-foreground/90">{term}</span>
          </li>
        ))}
      </ul>
    </Block>
  );
}

export function ServiceFaqs({
  items,
}: {
  items: { id: string; question: string; answer: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <Block id="faqs" title="Frequently asked questions">
      <Accordion type="single" collapsible className="w-full">
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left text-sm font-semibold text-foreground">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Block>
  );
}
