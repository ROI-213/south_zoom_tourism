import { Info, MapPin, Receipt } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { HotelProfile } from "@/content/hotel-details";

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function HotelPoliciesPanel({
  profile,
  startingPrice,
}: {
  profile: HotelProfile | undefined;
  startingPrice: number | null;
}) {
  if (!profile) return null;
  const policies = profile.policies.filter((p) => p.visible).sort((a, b) => a.order - b.order);

  return (
    <section aria-labelledby="policies-heading" className="space-y-3">
      <h2 id="policies-heading" className="text-lg font-semibold">
        Policies, taxes and house rules
      </h2>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Receipt className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Taxes and charges
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {profile.taxPercent}% GST applies on the room total
          {startingPrice !== null
            ? ` (from ${inr(Math.round((startingPrice * profile.taxPercent) / 100))} per room / night)`
            : ""}
          . {profile.taxNote}
        </p>
        <p className="mt-2 flex gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="font-medium text-foreground">Children: </span>
            {profile.childPolicy}
          </span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Cancellation: </span>
          {profile.cancellationSummary}
        </p>
      </div>

      {policies.length > 0 && (
        <Accordion type="multiple" className="rounded-xl border bg-card px-4">
          {policies.map((policy) => (
            <AccordionItem key={policy.id} value={policy.id}>
              <AccordionTrigger className="text-left text-sm">{policy.title}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {policy.body}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </section>
  );
}

export function HotelNearbyPlaces({ profile }: { profile: HotelProfile | undefined }) {
  const places = profile?.nearbyPlaces ?? [];
  if (places.length === 0) return null;

  return (
    <section aria-labelledby="nearby-heading" className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 id="nearby-heading" className="flex items-center gap-2 text-lg font-semibold">
        <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        Nearby places
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {places.map((place) => (
          <li key={place.id} className="min-w-0 rounded-lg border p-3">
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="min-w-0 break-words text-sm font-medium">{place.name}</span>
              <span className="shrink-0 text-sm text-muted-foreground">{place.distanceKm} km</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              {place.kind}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{place.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HotelDetailFaqs({ profile }: { profile: HotelProfile | undefined }) {
  const faqs = (profile?.faqs ?? []).filter((f) => f.visible).sort((a, b) => a.order - b.order);
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="hotel-faq-heading" className="space-y-3">
      <h2 id="hotel-faq-heading" className="text-lg font-semibold">
        Frequently asked questions
      </h2>
      <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left text-sm">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
