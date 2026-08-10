import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { destinationsCtaBlock } from "@/content/destinations";
import { waLink } from "@/content/site";

export function CustomTripCta() {
  if (!destinationsCtaBlock.visible) return null;

  return (
    <section
      aria-labelledby="custom-trip-heading"
      className="mt-14 rounded-2xl border border-border bg-secondary/40 p-6 sm:p-10"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Custom trips
      </span>
      <h2 id="custom-trip-heading" className="mt-3 text-balance text-xl font-bold sm:text-2xl">
        {destinationsCtaBlock.heading}
      </h2>
      <p className="mt-3 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
        {destinationsCtaBlock.body}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/contact-us">{destinationsCtaBlock.primary.label}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/tour-packages">{destinationsCtaBlock.secondary.label}</Link>
        </Button>
        <Button asChild variant="outline">
          <AppLink href={waLink("Hi, I'd like help planning a custom South India trip.")}>
            WhatsApp us
          </AppLink>
        </Button>
      </div>
    </section>
  );
}
