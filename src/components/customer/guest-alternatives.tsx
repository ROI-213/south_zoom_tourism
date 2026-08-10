import { Search, UserRound, Phone, MessageCircle } from "lucide-react";
import { AppLink } from "@/components/common/app-link";
import { company } from "@/content/site";

export function GuestAlternatives() {
  const waNumber = company.whatsappRaw;
  return (
    <section
      aria-labelledby="guest-heading"
      className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 sm:p-6"
    >
      <h2 id="guest-heading" className="text-lg font-bold tracking-tight sm:text-xl">
        Prefer not to sign in?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Guest booking stays fully supported. You never need an account to travel with us.
      </p>
      <ul className="mt-4 grid gap-3">
        <li>
          <AppLink
            href="/booking-status"
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">Track a booking with your reference number</span>
          </AppLink>
        </li>
        <li>
          <AppLink
            href="/contact-us"
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">Continue as a guest and send us an enquiry</span>
          </AppLink>
        </li>
        {company.phone ? (
          <li>
            <a
              href={`tel:${company.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">Call our team on {company.phone}</span>
            </a>
          </li>
        ) : null}
        {waNumber ? (
          <li>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">Chat with us on WhatsApp</span>
            </a>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
