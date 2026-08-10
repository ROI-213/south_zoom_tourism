import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { DestinationFaq } from "@/content/destination-details";

export function DestinationFaqs({
  destinationName,
  faqs,
}: {
  destinationName: string;
  faqs: DestinationFaq[];
}) {
  if (faqs.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No published questions for {destinationName} yet — send yours through the enquiry form and
        we'll answer the same day.
      </p>
    );
  }

  return (
    <Accordion type="single" collapsible className="mt-4 w-full">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left text-sm font-semibold sm:text-base">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
