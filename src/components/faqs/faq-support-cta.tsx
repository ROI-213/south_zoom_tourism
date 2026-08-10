import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { company, telLink, waLink } from "@/content/site";
import { faqSupportBlock, getFaqCategoryLabel } from "@/content/faqs";

/** Contact actions that carry the currently selected FAQ topic through. */
export function FaqSupportCta({ category, query }: { category: string; query: string }) {
  if (!faqSupportBlock.visible) return null;

  const topic = category === "all" ? "General" : getFaqCategoryLabel(category);
  const contactHref =
    `/contact-us?intent=support&topic=${encodeURIComponent(category)}` +
    (query.trim() ? `&question=${encodeURIComponent(query.trim())}` : "");
  const message =
    `Hi South Zoom Tourism, I have a question about ${topic}` +
    (query.trim() ? `: ${query.trim()}` : ".");

  return (
    <section
      aria-labelledby="faq-support-heading"
      className="rounded-2xl border border-border bg-secondary/50 p-5 sm:p-7"
    >
      <h2 id="faq-support-heading" className="text-lg font-bold tracking-tight sm:text-xl">
        {faqSupportBlock.heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{faqSupportBlock.description}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Selected topic: <span className="font-semibold text-foreground">{topic}</span>
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild size="sm">
          <AppLink href={contactHref}>Ask our team</AppLink>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={waLink(message)} target="_blank" rel="noreferrer noopener">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={telLink()}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            {company.phone}
          </a>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <a href={`mailto:${company.email}`}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            <span className="break-all">{company.email}</span>
          </a>
        </Button>
      </div>
    </section>
  );
}
