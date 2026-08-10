import { Link2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Highlight } from "@/components/faqs/highlight";
import { getFaqCategoryLabel, type FaqItem } from "@/content/faqs";

export function FaqAccordion({
  items,
  open,
  onOpenChange,
  query,
  showCategoryLabel,
  onCopyLink,
}: {
  items: FaqItem[];
  open: string[];
  onOpenChange: (v: string[]) => void;
  query: string;
  showCategoryLabel?: boolean;
  onCopyLink: (faq: FaqItem) => void;
}) {
  return (
    <Accordion type="multiple" value={open} onValueChange={onOpenChange} className="w-full">
      {items.map((faq) => (
        <AccordionItem key={faq.id} value={faq.slug} id={`faq-${faq.slug}`} className="scroll-mt-28">
          <AccordionTrigger className="text-left text-sm font-semibold sm:text-base">
            <span className="min-w-0">
              {showCategoryLabel ? (
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {getFaqCategoryLabel(faq.categorySlug)}
                </span>
              ) : null}
              <Highlight text={faq.question} query={query} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            <p className="text-pretty">
              <Highlight text={faq.answer} query={query} />
            </p>
            <button
              type="button"
              onClick={() => onCopyLink(faq)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              Copy link to this answer
            </button>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
