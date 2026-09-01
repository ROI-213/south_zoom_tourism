import { Check, X, ShieldCheck, Car, Clock, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function DestinationPolicies({ destinationName }: { destinationName: string }) {
  const inclusions = [
    `Dedicated sanitised AC vehicle (Sedan / SUV / Tempo Traveller / Bus) for complete ${destinationName} sightseeing & transfers`,
    `Professional verified chauffeur with extensive route experience across ${destinationName}`,
    "All vehicle fuel, maintenance, and driver allowance (Per Day) included",
    "All highway toll gates, interstate road permits, and standard parking charges",
    "100% KA registered commercial yellow-board vehicles with SZT verified stickers",
    "GPS live tracking and 24/7 South Zoom Tourism trip coordination",
    "Zero hidden fees and transparent pricing with itemised trip quotation",
  ];

  const exclusions = [
    `Monument, wildlife safari, palace, boating, museum and temple entry tickets in ${destinationName}`,
    "Lunch, dinner, room service, alcoholic drinks and personal food orders",
    "Local government guide fees and camera / videography permits at heritage monuments",
    "Night driving charges (applicable only between 9:30 PM to 5:30 AM if traveling outside planned schedule)",
    "Airfare, railway tickets, or intercity bus tickets to/from trip starting point",
    "Personal expenses, shopping, laundry, telephone, driver tipping and travel insurance",
    "Unforeseen costs due to road diversions, landslides or extreme weather delays",
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* All Inclusive */}
        <div className="flex flex-col rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold text-foreground">Inclusions</h3>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              All Inclusive
            </Badge>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {inclusions.map((item) => (
              <li key={item} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* All Exclusive */}
        <div className="flex flex-col rounded-2xl border border-destructive/20 bg-gradient-to-b from-destructive/5 to-transparent p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-destructive/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <X className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold text-foreground">Exclusions</h3>
            </div>
            <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
              All Exclusive
            </Badge>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {exclusions.map((item) => (
              <li key={item} className="flex gap-2.5">
                <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fleet Standards & Transparency Ribbon */}
      <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs">
        <div className="flex items-center gap-2">
          <Car className="size-4 shrink-0 text-primary" />
          <span><strong>Fleet:</strong> 100% KA Yellow Board Commercial Vehicles</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" />
          <span><strong>Night Charges:</strong> 9:30 PM – 5:30 AM (Driver Allow: Per Day)</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-4 shrink-0 text-primary" />
          <span><strong>Helpline:</strong> +91 6366357757 (Call & WhatsApp)</span>
        </div>
      </div>

      {/* Accordion for Destination Fleet & Trip Policies */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Trip Policies & Travel Guidelines
        </h4>
        <Accordion type="multiple" className="rounded-2xl border border-border bg-card px-4">
          <AccordionItem value="policy-terms">
            <AccordionTrigger className="text-left text-sm font-semibold hover:text-primary">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span>Terms & Fleet Policy</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-6 text-sm text-muted-foreground">
                <li className="list-disc leading-relaxed">
                  <strong>Driver Allowance:</strong> Charged on a strictly <strong>Per Day</strong> basis for standard daytime itinerary.
                </li>
                <li className="list-disc leading-relaxed">
                  <strong>Night Charges:</strong> Standard night allowance applies for driving between <strong>9:30 PM and 5:30 AM</strong>.
                </li>
                <li className="list-disc leading-relaxed">
                  <strong>AC Operation:</strong> Vehicle air conditioning operates continuously during road travel and is switched off when idling/parked or navigating extreme ghat slopes.
                </li>
                <li className="list-disc leading-relaxed">
                  <strong>Commercial Compliance:</strong> Every vehicle carries valid commercial passenger permits, all-India / state road tax papers, and passenger insurance.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="policy-cancellation">
            <AccordionTrigger className="text-left text-sm font-semibold hover:text-primary">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span>Payment & Cancellation Policy</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-6 text-sm text-muted-foreground">
                <li className="list-disc leading-relaxed">
                  <strong>25% Advance Token:</strong> Required to block vehicles and lock in fixed quotes.
                </li>
                <li className="list-disc leading-relaxed">
                  <strong>Easy Cancellations:</strong> Full refund for cancellations made 15+ days prior to travel; 75% refund between 7–14 days.
                </li>
                <li className="list-disc leading-relaxed">
                  <strong>Instant Invoicing:</strong> Official GST invoice and receipt issued for every trip payment.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
