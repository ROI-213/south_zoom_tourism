import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getPublishedServices } from "@/content/services";
import { company } from "@/content/site";
import { getEnquiryServiceOptions, generateEnquiryReference } from "@/content/contact";
import { syncEnquiryToSupabase } from "@/lib/booking-sync";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number (10–15 digits)."),
  email: z.string().trim().email("Enter a valid email address.").or(z.literal("")),
  serviceSlug: z.string().min(1, "Choose a service."),
  travelDate: z.string(),
  message: z.string().trim().max(600, "Please keep it under 600 characters."),
});

export type EnquiryValues = z.infer<typeof enquirySchema>;

export function EnquiryDialog({
  open,
  onOpenChange,
  serviceSlug,
  source = "services",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceSlug: string;
  /** Where the enquiry was raised from — stored with the enquiry record. */
  source?: string;
}) {
  const publishedServices = getPublishedServices();
  const serviceOptions = getEnquiryServiceOptions();

  const form = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      serviceSlug,
      travelDate: "",
      message: "",
    },
  });

  const { register, handleSubmit, reset, setValue, formState } = form;

  // Preselect the service the visitor clicked, every time the dialog opens.
  useEffect(() => {
    if (open) setValue("serviceSlug", serviceSlug, { shouldValidate: true });
  }, [open, serviceSlug, setValue]);

  const onSubmit = async (values: EnquiryValues) => {
    // No backend connected yet: the enquiry is handed to the team over
    // WhatsApp so no request is ever lost. Swap this for a Cloud insert
    // once the enquiries table exists — the payload below is already the
    // shape the table expects (service_id, page_url, source).
    const service = publishedServices.find((s) => s.slug === values.serviceSlug);
    const serviceLabel =
      serviceOptions.find((s) => s.slug === values.serviceSlug)?.label ??
      service?.title ??
      values.serviceSlug;
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    const payload = {
      service_id: service?.id ?? null,
      service_slug: values.serviceSlug,
      page_url: pageUrl,
      source,
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      travel_date: values.travelDate || null,
      message: values.message || null,
    };

    const ref = generateEnquiryReference();
    syncEnquiryToSupabase({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      serviceType: serviceLabel,
      message: `Travel Date: ${payload.travel_date || "Not specified"}\nDetails: ${payload.message || "None"}`,
      reference: ref,
    });

    const lines = [
      `New enquiry — ${serviceLabel}`,
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.email ? `Email: ${values.email}` : null,
      values.travelDate ? `Travel date: ${values.travelDate}` : null,
      values.message ? `Details: ${values.message}` : null,
      `Service: ${serviceLabel}`,
      pageUrl ? `Page: ${pageUrl}` : null,
      `Source: ${source}`,
    ].filter(Boolean);

    window.open(
      `https://wa.me/${company.whatsappRaw}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer",
    );

    toast.success("Enquiry ready to send", {
      description: `We've prepared your ${serviceLabel} enquiry on WhatsApp. You can also call ${company.phone}.`,
    });
    reset({ ...form.getValues(), name: "", phone: "", email: "", travelDate: "", message: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Service enquiry</DialogTitle>
          <DialogDescription>
            Tell us what you need and we'll reply with options and a fixed quote.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="enquiry-service">Service</Label>
            <select
              id="enquiry-service"
              {...register("serviceSlug")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {serviceOptions.map((opt) => (
                <option key={opt.slug} value={opt.slug}>
                  {opt.label}
                </option>
              ))}
            </select>
            {formState.errors.serviceSlug ? (
              <p className="text-xs text-destructive">{formState.errors.serviceSlug.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="enquiry-name">Your name</Label>
              <Input id="enquiry-name" autoComplete="name" {...register("name")} />
              {formState.errors.name ? (
                <p className="text-xs text-destructive">{formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="enquiry-phone">Phone</Label>
              <Input id="enquiry-phone" inputMode="tel" autoComplete="tel" {...register("phone")} />
              {formState.errors.phone ? (
                <p className="text-xs text-destructive">{formState.errors.phone.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="enquiry-email">Email (optional)</Label>
              <Input id="enquiry-email" type="email" autoComplete="email" {...register("email")} />
              {formState.errors.email ? (
                <p className="text-xs text-destructive">{formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="enquiry-date">Travel date (optional)</Label>
              <Input id="enquiry-date" type="date" {...register("travelDate")} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="enquiry-message">Trip details (optional)</Label>
            <Textarea
              id="enquiry-message"
              rows={3}
              placeholder="Route, number of passengers, pickup time…"
              {...register("message")}
            />
            {formState.errors.message ? (
              <p className="text-xs text-destructive">{formState.errors.message.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Send enquiry
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href={`tel:${company.phoneRaw}`}>Call {company.phone}</a>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
