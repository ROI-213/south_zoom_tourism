import { Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
      {inclusions || exclusions ? (
        <div className="grid gap-4 md:grid-cols-2">
          {inclusions ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-base font-semibold">{inclusions.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {inclusions.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {exclusions ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-base font-semibold">{exclusions.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {exclusions.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {rest.length ? (
        <Accordion type="multiple" className="rounded-xl border border-border bg-card px-4">
          {rest.map((policy) => (
            <AccordionItem key={policy.id} value={policy.id}>
              <AccordionTrigger className="text-left text-sm font-semibold">
                {policy.title}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                  {policy.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
    </div>
  );
}
