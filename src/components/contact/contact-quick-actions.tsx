import { Hotel, Mail, MapPin, MessageCircle, Phone, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { company, waLink } from "@/content/site";
import { contactSettings, directionsUrl } from "@/content/contact";

/** All hrefs come from admin-configured values, never hardcoded links. */
export function ContactQuickActions({
  onEnquiry,
}: {
  onEnquiry: (serviceSlug: string) => void;
}) {
  const links = [
    {
      id: "qa-call",
      label: "Call Now",
      icon: Phone,
      href: `tel:${company.phoneRaw}`,
      external: false,
      variant: "default" as const,
      published: Boolean(company.phoneRaw),
    },
    {
      id: "qa-whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      href: waLink(`Hi ${company.name}, I'd like help planning a trip.`),
      external: true,
      variant: "outline" as const,
      published: Boolean(company.whatsappRaw),
    },
    {
      id: "qa-email",
      label: "Send Email",
      icon: Mail,
      href: `mailto:${company.email}?subject=${encodeURIComponent("Travel enquiry")}`,
      external: false,
      variant: "outline" as const,
      published: Boolean(company.email),
    },
  ].filter((a) => a.published);

  const enquiries = [
    { id: "qa-travel", label: "Travel Enquiry", icon: Plane, slug: "custom-tour-planning" },
    { id: "qa-hotel", label: "Hotel Enquiry", icon: Hotel, slug: "hotel-and-room-booking" },
  ];

  return (
    <div role="group" aria-label="Quick contact actions" className="flex flex-wrap gap-2">
      {links.map((a) => {
        const Icon = a.icon;
        return (
          <Button key={a.id} asChild size="sm" variant={a.variant}>
            <a
              href={a.href}
              target={a.external ? "_blank" : undefined}
              rel={a.external ? "noreferrer noopener" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {a.label}
            </a>
          </Button>
        );
      })}

      {enquiries.map((e) => {
        const Icon = e.icon;
        return (
          <Button
            key={e.id}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEnquiry(e.slug)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {e.label}
          </Button>
        );
      })}

      {contactSettings.published ? (
        <Button asChild size="sm" variant="ghost">
          <a href={directionsUrl()} target="_blank" rel="noreferrer noopener">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Get Directions
          </a>
        </Button>
      ) : null}
    </div>
  );
}
