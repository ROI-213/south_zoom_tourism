import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { contactSettings, directionsUrl, mapEmbedUrl } from "@/content/contact";

/**
 * Embedded office map with a graceful fallback: if the embed fails to load
 * (blocked, offline, or unconfigured), the address and Get Directions button
 * are still shown.
 */
export function ContactMap() {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const src = mapEmbedUrl();

  // If the iframe never fires `load`, treat the map as unavailable.
  useEffect(() => {
    if (state !== "loading") return;
    const t = window.setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), 8000);
    return () => window.clearTimeout(t);
  }, [state]);

  const fallback = state === "failed" || !contactSettings.published || !src;

  return (
    <section aria-labelledby="contact-map-heading" className="min-w-0">
      <h2 id="contact-map-heading" className="text-lg font-bold tracking-tight sm:text-xl">
        Find our office
      </h2>
      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{contactSettings.address}</span>
      </p>

      <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {fallback ? (
          <div className="p-6 text-center">
            <MapPin className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">Map couldn't be loaded</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {contactSettings.officeLabel} — {contactSettings.address}
            </p>
            <Button asChild size="sm" className="mt-4">
              <a href={directionsUrl()} target="_blank" rel="noreferrer noopener">
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get Directions
              </a>
            </Button>
          </div>
        ) : (
          <>
            {state === "loading" ? (
              <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
            ) : null}
            <iframe
              src={src}
              title={`Map showing ${contactSettings.officeLabel}`}
              loading="lazy"
              width={640}
              height={360}
              onLoad={() => setState("ready")}
              onError={() => setState("failed")}
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[280px] w-full border-0 sm:h-[360px]"
            />
          </>
        )}
      </div>

      {!fallback ? (
        <Button asChild size="sm" variant="outline" className="mt-3">
          <a href={directionsUrl()} target="_blank" rel="noreferrer noopener">
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Get Directions
          </a>
        </Button>
      ) : null}
    </section>
  );
}
