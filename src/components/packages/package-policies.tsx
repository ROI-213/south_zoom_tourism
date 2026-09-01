import { Check, X, ShieldCheck, Car, Clock, Phone, AlertCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { PackagePolicy } from "@/content/package-details";

export function PackagePolicies({ policies }: { policies: PackagePolicy[] }) {
  const visible = policies.filter((p) => p.visible).sort((a, b) => a.order - b.order);
  const inclusions = visible.find((p) => p.key === "inclusions");
  const exclusions = visible.find((p) => p.key === "exclusions");
  const rest = visible.filter((p) => p.key !== "inclusions" && p.key !== "exclusions");

  if (!visible.length) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Inclusions and policies for this package are shared with your written quote.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* All Inclusive & All Exclusive comparison grid */}
      {inclusions || exclusions ? (
        <div className="grid gap-6 md:grid-cols-2">
          {inclusions ? (
            <div className="flex flex-col rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-emerald-500/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-bold text-foreground">{inclusions.title}</h3>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  All Inclusive
                </Badge>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {inclusions.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {exclusions ? (
            <div className="flex flex-col rounded-2xl border border-destructive/20 bg-gradient-to-b from-destructive/5 to-transparent p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-destructive/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <X className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-bold text-foreground">{exclusions.title}</h3>
                </div>
                <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                  All Exclusive
                </Badge>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {exclusions.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

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

      {/* Accordion for Other Detailed Policies */}
      {rest.length ? (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Booking Terms, Policies & Guidelines
          </h4>
          <Accordion type="multiple" className="rounded-2xl border border-border bg-card px-4">
            {rest.map((policy) => (
              <AccordionItem key={policy.id} value={policy.id}>
                <AccordionTrigger className="text-left text-sm font-semibold hover:text-primary">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <span>{policy.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-6 text-sm text-muted-foreground">
                    {policy.items.map((item) => (
                      <li key={item} className="list-disc leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : null}
    </div>
  );
}
