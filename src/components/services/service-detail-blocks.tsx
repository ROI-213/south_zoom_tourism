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
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <h2 id={`${id}-heading`} className="text-xl font-bold sm:text-2xl">
        {title}
      </h2>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
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
          <ul className="grid gap-3 sm:grid-cols-2">
            {module.options.map((option) => (
              <li key={option.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold">{option.label}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{option.detail}</p>
              </li>
            ))}
          </ul>
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
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0">{feature}</span>
            </li>
          ))}
        </ul>
        <ul className="grid gap-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0">{benefit}</span>
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
          <li key={step.id} className="rounded-xl border border-border bg-card p-4">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {index + 1}
            </span>
            <h3 className="mt-3 text-sm font-bold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
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
          <li key={item.id} className="overflow-hidden rounded-xl border border-border">
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
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[420px] text-left text-sm">
            <caption className="sr-only">Published rates for this service</caption>
            <thead className="bg-secondary/60">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Option</th>
                <th scope="col" className="px-4 py-3 font-semibold">Unit</th>
                <th scope="col" className="px-4 py-3 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <span className="font-medium">{row.label}</span>
                    {row.note ? (
                      <span className="block text-xs text-muted-foreground">{row.note}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.unit}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{row.price ?? "On enquiry"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-5">
          <p className="text-sm font-semibold">Contact for price</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Rates for this service depend on your plan. Send an enquiry and we reply with a written quote.
          </p>
          <button
            type="button"
            onClick={onEnquire}
            className="mt-3 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Request a quote
          </button>
        </div>
      )}
      {note ? (
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
      <ul className="grid gap-2">
        {terms.map((term) => (
          <li key={term} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span className="min-w-0">{term}</span>
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
            <AccordionTrigger className="text-left text-sm font-semibold">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Block>
  );
}
