import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { ContactChannel, ContactChannelType } from "@/content/contact";
import { contactSettings } from "@/content/contact";

const icons: Record<ContactChannelType, typeof Phone> = {
  address: MapPin,
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  hours: Clock,
};

export function ContactCards({ channels }: { channels: ContactChannel[] }) {
  if (channels.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Contact details will appear here once they are published.
      </p>
    );
  }

  const hours = contactSettings.businessHours
    .filter((h) => h.published)
    .sort((a, b) => a.order - b.order);

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {channels.map((c) => {
        const Icon = icons[c.type];
        const external = c.href?.startsWith("http");
        return (
          <li key={c.id} className="min-w-0 rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold tracking-tight">{c.label}</h3>
                {c.href ? (
                  <a
                    href={c.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer noopener" : undefined}
                    className="mt-1 block break-words text-sm text-foreground hover:text-primary hover:underline"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 break-words text-sm text-foreground">{c.value}</p>
                )}

                {c.type === "hours" && hours.length > 0 ? (
                  <dl className="mt-2 space-y-1">
                    {hours.map((h) => (
                      <div key={h.id} className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                        <dt className="font-semibold text-foreground/80">{h.days}</dt>
                        <dd>{h.hours}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {c.note ? <p className="mt-2 text-xs text-muted-foreground">{c.note}</p> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
