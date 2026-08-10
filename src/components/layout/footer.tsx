import { Compass, Clock, Mail, MapPin, Phone } from "lucide-react";
import { company, footerContent } from "@/content/site";
import { AppLink } from "@/components/common/app-link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-extrabold tracking-tight">{company.name}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{footerContent.about}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {company.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {footerContent.columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <AppLink
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="min-w-0 lg:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Contact & Head Office</h3>
          <ul className="mt-4 space-y-3 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <strong className="text-foreground">📞 Call:</strong>{" "}
                <a href={`tel:${company.phoneRaw}`} className="hover:text-primary font-medium">
                  {company.phone}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">WA:</span>
              <span>
                <strong className="text-foreground">WhatsApp:</strong>{" "}
                <a href={`https://wa.me/${company.whatsappRaw}`} target="_blank" rel="noreferrer" className="hover:text-primary font-medium">
                  {company.whatsapp}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <strong className="text-foreground">📍 Head Office:</strong> Bangalore in Karnataka
              </span>
            </li>
            <li className="border-t border-border/60 pt-2 text-xs">
              <strong className="text-foreground block mb-0.5">Areas of Operation:</strong>
              <span>Karnataka, Tamilnadu, Kerala, Andhra Pradesh, Goa, Puducherry</span>
            </li>
            <li className="border-t border-border/60 pt-2 text-xs">
              <strong className="text-foreground block mb-0.5">📍 Visit Us:</strong>
              <span>{company.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
