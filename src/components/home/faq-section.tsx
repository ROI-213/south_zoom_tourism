import { HelpCircle, PhoneCall, MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { faqSection, waLink, company } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { EmptyState } from "@/components/home/fleet-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export function FaqSection() {
  if (!faqSection.meta.visible) return null;
  const items = faqSection.items;

  return (
    <section
      id="faqs"
      className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background py-14 sm:py-20"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader meta={faqSection.meta} />

        {items.length === 0 ? (
          <EmptyState message="FAQs will appear here soon." />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Support Card */}
            <div className="flex flex-col justify-between lg:col-span-4">
              <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> 24/7 Support Desk
                </span>

                <h3 className="mt-4 text-xl font-extrabold text-foreground">
                  Have a question not listed here?
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Our trip planners are available around the clock to help you choose the right vehicle, plan your itinerary, or confirm custom bookings.
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/50 hover:bg-card"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <PhoneCall className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="block text-[11px] text-muted-foreground">Call Us Directly</span>
                      <span className="text-xs font-bold text-foreground">{company.phone}</span>
                    </div>
                  </a>

                  <Button asChild className="w-full font-bold shadow-md" size="lg">
                    <a
                      href={waLink("Hi South Zoom Tourism, I have a quick question about booking.")}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Animated Card Accordions */}
            <div className="lg:col-span-8">
              <Accordion type="single" collapsible className="space-y-4">
                {items.map((f, idx) => {
                  const numberFormatted = String(idx + 1).padStart(2, "0");
                  return (
                    <AccordionItem
                      key={f.id}
                      value={f.id}
                      className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:border-primary/60 hover:shadow-md data-[state=open]:border-primary/70 data-[state=open]:bg-gradient-to-r data-[state=open]:from-card data-[state=open]:to-primary/5"
                    >
                      <AccordionTrigger className="flex items-center justify-between px-6 py-5 text-left transition-colors hover:no-underline">
                        <div className="flex items-center gap-4 min-w-0 pr-4">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-black text-primary transition-colors duration-300 group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground">
                            {numberFormatted}
                          </span>
                          <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary sm:text-base">
                            {f.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-border/40 px-6 pb-6 pt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        <div className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <p>{f.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>
        )}

        <ViewAllMobile meta={faqSection.meta} />
      </div>
    </section>
  );
}
