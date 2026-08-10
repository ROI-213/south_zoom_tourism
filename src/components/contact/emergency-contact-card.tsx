import { AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emergencyContact } from "@/content/contact";

/** Renders only when the admin has published an after-hours number. */
export function EmergencyContactCard() {
  if (!emergencyContact.published || !emergencyContact.phoneRaw) return null;

  return (
    <section
      aria-labelledby="emergency-contact-heading"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0">
          <h2 id="emergency-contact-heading" className="text-base font-bold tracking-tight">
            {emergencyContact.heading}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{emergencyContact.description}</p>
          <Button asChild size="sm" variant="destructive" className="mt-4">
            <a href={`tel:${emergencyContact.phoneRaw}`}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              {emergencyContact.phone}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
