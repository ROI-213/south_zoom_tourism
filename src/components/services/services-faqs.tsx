import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { servicesFaqBlock } from "@/content/services";
import { AboutHeading } from "@/components/about/about-heading";

export function ServicesFaqs() {
  if (!servicesFaqBlock.visible || servicesFaqBlock.items.length === 0) return null;

  return (
    <section className="py-14 sm:py-20" aria-labelledby="services-faq-heading">
      <div className="mx-auto max-w-3xl px-4">
        <div id="services-faq-heading">
          <AboutHeading heading={servicesFaqBlock.heading} subheading={servicesFaqBlock.subheading} />
        </div>
        <Accordion type="single" collapsible className="w-full">
          {servicesFaqBlock.items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-sm font-semibold sm:text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
