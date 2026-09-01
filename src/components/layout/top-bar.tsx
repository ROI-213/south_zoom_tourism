import { useEffect, useState } from "react";
import { Clock, Mail, MessageCircle, Phone, User } from "lucide-react";
import { company as staticCompany, telLink, waLink } from "@/content/site";
import { AppLink } from "@/components/common/app-link";
import { supabase } from "@/lib/supabase";

export function TopBar() {
  const [contact, setContact] = useState({
    phone: staticCompany.phone,
    whatsapp: staticCompany.whatsapp,
    whatsappRaw: staticCompany.whatsappRaw,
  });

  useEffect(() => {
    supabase
      .from("website_settings")
      .select("value")
      .eq("key", "contact_settings")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          setContact({
            phone: data.value.phone || staticCompany.phone,
            whatsapp: data.value.phone || staticCompany.whatsapp,
            whatsappRaw: data.value.whatsapp || staticCompany.whatsappRaw,
          });
        }
      });
  }, []);

  return (
    <div className="hidden border-b border-border bg-secondary text-secondary-foreground lg:block">
      <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 text-xs sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1">
          <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>📞 {contact.phone}</span>
          </a>
          <a
            href={`https://wa.me/${contact.whatsappRaw}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>WhatsApp: {contact.phone}</span>
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
            {staticCompany.socials.map((s) => (
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
