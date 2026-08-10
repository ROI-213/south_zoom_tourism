import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ContactForm } from "@/components/contact/contact-form";
import { getEnquiryServiceOptions } from "@/content/contact";

type ContactSearch = Record<string, string>;

function buildPrefill(search: ContactSearch) {
  const serviceOptions = getEnquiryServiceOptions();
  const known = new Set(serviceOptions.map((o) => o.slug));

  let service = "general";
  if (search.service && known.has(search.service)) service = search.service;
  else if (search.vehicle) service = "local-taxi"; // Maps vehicles to taxi service
  else if (search.hotel || search.room)
    service = "hotel-and-room-booking";
  else if (search.package)
    service = "custom-tour-planning";
  else if (search.tripType) {
    if (search.tripType === "local") service = "local-taxi";
    else service = "outstation-trip";
  }

  const bits: string[] = [];
  if (search.vehicle) bits.push(`Vehicle: ${search.vehicle.replace(/-/g, " ").toUpperCase()}`);
  if (search.package) bits.push(`Package: ${search.package.replace(/-/g, " ").toUpperCase()}`);
  if (search.hotel) bits.push(`Hotel: ${search.hotel.replace(/-/g, " ").toUpperCase()}`);
  if (search.room) bits.push(`Room: ${search.room.replace(/-/g, " ").toUpperCase()}`);
  if (search.destination) bits.push(`Destination: ${search.destination}`);
  if (search.tripType) bits.push(`Trip Type: ${search.tripType.toUpperCase()}`);
  if (search.checkin) bits.push(`Check-in: ${search.checkin}`);
  if (search.checkout) bits.push(`Check-out: ${search.checkout}`);
  if (search.topic) bits.push(`FAQ topic: ${search.topic}`);

  const label = serviceOptions.find((o) => o.slug === service)?.label ?? "General Enquiry";
  const subject =
    search.intent === "booking" || search.intent === "quote"
      ? `Booking Enquiry — ${label}`
      : bits.length > 0
        ? `${label} Enquiry`
        : "Trip Inquiry";

  return { service, subject, message: bits.join("\n") };
}

export function GlobalEnquiryModal() {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<{
    service: string;
    subject: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    // Intercept clicks on links pointing to /contact-us
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target) {
        const href = target.getAttribute("href") || "";
        if (href.startsWith("/contact-us")) {
          // If it's a click to go to raw /contact-us from main menus, do not intercept
          // but if it has query parameters (like booking details) or contains "book"/"enquiry"/"quote" text, intercept!
          const hasParams = href.includes("?");
          const textContent = target.textContent?.toLowerCase() || "";
          const isBookingAction =
            textContent.includes("book") ||
            textContent.includes("enquire") ||
            textContent.includes("quote") ||
            hasParams;

          if (isBookingAction) {
            e.preventDefault();
            e.stopPropagation();

            const url = new URL(href, window.location.origin);
            const params = Object.fromEntries(url.searchParams.entries());
            const prefilled = buildPrefill(params);

            setPrefill(prefilled);
            setOpen(true);
          }
        }
      }
    };

    document.addEventListener("click", handleGlobalClick, true);
    return () => document.removeEventListener("click", handleGlobalClick, true);
  }, []);

  if (!open || !prefill) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight">Quick Booking Enquiry</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Complete the form below to send your request. We'll pre-fill the details for you.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <ContactForm
            serviceSlug={prefill.service}
            subjectPrefill={prefill.subject}
            messagePrefill={prefill.message}
            onServiceChange={(s) => {
              setPrefill((prev) => prev ? { ...prev, service: s } : null);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
