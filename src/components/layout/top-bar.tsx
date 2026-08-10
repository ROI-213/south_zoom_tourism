import { Clock, Mail, MessageCircle, Phone, User } from "lucide-react";
import { company, telLink, waLink } from "@/content/site";
import { AppLink } from "@/components/common/app-link";

export function TopBar() {
  return (
    <div className="hidden border-b border-border bg-secondary text-secondary-foreground lg:block">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1">
          <a href={telLink()} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>📞 {company.phone}</span>
          </a>
          <a
            href={`https://wa.me/${company.whatsappRaw}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>WhatsApp: {company.whatsapp}</span>
          </a>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
            📍 Head Office: Bengaluru, Karnataka
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <a
            href={waLink("Hi South Zoom Tourism, I'd like to know more about your services.")}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            WhatsApp
          </a>
          <nav aria-label="Social links" className="flex items-center gap-3">
            {company.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <AppLink
            href="/contact-us"
            className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
          >
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            Booking Status
          </AppLink>
        </div>
      </div>
    </div>
  );
}
